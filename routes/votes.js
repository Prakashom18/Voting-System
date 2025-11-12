const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const Voter = require('../models/Voter');

// Middleware: check if voter is logged in
function ensureVoter(req, res, next) {
  if (!req.session.voterId) {
    return res.redirect('/voter/login');
  }
  next();
}

// Show list of candidates
router.get('/candidates', ensureVoter, async (req, res) => {
  const voter = await Voter.findById(req.session.voterId);
  const candidates = await Candidate.find();
  res.render('candidate', { candidates, hasVoted: voter.hasVoted });
});

// Handle voting
router.post('/vote/:id', ensureVoter, async (req, res) => {
  const voter = await Voter.findById(req.session.voterId);
  if (voter.hasVoted) {
    return res.send('<h2 style="color:red;">❌ You have already voted!</h2><a href="/voter/dashboard">Go to Dashboard</a>');
  }

  // Increase vote count
  await Candidate.findByIdAndUpdate(req.params.id, { $inc: { votes: 1 } });

  // Update voter to mark that they have voted
  await Voter.findByIdAndUpdate(voter._id, { hasVoted: true });

  // Redirect to success page
  res.redirect('/vote-success');
});

// Show vote success page
router.get('/vote-success', ensureVoter, (req, res) => {
  res.render('voteSuccess');
});

module.exports = router;
