import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    weight: { type: String, required: true },
    height: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const account = mongoose.model("accounts", accountSchema);

export default account;
