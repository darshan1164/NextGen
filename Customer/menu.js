// Debugging: Check if the script is loaded
console.log("Script loaded successfully!");

// Mode toggle handling
function toggleMode() {
    console.log("Toggle Mode button clicked"); // Debugging
    const body = document.body;
    const modeToggleButton = document.getElementById('toggle-mode');

    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        modeToggleButton.textContent = 'Switch to Light Mode';
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        modeToggleButton.textContent = 'Switch to Dark Mode';
    }
}

// Menu item handling
function addToCart(button) {
    console.log("Add to Cart button clicked"); // Debugging

    const menuItem = button.closest('.menu-item');
    const name = menuItem.getAttribute('data-name');
    const price = parseInt(menuItem.getAttribute('data-price'), 10);

    console.log("Item Name:", name); // Debugging
    console.log("Item Price:", price); // Debugging

    if (name && !isNaN(price)) { // Ensure the attributes are properly read
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.name === name);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name, price, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        console.log("Cart Updated:", cart); // Debugging
        updateCart();
    } else {
        console.error('Item name or price is null or invalid.');
    }
}

function viewAR(arLink) {
    console.log("View in AR button clicked"); // Debugging
    window.location.href = arLink;
}

// Cart item handling
function updateCart() {
    console.log("Updating Cart"); // Debugging
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceContainer = document.getElementById('total-price');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    console.log("Cart Data:", cart); // Debugging

    cartItemsContainer.innerHTML = ''; // Clear existing items
    let totalPrice = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
    } else {
        cart.forEach((item, index) => {
            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('cart-item');
            cartItemElement.innerHTML = `
                <div class="cart-item-content">
                    <span class="item-name">${item.name}</span>
                    <div class="quantity-control">
                        <button onclick="changeCartQuantity(${index}, -1)">-</button>
                        <span class="cart-quantity">${item.quantity}</span>
                        <button onclick="changeCartQuantity(${index}, 1)">+</button>
                    </div>
                    <button class="remove-from-cart" onclick="removeFromCart(${index})">Remove</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemElement);
            totalPrice += item.price * item.quantity;
        });

        totalPriceContainer.innerHTML = `<h3>Total Price: ₹${totalPrice}</h3>`;
    }
}

function changeCartQuantity(index, delta) {
    console.log("Changing Cart Quantity"); // Debugging
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart[index].quantity = Math.max(1, cart[index].quantity + delta); // Ensure quantity is at least 1
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
}

function removeFromCart(index) {
    console.log("Removing Item from Cart"); // Debugging
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
}

async function proceedToOrder() {
    console.log("Proceeding to Order"); // Debugging
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const userId = localStorage.getItem('user_id'); // Get user_id from localStorage

    if (!userId) {
        alert('You must be logged in to place an order.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/place-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, cart })
        });

        const data = await response.json();
        if (data.status === 'success') {
            // Store the order ID in localStorage
            localStorage.setItem('order_id', data.orderId);
            alert('Thank you for your order! Your items are being processed.');
            localStorage.removeItem('cart');
            updateCart();
            window.location.href = '/Customer/bill.html';
        } else {
            console.error('Failed to place order:', data.message);
        }
    } catch (error) {
        console.error('Error placing order:', error);
    }
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', updateCart);