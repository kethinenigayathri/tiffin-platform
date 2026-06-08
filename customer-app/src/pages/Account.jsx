import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Account() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", address: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();
  const next = loc.state?.from || "/menu";

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") await login(form.email, form.password);
      else await register(form);
      nav(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 460 }}>
        <span className="eyebrow">Customer account</span>
        <h2 className="section-title">{mode === "login" ? "Welcome back" : "Create your account"}</h2>
        <p className="section-sub" style={{ marginBottom: 20 }}>
          {mode === "login"
            ? "Sign in to place orders and track them live."
            : "Register to order and follow your tiffin in real time."}
        </p>

        <form className="form-card" onSubmit={submit}>
          {mode === "register" && (
            <div className="field">
              <label>Full name</label>
              <input required value={form.name} onChange={set("name")} placeholder="Priya Sharma" />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input type="email" required value={form.email} onChange={set("email")} placeholder="you@email.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" required value={form.password} onChange={set("password")} placeholder="••••••••" />
          </div>
          {mode === "register" && (
            <>
              <div className="field">
                <label>Phone</label>
                <input value={form.phone} onChange={set("phone")} placeholder="+44 ..." />
              </div>
              <div className="field">
                <label>Delivery address</label>
                <textarea rows="2" value={form.address} onChange={set("address")} placeholder="Street, house no., city" />
              </div>
            </>
          )}

          {error && <p style={{ color: "#c0392b", fontSize: "0.85rem", margin: "4px 0" }}>{error}</p>}

          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>

          {mode === "login" && (
            <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: 12, textAlign: "center" }}>
              Demo: demo@tiffin.com / demo123
            </p>
          )}
        </form>

        <p style={{ textAlign: "center", marginTop: 16 }}>
          {mode === "login" ? (
            <>New here?{" "}
              <button className="linklike" onClick={() => { setMode("register"); setError(""); }}>Create an account</button>
            </>
          ) : (
            <>Already have an account?{" "}
              <button className="linklike" onClick={() => { setMode("login"); setError(""); }}>Sign in</button>
            </>
          )}
        </p>
        <p style={{ textAlign: "center", marginTop: 8 }}>
          <Link to="/menu" className="linklike">← Back to menu</Link>
        </p>
      </div>
    </section>
  );
}
