const urlParams = new URLSearchParams(window.location.search);
const tableNumber = urlParams.get("table") || null; // optional table; if not specified, backend will keep null
const API_URL = 'https://coffee-backend-9koq.onrender.com';
// Menu Data
        const menuItems = [
            {
                id: 1,
                name: "Blueberry Smoothie",
                price: 280,
                category: "cold",
                description: "Creamy blend of fresh blueberries, yogurt, and a touch of honey.",
                image: "smoothie.jpg",
            },
            {
                id: 2,
                name: "Iced Latte",
                price: 210,
                category: "cold",
                description: "Chilled espresso with milk over ice, lightly sweetened for a refreshing boost.",
                image: "icelatte.jpg",
            },
            {
                id: 3,
                name: "Mint Lemonade",
                price: 140,
                category: "cold",
                description: "Freshly squeezed lemons with mint leaves, ice-cold and revitalizing.",
                image: "mint.jpg",
            },
            {
                id: 4,
                name: "Oreo Milkshake",
                price: 200,
                category: "cold",
                description: "Rich chocolate milkshake blended with Oreo cookies for ultimate indulgence.",
                image: "oreo.jpg",
            },
            {
                id: 5,
                name: "Black Coffee",
                price: 100,
                category: "hot",
                description: "Pure, bold espresso served hot for a classic caffeine kick.",
                image: "black.jpg",
            },
            {
                id: 6,
                name: "Espresso",
                price: 165,
                category: "hot",
                description: "Intense, smooth shot of espresso to awaken your senses.",
                image: "espresso.jpg",
            },
            {
                id: 7,
                name: "Hot Chocolate",
                price: 220,
                category: "hot",
                description: "Velvety chocolate with steamed milk, topped with a hint of cocoa.",
                image: "hotchocolate.jpg",
            },
            {
                id: 8,
                name: "Tea",
                price: 75,
                category: "hot",
                description: "Classic brewed tea, served hot or iced, perfect anytime.",
                image: "tea.jpg",
            },
            {
                id: 9,
                name: "Cappuccino",
                price: 190,
                category: "hot",
                description: "Espresso with steamed milk and a thick layer of frothy foam.",
                image: "cap.jpg",
            },
            {
                id: 10,
                name: "Danish Pastry",
                price: 130,
                category: "pastries",
                description: "Sweet, layered pastry filled with fruit or custard for a delightful treat.",
                image: "danish.jpg",
            },
            {
                id: 11,
                name: "Hazelnut Cake",
                price: 230,
                category: "pastries",
                description: "Rich and moist hazelnut cake with a smooth chocolate glaze and crunchy hazelnut topping.",
                image: "hazlenut.jpg",
            },
             {
                id: 12,
                name: "Red Velvet Cake",
                price: 200,
                category: "pastries",
                description: "Moist, rich cake with a velvety texture and cream cheese frosting.",
                image: "red.jpg",
            },
             {
                id: 13,
                name: "Croissant",
                price: 180,
                category: "pastries",
                description: "Flaky, buttery, and golden-brown pastry perfect for breakfast or a light snack.",
                image: "croissant.jpg",
            },
             {
                id: 14,
                name: "Classic Chicken Burger",
                price: 350,
                category: "snacks",
                description: "Juicy chicken patty with melted cheese, fresh lettuce, tomato, and our signature sauce.",
                image: "burger.jpg",
            },
             {
                id: 15,
                name: "Veggie Burger",
                price: 300,
                category: "snacks",
                description: "Grilled vegetable patty with fresh greens, tomato, and creamy mayo on a soft bun.",
                image: "veg.jpg",
            },
             {
                id: 16,
                name: "Margherita Pizza",
                price: 420,
                category: "snacks",
                description: "Classic pizza with fresh tomato sauce, mozzarella cheese, and fragrant basil leaves.",
                image: "mrgherita.jpg",
            },
             {
                id: 17,
                name: "Pepperoni Pizza",
                price: 500,
                category: "snacks",
                description: "Loaded with spicy pepperoni slices, melted mozzarella, and zesty tomato sauce.",
                image: "pepperoni.jpg",
            },
             {
                id: 18,
                name: "Chicken Momo",
                price: 180,
                category: "snacks",
                description: "Steamed dumplings filled with seasoned chicken and herbs, served with spicy dipping sauce.",
                image: "chikenmomo.jpg",
             },
             {
                id: 19,
                name: "Veg Momo",
                price: 120,
                category: "snacks",
                description: "Steamed dumplings packed with fresh vegetables and aromatic spices, served with chili sauce.",
                image: "vegmomo.avif",
             },
             {
                id: 20,
                name: "Fries Basket",
                price: 200,
                category: "snacks",
                description: "Crispy golden fries served with your choice of ketchup or cheesy dip.",
                image: "fries.jpg",
            },
        ];

        
