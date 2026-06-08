// Order endpoints — customer places orders, staff manage them.
// Emits Socket.IO events for two-way live sync.
import express from "express";
import { db, uid, nextOrderNo } from "../db.js";
import { requireCustomer, requireStaff, requirePermission } from "../auth.js";

const router = express.Router();

const STATUS_FLOW = ["new", "preparing", "ready", "out", "completed"];

function rowToOrder(r) {
  return {
    id: r.id,
    no: r.no,
    customerId: r.customer_id,
    customer: r.customer_name,
    phone: r.phone,
    email: r.email,
    type: r.type,
    address: r.address,
    items: JSON.parse(r.items || "[]"),
    total: r.total,
    status: r.status,
    partnerId: r.partner_id,
    payment: r.payment,
    note: r.note,
    placedAt: r.placed_at,
  };
}

function getOrder(id) {
  const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
  return row ? rowToOrder(row) : null;
}

function emitUpdate(req, order) {
  const io = req.app.get("io");
  io.to("staff").emit("order:update", order);
  if (order.customerId) io.to(`customer_${order.customerId}`).emit("order:update", order);
}

// ---- CUSTOMER: place an order ----
router.post("/", requireCustomer, (req, res) => {
  const b = req.body || {};
  const items = Array.isArray(b.items) ? b.items : [];
  if (items.length === 0) return res.status(400).json({ error: "Order must contain at least one item" });

  const total = items.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0);
  const customer = db.prepare("SELECT * FROM customers WHERE id = ?").get(req.user.sub);
  const order = {
    id: uid("ord"),
    no: nextOrderNo(),
    customer_id: req.user.sub,
    customer_name: b.customerName || customer?.name || req.user.name,
    phone: b.phone || customer?.phone || "",
    email: customer?.email || "",
    type: b.type === "pickup" ? "pickup" : "delivery",
    address: b.type === "pickup" ? "—" : (b.address || customer?.address || ""),
    items: JSON.stringify(items.map((i) => ({ id: i.id, name: i.name, price: Number(i.price), qty: Number(i.qty), emoji: i.emoji || "" }))),
    total,
    status: "new",
    partner_id: null,
    payment: b.payment || "Card",
    note: b.note || "",
    placed_at: new Date().toISOString(),
  };
  db.prepare(
    `INSERT INTO orders (id, no, customer_id, customer_name, phone, email, type, address, items, total, status, partner_id, payment, note, placed_at)
     VALUES (@id, @no, @customer_id, @customer_name, @phone, @email, @type, @address, @items, @total, @status, @partner_id, @payment, @note, @placed_at)`
  ).run(order);

  const created = getOrder(order.id);
  const io = req.app.get("io");
  io.to("staff").emit("order:new", created); // restaurant gets the order live
  res.json(created);
});

// ---- CUSTOMER: my orders ----
router.get("/mine", requireCustomer, (req, res) => {
  const rows = db.prepare("SELECT * FROM orders WHERE customer_id = ? ORDER BY no DESC").all(req.user.sub);
  res.json(rows.map(rowToOrder));
});

// ---- STAFF: all orders ----
router.get("/", requireStaff, (req, res) => {
  const rows = db.prepare("SELECT * FROM orders ORDER BY no DESC").all();
  res.json(rows.map(rowToOrder));
});

// ---- STAFF: manual order entry ----
router.post("/manual", requireStaff, requirePermission("orders:create"), (req, res) => {
  const b = req.body || {};
  const items = Array.isArray(b.items) ? b.items : [];
  if (items.length === 0) return res.status(400).json({ error: "Order must contain at least one item" });
  const total = items.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0);
  const order = {
    id: uid("ord"),
    no: nextOrderNo(),
    customer_id: null,
    customer_name: b.customer || "Walk-in",
    phone: b.phone || "",
    email: "",
    type: b.type === "pickup" ? "pickup" : "delivery",
    address: b.type === "pickup" ? "—" : (b.address || ""),
    items: JSON.stringify(items.map((i) => ({ id: i.id, name: i.name, price: Number(i.price), qty: Number(i.qty) }))),
    total,
    status: "new",
    partner_id: null,
    payment: b.payment || "Cash",
    note: b.note || "",
    placed_at: new Date().toISOString(),
  };
  db.prepare(
    `INSERT INTO orders (id, no, customer_id, customer_name, phone, email, type, address, items, total, status, partner_id, payment, note, placed_at)
     VALUES (@id, @no, @customer_id, @customer_name, @phone, @email, @type, @address, @items, @total, @status, @partner_id, @payment, @note, @placed_at)`
  ).run(order);
  const created = getOrder(order.id);
  req.app.get("io").to("staff").emit("order:new", created);
  res.json(created);
});

// ---- STAFF: change status ----
router.patch("/:id/status", requireStaff, requirePermission("orders:status"), (req, res) => {
  const { status } = req.body || {};
  if (![...STATUS_FLOW, "cancelled"].includes(status)) return res.status(400).json({ error: "Invalid status" });
  const order = getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: "Not found" });
  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, order.id);
  const updated = getOrder(order.id);
  emitUpdate(req, updated);
  res.json(updated);
});

// ---- STAFF: assign delivery partner ----
router.patch("/:id/assign", requireStaff, requirePermission("orders:assign"), (req, res) => {
  const { partnerId } = req.body || {};
  const order = getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: "Not found" });
  const newStatus = order.status === "new" ? "preparing" : order.status;
  db.prepare("UPDATE orders SET partner_id = ?, type = 'delivery', status = ? WHERE id = ?").run(partnerId || null, newStatus, order.id);
  if (partnerId) db.prepare("UPDATE partners SET status = 'on-delivery' WHERE id = ?").run(partnerId);
  const updated = getOrder(order.id);
  emitUpdate(req, updated);
  req.app.get("io").to("staff").emit("partners:update");
  res.json(updated);
});

// ---- STAFF: mark self-pickup ----
router.patch("/:id/pickup", requireStaff, requirePermission("orders:assign"), (req, res) => {
  const order = getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: "Not found" });
  db.prepare("UPDATE orders SET type = 'pickup', partner_id = NULL, address = '—' WHERE id = ?").run(order.id);
  const updated = getOrder(order.id);
  emitUpdate(req, updated);
  res.json(updated);
});

// ---- STAFF: cancel ----
router.patch("/:id/cancel", requireStaff, requirePermission("orders:cancel"), (req, res) => {
  const order = getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: "Not found" });
  db.prepare("UPDATE orders SET status = 'cancelled' WHERE id = ?").run(order.id);
  const updated = getOrder(order.id);
  emitUpdate(req, updated);
  res.json(updated);
});

export default router;
