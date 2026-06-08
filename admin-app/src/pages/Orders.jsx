import { useMemo, useState } from "react";
import { useStore } from "../context/StoreContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import Modal from "../components/Modal.jsx";
import { StatusBadge, TypeBadge, Avatar, money, timeAgo } from "../components/ui.jsx";
import { STATUS_FLOW, STATUS_LABELS } from "../data/seed.js";

const FILTERS = [
  { key: "active", label: "Active" },
  { key: "new", label: "New" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "out", label: "Out for delivery" },
  { key: "completed", label: "Completed" },
  { key: "all", label: "All" },
];

export default function Orders() {
  const { orders } = useStore();
  const { can } = useAuth();
  const [filter, setFilter] = useState("active");
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchQ =
        !q ||
        String(o.no).includes(q) ||
        o.customer.toLowerCase().includes(q.toLowerCase());
      let matchF = true;
      if (filter === "active") matchF = !["completed", "cancelled"].includes(o.status);
      else if (filter !== "all") matchF = o.status === filter;
      return matchQ && matchF;
    });
  }, [orders, filter, q]);

  const selected = detail ? orders.find((o) => o.no === detail) : null;

  return (
    <>
      <div className="toolbar">
        <div className="search">
          <span className="ico">🔍</span>
          <input className="input" placeholder="Search by order # or customer" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {can("orders:create") && (
          <button className="btn btn--primary" onClick={() => setCreating(true)}>+ New order</button>
        )}
      </div>

      <div className="chips" style={{ marginBottom: 18 }}>
        {FILTERS.map((f) => (
          <button key={f.key} className={`chip ${filter === f.key ? "active" : ""}`} onClick={() => setFilter(f.key)}>
            {f.label}
            {f.key === "active" && ` (${orders.filter((o) => !["completed", "cancelled"].includes(o.status)).length})`}
          </button>
        ))}
      </div>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Order</th><th>Customer</th><th>Items</th><th>Type</th><th>Partner</th><th>Status</th><th>Total</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <OrderRow key={o.no} order={o} onOpen={() => setDetail(o.no)} />
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty"><div className="big">🍽️</div>No orders match this view.</div>
        )}
      </div>

      {selected && <OrderDetail order={selected} onClose={() => setDetail(null)} />}
      {creating && <NewOrder onClose={() => setCreating(false)} />}
    </>
  );
}

function OrderRow({ order, onOpen }) {
  const { partners } = useStore();
  const partner = partners.find((p) => p.id === order.partnerId);
  return (
    <tr style={{ cursor: "pointer" }} onClick={onOpen}>
      <td className="t-mono">#{order.no}<div className="small muted">{timeAgo(order.placedAt)}</div></td>
      <td><div className="row"><Avatar name={order.customer} /><span>{order.customer}</span></div></td>
      <td className="muted small">{order.items.reduce((s, i) => s + i.qty, 0)} items</td>
      <td><TypeBadge type={order.type} /></td>
      <td className="small">{order.type === "pickup" ? <span className="muted">—</span> : partner ? partner.name : <span className="badge b-muted">Unassigned</span>}</td>
      <td><StatusBadge status={order.status} /></td>
      <td className="t-mono">{money(order.total)}</td>
      <td><button className="btn btn--ghost btn--sm">Manage →</button></td>
    </tr>
  );
}