// Cart functionality
let cart = [];
const cartIcon = document.getElementById('cartIcon');
const cartModal = document.getElementById('cartModal');
const closeModal = document.querySelector('.close-modal');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const cartCountElement = document.querySelector('.cart-count');
const menuGrid = document.getElementById('menuGrid');
const categoryButtons = document.querySelectorAll('.category-btn');
const proceedToCheckoutBtn = document.getElementById('proceedToCheckout');
const checkoutForm = document.getElementById('checkoutForm');
const orderConfirmation = document.getElementById('orderConfirmation');
const placeOrderBtn = document.getElementById('placeOrder');
const orderSummary = document.getElementById('orderSummary');
const fastOrderToggle = document.getElementById('fastOrderToggle');
const customerNameInput = document.getElementById('customerName');
const customerEmailInput = document.getElementById('customerEmail');
const customerPhoneInput = document.getElementById('customerPhone');
const customerAddressInput = document.getElementById('customerAddress');

// Mobile navigation
const mobileNavToggle = document.getElementById('mobileNavToggle');
const mobileNav = document.getElementById('mobileNav');
const overlay = document.getElementById('overlay');

function initializeMenu() {
    displayMenuItems(menuItems);
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterMenuItems(button.getAttribute('data-category'));
        });
    });
}

const orderNowBtn = document.getElementById('orderNowBtn');
if(orderNowBtn) {
    orderNowBtn.addEventListener('click', () => {
        document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
    });
}

function displayMenuItems(items) {
    menuGrid.innerHTML = '';
    items.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('menu-item');
        div.innerHTML = `
            <div class="item-image" style="background-image: url('${item.image}')"></div>
            <div class="item-content">
                <div class="item-header">
                    <h3 class="item-title">${item.name}</h3>
                    <div class="item-price">Rs ${item.price.toFixed(2)}</div>
                </div>
                <p class="item-description">${item.description}</p>
                <div class="item-footer">
                    <button class="add-to-cart" data-id="${item.id}">Add to Cart</button>
                </div>
            </div>`;
        menuGrid.appendChild(div);
    });
}

function filterMenuItems(category) {
    category === 'all' ? displayMenuItems(menuItems) : displayMenuItems(menuItems.filter(i => i.category === category));
}

function addToCart(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    const existing = cart.find(ci => ci.id === itemId);
    existing ? existing.quantity++ : cart.push({ ...item, quantity: 1 });
    updateCartUI();
}

