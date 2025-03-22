import mongoose from "mongoose";
const Schema = mongoose.Schema;

const WebhookSchema = new Schema(
  {
    event: { type: String, required: true },
    email: { type: String, required: true },
    reason: { type: String},
    gameCode: { type: String },
    playerCode: { type: String },
  },
  {
    timestamps: true,
    collection: "webhook",
  }
);

const WebhookEvent = mongoose.model("webhook", WebhookSchema);

export default WebhookEvent;