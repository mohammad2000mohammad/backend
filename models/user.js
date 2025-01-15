const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Enforce uniqueness of email
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // Define allowed roles
    default: 'user', // Default to 'user' if not specified
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
