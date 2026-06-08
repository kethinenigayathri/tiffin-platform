// Customer registration + login.
import express from "express";
import { db, hashPassword, verifyPassword, uid } from "../db.js";
import { signToken, requireCustomer } from "../auth.js";
import Customer from "../models/Customer.js";

const router = express.Router();

function publicCustomer(c) {
  return { id: c.id, name: c.name, email: c.email, phone: c.phone, address: c.address };
}

router.post("/register", async(req, res) => {
  const { name, email, password, phone, address } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required" });
  }
  const exists = await Customer.findOne({
  email: email.toLowerCase(),
});
  if (exists) return res.status(409).json({ error: "An account with this email already exists" });

  
  const customer = await Customer.create({
  name,
  email: email.toLowerCase(),
  phone,
  address,
  password: hashPassword(password),
});

  const token = signToken({ kind: "customer", sub: customer.id, name: customer.name });
  res.json({ token, customer: publicCustomer(customer) });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
  const customer = await Customer.findOne({
  email: email.toLowerCase(),
});
  if (!customer || !verifyPassword(password, customer.password)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const token = signToken({ kind: "customer", sub: customer.id, name: customer.name });
  res.json({ token, customer: publicCustomer(customer) });
});

router.get("/me", requireCustomer, async (req, res) => {
  const customer = await Customer.findById(
  req.user.sub
);
  if (!customer) return res.status(404).json({ error: "Not found" });
  res.json({ customer: publicCustomer(customer) });
});

export default router;
