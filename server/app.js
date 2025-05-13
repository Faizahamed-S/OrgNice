require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const sendEmail = require('./utils/sendEmail');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.log('❌ MongoDB error:', err));

app.get('/ping', (req, res) => {
  res.send('pong 🏓');
});

app.get('/test-email', async (req, res) => {
  try {
    await sendEmail('your@email.com', 'Test Email from OrgNice', 'Hello from the backend!');
    res.send('Email sent!');
  } catch (err) {
    res.status(500).send('Email failed');
  }
});

app.use('/api/auth', authRoutes);



const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
