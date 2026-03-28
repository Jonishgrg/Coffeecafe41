const store = require('./store');

exports.handler = async (event) => {
  // Allow CORS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      }
    };
  }

  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const orderData = JSON.parse(event.body);
    
    const order = {
      ...orderData,
      id: Date.now(),
      time: new Date().toLocaleString(),
      status: "Pending"
    };

    store.addOrder(order);
    console.log("🔔 NEW ORDER RECEIVED:", order.name, "-", order.total);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        success: true, 
        message: "Order received!", 
        id: order.id 
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: error.message })
    };
  }
};