function updateCartUI() {
    cartItemsContainer.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-qty">
                <button class="decrease" data-id="${item.id}">-</button>
                <span>${item.quantity}</span>
                <button class="increase" data-id="${item.id}">+</button>
            </div>
            <div class="cart-item-price">Rs ${(item.price * item.quantity).toFixed(2)}</div>`;
        cartItemsContainer.appendChild(div);
        total += item.price * item.quantity;
    });
    cartTotalElement.textContent = `Rs ${total.toFixed(2)}`;
    cartCountElement.textContent = cart.reduce((acc, i) => acc + i.quantity, 0);
}

// CORRECTED: Added logic for the checkout button to function
if (proceedToCheckoutBtn) {
    proceedToCheckoutBtn.addEventListener('click', () => {
        document.querySelector('.cart-items').style.display = 'none';
        document.querySelector('.cart-total').style.display = 'none';
        proceedToCheckoutBtn.style.display = 'none';
        checkoutForm.style.display = 'block';
        checkoutForm.classList.add('active');
        document.querySelector('.modal-title').textContent = 'Checkout Details';
    });
}

if (fastOrderToggle) {
    fastOrderToggle.addEventListener('change', () => {
        const quick = fastOrderToggle.checked;
        [customerNameInput, customerEmailInput, customerPhoneInput, customerAddressInput].forEach(input => {
            input.disabled = quick;
            input.required = !quick; // enforce required in normal flow
        });
        if (quick) {
            customerNameInput.placeholder = 'Guest (optional)';
            customerEmailInput.placeholder = 'Optional';
            customerPhoneInput.placeholder = 'Optional';
            customerAddressInput.placeholder = 'Optional';
        } else {
            customerNameInput.placeholder = 'Your Name';
            customerEmailInput.placeholder = 'john@example.com';
            customerPhoneInput.placeholder = '(+977) 1234567891';
            customerAddressInput.placeholder = 'Address for delivery';
        }
    });
}

menuGrid.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart')) addToCart(parseInt(e.target.dataset.id));
});

cartItemsContainer.addEventListener('click', (e) => {
    const id = parseInt(e.target.dataset.id);
    const item = cart.find(i => i.id === id);
    if (e.target.classList.contains('increase')) item.quantity++;
    if (e.target.classList.contains('decrease')) {
        item.quantity--;
        if (item.quantity <= 0) cart = cart.filter(i => i.id !== id);
    }
    updateCartUI();
});

placeOrderBtn.addEventListener('click', async () => {
    if (cart.length === 0) return alert("Empty cart!");

    const quick = fastOrderToggle && fastOrderToggle.checked;
    const customerName = quick ? 'Guest' : (customerNameInput.value.trim() || 'Guest');
    const customerEmail = quick ? '' : customerEmailInput.value.trim();
    const customerPhone = quick ? '' : customerPhoneInput.value.trim();
    const customerAddress = quick ? '' : customerAddressInput.value.trim();

    if (!quick && !customerPhone && !customerEmail) {
        alert('Please provide at least a phone number or an email for order updates.');
        return;
    }

    const orderData = {
        tableNumber,
        cart,
        customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            address: customerAddress,
        },
        paymentMethod: document.getElementById('paymentMethod').value
    };

    try {
        const res = await fetch(`${API_URL}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        await res.json();

        alert("Order placed successfully!");

        cart = [];
        updateCartUI();
        cartModal.style.display = 'none';

    } catch (err) {
        alert("Failed to place order");
        console.error(err);
    }
});

// Reservation System
const reservationForm = document.getElementById("reservationForm");
const availabilityStatus = document.getElementById("availabilityStatus");
const resDate = document.getElementById("resDate");
const resTime = document.getElementById("resTime");
const resTable = document.getElementById("resTable");

