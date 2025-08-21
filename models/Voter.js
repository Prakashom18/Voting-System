const mongoose = require('mongoose');

const voterSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  hasVoted: {
    type: Boolean,
    default: false
},
  registeredAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Voter', voterSchema);
