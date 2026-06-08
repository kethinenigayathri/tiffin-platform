// Customer directory (staff only) — derived from registered customers and their orders.
import express from "express";
import { db } from "../db.js";
import { requireStaff } from "../auth.js";

const router = express.Router();

router.get("/", requireStaff, (req, res) => {
  const customers = db.prepare("SELECT id, name, phone, address, created_at FROM customers ORDER BY name").all();
  const result = customers.map((c) => {
    const stats = db
      .prepare("SELECT COUNT(*) orders, COALESCE(SUM(total), 0) spent FROM orders WHERE customer_id = ? AND status != 'cancelled'")
      .get(c.id);
    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      address: c.address,
      orders: stats.orders,
      spent: Number(stats.spent.toFixed(2)),
      since: (c.created_at || "").slice(0, 10),
    };
  });
  res.json(result);
});

export default router;
