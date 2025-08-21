const express = require('express');
const router = express.Router();
const Voter = require('../models/Voter');
const bcrypt = require('bcrypt');

// Show registration form
router.get('/register', (req, res) => {
  res.render('voterRegister');
});

// Show all registered voters
router.get('/list', async (req, res) => {
  try {
    const voters = await Voter.find().sort({ registeredAt: -1 });
    res.render('voterList', { voters });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error fetching voters');
  }
});

// Handle voter registration
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Check if the email already exists
  const existingVoter = await Voter.findOne({ email });
  if (existingVoter) {
    return res.send('Email already in use.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await Voter.create({
    name,
    email,
    password: hashedPassword,
    registeredAt: new Date()
  });

  res.redirect('/voter/login');
});

// Show login form
router.get('/login', (req, res) => {
  res.render('voterLogin');
});

// Handle login and redirect to dashboard
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const voter = await Voter.findOne({ email });

  if (!voter) return res.send('No voter found');
  const valid = await bcrypt.compare(password, voter.password);

  if (!valid) return res.send('Invalid password');

  req.session.voterId = voter._id;
  res.redirect('/voter/dashboard');
});

// Show voter dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const voterId = req.session.voterId; // Voter must be logged in

    if (!voterId) {
      return res.status(401).send('Unauthorized: Please log in to access the dashboard.');
    }

    const voter = await Voter.findById(voterId);

    if (!voter) {
      return res.status(404).send('Voter not found.');
    }

    // Pass the status parameter (if exists) to the view
    const status = req.query.status || null;

    // Render the voter dashboard and pass the status to the view
    res.render('voterDashboard', { voter, status });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error fetching voter data');
  }
});

// Show Edit Profile Form
router.get('/edit', async (req, res) => {
  if (!req.session.voterId) return res.redirect('/voter/login');

  const voter = await Voter.findById(req.session.voterId);
  if (!voter) return res.redirect('/voter/login');

  res.render('voterEdit', { voter });
});

// Handle Edit Profile Submission
router.post('/edit', async (req, res) => {
  const { name, email, password } = req.body;
  const updatedData = { name, email };

  if (password && password.trim() !== '') {
    updatedData.password = await bcrypt.hash(password, 10);
  }

  await Voter.findByIdAndUpdate(req.session.voterId, updatedData);
  res.redirect('/voter/dashboard');
});


// Handle logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
