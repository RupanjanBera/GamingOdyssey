const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize SQLite database (in-memory for simplicity; use file-based for production)
const db = new sqlite3.Database(':memory:');
db.run('CREATE TABLE orders (id TEXT, amount REAL, method TEXT, details TEXT, status TEXT)');

// Process payment endpoint
app.post('/process-payment', (req, res) => {
  const { orderId, amount, method, upiId } = req.body;
  
  // Construct payment details based on method
  let details = '';
  if (method === 'UPI QR Code') {
    details = `UPI ID: ${upiId || 'QR Code'}`;
  } else if (method === 'COD') {
    details = 'Cash on Delivery';
  }

  // Insert order into database
  db.run(
    'INSERT INTO orders (id, amount, method, details, status) VALUES (?, ?, ?, ?, ?)',
    [orderId, parseFloat(amount) || 0, method, details, 'pending'],
    (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to process payment' });
      }
      console.log(`Order ${orderId}: ${method}, Amount: ₹${amount}, Details: ${details}, Status: pending`);
      res.json({ status: 'pending', message: 'Payment submitted, awaiting manual verification' });
    }
  );
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});