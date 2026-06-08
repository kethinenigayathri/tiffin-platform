import { useMemo, useState } from "react";
import { useStore } from "../context/StoreContext.jsx";
import { Avatar, money } from "../components/ui.jsx";

export default function Customers() {
  const { customers, orders } = useStore();
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    return customers
      .map((c) => {
        const theirOrders = orders.filter((o) => o.customer === c.name);
        const liveSpent = theirOrders.filter((o) => o.status === "completed").reduce((s, o) => s + o.total, 0);
        return { ...c, liveOrders: theirOrders.length, liveSpent: c.spent + liveSpent };
      })
      .filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q));
  }, [customers, orders, q]);

  return (
    <>
      <div className="toolbar">
        <div className="search">
          <span className="ico">🔍</span>
          <input className="input" placeholder="Search customers" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="card table-wrap">
        <table>
          <thead><tr><th>Customer</th><th>Phone</th><th>Address</th><th>Orders</th><th>Lifetime spend</th><th>Since</th></tr></thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td><div className="row"><Avatar name={c.name} /><span style={{ fontWeight: 600 }}>{c.name}</span></div></td>
                <td className="small muted">{c.phone}</td>
                <td className="small muted">{c.address}</td>
                <td className="t-mono">{c.orders}</td>
                <td className="t-mono">{money(c.liveSpent)}</td>
                <td className="small muted">{c.since}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
