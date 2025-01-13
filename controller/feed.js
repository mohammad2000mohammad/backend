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

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists.' });
    }

    // Generate a verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();

    // Store the verification code temporarily
    verificationCodes.set(email, { name, email, password, code: verificationCode });

    // Send the verification code to the user's email
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // Use your preferred email service
      auth: {
        user: 'mohammadkaraki.220@gmail.com',
        pass: 'antw qznp gbzl bmlu',
      },
    });

    const mailOptions = {
      from: 'mohammadkaraki.220@gmail.com', 
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

// Verify the code and complete signup
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

    // Create new user
    const newUser = new User({ name: userData.name, email: userData.email, password: hashedPassword });
    await newUser.save();

    // Remove the verification code from temporary storage
    verificationCodes.delete(email);

    res.status(201).json({ message: 'User registered successfully!' });
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

    // Generate JWT token
    const token = jwt.sign({id:user._id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful!', token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
};




// Handle form submission
exports.checkout = async (req, res) => {
  try {
    const { name, email, streetAddress, phoneNumber,items,totalPrice, } = req.body;

    // Validate input
    if (!name || !email || !streetAddress || !phoneNumber || !items || !totalPrice) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const status="pending";

    // Create a new form entry
    const newForm = new Form({ name, email, streetAddress,phoneNumber ,items, totalPrice ,status});
    await newForm.save();

    res.status(201).json({ message: 'Form submitted successfully', data: newForm });
  } catch (error) {
    console.error('Error saving form:', error);
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
  
