import { useState } from "react";
import { useMenu } from "../context/MenuContext.jsx";
import MenuCard from "../components/MenuCard.jsx";

export default function MenuPage() {
  const { menu, categories, loading, error } = useMenu();
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? menu : menu.filter((m) => m.category === active);

  return (
    <section className="section">
      <div className="container">
        <span className="eyebrow">Our Kitchen</span>
        <h2 className="section-title">Full Menu</h2>
        <p className="section-sub">Freshly prepared Indian dishes. Add to your order and check out securely.</p>

        {error && <p style={{ color: "#c0392b" }}>Couldn't load the menu. Is the backend running? ({error})</p>}

        <div className="filters">
          {categories.map((c) => (
            <button
              key={c}
              className={`filter ${active === c ? "active" : ""}`}
              onClick={() => setActive(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid">
          {loading ? (
            <p className="section-sub">Loading menu…</p>
          ) : (
            filtered.map((item) => <MenuCard key={item.id} item={item} />)
          )}
        </div>
      </div>
    </section>
  );
}
