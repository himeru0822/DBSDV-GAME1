const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', UserSchema);
