import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiFetch } from "../lib/api.js";

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { isAuthed, customer } = useAuth();
  const [method, setMethod] = useState("parcel");
  const [address, setAddress] = useState(customer?.address || "");
  const [payment, setPayment] = useState("Card");
  const [note, setNote] = useState("");
  const [placed, setPlaced] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  const delivery = method === "parcel" && subtotal < 25 && subtotal > 0 ? 2.9 : 0;
  const total = subtotal + delivery;

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const order = await apiFetch("/api/orders", {
        method: "POST",
        auth: true,
        body: {
          items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, emoji: i.emoji })),
          type: method === "pickup" ? "pickup" : "delivery",
          address: method === "pickup" ? "—" : address,
          payment,
          note,
        },
      });
      setPlaced(order);
      clearCart();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (placed) {
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: 560 }}>
          <div className="success">
            <div className="big">🎉</div>
            <h2 className="section-title">Order #{placed.no} confirmed!</h2>
            <p className="section-sub" style={{ margin: "10px auto" }}>
              The restaurant has received your order. Track its progress live on the My Orders page.
            </p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => nav("/orders")}>
              Track my order →
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="section">
        <div className="container">
          <div className="success">
            <div className="big">🛒</div>
            <h2 className="section-title">Your cart is empty</h2>
            <p className="section-sub" style={{ margin: "10px auto" }}>Add some dishes before checking out.</p>
            <Link to="/menu" className="btn btn-primary" style={{ marginTop: 16 }}>Go to menu</Link>
          </div>
        </div>
      </section>
    );
  }

  if (!isAuthed) {
    return (
      <section className="section">
        <div className="container">
          <div className="success">
            <div className="big">🔒</div>
            <h2 className="section-title">Sign in to place your order</h2>
            <p className="section-sub" style={{ margin: "10px auto" }}>
              Create an account or sign in so the restaurant can confirm and you can track delivery live.
            </p>
            <Link to="/account" state={{ from: "/checkout" }} className="btn btn-primary" style={{ marginTop: 16 }}>
              Sign in to continue
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <span className="eyebrow">Almost there</span>
        <h2 className="section-title">Checkout</h2>
        <div className="checkout-grid" style={{ marginTop: 28 }}>
          <form className="form-card" onSubmit={submit}>
            <div className="field">
              <label>Ordering as</label>
              <input value={`${customer.name} · ${customer.email}`} disabled />
            </div>
            <div className="field">
              <label>Fulfilment</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="parcel">Parcel delivery</option>
                <option value="pickup">Pickup in store</option>
              </select>
            </div>
            {method === "parcel" && (
              <div className="field">
                <label>Delivery address</label>
                <textarea rows="2" required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, house no., 06844 Dessau-Roßlau" />
              </div>
            )}
            <div className="field">
              <label>Payment method</label>
              <select value={payment} onChange={(e) => setPayment(e.target.value)}>
                <option value="Card">Credit / Debit Card</option>
                <option value="SEPA">SEPA Direct Debit</option>
                <option value="Cash">Cash on delivery</option>
              </select>
            </div>
            <div className="field">
              <label>Note for the kitchen (optional)</label>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. extra spicy, no coriander" />
            </div>

            {error && <p style={{ color: "#c0392b", fontSize: "0.85rem" }}>{error}</p>}

            <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
              {busy ? "Placing order…" : `Place order · €${total.toFixed(2)}`}
            </button>
            <p style={{ color: "var(--muted)", fontSize: "0.78rem", marginTop: 12, textAlign: "center" }}>
              Demo checkout — no real payment is processed.
            </p>
          </form>

          <aside className="summary-card">
            <h3 style={{ marginBottom: 14 }}>Order summary</h3>
            {items.map((i) => (
              <div className="summary-line" key={i.id}>
                <span>{i.emoji} {i.name} × {i.qty}</span>
                <span>€{(i.price * i.qty).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-line">
              <span>Subtotal</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-line">
              <span>Delivery</span>
              <span>{delivery === 0 ? "Free" : `€${delivery.toFixed(2)}`}</span>
            </div>
            <div className="summary-line total">
              <span>Total</span>
              <span>€{total.toFixed(2)}</span>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
