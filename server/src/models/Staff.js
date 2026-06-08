import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
  name: String,
  username: {
    type: String,
    unique: true
  },
  password: String,
  role: String
});

export default mongoose.model("Staff", staffSchema);