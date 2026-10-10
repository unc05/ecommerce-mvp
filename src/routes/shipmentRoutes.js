const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');
const authMiddleware = require('../middleware/auth');

const authenticate = typeof authMiddleware === 'function' ? authMiddleware : authMiddleware.authenticateToken;

router.use(authenticate);

router.post('/update', shipmentController.updateShipmentStatus);

module.exports = router;