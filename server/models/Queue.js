import mongoose from "mongoose";

const queueSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    required: true
  },
  customers: [
    {
      customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      tokenNumber: {
        type: Number,
        required: true
      },
      status: {
        type: String,
        enum: ["waiting", "served", "skipped"], // This field will store the status of the customer in the queue. It can be either "waiting", "served", or "skipped". The enum option ensures that only these three values are allowed. The default value is set to "waiting", which means that when a new customer is added to the queue, their status will be set to "waiting" by default.
        default: "waiting"
      },
      joinedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, { timestamps: true });

export default mongoose.model("Queue", queueSchema);