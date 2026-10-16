import test from "node:test";
import assert from "node:assert";
import { canManageUser, hasManagementAccess, canAccessRoute } from "./src/lib/rolePermissions.ts";

test("Permission Matrix Tests", async (t) => {
  await t.test("MANAGER -> ADMIN is blocked", () => {
    assert.strictEqual(canManageUser("MANAGER", "ADMIN"), false);
  });

  await t.test("MANAGER -> MANAGER is allowed", () => {
    assert.strictEqual(canManageUser("MANAGER", "MANAGER"), true);
  });

  await t.test("MANAGER -> FARMER is allowed", () => {
    assert.strictEqual(canManageUser("MANAGER", "FARMER"), true);
  });

  await t.test("ADMIN -> ADMIN is allowed", () => {
    assert.strictEqual(canManageUser("ADMIN", "ADMIN"), true);
  });

  await t.test("ADMIN -> MANAGER is allowed", () => {
    assert.strictEqual(canManageUser("ADMIN", "MANAGER"), true);
  });

  await t.test("ADMIN -> FARMER is allowed", () => {
    assert.strictEqual(canManageUser("ADMIN", "FARMER"), true);
  });

  await t.test("FARMER -> FARMER is blocked", () => {
    assert.strictEqual(canManageUser("FARMER", "FARMER"), false);
  });

  await t.test("FARMER -> MANAGER is blocked", () => {
    assert.strictEqual(canManageUser("FARMER", "MANAGER"), false);
  });
});

test("Management Access Tests", async (t) => {
  await t.test("ADMIN has management access", () => {
    assert.strictEqual(hasManagementAccess("ADMIN"), true);
  });

  await t.test("MANAGER has management access", () => {
    assert.strictEqual(hasManagementAccess("MANAGER"), true);
  });

  await t.test("FARMER does NOT have management access", () => {
    assert.strictEqual(hasManagementAccess("FARMER"), false);
  });
});
