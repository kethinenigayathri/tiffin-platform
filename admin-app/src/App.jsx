import { useState } from "react";
import { Routes, Route, NavLink, useLocation, Navigate } from "react-router-dom";
import { useStore } from "./context/StoreContext.jsx";
import { useAuth, ROLE_LABELS } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Orders from "./pages/Orders.jsx";
import Partners from "./pages/Partners.jsx";
import Menu from "./pages/Menu.jsx";
import Analytics from "./pages/Analytics.jsx";
import Customers from "./pages/Customers.jsx";

const NAV = [
  { to: "/", label: "Dashboard", icon: "📊", end: true },
  { to: "/orders", label: "Orders", icon: "🧾", badgeKey: "active" },
  { to: "/partners", label: "Delivery Partners", icon: "🛵", perm: "partners:manage" },
  { to: "/menu", label: "Menu", icon: "🍛", perm: "menu:manage" },
  { to: "/customers", label: "Customers", icon: "👥" },
  { to: "/analytics", label: "Analytics", icon: "📈" },
];

const PAGE_META = {
  "/": { title: "Operations Dashboard", sub: "Live overview of today’s service" },
  "/orders": { title: "Orders", sub: "Receive, prepare and dispatch orders" },
  "/partners": { title: "Delivery Partners", sub: "Manage riders and availability" },
  "/menu": { title: "Menu Management", sub: "Items, pricing and availability" },
  "/customers": { title: "Customers", sub: "Customer directory and history" },
  "/analytics": { title: "Analytics & Reports", sub: "Sales and performance insights" },
};

function initials(name) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function App() {
  const { orders, toast, simulate, setSimulate } = useStore();
  const { user, ready, logout, can } = useAuth();
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  if (!ready) {
    return (
      <div className="login">
        <div className="login__card card" style={{ textAlign: "center" }}>
          <div className="sidebar__logo" style={{ margin: "0 auto 12px" }}>🍛</div>
          <p className="muted">Connecting to the kitchen…</p>
        </div>
      </div>
    );
  }

  if (!user) return <Login />;

  const meta = PAGE_META[loc.pathname] || { title: "", sub: "" };
  const activeCount = orders.filter((o) => !["completed", "cancelled"].includes(o.status)).length;
  const navItems = NAV.filter((n) => !n.perm || can(n.perm));

  return (
    <div className="app">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar__brand">
          <div className="sidebar__logo">🍛</div>
          <div>
            <h1>Indian Kitchen</h1>
            <span>Restaurant Console</span>
          </div>
        </div>
        <nav className="nav">
          <div className="nav__label">Operations</div>
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `nav__item ${isActive ? "active" : ""}`}
            >
              <span className="ico">{n.icon}</span>
              <span>{n.label}</span>
              {n.badgeKey === "active" && activeCount > 0 && <span className="nav__badge">{activeCount}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__foot">
          <label className="row small" style={{ cursor: "pointer", color: "#d4cab8" }}>
            <input type="checkbox" checked={simulate} onChange={(e) => setSimulate(e.target.checked)} />
            Live order simulation
          </label>
        </div>
      </aside>
      <div className={`backdrop ${open ? "show" : ""}`} onClick={() => setOpen(false)} />

      <div className="main">
        <header className="topbar">
          <button className="menu-toggle" onClick={() => setOpen(true)}>☰</button>
          <div>
            <h2>{meta.title}</h2>
            <p>{meta.sub}</p>
          </div>
          <div className="topbar__spacer" />
          {simulate && (
            <div className="row small muted" style={{ gap: 8 }}>
              <span className="live-dot" /> Live
            </div>
          )}
          <div className="user-chip">
            <div className="avatar" style={{ background: "var(--primary)" }}>{initials(user.name)}</div>
            <div className="user-chip__meta">
              <span className="user-chip__name">{user.name}</span>
              <span className="user-chip__role">{ROLE_LABELS[user.role]}</span>
            </div>
            <button className="btn btn--ghost btn--sm" onClick={logout} title="Sign out">Sign out</button>
          </div>
        </header>

        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/partners" element={can("partners:manage") ? <Partners /> : <Navigate to="/" replace />} />
            <Route path="/menu" element={can("menu:manage") ? <Menu /> : <Navigate to="/" replace />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </div>
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#221c14", color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 100, boxShadow: "var(--shadow)" }}>
          🔔 {toast}
        </div>
      )}
    </div>
  );
}
