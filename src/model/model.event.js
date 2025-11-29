const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  venue: { type: String },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  registeredUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Event", eventSchema);
