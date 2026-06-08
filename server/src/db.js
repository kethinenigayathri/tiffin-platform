// SQLite database setup + seed data.
// Uses better-sqlite3 (synchronous, file-based — no external DB server needed).
import Database from "better-sqlite3";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data.sqlite");

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

// ---- password hashing (built-in crypto, no bcrypt dependency) ----
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hash] = stored.split(":");
  const check = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(check, "hex"));
}

// ---- schema ----
db.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    password TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    price REAL NOT NULL,
    emoji TEXT,
    tag TEXT,
    veg INTEGER DEFAULT 1,
    available INTEGER DEFAULT 1,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS partners (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    vehicle TEXT,
    status TEXT DEFAULT 'available',
    zone TEXT,
    rating REAL DEFAULT 5,
    deliveries INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    no INTEGER NOT NULL,
    customer_id TEXT,
    customer_name TEXT,
    phone TEXT,
    email TEXT,
    type TEXT DEFAULT 'delivery',
    address TEXT,
    items TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'new',
    partner_id TEXT,
    payment TEXT,
    note TEXT,
    placed_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS counters (
    name TEXT PRIMARY KEY,
    value INTEGER NOT NULL
  );
`);

// ---- order number counter helpers ----
export function nextOrderNo() {
  const row = db.prepare("SELECT value FROM counters WHERE name = 'order_no'").get();
  const next = (row ? row.value : 1000) + 1;
  db.prepare(
    "INSERT INTO counters (name, value) VALUES ('order_no', ?) ON CONFLICT(name) DO UPDATE SET value = ?"
  ).run(next, next);
  return next;
}

export const uid = (p = "id") => p + "_" + crypto.randomBytes(6).toString("hex");

// ---- seed (only when empty) ----
const SEED_MENU = [
  { id: "m1", name: "Classic Veg Tiffin", category: "Tiffin", price: 7.5, emoji: "🍛", tag: "Bestseller", veg: 1, available: 1, description: "Idli, sambar, coconut chutney & a sweet — the daily South Indian staple." },
  { id: "m2", name: "Masala Dosa", category: "Tiffin", price: 6.9, emoji: "🫓", tag: "Veg", veg: 1, available: 1, description: "Crispy rice crêpe stuffed with spiced potato, served with sambar & chutney." },
  { id: "m3", name: "Idli Sambar (4 pcs)", category: "Tiffin", price: 5.5, emoji: "🍙", tag: "Veg", veg: 1, available: 1, description: "Steamed rice cakes soaked in hot lentil sambar with chutney trio." },
  { id: "m4", name: "South Indian Veg Thali", category: "Curry House", price: 11.9, emoji: "🥗", tag: "Full Meal", veg: 1, available: 1, description: "Rice, two curries, dal, rasam, papad, pickle & dessert on one platter." },
  { id: "m5", name: "Paneer Butter Masala", category: "Curry House", price: 9.5, emoji: "🧈", tag: "Popular", veg: 1, available: 1, description: "Cottage cheese in a creamy tomato-cashew gravy. Served with rice or roti." },
  { id: "m6", name: "Butter Chicken", category: "Curry House", price: 11.5, emoji: "🍗", tag: "Popular", veg: 0, available: 1, description: "Creamy tomato gravy, served with naan." },
  { id: "m7", name: "Chana Masala", category: "Curry House", price: 8.5, emoji: "🫘", tag: "Vegan", veg: 1, available: 1, description: "Chickpeas simmered in a tangy onion-tomato masala with fresh coriander." },
  { id: "m8", name: "Veg Hyderabadi Biryani", category: "Curry House", price: 10.5, emoji: "🍚", tag: "Spicy", veg: 1, available: 1, description: "Fragrant basmati layered with vegetables, saffron & fried onions." },
  { id: "m9", name: "Garlic Naan", category: "Sides", price: 2.5, emoji: "🥖", tag: "Veg", veg: 1, available: 1, description: "Tandoor-baked with garlic & butter." },
  { id: "m10", name: "Filter Coffee", category: "Sides", price: 2.5, emoji: "☕", tag: "Drink", veg: 1, available: 1, description: "Strong South Indian filter kaapi, frothy and freshly brewed." },
  { id: "m11", name: "Gulab Jamun (2 pcs)", category: "Sides", price: 3.5, emoji: "🍮", tag: "Sweet", veg: 1, available: 1, description: "Golden milk dumplings soaked in warm cardamom-rose syrup." },
];

const SEED_PARTNERS = [
  { id: "p1", name: "Ravi Kumar", phone: "+44 7700 900111", vehicle: "Bike", status: "available", zone: "Central", rating: 4.8, deliveries: 312 },
  { id: "p2", name: "Aman Singh", phone: "+44 7700 900222", vehicle: "Scooter", status: "available", zone: "North", rating: 4.6, deliveries: 198 },
  { id: "p3", name: "Priya Sharma", phone: "+44 7700 900333", vehicle: "Car", status: "on-delivery", zone: "East", rating: 4.9, deliveries: 421 },
  { id: "p4", name: "Mohammed Ali", phone: "+44 7700 900444", vehicle: "Bike", status: "available", zone: "South", rating: 4.7, deliveries: 267 },
  { id: "p5", name: "Sneha Patel", phone: "+44 7700 900555", vehicle: "Scooter", status: "offline", zone: "West", rating: 4.5, deliveries: 154 },
];

const SEED_STAFF = [
  { id: "u1", name: "Priya Sharma", username: "admin", password: "admin123", role: "admin" },
  { id: "u2", name: "Raj Patel", username: "manager", password: "manager123", role: "manager" },
  { id: "u3", name: "Amit Singh", username: "dispatch", password: "dispatch123", role: "dispatcher" },
];

export function seed() {
  const menuCount = db.prepare("SELECT COUNT(*) c FROM menu_items").get().c;
  if (menuCount === 0) {
    const stmt = db.prepare(
      "INSERT INTO menu_items (id, name, category, price, emoji, tag, veg, available, description) VALUES (@id, @name, @category, @price, @emoji, @tag, @veg, @available, @description)"
    );
    for (const m of SEED_MENU) stmt.run(m);
  }

  const partnerCount = db.prepare("SELECT COUNT(*) c FROM partners").get().c;
  if (partnerCount === 0) {
    const stmt = db.prepare(
      "INSERT INTO partners (id, name, phone, vehicle, status, zone, rating, deliveries) VALUES (@id, @name, @phone, @vehicle, @status, @zone, @rating, @deliveries)"
    );
    for (const p of SEED_PARTNERS) stmt.run(p);
  }

  const staffCount = db.prepare("SELECT COUNT(*) c FROM staff").get().c;
  if (staffCount === 0) {
    const stmt = db.prepare(
      "INSERT INTO staff (id, name, username, password, role) VALUES (@id, @name, @username, @password, @role)"
    );
    for (const s of SEED_STAFF) stmt.run({ ...s, password: hashPassword(s.password) });
  }

  // a demo customer account
  const custCount = db.prepare("SELECT COUNT(*) c FROM customers").get().c;
  if (custCount === 0) {
    db.prepare(
      "INSERT INTO customers (id, name, email, phone, address, password, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(
      uid("cust"),
      "Demo Customer",
      "demo@tiffin.com",
      "+44 7811 100201",
      "12 Oak Lane, Central",
      hashPassword("demo123"),
      new Date().toISOString()
    );
  }
}
