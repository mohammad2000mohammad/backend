const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const formRouter = require('./routes/feed');
const cors = require('cors');
dotenv.config();
const app = express();

app.use(cors({
  origin: 'https://mohammads-dynamite-site-85779b.webflow.io', // Replace with your Webflow domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Include all HTTP methods you need
  allowedHeaders: ['Content-Type', 'Authorization'], // Add Authorization to allowed headers
}));

// Handle preflight requests (important for Authorization headers)
app.options('*', cors({
  origin: 'https://mohammads-dynamite-site-85779b.webflow.io',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

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

