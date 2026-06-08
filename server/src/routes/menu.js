// Menu endpoints — public read, staff write.
import express from "express";
import { db, uid } from "../db.js";
import { requireStaff, requirePermission } from "../auth.js";

const router = express.Router();

function rowToItem(r) {
  return { ...r, veg: !!r.veg, available: !!r.available, desc: r.description };
}

// Public: only available items by default; staff can pass ?all=1
router.get("/", (req, res) => {
  const all = req.query.all === "1";
  const rows = all
    ? db.prepare("SELECT * FROM menu_items ORDER BY category, name").all()
    : db.prepare("SELECT * FROM menu_items WHERE available = 1 ORDER BY category, name").all();
  res.json(rows.map(rowToItem));
});

router.post("/", requireStaff, requirePermission("menu:manage"), (req, res) => {
  const b = req.body || {};
  const item = {
    id: b.id || uid("m"),
    name: b.name,
    category: b.category || "Curry House",
    price: Number(b.price) || 0,
    emoji: b.emoji || "🍽️",
    tag: b.tag || "",
    veg: b.veg ? 1 : 0,
    available: b.available === false ? 0 : 1,
    description: b.desc || b.description || "",
  };
  const existing = b.id && db.prepare("SELECT id FROM menu_items WHERE id = ?").get(b.id);
  if (existing) {
    db.prepare(
      "UPDATE menu_items SET name=@name, category=@category, price=@price, emoji=@emoji, tag=@tag, veg=@veg, available=@available, description=@description WHERE id=@id"
    ).run(item);
  } else {
    db.prepare(
      "INSERT INTO menu_items (id, name, category, price, emoji, tag, veg, available, description) VALUES (@id, @name, @category, @price, @emoji, @tag, @veg, @available, @description)"
    ).run(item);
  }
  const io = req.app.get("io");
  io.emit("menu:update");
  res.json(rowToItem(db.prepare("SELECT * FROM menu_items WHERE id = ?").get(item.id)));
});

router.patch("/:id/toggle", requireStaff, requirePermission("menu:manage"), (req, res) => {
  const row = db.prepare("SELECT * FROM menu_items WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  db.prepare("UPDATE menu_items SET available = ? WHERE id = ?").run(row.available ? 0 : 1, row.id);
  req.app.get("io").emit("menu:update");
  res.json(rowToItem(db.prepare("SELECT * FROM menu_items WHERE id = ?").get(row.id)));
});

router.delete("/:id", requireStaff, requirePermission("menu:manage"), (req, res) => {
  db.prepare("DELETE FROM menu_items WHERE id = ?").run(req.params.id);
  req.app.get("io").emit("menu:update");
  res.json({ ok: true });
});

export default router;
