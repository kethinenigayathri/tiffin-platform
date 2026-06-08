// Delivery partner endpoints (staff only).

import express from "express";
import Partner from "../models/Partner.js";

import {
  requireStaff,
  requirePermission,
} from "../auth.js";

const router = express.Router();

/* ---------------------------
   GET ALL PARTNERS
---------------------------- */

router.get("/", requireStaff, async (req, res) => {
  try {
    const partners = await Partner.find().sort({
      name: 1,
    });

    res.json(partners);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to load partners",
    });
  }
});

/* ---------------------------
   CREATE / UPDATE PARTNER
---------------------------- */

router.post(
  "/",
  requireStaff,
  requirePermission("partners:manage"),
  async (req, res) => {
    try {
      const b = req.body || {};

      let partner = null;

      if (b.id) {
        partner =
          await Partner.findByIdAndUpdate(
            b.id,
            {
              name: b.name,
              phone: b.phone || "",
              vehicle:
                b.vehicle || "Bike",
              status:
                b.status ||
                "available",
              zone:
                b.zone || "Central",
              rating:
                b.rating ?? 5,
              deliveries:
                b.deliveries ?? 0,
            },
            {
              new: true,
            }
          );
      }

      if (!partner) {
        partner =
          await Partner.create({
            name: b.name,
            phone: b.phone || "",
            vehicle:
              b.vehicle || "Bike",
            status:
              b.status ||
              "available",
            zone:
              b.zone || "Central",
            rating:
              b.rating ?? 5,
            deliveries:
              b.deliveries ?? 0,
          });
      }

      req.app
        .get("io")
        .to("staff")
        .emit("partners:update");

      res.json(partner);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Failed to save partner",
      });
    }
  }
);

/* ---------------------------
   UPDATE STATUS
---------------------------- */

router.patch(
  "/:id/status",
  requireStaff,
  requirePermission("partners:manage"),
  async (req, res) => {
    try {
      const { status } =
        req.body || {};

      const partner =
        await Partner.findByIdAndUpdate(
          req.params.id,
          {
            status,
          },
          {
            new: true,
          }
        );

      if (!partner) {
        return res.status(404).json({
          error: "Partner not found",
        });
      }

      req.app
        .get("io")
        .to("staff")
        .emit("partners:update");

      res.json(partner);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Failed to update partner",
      });
    }
  }
);

router.get("/", requireStaff, async (req, res) => {
  const partners = await Partner.find();

  console.log(partners);

  res.json(partners);
});
/* ---------------------------
   DELETE PARTNER
---------------------------- */

router.delete(
  "/:id",
  requireStaff,
  requirePermission("partners:manage"),
  async (req, res) => {
    try {
      const partner =
        await Partner.findByIdAndDelete(
          req.params.id
        );

      if (!partner) {
        return res.status(404).json({
          error: "Partner not found",
        });
      }

      req.app
        .get("io")
        .to("staff")
        .emit("partners:update");

      res.json({
        ok: true,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Failed to delete partner",
      });
    }
  }
);

export default router;