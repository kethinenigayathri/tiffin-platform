import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    no: {
      type: Number,
      required: true,
    },

    customer_id: {
      type: String,
      default: null,
    },

    customer_name: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      enum: ["delivery", "pickup"],
      default: "delivery",
    },

    address: {
      type: String,
      default: "",
    },

    items: [
      {
        id: String,
        name: String,
        price: Number,
        qty: Number,
        emoji: String,
      },
    ],

    total: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      default: "new",
    },

    partner_id: {
      type: String,
      default: null,
    },

    payment: {
      type: String,
      default: "Card",
    },

    note: {
      type: String,
      default: "",
    },

    placed_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", orderSchema);