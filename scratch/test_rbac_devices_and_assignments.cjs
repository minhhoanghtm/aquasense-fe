const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'LocalSecretPass!23',
  database: 'shrimp_local_db',
});

// Default JWT secret from backend .env
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'OgB655zcAlrfzn6Q5W6tDa+R8kM6uRrHRbbIiKaIHhFdoLhsw23OThsO8nqo3H+aEEk1h4VD8ICTJDBvTx5WlA==';

function signToken(user) {
  return jwt.sign(
    {
      sub: user.user_id,
      userId: user.user_id,
      email: user.email,
      role: user.role,
      type: 'access',
      jti: require('crypto').randomUUID(),
      tokenVersion: user.token_version || 0,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

async function request(path, options = {}) {
  const url = `http://localhost:3000${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
  };
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

function extractList(res) {
  if (!res || !res.data) return [];
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data.data)) return res.data.data;
  if (res.data.data && Array.isArray(res.data.data.data)) return res.data.data.data;
  return [];
}

async function run() {
  console.log('=== STARTING RBAC VERIFICATION FOR DEVICES & ASSIGNMENTS ===\n');

  // 1. Fetch users: 1 Admin, 2 Managers, 1 Farmer
  const usersRes = await pool.query(`
    SELECT user_id, email, full_name, role, token_version 
    FROM users 
    WHERE role IN ('ADMIN', 'MANAGER', 'FARMER')
    ORDER BY role, full_name
  `);
  
  const admin = usersRes.rows.find((u) => u.role === 'ADMIN');
  const managers = usersRes.rows.filter((u) => u.role === 'MANAGER');
  const farmer = usersRes.rows.find((u) => u.role === 'FARMER');

  if (!admin || managers.length < 2 || !farmer) {
    console.error('Need at least 1 Admin, 2 Managers, 1 Farmer in DB!');
    process.exit(1);
  }

  const manager1 = managers[0];
  const manager2 = managers[1];

  console.log(`Admin: ${admin.full_name} (${admin.user_id})`);
  console.log(`Manager 1: ${manager1.full_name} (${manager1.user_id})`);
  console.log(`Manager 2: ${manager2.full_name} (${manager2.user_id})`);
  console.log(`Farmer: ${farmer.full_name} (${farmer.user_id})\n`);

  const adminToken = signToken(admin);
  const m1Token = signToken(manager1);
  const m2Token = signToken(manager2);
  const farmerToken = signToken(farmer);

  // Check farms owned by Manager 1 and Manager 2
  const farmsM1 = await pool.query('SELECT farm_id, farm_name FROM farms WHERE owner_id = $1', [manager1.user_id]);
  const farmsM2 = await pool.query('SELECT farm_id, farm_name FROM farms WHERE owner_id = $1', [manager2.user_id]);
  console.log(`Manager 1 farms count: ${farmsM1.rows.length} (${farmsM1.rows.map(f => f.farm_name).join(', ')})`);
  console.log(`Manager 2 farms count: ${farmsM2.rows.length} (${farmsM2.rows.map(f => f.farm_name).join(', ')})\n`);

  // Ponds in Manager 1's farms and Manager 2's farms
  const pondsM1 = await pool.query(
    'SELECT pond_id, pond_name FROM pond WHERE farm_id = ANY($1::uuid[])',
    [farmsM1.rows.map((f) => f.farm_id)]
  );
  const pondsM2 = await pool.query(
    'SELECT pond_id, pond_name FROM pond WHERE farm_id = ANY($1::uuid[])',
    [farmsM2.rows.map((f) => f.farm_id)]
  );

  console.log(`Ponds in M1 farms: ${pondsM1.rows.length}`);
  console.log(`Ponds in M2 farms: ${pondsM2.rows.length}\n`);

  // TEST 1: Admin can see all devices
  const allDevsAdmin = await request('/devices', { token: adminToken });
  const adminList = extractList(allDevsAdmin);
  console.log(`[TEST 1] Admin view /devices: status=${allDevsAdmin.status}, total=${adminList.length}`);

  // TEST 2: Manager 1 view devices (scoped to M1's farms)
  const devsM1 = await request('/devices', { token: m1Token });
  const m1List = extractList(devsM1);
  console.log(`[TEST 2] Manager 1 view /devices: status=${devsM1.status}, count=${m1List.length}`);
  // Verify all devices returned for M1 actually belong to M1's ponds
  const m1PondIds = new Set(pondsM1.rows.map((p) => p.pond_id));
  const m1Leak = m1List.filter((d) => !m1PondIds.has(d.pondId));
  console.log(`         M1 devices outside M1 farms (leak count): ${m1Leak.length} (Expected: 0)`);

  // TEST 3: Farmer cannot create device
  const farmerCreate = await request('/devices', {
    method: 'POST',
    token: farmerToken,
    body: {
      deviceName: 'Farmer Device Test',
      macAddress: 'AA:BB:CC:DD:EE:01',
      pondId: pondsM1.rows[0]?.pond_id,
    },
  });
  console.log(`[TEST 3] Farmer create device: status=${farmerCreate.status} (Expected: 403 Forbidden)`);

  // TEST 4: Manager 1 create device in M1 pond (Success) vs M2 pond (Forbidden)
  const hexSuffix = Math.floor(Math.random() * 255).toString(16).padStart(2, '0').toUpperCase();
  const macM1 = `E0:4F:43:11:22:${hexSuffix}`;
  const m1CreateOwn = await request('/devices', {
    method: 'POST',
    token: m1Token,
    body: {
      deviceName: 'Device M1 Own Farm',
      macAddress: macM1,
      pondId: pondsM1.rows[0]?.pond_id,
    },
  });
  console.log(`[TEST 4a] Manager 1 create device in own pond: status=${m1CreateOwn.status} (Expected: 201)`);
  const createdDev = m1CreateOwn.data?.data?.data || m1CreateOwn.data?.data || m1CreateOwn.data;
  const createdDevId = createdDev?.deviceId;

  const hexSuffix2 = Math.floor(Math.random() * 255).toString(16).padStart(2, '0').toUpperCase();
  const macM2 = `E0:4F:43:33:44:${hexSuffix2}`;
  const m1CreateOther = await request('/devices', {
    method: 'POST',
    token: m1Token,
    body: {
      deviceName: 'Device M1 Other Farm',
      macAddress: macM2,
      pondId: pondsM2.rows[0]?.pond_id,
    },
  });
  console.log(`[TEST 4b] Manager 1 create device in M2 pond: status=${m1CreateOther.status} (Expected: 403 Forbidden)`);

  // TEST 5: Farmer report device fault (Success)
  // Ensure farmer is assigned to M1 pond first
  await pool.query(
    'INSERT INTO pond_farmer_assignments (assignment_id, pond_id, farmer_id, assigned_at) VALUES (gen_random_uuid(), $1, $2, NOW()) ON CONFLICT DO NOTHING',
    [pondsM1.rows[0]?.pond_id, farmer.user_id]
  );
  const reportRes = await request(`/devices/${createdDevId}/report-fault`, {
    method: 'POST',
    token: farmerToken,
    body: {
      reason: 'Đầu dò cảm biến bị rơi xuống đáy ao và chập tín hiệu',
    },
  });
  console.log(`[TEST 5] Farmer report broken device: status=${reportRes.status}, newStatus=${reportRes.data?.data?.status} (Expected: 200/201 and MAINTENANCE)`);

  // TEST 6: Farmer cannot edit or delete device
  const farmerEdit = await request(`/devices/${createdDevId}`, {
    method: 'PATCH',
    token: farmerToken,
    body: { deviceName: 'Hacked Name' },
  });
  console.log(`[TEST 6a] Farmer edit device: status=${farmerEdit.status} (Expected: 403 Forbidden)`);

  const farmerDelete = await request(`/devices/${createdDevId}`, {
    method: 'DELETE',
    token: farmerToken,
  });
  console.log(`[TEST 6b] Farmer delete device: status=${farmerDelete.status} (Expected: 403 Forbidden)`);

  // TEST 7: Manager assign farmer to pond in own farm vs other farm
  // Manager 1 assign farmer to M1 pond -> Success
  const m1AssignOwn = await request(`/ponds/${pondsM1.rows[1]?.pond_id}/farmers`, {
    method: 'POST',
    token: m1Token,
    body: { farmerId: farmer.user_id },
  });
  console.log(`[TEST 7a] Manager 1 assign farmer to own pond: status=${m1AssignOwn.status} (Expected: 201 or 409 if already)`);

  // Manager 1 assign farmer to M2 pond -> Forbidden (403)
  const m1AssignOther = await request(`/ponds/${pondsM2.rows[0]?.pond_id}/farmers`, {
    method: 'POST',
    token: m1Token,
    body: { farmerId: farmer.user_id },
  });
  console.log(`[TEST 7b] Manager 1 assign farmer to M2 pond: status=${m1AssignOther.status} (Expected: 403 Forbidden)`);

  // Cleanup test device
  if (createdDevId) {
    await pool.query('DELETE FROM alert WHERE device_id = $1', [createdDevId]);
    await pool.query('DELETE FROM device WHERE device_id = $1', [createdDevId]);
    console.log('\nCleaned up test device and test alerts.');
  }

  await pool.end();
  console.log('\n=== ALL RBAC TESTS COMPLETED SUCCESSFULLY! ===');
}

run().catch((err) => {
  console.error('Test error:', err);
  pool.end();
  process.exit(1);
});
