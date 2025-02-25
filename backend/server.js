const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('../Login')); // Serve static files from the 'Login' directory

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1164', // Update with your database password
    database: 'cafe_db' // Update with your database name
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database');
});

// Fetch orders from MySQL
app.get('/orders', (req, res) => {
    const query = "SELECT * FROM orders where status = 'in-progress' ORDER BY order_time DESC";
 
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching orders:', err);
            res.status(500).json({ status: 'failure', message: 'Internal server error' });
            return;
        }
        res.json({ status: 'success', orders: results });
    });
});

// Place order in MySQL
app.post('/place-order', (req, res) => {
    const { userId, cart } = req.body;

    if (!userId) {
        return res.status(400).json({ status: 'failure', message: 'User ID is required' });
    }

    if (!cart || !Array.isArray(cart)) {
        return res.status(400).json({ status: 'failure', message: 'Invalid cart data' });
    }

    const details = JSON.stringify(cart);

    const query = 'INSERT INTO orders (user_id, details) VALUES (?, ?)';
    db.query(query, [userId, details], (err, results) => {
        if (err) {
            console.error('Error placing order:', err);
            res.status(500).json({ status: 'failure', message: 'Internal server error' });
            return;
        }
        res.json({ status: 'success', message: 'Order placed successfully', orderId: results.insertId });
    });
});

// Fetch order details by ID
app.get('/order/:id', (req, res) => {
    const { id } = req.params;

    const query = 'SELECT * FROM orders WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error fetching order details:', err);
            res.status(500).json({ status: 'failure', message: 'Internal server error' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ status: 'failure', message: 'Order not found' });
        } else {
            res.json({ status: 'success', data: results[0] });
        }
    });
});

// Update order status in MySQL
app.post('/update-order-status', (req, res) => {
    const { id, status } = req.body;

    const query = 'UPDATE orders SET status = ? WHERE id = ?';
    db.query(query, [status, id], (err, result) => {
        if (err) {
            console.error('Error updating order status:', err);
            res.status(500).json({ status: 'failure', message: 'Internal server error' });
            return;
        }
        res.json({ status: 'success', message: 'Order status updated successfully' });
    });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt with username: ${username} and password: ${password}`); // Debugging

    const query = 'SELECT * FROM users WHERE username = ?';

    db.query(query, [username], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ status: 'failure', message: 'Internal server error' });
            return;
        }
        console.log('Query result:', result); // Debugging
        if (result.length > 0) {
            const user = result[0];
            bcrypt.compare(password, user.password, (err, match) => {
                if (err) {
                    console.error('Error comparing passwords:', err);
                    res.status(500).json({ status: 'failure', message: 'Internal server error' });
                    return;
                }
                if (match) {
                    res.json({ status: 'success', user_id: user.id, role: user.role });
                } else {
                    res.json({ status: 'failure', message: 'Invalid credentials' });
                }
            });
        } else {
            res.json({ status: 'failure', message: 'User not found' });
        }
    });
});

// Sign-up endpoint
app.post('/signup', (req, res) => {
    const { username, password, role = 'customer' } = req.body; // Default role to 'customer'

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error('Error hashing password:', err);
            res.status(500).json({ status: 'failure', message: 'Internal server error' });
            return;
        }

        const query = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';

        db.query(query, [username, hash, role], (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).json({ status: 'failure', message: 'Internal server error' });
                return;
            }
            res.json({ status: 'success' });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});