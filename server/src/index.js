// Express + Socket.IO server entry point.
import "./config.js";
import http from "node:http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import dotenv from "dotenv";

import connectDB from "../config/db.js";

import { config } from "./config.js";

import { verifyToken } from "./auth.js";

import customerAuth from "./routes/customerAuth.js";
import staffAuth from "./routes/staffAuth.js";
import menu from "./routes/menu.js";
import orders from "./routes/orders.js";
import partners from "./routes/partners.js";
import customers from "./routes/customers.js";

dotenv.config();
await connectDB();



const app = express();

app.use(
  cors({
    origin: config.clientOrigins.length
      ? config.clientOrigins
      : true,
  })
);

app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.clientOrigins.length
      ? config.clientOrigins
      : true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  const token = socket.handshake.auth?.token;
  const decoded = token ? verifyToken(token) : null;

  if (decoded?.kind === "staff") {
    socket.join("staff");
  } else if (decoded?.kind === "customer") {
    socket.join(`customer_${decoded.sub}`);
  }
});

app.get("/api/health", (req, res) =>
  res.json({
    ok: true,
    time: new Date().toISOString(),
  })
);

app.use("/api/customer/auth", customerAuth);
app.use("/api/staff/auth", staffAuth);
app.use("/api/menu", menu);
app.use("/api/orders", orders);
app.use("/api/partners", partners);
app.use("/api/customers", customers);

server.listen(config.port, () => {
  console.log(
    `🍛 Tiffin platform API running on http://localhost:${config.port}`
  );
});