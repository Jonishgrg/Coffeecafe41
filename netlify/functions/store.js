// File-based data store for Netlify Functions
const fs = require('fs');
const path = require('path');

// Use /tmp for temporary persistent storage (works during warm container)
const ORDERS_FILE = path.join('/tmp', 'coffeecafe_orders.json');

function readOrders() {
    try {
        if (fs.existsSync(ORDERS_FILE)) {
            const data = fs.readFileSync(ORDERS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error('Error reading orders file:', err);
    }
    return [];
}

function writeOrders(orders) {
    try {
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    } catch (err) {
        console.error('Error writing orders file:', err);
    }
}

module.exports = {
    getOrders: () => readOrders(),
    addOrder: (order) => {
        const orders = readOrders();
        orders.push(order);
        writeOrders(orders);
        return order;
    },
    updateOrder: (orderId, status) => {
        const orders = readOrders();
        const order = orders.find(o => o.id == orderId);
        if (order) {
            order.status = status;
            writeOrders(orders);
        }
        return order;
    },
    getOrder: (orderId) => {
        const orders = readOrders();
        return orders.find(o => o.id == orderId);
    },
    deleteOrder: (orderId) => {
        let orders = readOrders();
        orders = orders.filter(o => o.id != orderId);
        writeOrders(orders);
    }
};
