const User = require('../models/user');
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpiry,
      isVerified: false
    });

    await newUser.save();

    // Send email
    await sendEmail(email, 'OrgNice OTP Verification', `Your OTP is: ${otp}`);

    res.status(200).json({ message: 'Signup successful. OTP sent to your email.' });

  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Create JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(200).json({
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error('OTP verification error:', err.message);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const user = await User.findOne({ email });
      if (!user)
        return res.status(400).json({ message: 'User not found' });
  
      if (!user.isVerified)
        return res.status(403).json({ message: 'Please verify your email first' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(401).json({ message: 'Invalid password' });
  
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
      });
  
      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
  
    } catch (err) {
      console.error('Login error:', err.message);
      res.status(500).json({ message: 'Server error during login' });
    }
  };

  exports.forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();
  
      await sendEmail(email, 'OrgNice Password Reset OTP', `Your OTP for resetting password is: ${otp}`);
  
      res.status(200).json({ message: 'OTP sent to your email for password reset' });
  
    } catch (err) {
      console.error('Forgot password error:', err.message);
      res.status(500).json({ message: 'Server error during forgot password' });
    }
  };

  exports.resetPassword = async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;
  
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      if (user.otp !== otp || user.otpExpiry < Date.now()) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.otp = undefined;
      user.otpExpiry = undefined;
  
      await user.save();
  
      res.status(200).json({ message: 'Password reset successful' });
  
    } catch (err) {
      console.error('Reset password error:', err.message);
      res.status(500).json({ message: 'Server error during reset password' });
    }
  };
  
  

