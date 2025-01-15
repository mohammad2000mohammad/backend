const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const formRouter = require('./routes/feed');
const cors = require('cors');
dotenv.config();
const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from your development and production domains
    if (!origin || ['http://localhost:3000', 'https://mohammads-dynamite-site-85779b.webflow.io'].includes(origin)) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error('CORS not allowed')); // Block the request
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow these methods
  allowedHeaders: ['Content-Type', 'Authorization'],   // Allow these headers
};

// Apply CORS middleware to your app
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));



// Middleware
app.use(bodyParser.json());

// Connect to MongoDB

// Connect to MongoDB (without deprecated options)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api', formRouter);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

