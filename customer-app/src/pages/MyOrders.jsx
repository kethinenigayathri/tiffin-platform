import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiFetch } from "../lib/api.js";
import { getSocket } from "../lib/socket.js";

const STEPS = ["new", "preparing", "ready", "out", "completed"];
const LABELS = {
  new: "Order received",
  preparing: "Preparing",
  ready: "Ready",
  out: "Out for delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

function Tracker({ order }) {
  if (order.status === "cancelled") {
    return <div className="track cancelled">This order was cancelled.</div>;
  }
  const idx = STEPS.indexOf(order.status);
  const steps = order.type === "pickup" ? STEPS.filter((s) => s !== "out") : STEPS;
  return (
    <div className="track">
      {steps.map((s) => {
        const sIdx = STEPS.indexOf(s);
        const done = sIdx <= idx;
        const isLabel = s === "out" && order.type === "pickup";
        if (isLabel) return null;
        return (
          <div key={s} className={`track-step ${done ? "done" : ""} ${order.status === s ? "current" : ""}`}>
            <span className="dot" />
            <span>{s === "completed" && order.type === "pickup" ? "Picked up" : LABELS[s]}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function MyOrders() {
  const { isAuthed, ready } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready || !isAuthed) return;
    apiFetch("/api/orders/mine", { auth: true })
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));

    const socket = getSocket();
    if (!socket.connected) socket.connect();
    const onUpdate = (order) => {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
    };
    socket.on("order:update", onUpdate);
    return () => socket.off("order:update", onUpdate);
  }, [ready, isAuthed]);

  if (ready && !isAuthed) {
    return (
      <section className="section">
        <div className="container">
          <div className="success">
            <div className="big">🔒</div>
            <h2 className="section-title">Sign in to see your orders</h2>
            <Link to="/account" state={{ from: "/orders" }} className="btn btn-primary" style={{ marginTop: 16 }}>
              Sign in
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <span className="eyebrow">Live tracking</span>
        <h2 className="section-title">My Orders</h2>
        <p className="section-sub" style={{ marginBottom: 24 }}>
          Status updates appear here instantly as the kitchen works on your order.
        </p>

        {loading ? (
          <p className="section-sub">Loading…</p>
        ) : orders.length === 0 ? (
          <div className="success">
            <div className="big">🍽️</div>
            <h3>No orders yet</h3>
            <Link to="/menu" className="btn btn-primary" style={{ marginTop: 16 }}>Order now</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((o) => (
              <div className="order-card" key={o.id}>
                <div className="order-card__head">
                  <div>
                    <strong>Order #{o.no}</strong>
                    <span className="muted"> · {o.type === "pickup" ? "Pickup" : "Delivery"}</span>
                  </div>
                  <span className={`pill pill-${o.status}`}>{LABELS[o.status]}</span>
                </div>
                <Tracker order={o} />
                <div className="order-card__items">
                  {o.items.map((i, idx) => (
                    <span key={idx}>{i.qty}× {i.name}</span>
                  ))}
                </div>
                <div className="order-card__foot">
                  <span className="muted">{new Date(o.placedAt).toLocaleString()}</span>
                  <strong>€{o.total.toFixed(2)}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
