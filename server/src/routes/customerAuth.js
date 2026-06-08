// Customer registration + login.
import express from "express";
import { db, hashPassword, verifyPassword, uid } from "../db.js";
import { signToken, requireCustomer } from "../auth.js";

const router = express.Router();

function publicCustomer(c) {
  return { id: c.id, name: c.name, email: c.email, phone: c.phone, address: c.address };
}

router.post("/register", (req, res) => {
  const { name, email, password, phone, address } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required" });
  }
  const exists = db.prepare("SELECT id FROM customers WHERE email = ?").get(email.toLowerCase());
  if (exists) return res.status(409).json({ error: "An account with this email already exists" });

  const customer = {
    id: uid("cust"),
    name,
    email: email.toLowerCase(),
    phone: phone || "",
    address: address || "",
    password: hashPassword(password),
    created_at: new Date().toISOString(),
  };
  db.prepare(
    "INSERT INTO customers (id, name, email, phone, address, password, created_at) VALUES (@id, @name, @email, @phone, @address, @password, @created_at)"
  ).run(customer);

  const token = signToken({ kind: "customer", sub: customer.id, name: customer.name });
  res.json({ token, customer: publicCustomer(customer) });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
  const customer = db.prepare("SELECT * FROM customers WHERE email = ?").get(email.toLowerCase());
  if (!customer || !verifyPassword(password, customer.password)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const token = signToken({ kind: "customer", sub: customer.id, name: customer.name });
  res.json({ token, customer: publicCustomer(customer) });
});

router.get("/me", requireCustomer, (req, res) => {
  const customer = db.prepare("SELECT * FROM customers WHERE id = ?").get(req.user.sub);
  if (!customer) return res.status(404).json({ error: "Not found" });
  res.json({ customer: publicCustomer(customer) });
});

export default router;
