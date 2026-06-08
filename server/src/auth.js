// JWT helpers and auth middleware for both customer and staff tokens.
import jwt from "jsonwebtoken";
import { config } from "./config.js";

export function signToken(payload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch {
    return null;
  }
}

function readToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  return null;
}

// Requires any authenticated user (customer or staff)
export function requireAuth(req, res, next) {
  const decoded = verifyToken(readToken(req));
  if (!decoded) return res.status(401).json({ error: "Unauthorized" });
  req.user = decoded;
  next();
}

// Requires a staff token (kind === 'staff')
export function requireStaff(req, res, next) {
  const decoded = verifyToken(readToken(req));
  if (!decoded || decoded.kind !== "staff") {
    return res.status(401).json({ error: "Staff authorization required" });
  }
  req.user = decoded;
  next();
}

// Requires a customer token (kind === 'customer')
export function requireCustomer(req, res, next) {
  const decoded = verifyToken(readToken(req));
  if (!decoded || decoded.kind !== "customer") {
    return res.status(401).json({ error: "Customer authorization required" });
  }
  req.user = decoded;
  next();
}

// Role -> permissions (mirrors the admin app)
export const ROLE_PERMISSIONS = {
  admin: ["orders:status", "orders:assign", "orders:create", "orders:cancel", "menu:manage", "partners:manage", "staff:manage"],
  manager: ["orders:status", "orders:assign", "orders:create", "orders:cancel", "menu:manage", "partners:manage"],
  dispatcher: ["orders:status", "orders:assign", "orders:create"],
};

export function requirePermission(permission) {
  return (req, res, next) => {
    const perms = ROLE_PERMISSIONS[req.user?.role] || [];
    if (!perms.includes(permission)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}
