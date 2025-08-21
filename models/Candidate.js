const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: String,
  bio: String,
  imageUrl: String,
  qualification: String,
  city: String,
  age: Number,
  votes: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Candidate', candidateSchema);
