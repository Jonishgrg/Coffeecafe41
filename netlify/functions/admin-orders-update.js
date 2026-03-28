const store = require('./store');

exports.handler = async (event) => {
  // Allow CORS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "PATCH, OPTIONS"
      }
    };
  }

  // Only allow PATCH
  if (event.httpMethod !== "PATCH") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const orderId = event.path.split('/').pop();
    const { status } = JSON.parse(event.body);

    const order = store.updateOrder(orderId, status);

    if (!order) {
      return {
        statusCode: 404,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ success: false, message: "Order not found" })
      };
    }

    console.log(`✅ Order ${orderId} updated to: ${status}`);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        success: true, 
        status: order.status 
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
