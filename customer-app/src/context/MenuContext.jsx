import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../lib/api.js";
import { getSocket } from "../lib/socket.js";

const MenuContext = createContext(null);
export const useMenu = () => useContext(MenuContext);

export function MenuProvider({ children }) {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    try {
      const data = await apiFetch("/api/menu");
      setMenu(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // Live menu updates pushed from the restaurant console.
    const socket = getSocket();
    if (!socket.connected) socket.connect();
    const onUpdate = () => load();
    socket.on("menu:update", onUpdate);
    return () => socket.off("menu:update", onUpdate);
  }, []);

  const categories = ["All", ...Array.from(new Set(menu.map((m) => m.category))).filter(Boolean)];

  return (
    <MenuContext.Provider value={{ menu, categories, loading, error, reload: load }}>
      {children}
    </MenuContext.Provider>
  );
}
