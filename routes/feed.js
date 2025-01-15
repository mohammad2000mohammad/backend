const express = require('express');
const router = express.Router();
const formController = require('../controller/feed');
const { authenticate,adminOnly } = require('../middleware/authMiddleware');


// POST request to handle form submissions
router.post('/signup', formController.signup);
router.post('/verifyCode', formController.verifyCode);

// Login route
router.post('/login', formController.login);

router.post('/checkout', authenticate,formController.checkout);
router.post('/diet', authenticate,formController.diet);

//router.get('/orders', authenticate,formController.orders);

router.get('/orders/count',authenticate,adminOnly,formController.countOrders);

// Route to get all orders
router.get('/orders',authenticate, formController.getOrders);



// Route to update order status
router.put('/orders/:orderId/status', authenticate,adminOnly,formController.updateOrderStatus);



router.delete('/orders/:orderId', authenticate,adminOnly,formController.deleteOrderId);

router.get("/orders/search",authenticate,adminOnly,formController.ordersSearch);

router.get('/orders/user/:userId', authenticate,adminOnly,formController.getOrdersByUser);

router.get("/orders/paginated",authenticate,adminOnly,formController.pagination);

router.get("/users/search",authenticate,adminOnly,formController.usersSearch);

router.get('/users/:userId', authenticate,adminOnly,formController.getUserId);



router.delete('/users/:userId',authenticate,adminOnly, formController.deleteUser);



// Route to get a specific order by ID
router.get('/orders/:orderId',authenticate,adminOnly, formController.getOrderById);

router.get('/orders/:orderId', authenticate,adminOnly,formController.getOrderId);

module.exports = router;
