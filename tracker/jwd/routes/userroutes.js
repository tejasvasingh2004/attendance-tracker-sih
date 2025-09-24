const express = require('express');
const router = express.Router();
const { dashboard } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/dashboard', authenticateToken, dashboard);

module.exports = router;
