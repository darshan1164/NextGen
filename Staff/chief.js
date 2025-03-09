// Fetch and display in-progress orders
async function fetchInProgressOrders() {
    try {
        const response = await fetch('http://localhost:3000/in-progress-orders');
        const data = await response.json();

        if (data.status === 'success') {
            const ordersTableBody = document.querySelector('#orders-table tbody');
            ordersTableBody.innerHTML = ''; // Clear existing rows

            data.orders.forEach(order => {
                const jsonData = JSON.stringify(order.details);
                const details = JSON.parse(jsonData); // Ensure it's a valid JSON string

                // Format order items
                const orderItems = details.map(item => `${item.name} (Qty: ${item.quantity})`).join(', ');

                // Create a new row for the order
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${order.id}</td>
                    <td>${orderItems}</td>
                    <td>${new Date(order.order_time).toLocaleString()}</td>
                    <td>${order.order_type}</td>
                    <td>${order.status}</td>
                    <td>
                        <button onclick="updateOrderStatus(${order.id}, 'ready')">Mark as Ready</button>
                    </td>
                `;
                ordersTableBody.appendChild(row);
            });
        } else {
            console.error('Failed to fetch in-progress orders:', data.message);
        }
    } catch (error) {
        console.error('Error fetching in-progress orders:', error);
    }
}

// Update order status
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
            fetchInProgressOrders(); // Refresh the orders table
        } else {
            console.error('Failed to update order status:', data.message);
        }
    } catch (error) {
        console.error('Error updating order status:', error);
    }
}

// Auto-refresh the in-progress orders table every 5 seconds
function autoRefreshInProgressOrders() {
    setInterval(fetchInProgressOrders, 5000); // Refresh every 5 seconds
}

// Initialize and start auto-refresh on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchInProgressOrders(); // Fetch in-progress orders immediately
    autoRefreshInProgressOrders(); // Start auto-refresh
});