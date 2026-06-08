import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext.jsx";
import { StatusBadge, TypeBadge, Avatar, money, timeAgo } from "../components/ui.jsx";

function Stat({ icon, value, label, delta, up, bg, color }) {
  return (
    <div className="stat">
      <div className="stat__top">
        <div className="stat__icon" style={{ background: bg, color }}>{icon}</div>
        {delta && <span className={`stat__delta ${up ? "up" : "down"}`}>{up ? "▲" : "▼"} {delta}</span>}
      </div>
      <div className="stat__value">{value}</div>
      <div className="stat__label">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { orders, partners } = useStore();
  const today = orders;
  const revenue = today.filter((o) => o.status === "completed").reduce((s, o) => s + o.total, 0);
  const active = today.filter((o) => !["completed", "cancelled"].includes(o.status));
  const newOrders = today.filter((o) => o.status === "new");
  const availablePartners = partners.filter((p) => p.status === "available").length;
  const recent = [...orders].slice(0, 6);
  const queue = active.filter((o) => o.status !== "out").slice(0, 5);

  return (
    <>
      <div className="grid stat-grid" style={{ marginBottom: 22 }}>
        <Stat icon="🧾" value={today.length} label="Orders today" delta="12%" up bg="var(--blue-soft)" color="var(--blue)" />
        <Stat icon="💷" value={money(revenue)} label="Revenue (completed)" delta="8%" up bg="var(--green-soft)" color="var(--green)" />
        <Stat icon="🔥" value={active.length} label="Active orders" bg="var(--amber-soft)" color="var(--amber)" />
        <Stat icon="🛵" value={`${availablePartners}/${partners.length}`} label="Partners available" bg="var(--primary-soft)" color="var(--primary)" />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
        <div className="card">
          <div className="between" style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)" }}>
            <div className="section-title" style={{ margin: 0 }}>Recent orders</div>
            <Link to="/orders" className="btn btn--ghost btn--sm">View all →</Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Order</th><th>Customer</th><th>Type</th><th>Status</th><th>Total</th></tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.no}>
                    <td className="t-mono">#{o.no}<div className="small muted">{timeAgo(o.placedAt)}</div></td>
                    <td>{o.customer}</td>
                    <td><TypeBadge type={o.type} /></td>
                    <td><StatusBadge status={o.status} /></td>
                    <td className="t-mono">{money(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card card-pad">
          <div className="section-title">🆕 New orders to action</div>
          {newOrders.length === 0 && <div className="muted small">No new orders waiting. 🎉</div>}
          {newOrders.slice(0, 5).map((o) => (
            <div key={o.no} className="between" style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div className="row">
                <Avatar name={o.customer} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>#{o.no} · {o.customer}</div>
                  <div className="small muted">{o.items.reduce((s, i) => s + i.qty, 0)} items · {money(o.total)}</div>
                </div>
              </div>
              <TypeBadge type={o.type} />
            </div>
          ))}
          <Link to="/orders" className="btn btn--primary" style={{ width: "100%", justifyContent: "center", marginTop: 16 }}>
            Go to order board
          </Link>
        </div>
      </div>

      <div className="card card-pad" style={{ marginTop: 18 }}>
        <div className="section-title">👨‍🍳 Kitchen queue</div>
        {queue.length === 0 && <div className="muted small">Kitchen is clear.</div>}
        {queue.map((o) => (
          <div key={o.no} className="between" style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
            <div>
              <span className="t-mono" style={{ fontWeight: 700 }}>#{o.no}</span>
              <span className="muted small"> — {o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</span>
            </div>
            <StatusBadge status={o.status} />
          </div>
        ))}
      </div>
    </>
  );
}
