import { useStore } from "../context/StoreContext.jsx";
import { money } from "../components/ui.jsx";

export default function Analytics() {
  const { orders, menu, partners } = useStore();
  const completed = orders.filter((o) => o.status === "completed");
  const revenue = completed.reduce((s, o) => s + o.total, 0);
  const avg = completed.length ? revenue / completed.length : 0;
  const deliveryCount = orders.filter((o) => o.type === "delivery").length;
  const pickupCount = orders.filter((o) => o.type === "pickup").length;

  // weekly revenue (mock distribution seeded by today's revenue)
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const base = Math.max(revenue, 80);
  const weekly = [0.7, 0.5, 0.8, 0.9, 1.4, 1.7, 1.1].map((f) => Math.round(base * f));
  const maxWeek = Math.max(...weekly);

  // top items
  const itemCount = {};
  orders.forEach((o) => o.items.forEach((i) => { itemCount[i.name] = (itemCount[i.name] || 0) + i.qty; }));
  const topItems = Object.entries(itemCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxItem = topItems.length ? topItems[0][1] : 1;

  // partner leaderboard
  const board = [...partners].sort((a, b) => b.deliveries - a.deliveries).slice(0, 5);

  return (
    <>
      <div className="grid stat-grid" style={{ marginBottom: 22 }}>
        <Box icon="💷" value={money(revenue)} label="Total revenue" bg="var(--green-soft)" color="var(--green)" />
        <Box icon="🧾" value={completed.length} label="Completed orders" bg="var(--blue-soft)" color="var(--blue)" />
        <Box icon="🧮" value={money(avg)} label="Avg. order value" bg="var(--amber-soft)" color="var(--amber)" />
        <Box icon="🛵" value={`${deliveryCount}/${pickupCount}`} label="Delivery / Pickup" bg="var(--primary-soft)" color="var(--primary)" />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.5fr 1fr" }}>
        <div className="card card-pad">
          <div className="section-title">📈 Revenue this week</div>
          <div className="chart-bars">
            {weekly.map((v, i) => (
              <div className="col" key={i}>
                <div className="b" style={{ height: `${(v / maxWeek) * 100}%` }} title={money(v)} />
                <div className="cap">{days[i]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-pad">
          <div className="section-title">🍛 Top selling items</div>
          {topItems.map(([name, count]) => (
            <div key={name} style={{ marginBottom: 12 }}>
              <div className="between small" style={{ marginBottom: 4 }}><span>{name}</span><span className="muted">{count} sold</span></div>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${(count / maxItem) * 100}%` }} /></div>
            </div>
          ))}
        </div>
      </div>

      <div className="card card-pad" style={{ marginTop: 18 }}>
        <div className="section-title">🏆 Partner leaderboard</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Partner</th><th>Zone</th><th>Rating</th><th>Total deliveries</th></tr></thead>
            <tbody>
              {board.map((p, i) => (
                <tr key={p.id}>
                  <td className="t-mono">{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td className="muted small">{p.zone}</td>
                  <td>⭐ {p.rating}</td>
                  <td className="t-mono">{p.deliveries}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Box({ icon, value, label, bg, color }) {
  return (
    <div className="stat">
      <div className="stat__top"><div className="stat__icon" style={{ background: bg, color }}>{icon}</div></div>
      <div className="stat__value">{value}</div>
      <div className="stat__label">{label}</div>
    </div>
  );
}
