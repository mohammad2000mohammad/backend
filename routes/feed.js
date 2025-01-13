const express = require('express');
const router = express.Router();
const formController = require('../controller/feed');
const { authenticate } = require('../middleware/authMiddleware');

// POST request to handle form submissions
router.post('/signup', formController.signup);
router.post('/verifyCode', formController.verifyCode);

// Login route
router.post('/login', formController.login);

router.post('/checkout', authenticate,formController.checkout);
router.post('/diet', authenticate,formController.diet);

router.get('/orders', authenticate,formController.orders);

module.exports = router;
