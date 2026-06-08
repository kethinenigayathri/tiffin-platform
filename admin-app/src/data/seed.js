// Seed / mock data for the Tiffin & Curry House restaurant console.

export const MENU = [
  { id: "m1", name: "Veg Tiffin Box", category: "Tiffin", price: 7.5, veg: true, available: true, desc: "Dal, rice, 2 sabzi, 3 rotis, salad" },
  { id: "m2", name: "Non-Veg Tiffin Box", category: "Tiffin", price: 9.0, veg: false, available: true, desc: "Chicken curry, rice, dal, 3 rotis" },
  { id: "m3", name: "Jain Tiffin Box", category: "Tiffin", price: 8.0, veg: true, available: true, desc: "No onion/garlic, dal, rice, sabzi" },
  { id: "m4", name: "Butter Chicken", category: "Curry House", price: 11.5, veg: false, available: true, desc: "Creamy tomato gravy, served with naan" },
  { id: "m5", name: "Paneer Tikka Masala", category: "Curry House", price: 10.5, veg: true, available: true, desc: "Grilled paneer in spiced gravy" },
  { id: "m6", name: "Lamb Rogan Josh", category: "Curry House", price: 13.0, veg: false, available: false, desc: "Slow-cooked Kashmiri lamb curry" },
  { id: "m7", name: "Chana Masala", category: "Curry House", price: 8.5, veg: true, available: true, desc: "Chickpeas in onion-tomato masala" },
  { id: "m8", name: "Garlic Naan", category: "Sides", price: 2.5, veg: true, available: true, desc: "Tandoor-baked with garlic & butter" },
  { id: "m9", name: "Samosa (2 pcs)", category: "Sides", price: 3.0, veg: true, available: true, desc: "Crispy pastry with spiced potato" },
  { id: "m10", name: "Mango Lassi", category: "Sides", price: 3.5, veg: true, available: true, desc: "Sweet yogurt mango drink" },
  { id: "m11", name: "Gulab Jamun (3 pcs)", category: "Sides", price: 4.0, veg: true, available: true, desc: "Warm milk dumplings in syrup" },
];

export const PARTNERS = [
  { id: "p1", name: "Ravi Kumar", phone: "+44 7700 900111", vehicle: "Bike", status: "available", zone: "Central", rating: 4.8, deliveries: 312 },
  { id: "p2", name: "Aman Singh", phone: "+44 7700 900222", vehicle: "Scooter", status: "available", zone: "North", rating: 4.6, deliveries: 198 },
  { id: "p3", name: "Priya Sharma", phone: "+44 7700 900333", vehicle: "Car", status: "on-delivery", zone: "East", rating: 4.9, deliveries: 421 },
  { id: "p4", name: "Mohammed Ali", phone: "+44 7700 900444", vehicle: "Bike", status: "available", zone: "South", rating: 4.7, deliveries: 267 },
  { id: "p5", name: "Sneha Patel", phone: "+44 7700 900555", vehicle: "Scooter", status: "offline", zone: "West", rating: 4.5, deliveries: 154 },
];

export const CUSTOMERS = [
  { id: "c1", name: "John Mathews", phone: "+44 7811 100201", address: "12 Oak Lane, Central", orders: 24, spent: 287.5, since: "2024-02-11" },
  { id: "c2", name: "Aisha Khan", phone: "+44 7811 100202", address: "5 Maple Court, North", orders: 41, spent: 512.0, since: "2023-11-03" },
  { id: "c3", name: "David Wong", phone: "+44 7811 100203", address: "88 Birch Road, East", orders: 9, spent: 96.0, since: "2024-05-20" },
  { id: "c4", name: "Fatima Noor", phone: "+44 7811 100204", address: "30 Pine Street, South", orders: 33, spent: 398.5, since: "2024-01-17" },
  { id: "c5", name: "Tom Reilly", phone: "+44 7811 100205", address: "7 Cedar Ave, West", orders: 15, spent: 174.0, since: "2024-04-09" },
  { id: "c6", name: "Meera Iyer", phone: "+44 7811 100206", address: "21 Elm Walk, Central", orders: 52, spent: 689.0, since: "2023-09-28" },
];

const NAMES = ["John Mathews", "Aisha Khan", "David Wong", "Fatima Noor", "Tom Reilly", "Meera Iyer", "Liam Carter", "Zara Ahmed"];
const ADDRESSES = ["12 Oak Lane, Central", "5 Maple Court, North", "88 Birch Road, East", "30 Pine Street, South", "7 Cedar Ave, West", "21 Elm Walk, Central"];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

let counter = 1043;
export function nextOrderNo() { return ++counter; }

export function makeItems() {
  const n = 1 + Math.floor(Math.random() * 3);
  const chosen = [];
  const pool = [...MENU.filter((m) => m.available)];
  for (let i = 0; i < n; i++) {
    const item = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    if (!item) break;
    chosen.push({ id: item.id, name: item.name, price: item.price, qty: 1 + Math.floor(Math.random() * 2) });
  }
  return chosen;
}

export function itemsTotal(items) {
  return items.reduce((s, i) => s + i.price * i.qty, 0);
}

function buildOrder(overrides = {}) {
  const items = overrides.items || makeItems();
  const type = overrides.type || (Math.random() > 0.35 ? "delivery" : "pickup");
  const name = overrides.customer || pick(NAMES);
  return {
    no: overrides.no || nextOrderNo(),
    customer: name,
    phone: "+44 78" + Math.floor(10000000 + Math.random() * 89999999),
    type,
    address: type === "delivery" ? (overrides.address || pick(ADDRESSES)) : "—",
    items,
    total: itemsTotal(items),
    status: overrides.status || "new",
    partnerId: overrides.partnerId || null,
    payment: pick(["Card", "Cash", "SEPA"]),
    placedAt: overrides.placedAt || new Date().toISOString(),
    note: overrides.note || "",
  };
}

export function seedOrders() {
  const presets = [
    { status: "new", type: "delivery" },
    { status: "new", type: "pickup" },
    { status: "preparing", type: "delivery", partnerId: "p3" },
    { status: "preparing", type: "pickup" },
    { status: "ready", type: "pickup" },
    { status: "out", type: "delivery", partnerId: "p3" },
    { status: "completed", type: "delivery", partnerId: "p1" },
    { status: "completed", type: "pickup" },
    { status: "completed", type: "delivery", partnerId: "p2" },
    { status: "cancelled", type: "delivery" },
  ];
  return presets.map((p, idx) =>
    buildOrder({
      ...p,
      placedAt: new Date(Date.now() - (idx * 27 + Math.random() * 40) * 60000).toISOString(),
    })
  );
}

export { buildOrder };

export const STATUS_FLOW = ["new", "preparing", "ready", "out", "completed"];
export const STATUS_LABELS = {
  new: "New",
  preparing: "Preparing",
  ready: "Ready",
  out: "Out for delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};
export const STATUS_CLASS = {
  new: "b-new",
  preparing: "b-preparing",
  ready: "b-ready",
  out: "b-out",
  completed: "b-completed",
  cancelled: "b-cancelled",
};
