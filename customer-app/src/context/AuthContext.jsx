import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch, getToken, setToken } from "../lib/api.js";
import { reconnectSocket, disconnectSocket } from "../lib/socket.js";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [ready, setReady] = useState(false);

  // Restore session on load
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setReady(true);
      return;
    }
    apiFetch("/api/customer/auth/me", { auth: true })
      .then((d) => {
        setCustomer(d.customer);
        reconnectSocket();
      })
      .catch(() => setToken(null))
      .finally(() => setReady(true));
  }, []);

  async function login(email, password) {
    const d = await apiFetch("/api/customer/auth/login", {
      method: "POST",
      body: { email, password },
    });
    setToken(d.token);
    setCustomer(d.customer);
    reconnectSocket();
    return d.customer;
  }

  async function register(payload) {
    const d = await apiFetch("/api/customer/auth/register", {
      method: "POST",
      body: payload,
    });
    setToken(d.token);
    setCustomer(d.customer);
    reconnectSocket();
    return d.customer;
  }

  function logout() {
    setToken(null);
    setCustomer(null);
    disconnectSocket();
  }

  const value = { customer, ready, isAuthed: !!customer, login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
