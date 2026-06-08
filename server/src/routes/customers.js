// Customer directory (staff only)
// MongoDB + Mongoose version

import express from "express";

import Customer from "../models/Customer.js";
import Order from "../models/Order.js";

import { requireStaff } from "../auth.js";

const router = express.Router();

router.get("/", requireStaff, async (req, res) => {
  try {
    const customers = await Customer.find()
      .sort({ name: 1 });

    const result = await Promise.all(
      customers.map(async (customer) => {
        const orders = await Order.find({
          customer_id:
            customer._id.toString(),
          status: {
            $ne: "cancelled",
          },
        });

        const totalSpent =
          orders.reduce(
            (sum, order) =>
              sum +
              Number(order.total || 0),
            0
          );

        return {
          id: customer._id,

          name: customer.name,

          phone:
            customer.phone || "",

          address:
            customer.address || "",

          orders: orders.length,

          spent: Number(
            totalSpent.toFixed(2)
          ),

          since: customer.createdAt
            ? customer.createdAt
                .toISOString()
                .slice(0, 10)
            : "",
        };
      })
    );

    res.json(result);
  } catch (error) {
    console.error(
      "Customer Directory Error:",
      error
    );

    res.status(500).json({
      error:
        "Failed to load customers",
    });
  }
});

export default router;