if (reservationForm) {
    // Check availability when date/time changes
    [resDate, resTime].forEach(element => {
        element.addEventListener("change", checkTableAvailability);
    });

    reservationForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = {
            tableNumber: document.getElementById("resTable").value,
            customer: {
                name: document.getElementById("resName").value,
                email: document.getElementById("resEmail").value,
                phone: document.getElementById("resPhone").value
            },
            guests: document.getElementById("resGuests").value,
            date: document.getElementById("resDate").value,
            time: document.getElementById("resTime").value,
            notes: document.getElementById("resNotes").value
        };

        try {
            const response = await fetch(`${API_URL}/api/reservations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                document.getElementById("reservationMessage").textContent =
                    `✅ Reservation confirmed for ${formData.customer.name} at Table ${formData.tableNumber} on ${formData.date} at ${formData.time}`;
                document.getElementById("reservationMessage").style.color = "green";
                reservationForm.reset();
                availabilityStatus.style.display = "none";
            } else {
                document.getElementById("reservationMessage").textContent = `❌ ${result.message}`;
                document.getElementById("reservationMessage").style.color = "red";
            }
        } catch (error) {
            document.getElementById("reservationMessage").textContent = "❌ Error making reservation. Please try again.";
            document.getElementById("reservationMessage").style.color = "red";
            console.error('Reservation error:', error);
        }
    });
}

async function checkTableAvailability() {
    const date = resDate.value;
    const time = resTime.value;

    if (!date || !time) return;

    try {
        const response = await fetch(`${API_URL}/api/tables/availability?date=${date}&time=${time}`);
        const data = await response.json();

        if (response.ok) {
            updateTableOptions(data.availableTables, data.reservedTables);
            showAvailabilityStatus(data);
        }
    } catch (error) {
        console.error('Error checking availability:', error);
    }
}

function updateTableOptions(availableTables, reservedTables) {
    const options = resTable.querySelectorAll('option');
    options.forEach(option => {
        if (option.value) {
            const tableNum = parseInt(option.value);
            if (reservedTables.includes(tableNum)) {
                option.disabled = true;
                option.textContent = `Table ${tableNum} (Reserved)`;
                option.style.color = "#999";
            } else {
                option.disabled = false;
                option.textContent = `Table ${tableNum}`;
                option.style.color = "";
            }
        }
    });
}

function showAvailabilityStatus(data) {
    availabilityStatus.style.display = "block";

    if (data.availableTables.length === 0) {
        availabilityStatus.innerHTML = `
            <div style="color: #d32f2f; background: #ffebee; padding: 10px; border-radius: 5px;">
                <strong>❌ No tables available</strong> for ${data.date} at ${data.time}
            </div>
        `;
    } else {
        availabilityStatus.innerHTML = `
            <div style="color: #2e7d32; background: #e8f5e8; padding: 10px; border-radius: 5px;">
                <strong>✅ ${data.availableTables.length} tables available</strong> for ${data.date} at ${data.time}<br>
                <small>Available tables: ${data.availableTables.join(', ')}</small>
            </div>
        `;
    }
}

cartIcon.addEventListener('click', () => cart.length ? cartModal.style.display = 'block' : alert("Cart is empty!"));
closeModal.addEventListener('click', () => {
    cartModal.style.display = 'none';
    // Reset modal view
    document.querySelector('.cart-items').style.display = 'block';
    document.querySelector('.cart-total').style.display = 'flex';
    proceedToCheckoutBtn.style.display = 'block';
    checkoutForm.style.display = 'none';
});
// Smooth scrolling for all internal links and buttons
document.querySelectorAll('a[href^="#"], button[data-scroll]').forEach(el => {
    el.addEventListener('click', (e) => {
        e.preventDefault();

        let targetId = el.getAttribute('href') || el.getAttribute('data-scroll');
        if (!targetId) return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }

        // Close mobile nav if open
        if (mobileNav.classList.contains('active')) {
            closeMobileNav();
        }
    });
});

// ---------------------------
// Mobile / Hamburger Navigation
// ---------------------------

// Functions to open and close mobile nav
function openMobileNav() {
    mobileNav.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    mobileNavToggle.querySelector('i').classList.remove('fa-bars');
    mobileNavToggle.querySelector('i').classList.add('fa-times');
}

function closeMobileNav() {
    mobileNav.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    mobileNavToggle.querySelector('i').classList.remove('fa-times');
    mobileNavToggle.querySelector('i').classList.add('fa-bars');
}

// Toggle mobile menu on click
mobileNavToggle.addEventListener('click', () => {
    if (mobileNav.classList.contains('active')) {
        closeMobileNav();
    } else {
        openMobileNav();
    }
});



window.addEventListener('click', (e) => e.target === cartModal && (cartModal.style.display = 'none'));

// Table Number Display
if (tableNumber) {
    const tableDisplay = document.getElementById('tableDisplay');
    const tableNumberText = document.getElementById('tableNumberText');

    if (tableDisplay && tableNumberText) {
        tableDisplay.style.display = 'block';
        tableNumberText.textContent = `You are ordering for Table ${tableNumber}`;
    }
}

initializeMenu();



