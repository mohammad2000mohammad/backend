const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true, // Ensures that each order is associated with a user
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  streetAddress: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  items: {
    type: String,
    required: true,
  },
  totalPrice: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },


}, { timestamps: true });

module.exports = mongoose.model('order', formSchema);
