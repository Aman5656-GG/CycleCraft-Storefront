
// ======================================
// CYCLECRAFT - COMPLETE SHOPPING SYSTEM
// ======================================

const CART_KEY = "cycleCraftCart";
let cart = [];

// Load saved cart
try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY));

    if (Array.isArray(saved)) {
        cart = saved
            .filter(item => item && item.name && Number(item.price) >= 0)
            .map(item => ({
                id: String(item.id || Date.now() + Math.random()),
                name: String(item.name),
                price: Number(item.price),
                quantity: Math.max(1, Number(item.quantity) || 1),
                details: String(item.details || "")
            }));
    }
} catch (error) {
    console.error("Cart loading error:", error);
}

// Format Indian currency
function formatPrice(amount) {
    return new Intl.NumberFormat("en-IN").format(amount);
}

// Save cart
function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Update cart count
function updateCart() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);

    const countElement = document.getElementById("cart-count");

    if (countElement) {
        countElement.textContent = count;
    }

    saveCart();
}

// Safe HTML text
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

// ======================================
// 1. BICYCLE PRICE CALCULATOR
// ======================================

function calculateBike() {

    const componentIds = [
        "frame",
        "tyres",
        "seat",
        "handlebar",
        "gears",
        "brakes",
        "pedals",
        "suspension"
    ];

    let total = 0;

    componentIds.forEach(id => {
        const element = document.getElementById(id);

        if (element) {
            total += Number(element.value) || 0;
        }
    });

    const priceElement = document.getElementById("bike-price");

    if (priceElement) {
        priceElement.textContent = formatPrice(total);
    }

    return total;
}

// ======================================
// 2. ADD CUSTOM BICYCLE TO CART
// ======================================

function addCustomBikeToCart() {

    const componentIds = [
        "frame", "tyres", "seat", "handlebar",
        "gears", "brakes", "pedals", "suspension"
    ];

    const details = componentIds.map(id => {
        const select = document.getElementById(id);
        return select.options[select.selectedIndex].text;
    }).join(" | ");

    addToCart(
        "Custom Bicycle",
        calculateBike(),
        details
    );
}

// ======================================
// 3. ADD ACCESSORIES TO CART
// ======================================

function addToCart(name, price, details = "") {

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        alert("Invalid product price.");
        return;
    }

    // Merge identical accessories
    const existing = !details
        ? cart.find(item =>
            item.name === name &&
            item.price === numericPrice &&
            !item.details
        )
        : null;

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            id: String(Date.now() + Math.random()),
            name,
            price: numericPrice,
            quantity: 1,
            details
        });
    }

    updateCart();
    showCartToast(name + " added to cart!");
}

// ======================================
// 4. CREATE CART WINDOW
// ======================================

