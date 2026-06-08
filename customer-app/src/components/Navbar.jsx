import { NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { count, setOpen } = useCart();
  const { isAuthed, customer, logout } = useAuth();
  const nav = useNavigate();

  return (
    <header className="nav">
      <div className="container nav-inner">
        <NavLink to="/" className="brand">
          <span className="brand-badge">🍛</span>
          Indian Tiffin <span style={{ color: "var(--primary-dark)" }}>&amp; Curry House</span>
        </NavLink>
        <nav className="nav-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/menu">Menu</NavLink>
          <NavLink to="/subscribe">Subscription</NavLink>
          <NavLink to="/orders">My Orders</NavLink>
        </nav>
        <div className="nav-actions">
          {isAuthed ? (
            <>
              <span className="nav-user" title={customer?.email}>Hi, {customer?.name?.split(" ")[0]}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => { logout(); nav("/"); }}>Sign out</button>
            </>
          ) : (
            <NavLink to="/account" className="btn btn-ghost btn-sm">Sign in</NavLink>
          )}
          <button className="cart-btn" onClick={() => setOpen(true)}>
            🛒 Cart
            {count > 0 && <span className="cart-count">{count}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
