import assert from "node:assert/strict";
import test from "node:test";

import { createUserToken, requireAdminRole, verifyUserToken } from "../src/lib/auth.js";

function response() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test("signed user sessions contain only the user identity payload", () => {
  const token = createUserToken({ id: "user-1", role: "USER" });
  assert.deepEqual(verifyUserToken(token).userId, "user-1");
  assert.equal(verifyUserToken(`${token}tampered`), null);
});

test("admin middleware rejects normal users and allows administrators", () => {
  const denied = response();
  requireAdminRole({ user: { id: "user-1", role: "USER" } }, denied, () => {});
  assert.equal(denied.statusCode, 403);

  const allowed = response();
  let called = false;
  requireAdminRole({ user: { id: "admin-1", role: "SUPER_ADMIN" } }, allowed, () => { called = true; });
  assert.equal(called, true);
  assert.equal(allowed.statusCode, 200);
});
