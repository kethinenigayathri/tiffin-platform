import mongoose from "mongoose";

const partnerSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    vehicle: String,
    status: {
      type: String,
      default: "available",
    },
    zone: String,
    rating: {
      type: Number,
      default: 5,
    },
    deliveries: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Partner", partnerSchema);