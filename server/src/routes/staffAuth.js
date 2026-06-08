// Staff login (restaurant console).
import express from "express";
import { db, verifyPassword } from "../db.js";
import { signToken, requireStaff, ROLE_PERMISSIONS } from "../auth.js";

const router = express.Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "Username and password are required" });
  const staff = db.prepare("SELECT * FROM staff WHERE username = ?").get(username.trim().toLowerCase());
  if (!staff || !verifyPassword(password, staff.password)) {
    return res.status(401).json({ error: "Invalid username or password" });
  }
  const token = signToken({ kind: "staff", sub: staff.id, name: staff.name, role: staff.role });
  res.json({
    token,
    user: { id: staff.id, name: staff.name, username: staff.username, role: staff.role },
    permissions: ROLE_PERMISSIONS[staff.role] || [],
  });
});

router.get("/me", requireStaff, (req, res) => {
  const staff = db.prepare("SELECT id, name, username, role FROM staff WHERE id = ?").get(req.user.sub);
  if (!staff) return res.status(404).json({ error: "Not found" });
  res.json({ user: staff, permissions: ROLE_PERMISSIONS[staff.role] || [] });
});

export default router;
