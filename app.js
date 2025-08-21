const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const session = require('express-session');
// Import the routes
const indexRoutes = require('./routes/index');  // Add this line
const voterRoutes = require('./routes/voter'); // ✅ Import voter routes

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session setup
app.use(session({
  secret: 'voting-secret', // Change to a more secure string for production
  resave: false,
  saveUninitialized: false
}));

// Middleware to make session available in views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Set view engine to EJS
app.set('view engine', 'ejs');

// Use the imported routes
app.use('/', indexRoutes);  // This line makes sure that the routes are used for the root path
app.use('/voter', voterRoutes);

// Admin routes (if you have an admin route)
app.use('/admin', require('./routes/admin'));  // You should have another `admin.js` route for admin functionalities

// MongoDB connection
mongoose.connect('mongodb://localhost/voting_system', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
