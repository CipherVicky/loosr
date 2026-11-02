import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'loosr_heavyweight_streetwear_2026_secret_key';

app.use(cors());
app.use(express.json());

// Auth middleware for user profile endpoints
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

// Admin authentication helper (accepts loosr2026, admin, loosr, vicky or custom env key)
const isAdminAuthorized = (req) => {
  const key = (req.headers['x-admin-key'] || req.query.key || '').trim().toLowerCase();
  const MASTER_KEY = (process.env.ADMIN_KEY || 'loosr2026').toLowerCase();
  return key === MASTER_KEY || key === 'admin' || key === 'loosr' || key === 'vicky' || key === 'loosr2026';
};

// Helper to resolve cart identifier (supports both logged-in users and guest sessions in real DB)
const resolveCartIdentity = (req) => {
  let userId = null;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
    } catch (e) {}
  }

  const sessionToken = (
    req.headers['x-cart-token'] ||
    req.query.cart_token ||
    req.body?.cartToken ||
    ''
  ).trim();

  const cartId = userId ? `user_${userId}` : (sessionToken ? `guest_${sessionToken}` : null);
  return { userId, sessionToken, cartId };
};

// 1. REGISTER
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    const insertSql = `
      INSERT INTO users (name, email, password, phone, address)
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await db.run(insertSql, [
      name.trim(),
      normalizedEmail,
      hashedPassword,
      phone ? phone.trim() : '',
      address ? address.trim() : '',
    ]);

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
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await db.get('SELECT * FROM users WHERE email = ?', [normalizedEmail]);

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
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.get('SELECT id, name, email, phone, address, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const orders = await db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [user.id]);
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
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const updateSql = `
      UPDATE users
      SET name = COALESCE(?, name),
          phone = COALESCE(?, phone),
          address = COALESCE(?, address)
      WHERE id = ?
    `;

    await db.run(updateSql, [
      name ? name.trim() : null,
      phone ? phone.trim() : null,
      address ? address.trim() : null,
      req.user.id,
    ]);

    const updatedUser = await db.get('SELECT id, name, email, phone, address, created_at FROM users WHERE id = ?', [req.user.id]);

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
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, orderNumber, customerName, customerEmail, customerPhone, deliveryAddress, total, paymentMethod, items } = req.body;

    const orderNo = orderNumber || `LS-${Date.now().toString().slice(-6)}`;
    const insertSql = `
      INSERT INTO orders (user_id, order_number, customer_name, customer_email, customer_phone, delivery_address, total, payment_method, items_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await db.run(insertSql, [
      userId || null,
      orderNo,
      customerName || 'Customer',
      customerEmail || '',
      customerPhone || '',
      deliveryAddress || '',
      total || 0,
      paymentMethod || 'cod',
      JSON.stringify(items || []),
    ]);

    // Clear active cart in DB after successful order
    try {
      const { userId: cartUserId, sessionToken, cartId } = resolveCartIdentity(req);
      const targetUserId = userId || cartUserId;
      if (targetUserId) {
        await db.run('DELETE FROM carts WHERE user_id = ? OR cart_id = ?', [targetUserId, `user_${targetUserId}`]);
      }
      if (sessionToken) {
        await db.run('DELETE FROM carts WHERE session_id = ? OR cart_id = ?', [sessionToken, `guest_${sessionToken}`]);
      }
      if (cartId) {
        await db.run('DELETE FROM carts WHERE cart_id = ?', [cartId]);
      }
    } catch (clearErr) {
      console.warn('Could not clear cart after order:', clearErr);
    }

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

// 5.5 UNIVERSAL CART PERSISTENCE IN REAL DB (SUPPORTS GUEST VISITORS & LOGGED-IN USERS)
app.get('/api/cart', async (req, res) => {
  try {
    const { userId, sessionToken, cartId } = resolveCartIdentity(req);

    if (!cartId && !sessionToken && !userId) {
      return res.json({ cart: [], cartId: null });
    }

    let cartRow = null;

    if (userId) {
      // Find logged-in user cart
      cartRow = await db.get('SELECT * FROM carts WHERE user_id = ? OR cart_id = ?', [userId, `user_${userId}`]);

      // If user also had items in an active guest cart, seamlessly merge them
      if (sessionToken) {
        const guestRow = await db.get(
          'SELECT * FROM carts WHERE cart_id = ? OR (session_id = ? AND user_id IS NULL)',
          [`guest_${sessionToken}`, sessionToken]
        );
        if (guestRow && guestRow.items_json && guestRow.items_json !== '[]') {
          let userItems = [];
          let guestItems = [];
          try {
            userItems = JSON.parse(cartRow?.items_json || '[]');
            guestItems = JSON.parse(guestRow.items_json || '[]');
          } catch (e) {}

          if (guestItems.length > 0) {
            const mergedMap = new Map();
            for (const item of [...userItems, ...guestItems]) {
              const key = `${item.id}_${item.chosenColor || ''}_${item.chosenSize || ''}`;
              if (mergedMap.has(key)) {
                mergedMap.get(key).qty = (mergedMap.get(key).qty || 1) + (item.qty || 1);
              } else {
                mergedMap.set(key, { ...item });
              }
            }
            const mergedList = Array.from(mergedMap.values());
            const mergedJson = JSON.stringify(mergedList);

            await db.run(
              `INSERT INTO carts (cart_id, user_id, session_id, items_json, updated_at)
               VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
               ON CONFLICT(cart_id) DO UPDATE SET
                 items_json = excluded.items_json,
                 user_id = COALESCE(excluded.user_id, carts.user_id),
                 session_id = COALESCE(excluded.session_id, carts.session_id),
                 updated_at = CURRENT_TIMESTAMP`,
              [`user_${userId}`, userId, sessionToken, mergedJson]
            );

            // Clean up old guest cart
            await db.run('DELETE FROM carts WHERE cart_id = ?', [guestRow.cart_id]);
            return res.json({ cart: mergedList, cartId: `user_${userId}` });
          }
        }
      }
    } else {
      // Guest visitor cart
      cartRow = await db.get(
        'SELECT * FROM carts WHERE cart_id = ? OR session_id = ?',
        [cartId, sessionToken]
      );
    }

    let cart = [];
    if (cartRow && cartRow.items_json) {
      try {
        cart = JSON.parse(cartRow.items_json);
      } catch (e) {
        cart = [];
      }
    }

    res.json({ cart, cartId: cartId || cartRow?.cart_id || null });
  } catch (error) {
    console.error('Fetch cart error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

app.put('/api/cart', async (req, res) => {
  try {
    const { cart } = req.body;
    let { userId, sessionToken, cartId } = resolveCartIdentity(req);

    if (!cartId && req.body?.cartToken) {
      sessionToken = req.body.cartToken.trim();
      cartId = userId ? `user_${userId}` : `guest_${sessionToken}`;
    }

    if (!cartId) {
      return res.status(400).json({ error: 'Cart identifier required' });
    }

    const itemsJson = JSON.stringify(cart || []);

    const upsertSql = `
      INSERT INTO carts (cart_id, user_id, session_id, items_json, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(cart_id) DO UPDATE SET
        items_json = excluded.items_json,
        user_id = COALESCE(excluded.user_id, carts.user_id),
        session_id = COALESCE(excluded.session_id, carts.session_id),
        updated_at = CURRENT_TIMESTAMP
    `;

    await db.run(upsertSql, [
      cartId,
      userId || null,
      sessionToken || null,
      itemsJson,
    ]);

    res.json({ success: true, count: (cart || []).length, cartId });
  } catch (error) {
    console.error('Save cart error:', error);
    res.status(500).json({ error: 'Failed to save cart to database' });
  }
});

// 5.8 ADMIN / OWNER USERS, ORDERS & CARTS DATABASE PORTAL
app.get('/api/admin/users', async (req, res) => {
  if (!isAdminAuthorized(req)) {
    return res.status(403).json({ error: 'Unauthorized: Invalid username or passcode' });
  }

  try {
    const users = await db.all(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.password,
        u.phone, 
        u.address, 
        u.created_at,
        (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) as order_count,
        (SELECT COALESCE(SUM(o.total), 0) FROM orders o WHERE o.user_id = u.id) as total_spent
      FROM users u
      ORDER BY u.id DESC
    `);

    res.json({ users });
  } catch (err) {
    console.error('Fetch users table error:', err);
    res.status(500).json({ error: 'Failed to query users database' });
  }
});

app.get('/api/admin/orders', async (req, res) => {
  if (!isAdminAuthorized(req)) {
    return res.status(403).json({ error: 'Unauthorized: Invalid username or passcode' });
  }

  try {
    const orders = await db.all('SELECT * FROM orders ORDER BY created_at DESC');
    const parsed = orders.map((o) => ({
      ...o,
      items: JSON.parse(o.items_json || '[]'),
      raw_items_json: o.items_json,
    }));
    res.json({ orders: parsed });
  } catch (err) {
    console.error('Fetch orders table error:', err);
    res.status(500).json({ error: 'Failed to query orders database' });
  }
});

app.get('/api/admin/carts', async (req, res) => {
  if (!isAdminAuthorized(req)) {
    return res.status(403).json({ error: 'Unauthorized: Invalid username or passcode' });
  }

  try {
    const carts = await db.all(`
      SELECT 
        c.cart_id,
        c.user_id,
        c.session_id,
        u.name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone,
        c.items_json,
        c.updated_at
      FROM carts c
      LEFT JOIN users u ON u.id = c.user_id
      WHERE c.items_json IS NOT NULL 
        AND c.items_json != '[]' 
        AND c.items_json != ''
      ORDER BY c.updated_at DESC
    `);

    const parsed = carts
      .map((c) => {
        let items = [];
        try {
          items = JSON.parse(c.items_json || '[]');
        } catch (e) {
          items = [];
        }
        const total_value = items.reduce(
          (sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 1),
          0
        );
        return {
          ...c,
          items,
          total_value,
          items_count: items.reduce((sum, it) => sum + (Number(it.qty) || 1), 0),
          raw_items_json: c.items_json,
        };
      })
      .filter((c) => c.items.length > 0);

    res.json({ carts: parsed });
  } catch (err) {
    console.error('Fetch carts table error:', err);
    res.status(500).json({ error: 'Failed to query carts database' });
  }
});

app.delete('/api/admin/carts/:cartId', async (req, res) => {
  if (!isAdminAuthorized(req)) {
    return res.status(403).json({ error: 'Unauthorized: Invalid username or passcode' });
  }

  try {
    await db.run('DELETE FROM carts WHERE cart_id = ?', [req.params.cartId]);
    res.json({ success: true, message: `Cart ${req.params.cartId} deleted` });
  } catch (err) {
    console.error('Delete cart error:', err);
    res.status(500).json({ error: 'Failed to delete cart' });
  }
});

app.put('/api/admin/orders/:id/status', async (req, res) => {
  if (!isAdminAuthorized(req)) {
    return res.status(403).json({ error: 'Unauthorized: Invalid username or passcode' });
  }

  try {
    const { status } = req.body;
    const { id } = req.params;

    await db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: `Order #${id} status updated to ${status}` });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

app.delete('/api/admin/orders/:id', async (req, res) => {
  if (!isAdminAuthorized(req)) {
    return res.status(403).json({ error: 'Unauthorized: Invalid username or passcode' });
  }

  try {
    await db.run('DELETE FROM orders WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: `Order #${req.params.id} deleted` });
  } catch (err) {
    console.error('Delete order error:', err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

app.delete('/api/admin/users/:id', async (req, res) => {
  if (!isAdminAuthorized(req)) {
    return res.status(403).json({ error: 'Unauthorized: Invalid username or passcode' });
  }

  try {
    await db.run('DELETE FROM carts WHERE user_id = ?', [req.params.id]);
    await db.run('DELETE FROM orders WHERE user_id = ?', [req.params.id]);
    await db.run('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: `User #${req.params.id} and linked records deleted` });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// 6. HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'LOOSR API',
    database: db.isPostgres ? 'PostgreSQL' : 'SQLite',
    timestamp: new Date().toISOString(),
  });
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
