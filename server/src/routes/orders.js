// Order endpoints — customer places orders, staff manage them.
// MongoDB + Mongoose version
// Emits Socket.IO events for two-way live sync.

import express from "express";
import crypto from "node:crypto";

import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import Partner from "../models/Partner.js";

import { nextOrderNo } from "../utils/orderCounter.js";

import {
  requireCustomer,
  requireStaff,
  requirePermission,
} from "../auth.js";

const router = express.Router();

const STATUS_FLOW = [
  "new",
  "preparing",
  "ready",
  "out",
  "completed",
];

const uid = (prefix = "id") =>
  prefix +
  "_" +
  crypto.randomBytes(6).toString("hex");

function rowToOrder(order) {
  return {
    id: order._id,

    no: order.no,

    customerId: order.customer_id,

    customer: order.customer_name,

    phone: order.phone,

    email: order.email,

    type: order.type,

    address: order.address,

    items: order.items || [],

    total: order.total,

    status: order.status,

    partnerId: order.partner_id,

    payment: order.payment,

    note: order.note,

    placedAt: order.placed_at,
  };
}

async function getOrder(id) {
  const order = await Order.findById(id);

  return order ? rowToOrder(order) : null;
}

function emitUpdate(req, order) {
  const io = req.app.get("io");

  io.to("staff").emit(
    "order:update",
    order
  );

  if (order.customerId) {
    io.to(
      `customer_${order.customerId}`
    ).emit("order:update", order);
  }
}

/* ----------------------------------
   CUSTOMER: PLACE ORDER
---------------------------------- */

router.post(
  "/",
  requireCustomer,
  async (req, res) => {
    try {
      const b = req.body || {};

      const items = Array.isArray(
        b.items
      )
        ? b.items
        : [];

      if (!items.length) {
        return res.status(400).json({
          error:
            "Order must contain at least one item",
        });
      }

      const total = items.reduce(
        (sum, item) =>
          sum +
          Number(item.price) *
            Number(item.qty),
        0
      );

      const customer =
        await Customer.findById(
          req.user.sub
        );

      const orderNo =
        await nextOrderNo();

      const order =
        await Order.create({
          no: orderNo,

          customer_id:
            req.user.sub,

          customer_name:
            b.customerName ||
            customer?.name ||
            req.user.name,

          phone:
            b.phone ||
            customer?.phone ||
            "",

          email:
            customer?.email || "",

          type:
            b.type === "pickup"
              ? "pickup"
              : "delivery",

          address:
            b.type === "pickup"
              ? "—"
              : b.address ||
                customer?.address ||
                "",

          items: items.map((i) => ({
            id:
              i.id ||
              uid("item"),
            name: i.name,
            price:
              Number(i.price),
            qty:
              Number(i.qty),
            emoji:
              i.emoji || "",
          })),

          total,

          status: "new",

          partner_id: null,

          payment:
            b.payment || "Card",

          note: b.note || "",

          placed_at:
            new Date(),
        });

      const created =
        rowToOrder(order);

      req.app
        .get("io")
        .to("staff")
        .emit(
          "order:new",
          created
        );

      res.json(created);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Failed to create order",
      });
    }
  }
);

/* ----------------------------------
   CUSTOMER: MY ORDERS
---------------------------------- */

router.get(
  "/mine",
  requireCustomer,
  async (req, res) => {
    try {
      const orders =
        await Order.find({
          customer_id:
            req.user.sub,
        }).sort({
          no: -1,
        });

      res.json(
        orders.map(rowToOrder)
      );
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Failed to load orders",
      });
    }
  }
);

/* ----------------------------------
   STAFF: ALL ORDERS
---------------------------------- */

router.get(
  "/",
  requireStaff,
  async (req, res) => {
    try {
      const orders =
        await Order.find().sort({
          no: -1,
        });

      res.json(
        orders.map(rowToOrder)
      );
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Failed to load orders",
      });
    }
  }
);

/* ----------------------------------
   STAFF: MANUAL ORDER
---------------------------------- */

