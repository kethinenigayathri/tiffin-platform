import { createContext, useContext, useEffect, useRef, useState } from "react";
import { apiFetch } from "../lib/api.js";
import { getSocket } from "../lib/socket.js";
import { useAuth } from "./AuthContext.jsx";

const StoreContext = createContext(null);
export const useStore = () => useContext(StoreContext);

export function StoreProvider({ children }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [partners, setPartners] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [simulate, setSimulate] = useState(true); // toggles the "Live" badge
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  function flash(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }

  // ---- initial load + live sync (only when signed in) ----
  async function loadAll() {
    const [o, m, p, c] = await Promise.all([
      apiFetch("/api/orders").catch(() => []),
      apiFetch("/api/menu?all=1").catch(() => []),
      apiFetch("/api/partners").catch(() => []),
      apiFetch("/api/customers").catch(() => []),
    ]);
    setOrders(o);
    setMenu(m);
    setPartners(p);
    setCustomers(c);

    console.log("PARTNERS:", p);
  }

  useEffect(() => {
    if (!user) return;
    loadAll();

    const socket = getSocket();
    if (!socket.connected) socket.connect();

    const onNew = (order) => {
      setOrders((prev) => (prev.some((o) => o.id === order.id) ? prev : [order, ...prev]));
      flash(`New order #${order.no} received`);
    };
    const onUpdate = (order) => {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
    };
    const onMenu = () => apiFetch("/api/menu?all=1").then(setMenu).catch(() => {});
    const onPartners = () => apiFetch("/api/partners").then(setPartners).catch(() => {});

    socket.on("order:new", onNew);
    socket.on("order:update", onUpdate);
    socket.on("menu:update", onMenu);
    socket.on("partners:update", onPartners);
    return () => {
      socket.off("order:new", onNew);
      socket.off("order:update", onUpdate);
      socket.off("menu:update", onMenu);
      socket.off("partners:update", onPartners);
    };
  }, [user]);

  const findId = (no) => orders.find((o) => o.no === no)?.id;

  // ---- order actions (identified by order number, mapped to id) ----
  async function addOrder(data) {
    try {
      await apiFetch("/api/orders/manual", { method: "POST", body: data });
      // order:new socket event will add it to the list
    } catch (e) {
      flash(e.message);
    }
  }
  async function setStatus(no, status) {
    const id = findId(no);
    if (!id) return;
    setOrders((prev) => prev.map((o) => (o.no === no ? { ...o, status } : o)));
    try {
      await apiFetch(`/api/orders/${id}/status`, { method: "PATCH", body: { status } });
    } catch (e) {
      flash(e.message);
    }
  }
  async function assignPartner(no, partnerId) {
    console.log("PARTNER SENT:", partnerId);
    const id = findId(no);
    if (!id) return;
    try {
      await apiFetch(`/api/orders/${id}/assign`, { method: "PATCH", body: { partnerId } });
      if (partnerId) flash("Delivery partner assigned");
    } catch (e) {
      flash(e.message);
    }
  }
  async function markPickup(no) {
    const id = findId(no);
    if (!id) return;
    try {
      await apiFetch(`/api/orders/${id}/pickup`, { method: "PATCH" });
      flash("Marked as self-pickup");
    } catch (e) {
      flash(e.message);
    }
  }
  async function cancelOrder(no) {
    const id = findId(no);
    if (!id) return;
    setOrders((prev) => prev.map((o) => (o.no === no ? { ...o, status: "cancelled" } : o)));
    try {
      await apiFetch(`/api/orders/${id}/cancel`, { method: "PATCH" });
    } catch (e) {
      flash(e.message);
    }
  }

  // ---- menu actions ----
  async function saveMenuItem(item) {
    try {
      await apiFetch("/api/menu", { method: "POST", body: item });
    } catch (e) {
      flash(e.message);
    }
  }
  async function toggleMenuItem(id) {
    try {
      await apiFetch(`/api/menu/${id}/toggle`, { method: "PATCH" });
    } catch (e) {
      flash(e.message);
    }
  }
  async function deleteMenuItem(id) {
    try {
      await apiFetch(`/api/menu/${id}`, { method: "DELETE" });
    } catch (e) {
      flash(e.message);
    }
  }

  // ---- partner actions ----
  async function savePartner(p) {
    try {
      await apiFetch("/api/partners", { method: "POST", body: p });
    } catch (e) {
      flash(e.message);
    }
  }
  
  async function setPartnerStatus(id, status) {
    try {
      await apiFetch(`/api/partners/${id}/status`, { method: "PATCH", body: { status } });
    } catch (e) {
      flash(e.message);
    }
  }
  async function deletePartner(id) {
    try {
      await apiFetch(`/api/partners/${id}`, { method: "DELETE" });
    } catch (e) {
      flash(e.message);
    }
  }

  function resetData() {
    loadAll();
    flash("Data refreshed from server");
  }

  const value = {
    orders, menu, partners, customers,
    simulate, setSimulate, toast, flash,
    addOrder, setStatus, assignPartner, markPickup, cancelOrder,
    saveMenuItem, toggleMenuItem, deleteMenuItem,
    savePartner, setPartnerStatus, deletePartner, resetData,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
