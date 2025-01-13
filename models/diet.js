const mongoose = require('mongoose');

const dietSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  goal:{
    type:String,
    required:true
  },
  option:{
    type:String,
    required:true
  },
  activity:{
    type:String,
    required:true
  },
  gender:{
    type:String,
    required:true
  },
  dateOfBirth:{
    type:String,
    required:true
  }
  ,
  height:{
    type:String,
    required:true
  }
  ,
  currentWeight:{
    type:String,
    required:true
  },
  goalWeight:{
    type:String,
    required:true
  }



}, { timestamps: true });

module.exports = mongoose.model('diet', dietSchema);
