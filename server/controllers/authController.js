const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    const allowedRoles = ['Buyer', 'Seller', 'Broker'];
    const selectedRole = role || 'Buyer';

    if (!allowedRoles.includes(selectedRole)) {
      return res.status(400).json({
        message: 'Invalid user role'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters'
      });
    }

    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE email = ? OR phone = ?',
      [email, phone]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: 'Email or phone already registered'
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await db.execute(
      `INSERT INTO users
       (name, email, phone, password_hash, role)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone, passwordHash, selectedRole]
    );

    return res.status(201).json({
      message: 'Registration successful',
      user: {
        id: result.insertId,
        name,
        email,
        phone,
        role: selectedRole
      }
    });

  } catch (error) {
    console.error('Registration error:', error.message);

    return res.status(500).json({
      message: 'Registration failed'
    });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error.message);

    return res.status(500).json({
      message: 'Login failed'
    });
  }
};
// Get Logged-in User Profile
const getProfile = async (req, res) => {
  try {
    const [users] = await db.execute(
      `SELECT id, name, email, phone, role, created_at
       FROM users
       WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    return res.status(200).json({
      message: 'Profile fetched successfully',
      user: users[0]
    });

  } catch (error) {
    console.error('Profile error:', error.message);

    return res.status(500).json({
      message: 'Unable to fetch profile'
    });
  }
};
module.exports = { register, login, getProfile };

