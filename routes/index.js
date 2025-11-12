const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const Voter = require('../models/Voter'); // Make sure you have this model

// Home page
router.get('/', async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.render('home', { candidates });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error fetching candidates');
  }
});

// Candidates page — show list and check if voter already voted
router.get('/candidates', async (req, res) => {
  try {
    const voterId = req.session.voterId; // assuming session is set after login
    const voter = await Voter.findById(voterId);
    const candidates = await Candidate.find();

    const hasVoted = voter && voter.hasVoted ? true : false;

    res.render('candidate', { candidates, hasVoted });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Privacy page
router.get('/privacy', (req, res) => {
  res.render('privacy');
});

// Handle voting
router.post('/vote/:id', async (req, res) => {
  try {
    const voterId = req.session.voterId;
    const candidateId = req.params.id;

    // Find the voter
    const voter = await Voter.findById(voterId);

    if (!voter) {
      return res.status(400).send('Voter not found');
    }

    // Prevent duplicate voting
    if (voter.hasVoted) {
      return res.render('voteSuccess', {
        message: 'You have already voted. Thank you for participating!',
      });
    }

    // Increment candidate votes
    await Candidate.findByIdAndUpdate(candidateId, { $inc: { votes: 1 } });

    // Mark voter as voted
    voter.hasVoted = true;
    await voter.save();

    // Render success page
    res.render('voteSuccess', { message: '✅ Vote submitted successfully!' });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error casting vote');
  }
});

module.exports = router;