router.post(
  "/manual",
  requireStaff,
  requirePermission(
    "orders:create"
  ),
  async (req, res) => {
    try {
      const b = req.body || {};

      const items = Array.isArray(
        b.items
      )
        ? b.items
        : [];

      if (!items.length) {
        return res.status(400).json({
          error:
            "Order must contain at least one item",
        });
      }

      const total = items.reduce(
        (sum, item) =>
          sum +
          Number(item.price) *
            Number(item.qty),
        0
      );

      const orderNo =
        await nextOrderNo();

      const order =
        await Order.create({
          no: orderNo,

          customer_id: null,

          customer_name:
            b.customer ||
            "Walk-in",

          phone:
            b.phone || "",

          email: "",

          type:
            b.type === "pickup"
              ? "pickup"
              : "delivery",

          address:
            b.type === "pickup"
              ? "—"
              : b.address || "",

          items,

          total,

          status: "new",

          partner_id: null,

          payment:
            b.payment || "Cash",

          note: b.note || "",

          placed_at:
            new Date(),
        });

      const created =
        rowToOrder(order);

      req.app
        .get("io")
        .to("staff")
        .emit(
          "order:new",
          created
        );

      res.json(created);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Failed to create order",
      });
    }
  }
);

/* ----------------------------------
   STAFF: UPDATE STATUS
---------------------------------- */

router.patch(
  "/:id/status",
  requireStaff,
  requirePermission(
    "orders:status"
  ),
  async (req, res) => {
    try {
      const { status } =
        req.body || {};

      if (
        ![
          ...STATUS_FLOW,
          "cancelled",
        ].includes(status)
      ) {
        return res.status(400).json({
          error:
            "Invalid status",
        });
      }

      const order =
        await Order.findByIdAndUpdate(
          req.params.id,
          { status },
          { new: true }
        );

      if (!order) {
        return res.status(404).json({
          error: "Not found",
        });
      }

      const updated =
        rowToOrder(order);

      emitUpdate(
        req,
        updated
      );

      res.json(updated);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Failed to update order",
      });
    }
  }
);

/* ----------------------------------
   STAFF: ASSIGN PARTNER
---------------------------------- */

router.patch(
  "/:id/assign",
  requireStaff,
  requirePermission(
    "orders:assign"
  ),
  async (req, res) => {
    try {
      const { partnerId } =
        req.body || {};

      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        return res.status(404).json({
          error: "Not found",
        });
      }

      const newStatus =
        order.status === "new"
          ? "preparing"
          : order.status;

      order.partner_id =
        partnerId || null;

      order.type =
        "delivery";

      order.status =
        newStatus;

      await order.save();

      if (partnerId) {
        await Partner.findByIdAndUpdate(
          partnerId,
          {
            status:
              "on-delivery",
          }
        );
      }

      const updated =
        rowToOrder(order);

      emitUpdate(
        req,
        updated
      );

      req.app
        .get("io")
        .to("staff")
        .emit(
          "partners:update"
        );

      res.json(updated);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Failed to assign partner",
      });
    }
  }
);

/* ----------------------------------
   STAFF: SELF PICKUP
---------------------------------- */

router.patch(
  "/:id/pickup",
  requireStaff,
  requirePermission(
    "orders:assign"
  ),
  async (req, res) => {
    try {
      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        return res.status(404).json({
          error: "Not found",
        });
      }

      order.type =
        "pickup";

      order.partner_id =
        null;

      order.address =
        "—";

      await order.save();

      const updated =
        rowToOrder(order);

      emitUpdate(
        req,
        updated
      );

      res.json(updated);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Failed to update order",
      });
    }
  }
);

/* ----------------------------------
   STAFF: CANCEL ORDER
---------------------------------- */

router.patch(
  "/:id/cancel",
  requireStaff,
  requirePermission(
    "orders:cancel"
  ),
  async (req, res) => {
    try {
      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        return res.status(404).json({
          error: "Not found",
        });
      }

      order.status =
        "cancelled";

      await order.save();

      const updated =
        rowToOrder(order);

      emitUpdate(
        req,
        updated
      );

      res.json(updated);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Failed to cancel order",
      });
    }
  }
);

export default router;