const Voter = require('../models/Voter');

router.get('/candidates', async (req, res) => {
  if (!req.session.voterId) return res.redirect('/voter/login');
  const candidates = await Candidate.find();
  res.render('candidate', { 
    candidates,
    message: req.query.message || null  // Pass message to view
  });
});

router.post('/vote/:id', async (req, res) => {
  if (!req.session.voterId) return res.redirect('/voter/login');

  const voter = await Voter.findById(req.session.voterId);
  if (voter.hasVoted) return res.send('❗ You have already voted.');

  await Candidate.findByIdAndUpdate(req.params.id, { $inc: { votes: 1 } });
  await Voter.findByIdAndUpdate(voter._id, { hasVoted: true });

  res.redirect('/candidates?message=Voted successfully!');

});
