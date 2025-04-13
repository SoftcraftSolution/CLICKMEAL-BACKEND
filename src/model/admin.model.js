
const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  email: String,
  password: String,
  hasResetPassword: { type: Boolean, default: false },
  isLoggedIn: { type: Boolean, default: false },
  otp: {
    type: String,
}
// updated vercel
}, { timestamps: true });






// Create the model from the schema
const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;