function initializeCart() {

    if (document.getElementById("cycle-cart")) return;

    const overlay = document.createElement("div");

    overlay.id = "cycle-cart";
    overlay.className = "cart-overlay";

    overlay.innerHTML = `
        <div class="cart-panel" role="dialog" aria-modal="true"
             aria-label="Shopping cart">

            <div class="cart-header">
                <div>
                    <h2>Your Shopping Cart</h2>
                    <p>Review your selected products</p>
                </div>

                <button class="cart-close" data-cart-action="close"
                        aria-label="Close cart">×</button>
            </div>

            <div class="cart-items" id="cart-items"></div>

            <div class="cart-footer">

                <div class="cart-total-row">
                    <span>Total Amount</span>
                    <strong id="cart-total">₹0</strong>
                </div>

                <button class="checkout-btn"
                        data-cart-action="checkout">
                    Proceed to Checkout
                </button>

                <button class="continue-btn"
                        data-cart-action="close">
                    Continue Shopping
                </button>

                <p class="cart-note">
                    Demo storefront. No real payment is processed.
                </p>

            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    overlay.addEventListener("click", function(event) {

        if (event.target === overlay) {
            closeCart();
            return;
        }

        const button = event.target.closest("[data-cart-action]");

        if (!button) return;

        const action = button.dataset.cartAction;
        const id = button.dataset.id;

        if (action === "close") {
            closeCart();
        }

        if (action === "increase") {
            changeQuantity(id, 1);
        }

        if (action === "decrease") {
            changeQuantity(id, -1);
        }

        if (action === "remove") {
            removeCartItem(id);
        }

        if (action === "checkout") {
            alert(
                "Checkout demo only. Real payment and order placement are not connected."
            );
        }
    });
}

// ======================================
// 5. DISPLAY CART
// ======================================

function viewCart() {

    initializeCart();
    renderCart();

    document.getElementById("cycle-cart").classList.add("active");

    document.body.classList.add("cart-open");
}

function closeCart() {

    const overlay = document.getElementById("cycle-cart");

    if (overlay) {
        overlay.classList.remove("active");
    }

    document.body.classList.remove("cart-open");
}

// ======================================
// 6. RENDER CART PRODUCTS
// ======================================

function renderCart() {

    const container = document.getElementById("cart-items");
    const totalElement = document.getElementById("cart-total");

    if (!container || !totalElement) return;

    if (cart.length === 0) {

        container.innerHTML = `
            <div class="empty-cart">
                <div>🛒</div>
                <h3>Your cart is empty</h3>
                <p>Explore our bicycles and cycling accessories.</p>
            </div>
        `;

        totalElement.textContent = "₹0";
        return;
    }

    let total = 0;

    container.innerHTML = cart.map(item => {

        const subtotal = item.price * item.quantity;

        total += subtotal;

        return `
            <div class="cart-item">

                <div class="cart-item-info">

                    <h3>${escapeHTML(item.name)}</h3>

                    <p>₹${formatPrice(item.price)} each</p>

                    ${item.details
                        ? `<small>${escapeHTML(item.details)}</small>`
                        : ""}
                </div>

                <div class="cart-item-bottom">

                    <div class="quantity-control">

                        <button data-cart-action="decrease"
                                data-id="${escapeHTML(item.id)}">−</button>

                        <span>${item.quantity}</span>

                        <button data-cart-action="increase"
                                data-id="${escapeHTML(item.id)}">+</button>

                    </div>

                    <strong>₹${formatPrice(subtotal)}</strong>

                    <button class="remove-item"
                            data-cart-action="remove"
                            data-id="${escapeHTML(item.id)}">
                        Remove
                    </button>

                </div>

            </div>
        `;
    }).join("");

    totalElement.textContent = "₹" + formatPrice(total);
}

// ======================================
// 7. QUANTITY AND REMOVE FUNCTIONS
// ======================================

function changeQuantity(id, amount) {

    const item = cart.find(product => product.id === id);

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        cart = cart.filter(product => product.id !== id);
    }

    updateCart();
    renderCart();
}

function removeCartItem(id) {

    cart = cart.filter(item => item.id !== id);

    updateCart();
    renderCart();
}

// ======================================
// 8. CART NOTIFICATION
// ======================================

function showCartToast(message) {

    let toast = document.getElementById("cycle-toast");

    if (!toast) {

        toast = document.createElement("div");
        toast.id = "cycle-toast";
        toast.className = "cycle-toast";

        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.cycleToastTimer);

    window.cycleToastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

// ======================================
// 9. INITIALIZE WEBSITE
// ======================================

document.addEventListener("DOMContentLoaded", function() {

    initializeCart();
    updateCart();

    const componentIds = [
        "frame", "tyres", "seat", "handlebar",
        "gears", "brakes", "pedals", "suspension"
    ];

    componentIds.forEach(id => {

        const element = document.getElementById(id);

        if (element) {
            element.addEventListener("change", calculateBike);
        }
    });

    calculateBike();

});

// ======================================
// PRODUCT SEARCH AND PRICE FILTER
// ======================================

document.addEventListener("DOMContentLoaded", function() {

    const searchInput = document.getElementById("product-search");
    const sortSelect = document.getElementById("price-sort");
    const productGrid = document.querySelector(".products");
    const productCount = document.getElementById("product-count");

    if (!searchInput || !sortSelect || !productGrid) return;

    function updateProducts() {

        const query = searchInput.value.trim().toLowerCase();

        const cards = Array.from(
            productGrid.querySelectorAll(".product-card")
        );

        // Remember original product order
        cards.forEach((card, index) => {
            if (card.dataset.originalOrder === undefined) {
                card.dataset.originalOrder = index;
            }
        });

        const sortValue = sortSelect.value;

        // Sort products by price
        cards.sort((a, b) => {

            const priceA = Number(
                a.querySelector("p").textContent.replace(/[^\d]/g, "")
            );

            const priceB = Number(
                b.querySelector("p").textContent.replace(/[^\d]/g, "")
            );

            if (sortValue === "low-high") {
                return priceA - priceB;
            }

            if (sortValue === "high-low") {
                return priceB - priceA;
            }

            return Number(a.dataset.originalOrder) -
                   Number(b.dataset.originalOrder);
        });

        let visibleCount = 0;

        cards.forEach(card => {

            const name = card.querySelector("h3")
                .textContent.toLowerCase();

            const matched = name.includes(query);

            card.style.display = matched ? "" : "none";

            if (matched) visibleCount++;

            productGrid.appendChild(card);
        });

        productCount.textContent =
            visibleCount + " products found";

    }

    searchInput.addEventListener("input", updateProducts);
    sortSelect.addEventListener("change", updateProducts);

    updateProducts();

});
