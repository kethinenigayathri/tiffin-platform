import { useState } from "react";
import { useStore } from "../context/StoreContext.jsx";
import Modal from "../components/Modal.jsx";
import { money } from "../components/ui.jsx";

const CATEGORIES = ["Breakfast", "Curry House","Naans", "Rice & Biryani's", "Sides", "Desserts", "Beverages"];

export default function Menu() {
  const { menu, saveMenuItem, toggleMenuItem, deleteMenuItem } = useStore();
  const [editing, setEditing] = useState(null);
  const [cat, setCat] = useState("All");

  const shown = cat === "All" ? menu : menu.filter((m) => m.category === cat);

  return (
    <>
      <div className="toolbar">
        <div className="chips">
          {["All", ...CATEGORIES].map((c) => (
            <button key={c} className={`chip ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <div className="topbar__spacer" />
        <button className="btn btn--primary" onClick={() => setEditing({})}>+ Add item</button>
      </div>

      <div className="card table-wrap">
        <table>
          <thead><tr><th>Item</th><th>Category</th><th>Diet</th><th>Price</th><th>Availability</th><th></th></tr></thead>
          <tbody>
            {shown.map((m) => (
              <tr key={m.id}>
                <td><div style={{ fontWeight: 600 }}>{m.name}</div><div className="small muted">{m.desc}</div></td>
                <td><span className="badge b-muted">{m.category}</span></td>
                <td>{m.veg ? "🟢 Veg" : "🔴 Non-veg"}</td>
                <td className="t-mono">{money(m.price)}</td>
                <td>
                  <label className="row small" style={{ cursor: "pointer" }}>
                    <input type="checkbox" checked={m.available} onChange={() => toggleMenuItem(m.id)} />
                    {m.available ? <span className="badge b-completed"><span className="dot" />In stock</span> : <span className="badge b-cancelled"><span className="dot" />Out of stock</span>}
                  </label>
                </td>
                <td className="row" style={{ gap: 6 }}>
                  <button className="btn btn--sm" onClick={() => setEditing(m)}>Edit</button>
                  <button className="btn btn--sm btn--danger" onClick={() => deleteMenuItem(m.id)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && <MenuForm item={editing} onClose={() => setEditing(null)} onSave={(it) => { saveMenuItem(it); setEditing(null); }} />}
    </>
  );
}

function MenuForm({ item, onClose, onSave }) {
  const [form, setForm] = useState({
    id: item.id, name: item.name || "", category: item.category || "Breakfast",
    price: item.price || "", desc: item.desc || "", veg: item.veg ?? true, available: item.available ?? true,
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal
      title={item.id ? "Edit menu item" : "Add menu item"}
      onClose={onClose}
      footer={<>
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn--primary" disabled={!form.name || !form.price} onClick={() => onSave({ ...form, price: parseFloat(form.price) })}>Save</button>
      </>}
    >
      <div className="field"><label>Name</label><input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
      <div className="field"><label>Description</label><textarea rows={2} value={form.desc} onChange={(e) => set("desc", e.target.value)} /></div>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="field"><label>Category</label>
          <select className="select" value={form.category} onChange={(e) => set("category", e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="field"><label>Price (£)</label><input className="input" type="number" step="0.5" value={form.price} onChange={(e) => set("price", e.target.value)} /></div>
      </div>
      <div className="row" style={{ gap: 18 }}>
        <label className="row small"><input type="checkbox" checked={form.veg} onChange={(e) => set("veg", e.target.checked)} /> Vegetarian</label>
        <label className="row small"><input type="checkbox" checked={form.available} onChange={(e) => set("available", e.target.checked)} /> Available</label>
      </div>
    </Modal>
  );
}
