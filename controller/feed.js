const Form = require('../models/orders');
const form2=require('../models/diet');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Secret key for JWT (use environment variables in production)
const SECRET_KEY = 'your_secret_key';




const verificationCodes = new Map(); // Temporary in-memory store for codes







// Signup endpoint
exports.signup = async (req, res) => {
  const { name, email, password, role = 'user' } = req.body; // Default role is 'user'

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists.' });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // Generate a verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();

    // Store the verification code temporarily
    verificationCodes.set(email, { name, email, password, role, code: verificationCode });

    // Send the verification code to the user's email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'mohammadkaraki.220@gmail.com', // Your email
        pass: 'antw qznp gbzl bmlu', // Your app-specific password
      },
    });

    const mailOptions = {
      from: 'mohammadkaraki.220@gmail.com', // Your email
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is ${verificationCode}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Verification code sent to email.' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
};

// Verify code endpoint
exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: 'Email and code are required.' });
  }

  const userData = verificationCodes.get(email);
  if (!userData || userData.code !== code) {
    return res.status(400).json({ message: 'Invalid or expired verification code.' });
  }

  try {
    // Hash password before saving
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create new user with role
    const newUser = new User({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role,
    });
    await newUser.save();

    // Remove the verification code from temporary storage
    verificationCodes.delete(email);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.status(201).json({ message: 'User registered successfully!', token });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
};



// Login Controller
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // Check if the email exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Compare password with stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT token, including the user's role in the payload
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: '7d' } // Token expires in 7 days
    );

    // Send user details and token in the response
    res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // Include role for the frontend
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
};

