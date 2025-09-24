const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  enrollmentNumber: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  hardwareId: { type: String, required: true },
  password: { type: String, required: true },
  emailToken: { type: String },
  isVerified: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);
