import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function CartDrawer() {
  const { items, open, setOpen, changeQty, removeItem, subtotal } = useCart();
  const navigate = useNavigate();
  if (!open) return null;

  const goCheckout = () => {
    setOpen(false);
    navigate("/checkout");
  };

  return (
    <>
      <div className="drawer-overlay" onClick={() => setOpen(false)} />
      <aside className="drawer">
        <div className="drawer-head">
          <h3>Your Order</h3>
          <button className="icon-btn" onClick={() => setOpen(false)}>✕</button>
        </div>
        <div className="drawer-body">
          {items.length === 0 ? (
            <p className="empty">Your cart is empty.<br />Add some delicious tiffin! 🍛</p>
          ) : (
            items.map((i) => (
              <div className="line-item" key={i.id}>
                <span className="line-emoji">{i.emoji}</span>
                <div className="line-info">
                  <strong>{i.name}</strong>
                  <small>€{i.price.toFixed(2)}</small>
                </div>
                <div className="qty">
                  <button onClick={() => changeQty(i.id, -1)}>−</button>
                  <span>{i.qty}</span>
                  <button onClick={() => changeQty(i.id, 1)}>+</button>
                </div>
                <button className="icon-btn" onClick={() => removeItem(i.id)}>🗑️</button>
              </div>
            ))
          )}
        </div>
        {items.length > 0 && (
          <div className="drawer-foot">
            <div className="drawer-total">
              <span>Subtotal</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            <button className="btn btn-primary btn-block" onClick={goCheckout}>
              Checkout →
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
