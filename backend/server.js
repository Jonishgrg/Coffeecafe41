const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let orders = [];

// 1. Handle New Orders from Customers
app.post("/orders", (req, res) => {
    const order = {
        ...req.body,
        id: Date.now(), // Unique ID for tracking
        time: new Date().toLocaleString(),
        status: "Pending"
    };
    orders.push(order);
    
    console.log("🔔 NEW ORDER RECEIVED:", order.name, "-", order.total);

    // We MUST return the ID so the frontend knows which order to track
    res.json({ 
        success: true, 
        message: "Order received!", 
        id: order.id 
    });
});

// 2. Admin Login Route
app.post("/admin/login", (req, res) => {
    const { username, password } = req.body;
    // Hardcoded credentials
    if (username === "admin" && password === "coffee123") {
        res.json({ success: true, token: "secret-session-key" });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

// 3. Get Orders for Admin Panel
app.get("/admin/orders", (req, res) => {
    // Returns orders newest-first for the admin
    res.json([...orders].reverse());
});

// 4. Update Order Status (From Admin Panel)
app.patch("/admin/orders/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const order = orders.find(o => o.id == id);
    if (order) {
        order.status = status;
        console.log(`✅ Order ${id} updated to: ${status}`);
        res.json({ success: true, status: order.status });
    } else {
        res.status(404).json({ success: false, message: "Order not found" });
    }
});

// 5. Route for Customer to check their specific order status
app.get("/order-status/:id", (req, res) => {
    const order = orders.find(o => o.id == req.params.id);
    if (order) {
        res.json({ status: order.status });
    } else {
        res.status(404).json({ success: false, message: "Order not found" });
    }
});

// 6. Delete Order (Optional: To keep your list clean)
app.delete("/admin/orders/:id", (req, res) => {
    const { id } = req.params;
    orders = orders.filter(o => o.id != id);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`🚀 Coffee Shop Server running at http://localhost:${PORT}`);
    console.log(`Admin Login: admin / coffee123`);
});