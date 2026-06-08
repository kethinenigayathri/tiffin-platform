// Express + Socket.IO server entry point.
import "./config.js";
import http from "node:http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { config } from "./config.js";
import { db, seed } from "./db.js";
import { verifyToken } from "./auth.js";

import customerAuth from "./routes/customerAuth.js";
import staffAuth from "./routes/staffAuth.js";
import menu from "./routes/menu.js";
import orders from "./routes/orders.js";
import partners from "./routes/partners.js";
import customers from "./routes/customers.js";

seed();

const app = express();
app.use(cors({ origin: config.clientOrigins.length ? config.clientOrigins : true }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: config.clientOrigins.length ? config.clientOrigins : true },
});
app.set("io", io);

// Socket auth + room joining for live two-way sync.
io.on("connection", (socket) => {
  const token = socket.handshake.auth?.token;
  const decoded = token ? verifyToken(token) : null;
  if (decoded?.kind === "staff") {
    socket.join("staff"); // restaurant console receives new orders + updates
  } else if (decoded?.kind === "customer") {
    socket.join(`customer_${decoded.sub}`); // customer receives their order updates
  }
});

app.get("/api/health", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use("/api/customer/auth", customerAuth);
app.use("/api/staff/auth", staffAuth);
app.use("/api/menu", menu);
app.use("/api/orders", orders);
app.use("/api/partners", partners);
app.use("/api/customers", customers);

server.listen(config.port, () => {
  console.log(`\n🍛  Tiffin platform API running on http://localhost:${config.port}`);
  console.log(`    Allowed origins: ${config.clientOrigins.join(", ")}`);
  console.log(`    Customer demo login: demo@tiffin.com / demo123`);
  console.log(`    Staff demo login:    admin / admin123\n`);
});
