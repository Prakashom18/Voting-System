const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');

// Show the home page and pass candidates to the view
router.get('/', async (req, res) => {
  try {
    const candidates = await Candidate.find(); // Fetch all candidates from the database
    res.render('home', { candidates }); // Pass candidates to the home.ejs view
  } catch (error) {
    console.log(error);
    res.status(500).send('Error fetching candidates');
  }
});

// Show all candidates for voting
router.get('/candidates', async (req, res) => {
  try {
    const candidates = await Candidate.find(); // Fetch all candidates from the database
    res.render('candidate', { candidates }); // Pass candidates to the candidate.ejs view
  } catch (error) {
    console.log(error);
    res.status(500).send('Error fetching candidates');
  }
});

  // GET /privacy
  router.get('/privacy', (req, res) => {
    res.render('privacy');
  });

// Handle voting for a candidate
router.post('/vote/:id', async (req, res) => {
  try {
    const candidateId = req.params.id;

    // Increment the vote count for the selected candidate
    await Candidate.findByIdAndUpdate(candidateId, { $inc: { votes: 1 } });

    // Redirect back to the candidates list
    res.redirect('/candidates');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error casting vote');
  }
});

module.exports = router;
