// models/MenuItem.js

import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  emoji: String,
  tag: String,
  veg: Boolean,
  available: Boolean,
  description: String,
});

export default mongoose.model("MenuItem", menuItemSchema);