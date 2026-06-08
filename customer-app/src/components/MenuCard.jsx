import { useCart } from "../context/CartContext.jsx";

export default function MenuCard({ item }) {
  const { addItem } = useCart();
  return (
    <article className="card">
      <div className="card-emoji">{item.emoji}</div>
      <div className="card-body">
        <span className="tag">{item.tag}</span>
        <h3>{item.name}</h3>
        <p className="card-desc">{item.desc}</p>
        <div className="card-foot">
          <span className="price">€{item.price.toFixed(2)}</span>
          <button className="btn btn-primary" onClick={() => addItem(item)}>Add +</button>
        </div>
      </div>
    </article>
  );
}
