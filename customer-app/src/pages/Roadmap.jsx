import { roadmap } from "../data/roadmap.js";

export default function Roadmap() {
  return (
    <section className="section">
      <div className="container">
        <span className="eyebrow">Behind the scenes</span>
        <h2 className="section-title">Full Tech Build Roadmap</h2>
        <p className="section-sub">
          The 12-phase plan to take Indian Tiffin &amp; Curry House from idea to a live
          website, iOS &amp; Android app — payments, auth, admin and more.
        </p>

        <div className="table-wrap" style={{ marginTop: 28 }}>
          <table>
            <thead>
              <tr>
                <th>Phase</th>
                <th>Tab</th>
                <th>Focus Area</th>
                <th>Key Deliverable</th>
                <th>AI Tool</th>
                <th>Timeline</th>
                <th>Cost (€)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {roadmap.map((r) => (
                <tr key={r.phase}>
                  <td><strong>{r.phase}</strong></td>
                  <td>{r.tab}</td>
                  <td>{r.focus}</td>
                  <td>{r.deliverable}</td>
                  <td>{r.tool}</td>
                  <td>{r.timeline}</td>
                  <td>{r.cost}</td>
                  <td><span className="status">📋 {r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
