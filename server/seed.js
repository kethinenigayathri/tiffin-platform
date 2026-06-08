import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "./config/db.js";

import MenuItem from "./src/models/MenuItem.js";
import Partner from "./src/models/Partner.js";
import Staff from "./src/models/Staff.js";
import Customer from "./src/models/Customer.js";
import Counter from "./src/models/Counter.js";

import { hashPassword } from "./src/utils/password.js";

dotenv.config();

await connectDB();

const SEED_MENU = [
  { name: "Classic Veg Tiffin", category: "Tiffin", price: 7.5, emoji: "🍛", tag: "Bestseller", veg: true, available: true, description: "Idli, sambar, coconut chutney & a sweet — the daily South Indian staple." },
  { name: "Masala Dosa", category: "Tiffin", price: 6.9, emoji: "🫓", tag: "Veg", veg: true, available: true, description: "Crispy rice crêpe stuffed with spiced potato, served with sambar & chutney." },
  { name: "Idli Sambar (4 pcs)", category: "Tiffin", price: 5.5, emoji: "🍙", tag: "Veg", veg: true, available: true, description: "Steamed rice cakes soaked in hot lentil sambar with chutney trio." },
  { name: "South Indian Veg Thali", category: "Curry House", price: 11.9, emoji: "🥗", tag: "Full Meal", veg: true, available: true, description: "Rice, two curries, dal, rasam, papad, pickle & dessert on one platter." },
  { name: "Paneer Butter Masala", category: "Curry House", price: 9.5, emoji: "🧈", tag: "Popular", veg: true, available: true, description: "Cottage cheese in a creamy tomato-cashew gravy. Served with rice or roti." },
  { name: "Butter Chicken", category: "Curry House", price: 11.5, emoji: "🍗", tag: "Popular", veg: false, available: true, description: "Creamy tomato gravy, served with naan." },
  { name: "Chana Masala", category: "Curry House", price: 8.5, emoji: "🫘", tag: "Vegan", veg: true, available: true, description: "Chickpeas simmered in a tangy onion-tomato masala with fresh coriander." },
  { name: "Veg Hyderabadi Biryani", category: "Curry House", price: 10.5, emoji: "🍚", tag: "Spicy", veg: true, available: true, description: "Fragrant basmati layered with vegetables, saffron & fried onions." },
  { name: "Garlic Naan", category: "Sides", price: 2.5, emoji: "🥖", tag: "Veg", veg: true, available: true, description: "Tandoor-baked with garlic & butter." },
  { name: "Filter Coffee", category: "Sides", price: 2.5, emoji: "☕", tag: "Drink", veg: true, available: true, description: "Strong South Indian filter kaapi, frothy and freshly brewed." },
  { name: "Gulab Jamun (2 pcs)", category: "Sides", price: 3.5, emoji: "🍮", tag: "Sweet", veg: true, available: true, description: "Golden milk dumplings soaked in warm cardamom-rose syrup." },
];

const SEED_PARTNERS = [
  { name: "Ravi Kumar", phone: "+44 7700 900111", vehicle: "Bike", status: "available", zone: "Central", rating: 4.8, deliveries: 312 },
  { name: "Aman Singh", phone: "+44 7700 900222", vehicle: "Scooter", status: "available", zone: "North", rating: 4.6, deliveries: 198 },
  { name: "Priya Sharma", phone: "+44 7700 900333", vehicle: "Car", status: "on-delivery", zone: "East", rating: 4.9, deliveries: 421 },
  { name: "Mohammed Ali", phone: "+44 7700 900444", vehicle: "Bike", status: "available", zone: "South", rating: 4.7, deliveries: 267 },
  { name: "Sneha Patel", phone: "+44 7700 900555", vehicle: "Scooter", status: "offline", zone: "West", rating: 4.5, deliveries: 154 },
];

const SEED_STAFF = [
  {
    name: "Priya Sharma",
    username: "admin",
    password: hashPassword("admin123"),
    role: "admin",
  },
  {
    name: "Raj Patel",
    username: "manager",
    password: hashPassword("manager123"),
    role: "manager",
  },
  {
    name: "Amit Singh",
    username: "dispatch",
    password: hashPassword("dispatch123"),
    role: "dispatcher",
  },
];

async function seed() {
  try {
    await MenuItem.deleteMany({});
    await Partner.deleteMany({});
    await Staff.deleteMany({});
    await Customer.deleteMany({});
    await Counter.deleteMany({});

    await MenuItem.insertMany(SEED_MENU);
    await Partner.insertMany(SEED_PARTNERS);
    await Staff.insertMany(SEED_STAFF);

    await Customer.create({
      name: "Demo Customer",
      email: "demo@tiffin.com",
      phone: "+44 7811 100201",
      address: "12 Oak Lane, Central",
      password: hashPassword("demo123"),
    });

    await Counter.create({
      name: "order_no",
      value: 1000,
    });

    console.log("✅ MongoDB Seed Completed");

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seed();