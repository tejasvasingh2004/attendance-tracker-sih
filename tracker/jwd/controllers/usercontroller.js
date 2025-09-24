exports.dashboard = (req, res) => {
  res.json({ message: `Welcome ${req.user.enrollmentNumber} to your dashboard!` });
};
