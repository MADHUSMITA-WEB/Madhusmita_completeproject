main5.js

const API_BASE_URL = "http://localhost:3000/api";

// ==========================================
// GENERIC API REQUEST
// ==========================================
async function sendApiRequest(endpoint, method = "GET", data = null) {
    const options = {
        method: method,
        headers: {
            "Content-Type": "application/json"
        }
    };

    if (data && (method === "POST" || method === "PUT")) {
        options.body = JSON.stringify(data);
    }

    try {
        console.log(`API Request: ${method} ${endpoint}`, data);

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        if (!response.ok) {
            throw new Error(`HTTP Error: Status ${response.status}`);
        }

        const result = await response.json();

        console.log(`API Response: ${method} ${endpoint}`, result);

        return result;

    } catch (error) {
        console.error(`API Request Error [${method} ${endpoint}]:`, error);
        throw error;
    }
}


// ==========================================
// AUTHENTICATION
// ==========================================

async function loginUser(credentials) {
    return await sendApiRequest("/login", "POST", credentials);
}

async function signupUser(userData) {
    return await sendApiRequest("/signup", "POST", userData);
}


// ==========================================
// STORE & CART
// ==========================================

async function fetchStoreItems() {
    return await sendApiRequest("/store", "GET");
}

async function saveCart(cartItems) {
    return await sendApiRequest("/cart", "POST", cartItems);
}

async function getCartByUser(userId) {
    return await sendApiRequest(`/cart/${userId}`, "GET");
}


// ==========================================
// CHECKOUT / PAYMENT / ORDERS
// ==========================================

async function processCheckout(checkoutData) {
    return await sendApiRequest("/checkout", "POST", checkoutData);
}

async function processPayment(paymentData) {
    return await sendApiRequest("/payment", "POST", paymentData);
}

async function createOrder(orderData) {
    return await sendApiRequest("/orders", "POST", orderData);
}


// ==========================================
// PAGE EVENT HANDLERS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // ======================================
    // LOGIN FORM
    // ======================================

   // ======================================
// LOGIN FORM
// ======================================

const loginForm = document.getElementById("login-form");

if (loginForm) {
    console.log("Login form detected successfully");

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        console.log("Login form submission intercepted.");

        // Target the registration ID field securely
        const registerIdInput = document.getElementById("registerId") || document.getElementById("regId");
        const passwordInput = document.getElementById("password");

        const registerId = registerIdInput ? registerIdInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value : "";

        console.log("Captured Login Input -> RegisterID:", registerId, "| Password length:", password.length);

        if (!registerId || !password) {
            alert("Please enter both your Registration ID and password.");
            return;
        }

        // Depending on your backend, it might look for 'registerId' or 'username'. 
        // We will send both keys so your backend catches it regardless!
        const payload = {
            registerId: registerId,
            username: registerId, // fallback if backend maps user identifier to username
            password: password
        };

        try {
            console.log("Sending login payload to server:", payload);

            const response = await loginUser(payload);

            console.log("Login server raw response:", response);

            if (response && (response.success === true || response.token || response.status === "success")) {
                console.log("Login successful, redirecting to store.html...");
                window.location.href = "store.html";
            } else {
                alert(response.message || "Invalid Registration ID or password.");
            }

        } catch (err) {
            console.error("Critical login connection error:", err);
            alert("Failed to connect to server. Check if backend is running on port 3000.");
        }
    });
}

    // ======================================
    // SIGNUP FORM
    // ======================================

    const signupForm = document.getElementById("signup-form");

    if (signupForm) {

        console.log("Signup form detected");

        signupForm.addEventListener("submit", async (e) => {

            // IMPORTANT:
            // Prevent normal HTML form submission
            e.preventDefault();

            const usernameInput = document.getElementById("username");
            const emailInput = document.getElementById("email");
            const passwordInput = document.getElementById("password");

            const username = usernameInput ? usernameInput.value.trim() : "";
            const email = emailInput ? emailInput.value.trim() : "";
            const password = passwordInput ? passwordInput.value : "";

            if (!username || !email || !password) {

                alert("Please fill in all fields.");

                return;
            }

            const payload = {
                username: username,
                email: email,
                password: password
            };

            try {

                console.log("Sending signup data:", payload);

                const response = await signupUser(payload);

                console.log("Signup server response:", response);

                if (response.success) {

                    console.log("Signup successful!");

                    alert("Signup successful! Please login.");

                    // Navigate only after successful server response
                    window.location.href = "login.html";

                } else {

                    alert(response.message || "Signup failed.");

                }

            } catch (err) {

                console.error("Signup error:", err);

                alert("Failed to connect to server.");

            }

        });
    }


    // ======================================
    // STORE
    // ======================================

    loadStore();

});


// ==========================================
// LOAD STORE PRODUCTS
// ==========================================

async function loadStore() {

    const storeContainer = document.getElementById("store-products");

    // If this isn't the store page, do nothing
    if (!storeContainer) {
        return;
    }

    try {

        console.log("Loading store products...");

        const products = await fetchStoreItems();

        // Convert the fetched response into a formatted JSON string for console tracking
        console.log("Store response JSON.stringify output:", JSON.stringify(products, null, 2));

        // Your backend may return an array directly
        // or { success: true, products: [...] }

        const items = Array.isArray(products)
            ? products
            : products.products || [];

        storeContainer.innerHTML = "";

        items.forEach(product => {

            const productElement = document.createElement("div");

            productElement.className = "product";

            productElement.innerHTML = `
                <h3>${product.name || "Product"}</h3>
                <p>Price: ₹${product.price || 0}</p>
                <p>Stock: ${product.stock || 0}</p>
            `;

            storeContainer.appendChild(productElement);

        });

    } catch (error) {

        console.error("Failed to load store:", error);

    }
}