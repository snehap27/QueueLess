const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  queueOpen: {
    type: Boolean,
    default: false
  },
  currentToken: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model("Business", businessSchema);