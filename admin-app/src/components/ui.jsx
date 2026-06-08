import { STATUS_LABELS, STATUS_CLASS } from "../data/seed.js";

export function StatusBadge({ status }) {
  return (
    <span className={`badge ${STATUS_CLASS[status] || "b-muted"}`}>
      <span className="dot" /> {STATUS_LABELS[status] || status}
    </span>
  );
}

export function TypeBadge({ type }) {
  return (
    <span className={`badge ${type === "pickup" ? "b-pickup" : "b-delivery"}`}>
      {type === "pickup" ? "🏪 Pickup" : "🛵 Delivery"}
    </span>
  );
}

const COLORS = ["#e8590c", "#1971c2", "#7048e8", "#2f9e44", "#f08c00", "#c2255c"];
export function Avatar({ name }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const color = COLORS[name.charCodeAt(0) % COLORS.length];
  return <div className="avatar" style={{ background: color }}>{initials}</div>;
}

export function money(n) {
  return "£" + Number(n).toFixed(2);
}

export function timeAgo(iso) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
