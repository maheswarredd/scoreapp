const express = require('express');
const router = express.Router();
const { loginAdmin, verifyAdminToken, getMe } = require('../controllers/authController');

router.post('/login', loginAdmin);
router.get('/me', verifyAdminToken, getMe);

module.exports = router;
