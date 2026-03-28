const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

// ===== CORS Security =====
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],
  credentials: true
}));
app.use(express.json());

// ===== MongoDB =====
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// ===== Model =====
const Order = require("./models/order");

// ===== Environment Variables =====
const JWT_SECRET = process.env.JWT_SECRET || "change-this-in-production";
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "24h";
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION || "7d";

// Validate critical env variables in production
if (process.env.NODE_ENV === "production") {
  if (!process.env.JWT_SECRET) {
    console.error("FATAL: JWT_SECRET must be set in environment variables");
    process.exit(1);
  }
  if (!process.env.MONGO_URI) {
    console.error("FATAL: MONGO_URI must be set in environment variables");
    process.exit(1);
  }
}

// ===== Token Blacklist (for logout) =====
const tokenBlacklist = new Set();

// ===== Rate Limiters =====
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: "Too many login attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

const orderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 orders per minute
  message: "Too many orders, please wait before placing another",
  skip: (req) => req.ip?.includes("127.0.0.1"), // Skip localhost
});

// ===== Input Validation Helpers =====
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone) {
  const re = /^[\d\s\-\+\(\)]{7,}$/; // At least 7 digits
  return re.test(phone);
}

// ===== Admin Credentials (from environment) =====
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH; // Must be hashed in env

// ===== Admin Login (PROTECTED with rate limiting) =====
app.post("/api/login", loginLimiter, async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  // Check credentials
  if (username === ADMIN_USERNAME && ADMIN_PASSWORD_HASH) {
    const isPasswordValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (isPasswordValid) {
      const accessToken = jwt.sign(
        { username, type: "access" },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
      );
      const refreshToken = jwt.sign(
        { username, type: "refresh" },
        JWT_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRATION }
      );
      return res.json({ accessToken, refreshToken });
    }
  }

  // Don't reveal which field is wrong
  res.status(401).json({ message: "Invalid credentials" });
});

// ===== Refresh Token Endpoint =====
app.post("/api/refresh", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(403).json({ message: "Refresh token required" });

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    if (decoded.type !== "refresh") {
      return res.status(403).json({ message: "Invalid token type" });
    }

    const newAccessToken = jwt.sign(
      { username: decoded.username, type: "access" },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );
    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }
});

// ===== Logout Endpoint =====
app.post("/api/logout", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    tokenBlacklist.add(token);
  }
  res.json({ message: "Logged out successfully" });
});

// ===== Auth Middleware =====
function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(403).json({ message: "No token provided" });
  }

  // Extract Bearer token
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(403).json({ message: "Invalid token format. Use 'Bearer <token>'" });
  }

  const token = parts[1];

  // Check if token is blacklisted (logout)
  if (tokenBlacklist.has(token)) {
    return res.status(403).json({ message: "Token has been revoked" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type === "refresh") {
      return res.status(403).json({ message: "Cannot use refresh token for API access" });
    }
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token expired. Please refresh your token." });
    }
    return res.status(403).json({ message: "Invalid token" });
  }
}

// ===== Routes =====
app.get("/", (req, res) => {
  res.send("Backend Running");
});

// CREATE ORDER (with rate limiting and validation)
app.post("/api/orders", orderLimiter, async (req, res) => {
  const { tableNumber, customer, cart, paymentMethod } = req.body;

  // ===== Input Validation =====
  if (!customer) {
    return res.status(400).json({ message: "Customer information is required" });
  }

  // Validate contact details
  if (!customer.name || customer.name.trim().length < 2) {
    return res.status(400).json({ message: "Valid customer name is required" });
  }

  const hasValidContact = (customer.email && validateEmail(customer.email)) ||
                         (customer.phone && validatePhone(customer.phone));

  if (!hasValidContact) {
    return res.status(400).json({ message: "Valid email or phone number is required" });
  }

  // Validate cart
  if (!Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ message: "Cart cannot be empty" });
  }

  // Validate cart items
  for (const item of cart) {
    if (!item.id || !item.name || typeof item.price !== "number" || item.price < 0) {
      return res.status(400).json({ message: "Invalid item in cart" });
    }
  }

  if (paymentMethod && !["cash", "card", "upi", "wallet"].includes(paymentMethod)) {
    return res.status(400).json({ message: "Invalid payment method" });
  }

  // ===== Table Number Validation =====
  if (tableNumber !== null && tableNumber !== undefined) {
    const num = Number(tableNumber);
    if (!Number.isInteger(num) || num < 1 || num > 8) {
      return res.status(400).json({ message: "Table number must be between 1 and 8" });
    }

    const existing = await Order.findOne({
      tableNumber: num,
      status: { $nin: ["completed", "cancelled"] }
    });

    if (existing) {
      return res.status(400).json({ message: `Table ${num} already has an active order` });
    }
  }

  try {
    const order = new Order({
      tableNumber: tableNumber || null,
      cart,
      customer: {
        name: customer.name.trim(),
        phone: customer.phone || null,
        email: customer.email || null,
        address: customer.address || null
      },
      paymentMethod: paymentMethod || "cash",
      status: "pending"
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: "Error creating order", error: err.message });
  }
});

