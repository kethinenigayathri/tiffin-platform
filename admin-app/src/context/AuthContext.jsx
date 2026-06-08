import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch, getToken, setToken } from "../lib/api.js";
import { reconnectSocket, disconnectSocket } from "../lib/socket.js";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Role -> permissions (kept in sync with the backend).
export const ROLE_PERMISSIONS = {
  admin: ["orders:status", "orders:assign", "orders:create", "orders:cancel", "menu:manage", "partners:manage", "staff:manage"],
  manager: ["orders:status", "orders:assign", "orders:create", "orders:cancel", "menu:manage", "partners:manage"],
  dispatcher: ["orders:status", "orders:assign", "orders:create"],
};

export const ROLE_LABELS = {
  admin: "Administrator",
  manager: "Manager",
  dispatcher: "Dispatcher",
};

// Demo staff accounts (for the quick-login buttons on the sign-in screen).
export const STAFF = [
  { id: "u1", name: "Priya Sharma", username: "admin", password: "admin123", role: "admin" },
  { id: "u2", name: "Raj Patel", username: "manager", password: "manager123", role: "manager" },
  { id: "u3", name: "Amit Singh", username: "dispatch", password: "dispatch123", role: "dispatcher" },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setReady(true);
      return;
    }
    apiFetch("/api/staff/auth/me")
      .then((d) => {
        setUser(d.user);
        setPermissions(d.permissions || ROLE_PERMISSIONS[d.user.role] || []);
        reconnectSocket();
      })
      .catch(() => setToken(null))
      .finally(() => setReady(true));
  }, []);

  async function login(username, password) {
    try {
      const d = await apiFetch("/api/staff/auth/login", {
        method: "POST",
        auth: false,
        body: { username, password },
      });
      setToken(d.token);
      setUser(d.user);
      setPermissions(d.permissions || ROLE_PERMISSIONS[d.user.role] || []);
      reconnectSocket();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  function logout() {
    setToken(null);
    setUser(null);
    setPermissions([]);
    disconnectSocket();
  }

  function can(permission) {
    return permissions.includes(permission);
  }

  const value = { user, ready, permissions, login, logout, can, role: user?.role || null };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
