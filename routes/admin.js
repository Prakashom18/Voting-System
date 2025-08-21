const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');

// Middleware to protect admin routes
function isAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    next();
  } else {
    res.redirect('/admin/login');
  }
}

// Render admin login page
router.get('/login', (req, res) => {
  res.render('login');
});

// Handle admin login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'admin123') {
    req.session.isAdmin = true;
    res.redirect('/admin/dashboard');
  } else {
    res.send('Invalid credentials');
  }
});

// Admin logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.send('Error logging out');
    res.redirect('/admin/login');
  });
});

// Admin dashboard (protected)
router.get('/dashboard', isAdmin, async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.render('dashboard', { candidates });
  } catch (error) {
    res.send('Error loading dashboard');
  }
});

// Show add candidate form
router.get('/add', isAdmin, (req, res) => {
  res.render('addCandidate');
});

// Handle add candidate
// Handle add candidate
router.post('/add', isAdmin, async (req, res) => {
  const { name, bio, imageUrl, qualification, city, age } = req.body;

  await Candidate.create({
    name,
    bio,
    imageUrl,
    qualification,
    city,
    age,
    votes: 0
  });

  res.redirect('/admin/dashboard');
});


// Show edit candidate form
router.get('/edit/:id', isAdmin, async (req, res) => {
  const candidate = await Candidate.findById(req.params.id);
  res.render('editCandidate', { candidate });
});

// Handle edit candidate
router.post('/edit/:id', isAdmin, async (req, res) => {
  const { name, bio, imageUrl,  qualification, city, age } = req.body;

await Candidate.create({ name, bio, imageUrl, qualification, city, age });

  res.redirect('/admin/dashboard');
});

// Handle delete candidate
router.post('/delete/:id', isAdmin, async (req, res) => {
  await Candidate.findByIdAndDelete(req.params.id);
  res.redirect('/admin/dashboard');
});

// Reset votes (protected)
router.post('/reset-votes', isAdmin, async (req, res) => {
  try {
    await Candidate.updateMany({}, { $set: { votes: 0 } });
    res.redirect('/admin/dashboard');
  } catch (error) {
    res.send('Error resetting votes');
  }
});

module.exports = router;