// Handle form submission
exports.checkout = async (req, res) => {
  try {
    // Get userId from the authenticated user in req.user
    const { name, email, streetAddress, phoneNumber, items, totalPrice } = req.body;
    const userId = req.user.id;  // Get userId from the token (which was set in the middleware)

    // Validate input
    if (!userId || !name || !email || !streetAddress || !phoneNumber || !items || !totalPrice) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const status = "Pending";

    // Create a new order entry
    const newOrder = new Form({
      userId,
      name,
      email,
      streetAddress,
      phoneNumber,
      items,
      totalPrice,
      status,
    });

    await newOrder.save();

    res.status(201).json({ message: 'Order placed successfully', data: newOrder });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.diet = async (req, res) => {
    try {
      const { name, email, phone, goal,option,activity,gender,dateOfBirth,height,currentWeight,goalWeight } = req.body;
  
      // Validate input
      if (!name || !email || !phone || !goal || !option || !activity || !gender|| !dateOfBirth|| !height|| !currentWeight|| !goalWeight ) {
        return res.status(400).json({ error: 'All fields are required' });
      }
      
  
      // Create a new form entry
      const newForm = new form2({ name, email, phone,goal, option, activity, gender, dateOfBirth, height, currentWeight, goalWeight});
      await newForm.save();
  
      res.status(201).json({ message: 'Form submitted successfully', data: newForm });
    } catch (error) {
      console.error('Error saving form:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };

  exports.orders = async (req, res) => {

    const userEmail = req.user.email;
    
    try {
       
      const orders=await Form.find({email:userEmail})
      
      res.status(201).json( orders );
    } catch (error) {
      console.error('Error saving form:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };


exports.countOrders = async (req, res) => {
  try {
    // Count all the orders in the database
    const orderCount = await Form.countDocuments(); // You can add filters like { status: 'pending' } if needed
    const orders = await Form.find({});

    // Extract revenue from orders
    let totalRevenue = 0;
    orders.forEach(order => {
      // Assuming each order has a "totalPrice" field which is a number or string
      const orderRevenue = order.totalPrice;

      // If it's a string, remove any non-numeric characters
      const numericRevenue = parseFloat(orderRevenue.toString().replace(/[^\d.-]/g, ''));

      // Add to the total revenue
      totalRevenue += numericRevenue;

    });
    const Users = await User.countDocuments({});

    res.status(200).json({ count: orderCount ,
      revenue: totalRevenue,
      users:Users
    });
  } catch (error) {
    console.error('Error counting orders:', error);
    res.status(500).json({ error: 'Server error' });
  }
};




// Get all orders for the admin
exports.getOrders = async (req, res) => {
  try {
    const orders = await Form.find(); // Fetch all orders
    res.status(200).json(orders); // Return the orders
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get details for a single order
exports.getOrderById = async (req, res) => {
  const { orderId } = req.params; // Get the order ID from the URL params
  try {
    const order = await Form.findById(orderId); // Fetch the order by ID
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json(order); // Return the order details
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


// Update order status
exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params; // Get the order ID from the URL
  const { status } = req.body; // Get the new status from the request body

  try {
    // Update the status of the order
    const updatedOrder = await Form.findByIdAndUpdate(
      orderId,
      { status },
      { new: true } // Return the updated order
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json(updatedOrder); // Return the updated order
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.getOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Form.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Form.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const paginateOrders = (page, limit) => {
  const skip = (page - 1) * limit;
  return { skip, limit };
};

exports.pagination = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const { skip, limit: pageLimit } = paginateOrders(page, limit);

    // Fetch the orders with pagination
    const orders = await Form.find()
      .skip(skip)
      .limit(parseInt(pageLimit))
      .exec();

    // Get the total number of orders
    const totalOrders = await Form.countDocuments();

    res.json({
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
};

// Function to handle search queries
// Function to handle search queries
// Function to handle search queries
// In your backend (ordersSearch function)
// In your backend (ordersSearch function)
const searchOrders = (searchTerm, statusFilter, dateFilter) => {
  let searchQuery = { $or: [] };

  // Search for name using regex if searchTerm is provided
  if (searchTerm) {
    searchQuery.$or.push({ name: { $regex: searchTerm, $options: "i" } });
  }

  // Filter by status if statusFilter is provided
  if (statusFilter) {
    searchQuery.status = statusFilter;
  }

  // Filter by date if dateFilter is provided
  if (dateFilter) {
    let startDate;
    switch (dateFilter) {
      case "thisWeek":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "thisMonth":
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "thisYear":
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date(0); // Default to the Unix epoch if no valid date filter is provided
    }
    searchQuery.createdAt = { $gte: startDate };
  }

  return searchQuery;
};

exports.ordersSearch = async (req, res) => {
  const { searchTerm = "", page = 1, limit = 10, statusFilter = "", dateFilter = "" } = req.query;

  // Validate pagination parameters
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  if (isNaN(pageNumber) || pageNumber < 1) {
    return res.status(400).json({ error: "Invalid page number." });
  }

  if (isNaN(limitNumber) || limitNumber < 1) {
    return res.status(400).json({ error: "Invalid limit number." });
  }

  try {
    // Generate the query object with all provided filters
    const query = searchOrders(searchTerm, statusFilter, dateFilter);

    // Fetch the orders based on the query, with pagination
    const orders = await Form.find(query)
      .skip((pageNumber - 1) * limitNumber) // Skip results for pagination
      .limit(limitNumber); // Limit results per page

    // Get the total number of orders that match the query for pagination purposes
    const totalOrders = await Form.countDocuments(query);

    // Calculate total pages
    const totalPages = Math.ceil(totalOrders / limitNumber);

    res.json({
      orders,
      totalOrders,
      totalPages,
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error("Error searching orders:", error);
    res.status(500).json({ error: "Error searching orders" });
  }
};


exports.usersSearch = async (req, res) => {
  const { searchTerm = "", page = 1, limit = 10 } = req.query;

  // Validate pagination parameters
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  if (isNaN(pageNumber) || pageNumber < 1) {
    return res.status(400).json({ error: "Invalid page number." });
  }

  if (isNaN(limitNumber) || limitNumber < 1) {
    return res.status(400).json({ error: "Invalid limit number." });
  }

  try {
    // Create search query based on the searchTerm
    const searchQuery = {
      $or: [
        { name: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search by name
        { email: { $regex: searchTerm, $options: "i" } }  // Case-insensitive search by email
      ],
    };

    // Fetch the users that match the search term with pagination
    const users = await User.find(searchQuery)
      .skip((pageNumber - 1) * limitNumber)  // Skip results for pagination
      .limit(limitNumber);  // Limit results per page

    // Get the total number of users that match the search term (for pagination purposes)
    const totalUsers = await User.countDocuments(searchQuery);

    // Calculate total pages
    const totalPages = Math.ceil(totalUsers / limitNumber);

    res.json({
      users,
      totalUsers,
      totalPages,
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Error searching users" });
  }
};

exports.getUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({ error: "Error retrieving user" });
  }
};


exports.deleteUser = async (req, res) => {
  const { userId } = req.params;
  console.log(userId)
  try {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" }); 
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Error deleting user" });
  }
};




exports.getOrdersByUser = async (req, res) => {
  const { userId } = req.params;
  console.log(userId)

  try {
    // Find all orders associated with the user
    const orders = await Form.find({ 'userId': userId });

    // Calculate total paid by the user
    const totalPaid = orders.reduce((total, order) => {
      const numericPrice = parseFloat(
        order.totalPrice
          .replace(/\$\s*/, '') // Remove the dollar sign and extra space
          .replace(/,/, '')     // Remove the comma for thousands
          .replace(/\sUSD$/, '') // Remove the trailing "USD"
      );
    
      return total + (isNaN(numericPrice) ? 0 : numericPrice); // Add to total if numeric
    }, 0);
    
    // Format the total with two decimal places and append the currency symbol
   // const formattedTotal = `${totalPaid.toFixed(2)} $`;

    res.json({ orders, totalPaid });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Failed to fetch user orders" });
  }
};

