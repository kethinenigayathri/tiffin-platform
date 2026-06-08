// Delivery partner endpoints (staff only).
import express from "express";
import { db, uid } from "../db.js";
import { requireStaff, requirePermission } from "../auth.js";

const router = express.Router();

router.get("/", requireStaff, (req, res) => {
  res.json(db.prepare("SELECT * FROM partners ORDER BY name").all());
});

router.post("/", requireStaff, requirePermission("partners:manage"), (req, res) => {
  const b = req.body || {};
  const item = {
    id: b.id || uid("p"),
    name: b.name,
    phone: b.phone || "",
    vehicle: b.vehicle || "Bike",
    status: b.status || "available",
    zone: b.zone || "Central",
    rating: b.rating ?? 5,
    deliveries: b.deliveries ?? 0,
  };
  const existing = b.id && db.prepare("SELECT id FROM partners WHERE id = ?").get(b.id);
  if (existing) {
    db.prepare("UPDATE partners SET name=@name, phone=@phone, vehicle=@vehicle, status=@status, zone=@zone WHERE id=@id").run(item);
  } else {
    db.prepare("INSERT INTO partners (id, name, phone, vehicle, status, zone, rating, deliveries) VALUES (@id, @name, @phone, @vehicle, @status, @zone, @rating, @deliveries)").run(item);
  }
  req.app.get("io").to("staff").emit("partners:update");
  res.json(db.prepare("SELECT * FROM partners WHERE id = ?").get(item.id));
});

router.patch("/:id/status", requireStaff, requirePermission("partners:manage"), (req, res) => {
  const { status } = req.body || {};
  db.prepare("UPDATE partners SET status = ? WHERE id = ?").run(status, req.params.id);
  req.app.get("io").to("staff").emit("partners:update");
  res.json(db.prepare("SELECT * FROM partners WHERE id = ?").get(req.params.id));
});

router.delete("/:id", requireStaff, requirePermission("partners:manage"), (req, res) => {
  db.prepare("DELETE FROM partners WHERE id = ?").run(req.params.id);
  req.app.get("io").to("staff").emit("partners:update");
  res.json({ ok: true });
});

export default router;
