const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const safeEqual = (a, b) => {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
};

const loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  const envUser = process.env.ADMIN_USERNAME || 'admin';
  const envPass = process.env.ADMIN_PASSWORD || 'admin123';

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  // Optional: set ADMIN_PASSWORD_HASH (bcrypt) instead of a plain ADMIN_PASSWORD
  const envHash = process.env.ADMIN_PASSWORD_HASH;
  const passwordOk = envHash
    ? bcrypt.compareSync(String(password), envHash)
    : safeEqual(password, envPass);

  if (safeEqual(username, envUser) && passwordOk) {
    const token = jwt.sign(
      { username, role: 'admin' },
      process.env.JWT_SECRET || 'crex_super_secret_jwt_key_2026',
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      admin: {
        username,
        role: 'admin'
      }
    });
  }

  return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
};

const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'crex_super_secret_jwt_key_2026');
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired token' });
  }
};

const getMe = (req, res) => {
  return res.json({
    success: true,
    admin: req.admin
  });
};

module.exports = {
  loginAdmin,
  verifyAdminToken,
  getMe
};
