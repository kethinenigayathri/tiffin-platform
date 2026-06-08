import { useState } from "react";
import { useAuth, STAFF, ROLE_LABELS } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    const res = await login(username, password);
    if (!res.ok) setError(res.error);
  }

  async function quick(u) {
    const res = await login(u.username, u.password);
    if (!res.ok) setError(res.error);
  }

  return (
    <div className="login">
      <div className="login__card card">
        <div className="login__brand">
          <div className="sidebar__logo">🍛</div>
          <div>
            <h1>Tiffin & Curry House</h1>
            <span>Restaurant Console — Staff Login</span>
          </div>
        </div>

        <form onSubmit={submit}>
          <div className="field">
            <label>Username</label>
            <input
              className="input"
              placeholder="e.g. admin"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              autoFocus
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
            />
          </div>
          {error && <p className="login__error">{error}</p>}
          <button className="btn btn--primary" type="submit" style={{ width: "100%", justifyContent: "center", marginTop: 6 }}>
            Sign in
          </button>
        </form>

        <div className="divider" />
        <div className="login__demo">
          <div className="small muted" style={{ marginBottom: 8 }}>Demo accounts — click to sign in</div>
          {STAFF.map((s) => (
            <button key={s.id} type="button" className="login__demo-row" onClick={() => quick(s)}>
              <div>
                <div style={{ fontWeight: 600 }}>{s.name}</div>
                <div className="small muted">{s.username} · {s.password}</div>
              </div>
              <span className="badge b-muted">{ROLE_LABELS[s.role]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
