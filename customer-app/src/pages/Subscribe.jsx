import { plans } from "../data/menu.js";

export default function Subscribe() {
  return (
    <section className="section">
      <div className="container">
        <span className="eyebrow">Tiffin Subscription</span>
        <h2 className="section-title">Daily lunch, sorted.</h2>
        <p className="section-sub">Pick a plan and get fresh tiffin delivered on a schedule. Pause, skip, or cancel anytime.</p>

        <div className="plans" style={{ marginTop: 32 }}>
          {plans.map((p) => (
            <div key={p.id} className={`plan ${p.featured ? "featured" : ""}`}>
              {p.featured && <span className="badge">Most Popular</span>}
              <h3>{p.name}</h3>
              <div className="pp">€{p.price}<span>{p.period}</span></div>
              <ul>
                {p.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
              <button className={`btn btn-block ${p.featured ? "btn-primary" : "btn-ghost"}`}>
                Choose {p.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