// GET ORDERS (PROTECTED)
app.get("/api/orders", auth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
});

// UPDATE STATUS (PROTECTED)
app.patch("/api/orders/:id", auth, async (req, res) => {
  const { status, tableNumber } = req.body;

  // Validate inputs
  const updates = {};

  if (status) {
    if (!["pending", "preparing", "ready", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    updates.status = status;
  }

  if (tableNumber !== undefined) {
    const num = Number(tableNumber);
    if (tableNumber !== null && (!Number.isInteger(num) || num < 1 || num > 8)) {
      return res.status(400).json({ message: "Invalid table number" });
    }
    updates.tableNumber = tableNumber;
  }

  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Error updating order", error: err.message });
  }
});

// ===== RESERVATION ENDPOINTS =====

// Import Reservation model
const Reservation = require("./models/reservation");

// Rate limiter for reservations
const reservationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 reservation attempts per 15 minutes
  message: "Too many reservation attempts, please try again later",
});

// Create reservation
app.post("/api/reservations", reservationLimiter, async (req, res) => {
  try {
    const { tableNumber, customer, guests, date, time, notes } = req.body;

    // Validate table number
    const num = Number(tableNumber);
    if (!Number.isInteger(num) || num < 1 || num > 8) {
      return res.status(400).json({ message: "Invalid table number" });
    }

    // Check if table is available for the requested date/time
    const existingReservation = await Reservation.findOne({
      tableNumber: num,
      date: new Date(date),
      time: time,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingReservation) {
      return res.status(409).json({
        message: `Table ${num} is already reserved for ${date} at ${time}`
      });
    }

    const reservation = new Reservation({
      tableNumber: num,
      customer,
      guests,
      date: new Date(date),
      time,
      notes
    });

    await reservation.save();
    res.status(201).json({
      message: "Reservation created successfully",
      reservation
    });
  } catch (err) {
    res.status(500).json({ message: "Error creating reservation", error: err.message });
  }
});

// Get all reservations (admin only)
app.get("/api/reservations", auth, async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .sort({ date: 1, time: 1 })
      .limit(100); // Limit to prevent large responses
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: "Error fetching reservations", error: err.message });
  }
});

// Get available tables for a specific date/time
app.get("/api/tables/availability", async (req, res) => {
  try {
    const { date, time } = req.query;

    if (!date || !time) {
      return res.status(400).json({ message: "Date and time are required" });
    }

    // Find all reserved tables for this date/time
    const reservedTables = await Reservation.find({
      date: new Date(date),
      time: time,
      status: { $in: ['pending', 'confirmed'] }
    }).select('tableNumber');

    const reservedTableNumbers = reservedTables.map(r => r.tableNumber);

    // Return available tables (1-8 except reserved ones)
    const availableTables = [];
    for (let i = 1; i <= 8; i++) {
      if (!reservedTableNumbers.includes(i)) {
        availableTables.push(i);
      }
    }

    res.json({
      date,
      time,
      availableTables,
      reservedTables: reservedTableNumbers
    });
  } catch (err) {
    res.status(500).json({ message: "Error checking availability", error: err.message });
  }
});

// Update reservation status (admin only)
app.patch("/api/reservations/:id", auth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updates = {};

    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: "Error updating reservation", error: err.message });
  }
});

// Delete reservation (admin only)
app.delete("/api/reservations/:id", auth, async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    res.json({ message: "Reservation deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting reservation", error: err.message });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running...");
});