function OrderDetail({ order, onClose }) {
  const { partners, setStatus, assignPartner, markPickup, cancelOrder } = useStore();
  const { can } = useAuth();
  const canAssign = can("orders:assign");
  const canStatus = can("orders:status");
  const canCancel = can("orders:cancel");
  const partner = partners.find((p) => p.id === order.partnerId);
  const available = partners.filter((p) => p.status !== "offline");
  const flow = STATUS_FLOW;
  const idx = flow.indexOf(order.status);
  const nextStatus = idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null;
  const canDispatch = canStatus && order.type === "delivery" && order.status === "ready" && order.partnerId;

  return (
    <Modal
      large
      title={`Order #${order.no}`}
      onClose={onClose}
      footer={
        <>
          {!canStatus && !canCancel && (
            <span className="small muted" style={{ marginRight: "auto" }}>🔒 View only — you can't change this order.</span>
          )}
          {canCancel && order.status !== "cancelled" && order.status !== "completed" && (
            <button className="btn btn--danger" onClick={() => { cancelOrder(order.no); onClose(); }}>Cancel order</button>
          )}
          {canStatus && nextStatus && (
            <button
              className="btn btn--primary"
              disabled={nextStatus === "out" && (order.type !== "delivery" || !order.partnerId)}
              onClick={() => setStatus(order.no, nextStatus)}
            >
              Advance → {STATUS_LABELS[nextStatus]}
            </button>
          )}
        </>
      }
    >
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <div>
          <div className="row" style={{ marginBottom: 12 }}>
            <Avatar name={order.customer} />
            <div>
              <div style={{ fontWeight: 700 }}>{order.customer}</div>
              <div className="small muted">{order.phone}</div>
            </div>
          </div>
          <div className="kv"><span>Status</span><StatusBadge status={order.status} /></div>
          <div className="kv"><span>Type</span><TypeBadge type={order.type} /></div>
          <div className="kv"><span>Placed</span><span>{timeAgo(order.placedAt)}</span></div>
          <div className="kv"><span>Payment</span><span>{order.payment}</span></div>
          {order.type === "delivery" && <div className="kv"><span>Address</span><span style={{ textAlign: "right", maxWidth: 180 }}>{order.address}</span></div>}

          <div className="divider" />
          <div className="section-title" style={{ fontSize: 14 }}>Items</div>
          {order.items.map((i, k) => (
            <div className="kv" key={k}><span>{i.qty}× {i.name}</span><span className="t-mono">{money(i.price * i.qty)}</span></div>
          ))}
          <div className="divider" />
          <div className="kv" style={{ fontWeight: 700, fontSize: 16 }}><span>Total</span><span className="t-mono">{money(order.total)}</span></div>
        </div>

        <div className="card card-pad" style={{ background: "var(--surface-2)" }}>
          <div className="section-title" style={{ fontSize: 14 }}>Fulfilment</div>
          {canAssign ? (
            <p className="small muted" style={{ marginBottom: 14 }}>Assign this order to a delivery partner, or switch it to self-pickup.</p>
          ) : (
            <p className="small muted" style={{ marginBottom: 14 }}>🔒 You don't have permission to assign delivery or change fulfilment.</p>
          )}

          <button
            className={`btn ${order.type === "pickup" ? "btn--primary" : ""}`}
            style={{ width: "100%", justifyContent: "center", marginBottom: 10 }}
            disabled={!canAssign}
            onClick={() => markPickup(order.no)}
          >
            🏪 Self-pickup
          </button>

          <div className="field">
            <label>Assign delivery partner</label>
            <select
              className="select"
              value={order.partnerId || ""}
              disabled={!canAssign}
              onChange={(e) => assignPartner(order.no, e.target.value || null)}
            >
              <option value="">— Select rider —</option>
              {available.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.vehicle} · {p.zone} {p.status === "on-delivery" ? "(busy)" : ""}
                </option>
              ))}
            </select>
          </div>

          {partner && (
            <div className="card card-pad" style={{ background: "var(--surface)", marginTop: 6 }}>
              <div className="row"><Avatar name={partner.name} /><div>
                <div style={{ fontWeight: 600 }}>{partner.name}</div>
                <div className="small muted">⭐ {partner.rating} · {partner.vehicle} · {partner.zone}</div>
              </div></div>
            </div>
          )}

          {canDispatch && (
            <button className="btn btn--primary" style={{ width: "100%", justifyContent: "center", marginTop: 12 }} onClick={() => setStatus(order.no, "out")}>
              🛵 Dispatch for delivery
            </button>
          )}
          {order.type === "delivery" && order.status === "ready" && !order.partnerId && (
            <p className="small" style={{ color: "var(--red)", marginTop: 10 }}>Assign a partner before dispatching.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}

function NewOrder({ onClose }) {
  const { menu, addOrder } = useStore();
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState("delivery");
  const [address, setAddress] = useState("");
  const [cart, setCart] = useState({});

  const items = Object.entries(cart)
    .filter(([, q]) => q > 0)
    .map(([id, qty]) => {
      const m = menu.find((x) => x.id === id);
      return { id, name: m.name, price: m.price, qty };
    });
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const valid = customer && items.length > 0 && (type === "pickup" || address);

  function setQty(id, delta) {
    setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] || 0) + delta) }));
  }

  function submit() {
    addOrder({ customer, phone, type, address: type === "delivery" ? address : "—", items });
    onClose();
  }

  return (
    <Modal
      large
      title="Create order"
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" disabled={!valid} onClick={submit}>Create order · {money(total)}</button>
        </>
      }
    >
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <div>
          <div className="field"><label>Customer name</label><input className="input" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="e.g. Aisha Khan" /></div>
          <div className="field"><label>Phone</label><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+44 7700 900000" /></div>
          <div className="field">
            <label>Fulfilment</label>
            <div className="chips">
              <button className={`chip ${type === "delivery" ? "active" : ""}`} onClick={() => setType("delivery")}>🛵 Delivery</button>
              <button className={`chip ${type === "pickup" ? "active" : ""}`} onClick={() => setType("pickup")}>🏪 Pickup</button>
            </div>
          </div>
          {type === "delivery" && (
            <div className="field"><label>Delivery address</label><textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, area" /></div>
          )}
        </div>

        <div>
          <div className="section-title" style={{ fontSize: 14 }}>Menu</div>
          <div style={{ maxHeight: 320, overflowY: "auto", paddingRight: 4 }}>
            {menu.filter((m) => m.available).map((m) => (
              <div className="between" key={m.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <div><div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div><div className="small muted">{money(m.price)}</div></div>
                <div className="row" style={{ gap: 8 }}>
                  <button className="btn btn--sm" onClick={() => setQty(m.id, -1)}>−</button>
                  <span style={{ minWidth: 18, textAlign: "center" }}>{cart[m.id] || 0}</span>
                  <button className="btn btn--sm" onClick={() => setQty(m.id, 1)}>+</button>
                </div>
              </div>
            ))}
          </div>
          <div className="kv" style={{ fontWeight: 700, fontSize: 16, marginTop: 12 }}><span>Total</span><span className="t-mono">{money(total)}</span></div>
        </div>
      </div>
    </Modal>
  );
}
