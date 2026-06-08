import { Link } from "react-router-dom";
import { useMenu } from "../context/MenuContext.jsx";
import MenuCard from "../components/MenuCard.jsx";

export default function Home() {
  const { menu, loading } = useMenu();
  const featured = menu.slice(0, 3);
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">Dessau-Roßlau · Germany</span>
            <h1>Authentic Indian Kitchen, Delivered Fresh.</h1>
            <p>
              Home-style idli, dosa, thalis & curries — cooked every morning and
              brought to your door. Order a parcel, grab a pickup, or subscribe
              for daily lunch.
            </p>
            <div className="hero-cta">
              <Link to="/menu" className="btn btn-primary">Order Now 🍽️</Link>
              <Link to="/subscribe" className="btn btn-ghost">View Subscriptions</Link>
            </div>
            <div className="stats">
              <div className="stat"><strong>100%</strong><span>Lovable</span></div>
              <div className="stat"><strong>Daily</strong><span>Fresh Cooked</span></div>
              <div className="stat"><strong>Live</strong><span>Order Tracking</span></div>
            </div>
          </div>
          <div className="hero-card">
            <h3>🥗 Today's Special</h3>
            <p className="card-desc" style={{ marginTop: 8 }}>
              Idli + Sambar + Coconut Chutney + Sweet — the perfect South Indian start.
            </p>
            <div className="chips">
              <span className="chip">Vegan options</span>
              <span className="chip">SEPA / Card</span>
              <span className="chip">Free parcel over €25</span>
              <span className="chip">Live order tracking</span>
            </div>
            <div style={{ marginTop: 22 }}>
              <Link to="/menu" className="btn btn-primary btn-block">See full menu →</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <span className="eyebrow">Crowd Favourites</span>
          <h2 className="section-title">Popular this week</h2>
          <p className="section-sub">A taste of what our kitchen is loving right now.</p>
          <div className="grid" style={{ marginTop: 28 }}>
            {loading ? (
              <p className="section-sub">Loading menu…</p>
            ) : (
              featured.map((item) => <MenuCard key={item.id} item={item} />)
            )}
          </div>
          <div style={{ marginTop: 28 }}>
            <Link to="/menu" className="btn btn-ghost">Browse all dishes →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
