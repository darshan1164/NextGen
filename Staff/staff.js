async function fetchOrders() {
    try {
        const response = await fetch('http://localhost:3000/orders');
        const data = await response.json();
        if (data.status === 'success') {
            const ordersContainer = document.getElementById('orders');
            ordersContainer.innerHTML = '';

            data.orders.forEach(order => {
                const jsonData = JSON.stringify(order.details);
                const details = JSON.parse(jsonData); // Ensure it's a valid JSON string

                //const details = JSON.parse(order.details); // Parse the details JSON
                const orderItems = details.map(item => `<p>${item.name} - Qty: ${item.quantity}</p>`).join('');

                const orderElement = document.createElement('div');
                orderElement.classList.add('order');
                orderElement.innerHTML = `
                    <div class="order-content">
                        <h3>Order ID: ${order.id}</h3>
                        ${orderItems}
                        <p>Ordered at: ${new Date(order.order_time).toLocaleString()}</p>
                        <p>Status: ${order.status}</p>
                        ${order.status === 'in-progress' ? `<button onclick="updateOrderStatus(${order.id}, 'completed')">Mark as Completed</button>` : ''}
                    </div>
                `;
                ordersContainer.appendChild(orderElement);
            });
        } else {
            console.error('Failed to fetch orders:', data.message);
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
}

async function updateOrderStatus(id, status) {
    try {
        const response = await fetch('http://localhost:3000/update-order-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        });

        const data = await response.json();
        if (data.status === 'success') {
            alert('Order status updated successfully!');
            fetchOrders();
            if (status === 'completed') {
                sendNotification(id);
            }
        } else {
            console.error('Failed to update order status:', data.message);
        }
    } catch (error) {
        console.error('Error updating order status:', error);
    }
}

async function sendNotification(orderId) {
    // Add logic to send notification to the user
    console.log(`Notification sent for order ID: ${orderId}`);
}

// Initialize orders on page load
document.addEventListener('DOMContentLoaded', fetchOrders);