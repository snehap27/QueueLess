const mongoose = require("mongoose");

const queueSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    customers: [
      {
        customerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        tokenNumber: {
          type: Number,
          required: true,
        },
        status: {
          type: String,
          enum: ["waiting", "served", "skipped"],
          default: "waiting",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Queue", queueSchema);