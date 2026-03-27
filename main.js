// REPLACE your current placeOrderBtn.addEventListener with this:
placeOrderBtn.addEventListener('click', async () => {
    if (cart.length === 0) return alert("Empty cart!");

    const orderData = {
        name: document.getElementById("customerName").value,
        email: document.getElementById("customerEmail").value,
        phone: document.getElementById("customerPhone").value,
        address: document.getElementById("customerAddress").value,
        payment: document.getElementById("paymentMethod").value,
        items: cart,
        total: cartTotalElement.textContent
    };

    try {
        const res = await fetch("http://localhost:3000/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData)
        });

        const data = await res.json();

        if (data.success) {
            alert("Order placed successfully! Keep this page open for updates. ✅");
            
            // Start the real-time tracking
            trackOrderStatus(data.id); 

            // Clear Cart
            cart = [];
            updateCartUI();
            cartModal.style.display = 'none';
        }
    } catch (err) {
        alert("Server is offline. Please try again later.");
    }
});

// ADD this function to the bottom of main.js
function trackOrderStatus(id) {
    // Create notification box if not exists
    let notifyDiv = document.getElementById('orderNotification');
    if (!notifyDiv) {
        notifyDiv = document.createElement('div');
        notifyDiv.id = 'orderNotification';
        notifyDiv.style = "position:fixed; top:20px; right:20px; background:#ff6b35; color:white; padding:20px; border-radius:10px; display:none; z-index:9999; box-shadow:0 5px 15px rgba(0,0,0,0.3); font-family:sans-serif;";
        document.body.appendChild(notifyDiv);
    }

    const checkInterval = setInterval(async () => {
        try {
            const res = await fetch(`http://localhost:3000/order-status/${id}`);
            const data = await res.json();
            
            // Trigger notification for these specific statuses
            if (data.status === "Ready to Pick Up" || data.status === "On the Way") {
                notifyDiv.innerHTML = `<h4 style="margin:0">☕ Update!</h4><p style="margin:5px 0 0 0">Your order is <b>${data.status.toUpperCase()}</b>!</p>`;
                notifyDiv.style.display = 'block';
                
                // Play Sound
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.play().catch(e => console.log("Sound blocked"));

                clearInterval(checkInterval); // Stop polling

                // Hide after 10 seconds
                setTimeout(() => { notifyDiv.style.display = 'none'; }, 10000);
            }
        } catch (e) {
            console.log("Checking status...");
        }
    }, 5000); 
}