const express = require("express");
const cors = require("cors");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = "orders.json";

app.use(cors());
app.use(express.json());

// Load existing orders from file on startup
let orders = [];
if (fs.existsSync(DATA_FILE)) {
    try {
        orders = JSON.parse(fs.readFileSync(DATA_FILE));
    } catch (e) {
        orders = [];
    }
}

// Save function
const saveToFile = () => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2));
};

// 1. Customer places order
app.post("/orders", (req, res) => {
    const order = {
        ...req.body,
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        status: "Pending"
    };
    orders.push(order);
    saveToFile();
    res.json({ success: true, id: order.id });
});

// 2. Admin Login
app.post("/admin/login", (req, res) => {
    const { username, password } = req.body;
    if (username === "admin" && password === "coffee123") {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});

// 3. Admin gets all orders
app.get("/admin/orders", (req, res) => {
    res.json([...orders].reverse());
});

// 4. Admin updates status
app.patch("/admin/orders/:id", (req, res) => {
    const order = orders.find(o => o.id == req.params.id);
    if (order) {
        order.status = req.body.status;
        saveToFile();
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false });
    }
});

// 5. Customer checks their specific status
app.get("/order-status/:id", (req, res) => {
    const order = orders.find(o => o.id == req.params.id);
    res.json({ status: order ? order.status : "Not Found" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));