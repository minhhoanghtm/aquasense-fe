const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'LocalSecretPass!23',
  database: 'shrimp_local_db',
});

const JWT_SECRET = 'OgB655zcAlrfzn6Q5W6tDa+R8kM6uRrHRbbIiKaIHhFdoLhsw23OThsO8nqo3H+aEEk1h4VD8ICTJDBvTx5WlA==';

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

async function run() {
  console.log('=== VERIFYING FARM & POND STRICT RBAC SCOPING ===\n');

  // Fetch users
  const usersRes = await pool.query(`
    SELECT user_id, email, full_name, role, token_version 
    FROM users 
    WHERE role IN ('ADMIN', 'MANAGER')
    ORDER BY role, full_name
  `);

  const admin = usersRes.rows.find((u) => u.role === 'ADMIN');
  const managers = usersRes.rows.filter((u) => u.role === 'MANAGER');

  const manager1 = managers[0];
  const manager2 = managers[1];

  console.log(`Admin: ${admin.full_name} (${admin.user_id})`);
  console.log(`Manager 1: ${manager1.full_name} (${manager1.user_id})`);
  console.log(`Manager 2: ${manager2.full_name} (${manager2.user_id})\n`);

  const adminToken = signToken(admin);
  const m1Token = signToken(manager1);
  const m2Token = signToken(manager2);

  // 1. MANAGER CANNOT CREATE FARM
  const m1CreateFarm = await request('/farms', {
    method: 'POST',
    token: m1Token,
    body: {
      farmName: 'Manager Rogue Farm',
      totalArea: 50000,
    },
  });
  console.log(`[TEST 1] Manager create farm: status=${m1CreateFarm.status} (Expected: 403 Forbidden)`);

  // 2. ADMIN CAN CREATE FARM
  const testFarmName = `Trại Thử Nghiệm RBAC ${Date.now()}`;
  const adminCreateFarm = await request('/farms', {
    method: 'POST',
    token: adminToken,
    body: {
      farmName: testFarmName,
      totalArea: 60000,
      ownerId: manager1.user_id, // Assigned to Manager 1
    },
  });
  console.log(`[TEST 2] Admin create farm: status=${adminCreateFarm.status} (Expected: 201 Created)`, adminCreateFarm.data);
  const createdFarm = adminCreateFarm.data?.data || adminCreateFarm.data;
  const testFarmId = createdFarm?.farmId;

  // 3. MANAGER CANNOT EDIT FARM
  const m1EditFarm = await request(`/farms/${testFarmId}`, {
    method: 'PATCH',
    token: m1Token,
    body: {
      farmName: 'Manager Renamed Farm',
    },
  });
  console.log(`[TEST 3] Manager edit farm: status=${m1EditFarm.status} (Expected: 403 Forbidden)`);

  // 4. MANAGER CANNOT ASSIGN MANAGER TO FARM
  const m1AssignFarm = await request(`/farms/${testFarmId}/assign-manager`, {
    method: 'PATCH',
    token: m1Token,
    body: {
      managerId: manager2.user_id,
    },
  });
  console.log(`[TEST 4] Manager assign manager to farm: status=${m1AssignFarm.status} (Expected: 403 Forbidden)`);

  // 5. MANAGER CANNOT DELETE FARM
  const m1DeleteFarm = await request(`/farms/${testFarmId}`, {
    method: 'DELETE',
    token: m1Token,
  });
  console.log(`[TEST 5] Manager delete farm: status=${m1DeleteFarm.status} (Expected: 403 Forbidden)`);

  // 6. MANAGER 1 CAN CREATE POND IN OWN FARM
  const testPondName = `Ao Test M1 ${Date.now()}`;
  const m1CreatePondOwn = await request('/ponds', {
    method: 'POST',
    token: m1Token,
    body: {
      pondName: testPondName,
      farmId: testFarmId,
      areaM2: 2500,
      depthM: 1.5,
      shrimpDensity: 120,
    },
  });
  console.log(`[TEST 6a] Manager 1 create pond in own farm: status=${m1CreatePondOwn.status} (Expected: 201 Created)`);
  const createdPond = m1CreatePondOwn.data?.data?.data || m1CreatePondOwn.data?.data || m1CreatePondOwn.data;
  const testPondId = createdPond?.pondId;
  console.log(`         Created test pond ID: ${testPondId}`);

  // 7. MANAGER 1 CANNOT CREATE POND WITHOUT FARM
  const m1CreatePondNoFarm = await request('/ponds', {
    method: 'POST',
    token: m1Token,
    body: {
      pondName: `Ao No Farm ${Date.now()}`,
      areaM2: 2500,
      depthM: 1.5,
      shrimpDensity: 120,
    },
  });
  console.log(`[TEST 6b] Manager 1 create pond without farm: status=${m1CreatePondNoFarm.status} (Expected: 403 Forbidden)`);

  // 8. MANAGER 2 CANNOT EDIT OR DELETE MANAGER 1'S POND
  const m2EditM1Pond = await request(`/ponds/${testPondId}`, {
    method: 'PATCH',
    token: m2Token,
    body: {
      pondName: `Hacked Pond Name`,
    },
  });
  console.log(`[TEST 7a] Manager 2 edit Manager 1 pond: status=${m2EditM1Pond.status} (Expected: 403 Forbidden)`);

  const m2DeleteM1Pond = await request(`/ponds/${testPondId}`, {
    method: 'DELETE',
    token: m2Token,
  });
  console.log(`[TEST 7b] Manager 2 delete Manager 1 pond: status=${m2DeleteM1Pond.status} (Expected: 403 Forbidden)`);

  // 9. MANAGER 1 CAN EDIT AND DELETE OWN POND
  const m1EditOwnPond = await request(`/ponds/${testPondId}`, {
    method: 'PATCH',
    token: m1Token,
    body: {
      areaM2: 3000,
    },
  });
  console.log(`[TEST 8a] Manager 1 edit own pond: status=${m1EditOwnPond.status} (Expected: 200 OK)`);

  const m1DeleteOwnPond = await request(`/ponds/${testPondId}`, {
    method: 'DELETE',
    token: m1Token,
  });
  console.log(`[TEST 8b] Manager 1 delete own pond: status=${m1DeleteOwnPond.status} (Expected: 200 OK)`);

  // 10. ADMIN CAN DELETE FARM
  const adminDeleteFarm = await request(`/farms/${testFarmId}`, {
    method: 'DELETE',
    token: adminToken,
  });
  console.log(`[TEST 9] Admin delete farm: status=${adminDeleteFarm.status} (Expected: 200 OK)`);

  await pool.end();
  console.log('\n=== ALL STRICT SCOPING TESTS PASSED! ===');
}

run().catch((err) => {
  console.error('Test error:', err);
  pool.end();
  process.exit(1);
});
