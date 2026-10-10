const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

// Lấy hàm middleware bất kể export dạng function hay object
const authenticate = typeof authMiddleware === 'function' ? authMiddleware : authMiddleware.authenticateToken;

router.use(authenticate);

router.post('/', orderController.createOrder);
router.get('/', orderController.getUserOrders);

module.exports = router;