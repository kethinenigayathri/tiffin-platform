import { useState } from "react";
import { useStore } from "../context/StoreContext.jsx";
import Modal from "../components/Modal.jsx";
import { Avatar } from "../components/ui.jsx";

const STATUS = {
  available: { label: "Available", cls: "b-completed" },
  "on-delivery": { label: "On delivery", cls: "b-out" },
  offline: { label: "Offline", cls: "b-muted" },
};

export default function Partners() {
  const { partners, orders, savePartner, setPartnerStatus, deletePartner } = useStore();
  const [editing, setEditing] = useState(null);

  function activeOrders(id) {
    return orders.filter((o) => o.partnerId === id && o.status === "out").length;
  }

  return (
    <>
      <div className="toolbar">
        <div className="muted small">{partners.filter((p) => p.status === "available").length} of {partners.length} partners available</div>
        <div className="topbar__spacer" />
        <button className="btn btn--primary" onClick={() => setEditing({})}>+ Add partner</button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
        {partners.map((p) => (
          <div className="card card-pad" key={p.id}>
            <div className="between">
              <div className="row"><Avatar name={p.name} /><div>
                <div style={{ fontWeight: 700 }}>{p.name}</div>
                <div className="small muted">{p.phone}</div>
              </div></div>
              <span className={`badge ${STATUS[p.status].cls}`}><span className="dot" />{STATUS[p.status].label}</span>
            </div>
            <div className="divider" />
            <div className="kv"><span>Vehicle</span><span>{p.vehicle}</span></div>
            <div className="kv"><span>Zone</span><span>{p.zone}</span></div>
            <div className="kv"><span>Rating</span><span>⭐ {p.rating}</span></div>
            <div className="kv"><span>Deliveries</span><span>{p.deliveries}</span></div>
            <div className="kv"><span>Active now</span><span>{activeOrders(p.id)}</span></div>
            <div className="divider" />
            <div className="row" style={{ gap: 8 }}>
              <select className="select" value={p.status} onChange={(e) => setPartnerStatus(p.id, e.target.value)}>
                <option value="available">Available</option>
                <option value="on-delivery">On delivery</option>
                <option value="offline">Offline</option>
              </select>
              <button className="btn btn--sm" onClick={() => setEditing(p)}>Edit</button>
              <button className="btn btn--sm btn--danger" onClick={() => deletePartner(p.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {editing && <PartnerForm partner={editing} onClose={() => setEditing(null)} onSave={(p) => { savePartner(p); setEditing(null); }} />}
    </>
  );
}

function PartnerForm({ partner, onClose, onSave }) {
  const [form, setForm] = useState({
    id: partner.id, name: partner.name || "", phone: partner.phone || "",
    vehicle: partner.vehicle || "Bike", zone: partner.zone || "Central",
    status: partner.status || "available", rating: partner.rating, deliveries: partner.deliveries,
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal
      title={partner.id ? "Edit partner" : "Add delivery partner"}
      onClose={onClose}
      footer={<>
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn--primary" disabled={!form.name} onClick={() => onSave(form)}>Save</button>
      </>}
    >
      <div className="field"><label>Name</label><input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
      <div className="field"><label>Phone</label><input className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="field"><label>Vehicle</label>
          <select className="select" value={form.vehicle} onChange={(e) => set("vehicle", e.target.value)}>
            <option>Bike</option><option>Scooter</option><option>Car</option><option>Cycle</option>
          </select>
        </div>
        <div className="field"><label>Zone</label>
          <select className="select" value={form.zone} onChange={(e) => set("zone", e.target.value)}>
            <option>Central</option><option>North</option><option>South</option><option>East</option><option>West</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}
