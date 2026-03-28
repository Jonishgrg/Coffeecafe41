const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  customer: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  guests: {
    type: Number,
    required: true,
    min: 1
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  notes: String
}, { timestamps: true });

// Index for efficient queries
reservationSchema.index({ tableNumber: 1, date: 1 });
reservationSchema.index({ date: 1, time: 1 });

module.exports = mongoose.model("Reservation", reservationSchema);