import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'loosr_ultra_secret_jwt_key_2026';

app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// 1. REGISTER
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    const insert = db.prepare(`
      INSERT INTO users (name, email, password, phone, address)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      name.trim(),
      normalizedEmail,
      hashedPassword,
      phone ? phone.trim() : '',
      address ? address.trim() : ''
    );

    const newUser = {
      id: result.lastInsertRowid,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : '',
      address: address ? address.trim() : '',
    };

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      token,
      user: newUser,
      message: 'Account created successfully',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// 2. LOGIN
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      createdAt: user.created_at,
    };

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      token,
      user: userProfile,
      message: 'Logged in successfully',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// 3. GET CURRENT USER PROFILE & ORDERS
app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, phone, address, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
    const parsedOrders = orders.map((o) => ({
      ...o,
      items: JSON.parse(o.items_json || '[]'),
    }));

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        createdAt: user.created_at,
      },
      orders: parsedOrders,
    });
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. UPDATE USER PROFILE (Name, Phone, Address)
app.put('/api/user/profile', authenticateToken, (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const update = db.prepare(`
      UPDATE users
      SET name = COALESCE(?, name),
          phone = COALESCE(?, phone),
          address = COALESCE(?, address)
      WHERE id = ?
    `);

    update.run(
      name ? name.trim() : null,
      phone ? phone.trim() : null,
      address ? address.trim() : null,
      req.user.id
    );

    const updatedUser = db.prepare('SELECT id, name, email, phone, address, created_at FROM users WHERE id = ?').get(req.user.id);

    res.json({
      user: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// 5. CREATE ORDER
app.post('/api/orders', (req, res) => {
  try {
    const { userId, orderNumber, customerName, customerEmail, customerPhone, deliveryAddress, total, paymentMethod, items } = req.body;

    const orderNo = orderNumber || `LS-${Date.now().toString().slice(-6)}`;
    const insert = db.prepare(`
      INSERT INTO orders (user_id, order_number, customer_name, customer_email, customer_phone, delivery_address, total, payment_method, items_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      userId || null,
      orderNo,
      customerName || 'Customer',
      customerEmail || '',
      customerPhone || '',
      deliveryAddress || '',
      total || 0,
      paymentMethod || 'cod',
      JSON.stringify(items || [])
    );

    res.status(201).json({
      id: result.lastInsertRowid,
      orderNumber: orderNo,
      message: 'Order created successfully',
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// 6. HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'LOOSR API', timestamp: new Date().toISOString() });
});

// 7. SERVE STATIC FRONTEND ON RENDER
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Fallback for SPA routing in Express 5
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[+] LOOSR Server running on port ${PORT}`);
});
