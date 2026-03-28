const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  tableNumber: Number,
  cart: Array,
  customer: {
  name: String,
  phone: String,
  email: String,
  address: String
  },
  paymentMethod: String,
  status: {
    type: String,
    default: "pending"
  }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);