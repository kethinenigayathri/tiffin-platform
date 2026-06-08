// Shared Socket.IO connection for the restaurant console (staff room).
import { io } from "socket.io-client";
import { API_URL, getToken } from "./api.js";

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(API_URL, { autoConnect: false, auth: { token: getToken() } });
  }
  return socket;
}

export function reconnectSocket() {
  const s = getSocket();
  if (s.connected) s.disconnect();
  s.auth = { token: getToken() };
  s.connect();
}

export function disconnectSocket() {
  if (socket) socket.disconnect();
}
