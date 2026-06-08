// Menu endpoints — public read, staff write.

import express from "express";
import MenuItem from "../models/MenuItem.js";

import {
  requireStaff,
  requirePermission,
} from "../auth.js";

const router = express.Router();

function rowToItem(item) {
  return {
    id: item._id,
    name: item.name,
    category: item.category,
    price: item.price,
    emoji: item.emoji,
    tag: item.tag,
    veg: item.veg,
    available: item.available,
    description: item.description,
    desc: item.description,
  };
}

/* ---------------------------
   PUBLIC MENU
---------------------------- */

router.get("/", async (req, res) => {
  try {
    const all = req.query.all === "1";

    const items = all
      ? await MenuItem.find().sort({
          category: 1,
          name: 1,
        })
      : await MenuItem.find({
          available: true,
        }).sort({
          category: 1,
          name: 1,
        });

    res.json(items.map(rowToItem));
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to load menu",
    });
  }
});

/* ---------------------------
   CREATE / UPDATE MENU ITEM
---------------------------- */

router.post(
  "/",
  requireStaff,
  requirePermission("menu:manage"),
  async (req, res) => {
    try {
      const b = req.body || {};

      let item;

      if (b.id) {
        item = await MenuItem.findByIdAndUpdate(
          b.id,
          {
            name: b.name,
            category:
              b.category || "Curry House",
            price:
              Number(b.price) || 0,
            emoji: b.emoji || "🍽️",
            tag: b.tag || "",
            veg: !!b.veg,
            available:
              b.available === false
                ? false
                : true,
            description:
              b.desc ||
              b.description ||
              "",
          },
          {
            new: true,
          }
        );
      }

      if (!item) {
        item = await MenuItem.create({
          name: b.name,
          category:
            b.category || "Curry House",
          price:
            Number(b.price) || 0,
          emoji: b.emoji || "🍽️",
          tag: b.tag || "",
          veg: !!b.veg,
          available:
            b.available === false
              ? false
              : true,
          description:
            b.desc ||
            b.description ||
            "",
        });
      }

      req.app
        .get("io")
        .emit("menu:update");

      res.json(rowToItem(item));
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Failed to save menu item",
      });
    }
  }
);

/* ---------------------------
   TOGGLE AVAILABILITY
---------------------------- */

router.patch(
  "/:id/toggle",
  requireStaff,
  requirePermission("menu:manage"),
  async (req, res) => {
    try {
      const item =
        await MenuItem.findById(
          req.params.id
        );

      if (!item) {
        return res.status(404).json({
          error: "Not found",
        });
      }

      item.available =
        !item.available;

      await item.save();

      req.app
        .get("io")
        .emit("menu:update");

      res.json(rowToItem(item));
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Failed to update item",
      });
    }
  }
);

/* ---------------------------
   DELETE ITEM
---------------------------- */

router.delete(
  "/:id",
  requireStaff,
  requirePermission("menu:manage"),
  async (req, res) => {
    try {
      await MenuItem.findByIdAndDelete(
        req.params.id
      );

      req.app
        .get("io")
        .emit("menu:update");

      res.json({
        ok: true,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Failed to delete item",
      });
    }
  }
);

export default router;