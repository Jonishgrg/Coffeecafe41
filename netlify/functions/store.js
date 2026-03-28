// Simple in-memory data store (resets on function redeploy)
let orders = [];

module.exports = {
    getOrders: () => orders,
    addOrder: (order) => {
        orders.push(order);
        return order;
    },
    updateOrder: (orderId, status) => {
        const order = orders.find(o => o.id == orderId);
        if (order) {
            order.status = status;
        }
        return order;
    },
    getOrder: (orderId) => orders.find(o => o.id == orderId),
    deleteOrder: (orderId) => {
        orders = orders.filter(o => o.id != orderId);
    }
};
