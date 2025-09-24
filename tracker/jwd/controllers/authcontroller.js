const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const sendLoginEmail = require('../utils/mailer');

const SECRET_KEY = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  const { enrollmentNumber, email, password, hardwareId } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const emailToken = uuidv4();

    await prisma.user.create({
      data: { enrollmentNumber, email, password: hashedPassword, hardwareId, emailToken }
    });

    await sendLoginEmail(email, emailToken);
    res.json({ message: 'Registration successful. Check your email to login.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  const hwid = req.headers['hardware-id'];

  try {
    const user = await prisma.user.findFirst({ where: { emailToken: token } });
    if (!user) return res.status(400).json({ message: 'Invalid token' });

    if (user.hardwareId !== hwid) return res.status(403).json({ message: 'Device not recognized' });

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, emailToken: null }
    });

    const jwtToken = jwt.sign({ enrollmentNumber: user.enrollmentNumber }, SECRET_KEY, { expiresIn: '2h' });
    res.json({ message: 'Login successful', token: jwtToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
