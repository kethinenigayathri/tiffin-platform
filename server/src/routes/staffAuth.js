// Staff login (restaurant console) - MongoDB version.

import express from "express";
import Staff from "../models/Staff.js";

import { verifyPassword } from "../utils/password.js";
import {
  signToken,
  requireStaff,
  ROLE_PERMISSIONS,
} from "../auth.js";

const router = express.Router();

/* ---------------------------
   STAFF LOGIN
---------------------------- */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required",
      });
    }

    const staff = await Staff.findOne({
      username: username.trim().toLowerCase(),
    });

    if (!staff || !verifyPassword(password, staff.password)) {
      return res.status(401).json({
        error: "Invalid username or password",
      });
    }

    const token = signToken({
      kind: "staff",
      sub: staff._id.toString(),
      name: staff.name,
      role: staff.role,
    });

    return res.json({
      token,
      user: {
        id: staff._id,
        name: staff.name,
        username: staff.username,
        role: staff.role,
      },
      permissions:
        ROLE_PERMISSIONS[staff.role] || [],
    });
  } catch (error) {
    console.error("Staff Login Error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

/* ---------------------------
   CURRENT STAFF PROFILE
---------------------------- */
router.get("/me", requireStaff, async (req, res) => {
  try {
    const staff = await Staff.findById(
      req.user.sub
    ).select(
      "_id name username role"
    );

    if (!staff) {
      return res.status(404).json({
        error: "Not found",
      });
    }

    return res.json({
      user: {
        id: staff._id,
        name: staff.name,
        username: staff.username,
        role: staff.role,
      },
      permissions:
        ROLE_PERMISSIONS[staff.role] || [],
    });
  } catch (error) {
    console.error("Staff Profile Error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

export default router;