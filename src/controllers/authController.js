const User = require('../models/User'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createProfileIfNotExists } = require('../lib/profile');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../lib/mailer');

exports.login = async (req, res) => {

    if (!req.body.username || !req.body.password) {
        return res.status(400).json({message: 'Please provide username and password'});
    }

    try {
        const { username, password } = req.body;
        const user = await User.findOne({username : username});
        
        if (!user) return res.status(400).json({message: 'Invalid credentials'});
        if (!user.isVerified) return res.status(403).json({message: 'Email not verified. Please verify your email before logging in.'});
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) return res.status(400).json({message: 'Invalid credentials'});
        await createProfileIfNotExists(user._id);
        const token = jwt.sign({id : user._id}, process.env.JWT_SECRET, {expiresIn : '7d'});

        return res.status(200).json({message: 'Login successful', token : token});
    
    } catch (error) {
        return res.status(400).json({error : error.message})
    }
}

exports.register = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ message: 'Please provide email, username and password' });
    }

    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });

    const isEmailUsed = await User.findOne({ email });
    if (isEmailUsed) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const isUsernameUsed = await User.findOne({ username });
    if (isUsernameUsed) {
      return res.status(400).json({ message: 'Username already in use' });
    }

    const user = new User({
      username,
      email,
      password: await bcrypt.hash(password, 10),
      isVerified: false,
      emailVerificationToken: crypto.randomBytes(32).toString('hex'),
      verificationTokenExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    await user.save();
    await sendVerificationEmail(user.email, user.emailVerificationToken);
    return res.status(201).json({ message: 'User registered. Please verify your email to activate your account.' });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};


exports.me = async (req, res) => {
    try {
        const id = req.user.id;
        const user = await User.findById(id).select('-password');
        if (!user) return res.status(404).json({message : 'User not found'});

        return res.status(200).json({user});

    } catch (error) {
        console.log(error);
        return res.status(400).json({error : error.message})
    }
}

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: 'All password fields are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: 'Password confirmation does not match',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Current password is incorrect',
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Failed to change password',
    });
  }
};

// exports.verifyEmail = async (req, res) => {
//   try {
//     const { token } = req.query;

//     const user = await User.findOne ({ emailVerificationToken: token, verificationTokenExpiry: { $gt: Date.now() } });
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid or expired token' });
//     }
//     user.isVerified = true;
//     user.emailVerificationToken = null;
//     user.verificationTokenExpiry = null;
//     await user.save();
//     return res.status(200).json({ message: 'Email verified successfully' });
//   } catch (error) {
//     console.log(error);
//     return res.status(400).json({error : error.message} )
//   }
// }

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({
      emailVerificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).send(`
        <html>
          <head>
            <title>Email Verification Failed</title>
            <style>
              body { font-family: sans-serif; text-align: center; padding: 50px; }
              .error { color: red; }
            </style>
          </head>
          <body>
            <h1 class="error">Verification Failed</h1>
            <p>Token tidak valid atau sudah kedaluwarsa.</p>
          </body>
        </html>
      `);
    }

    user.isVerified = true;
    user.emailVerificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    return res.send(`
      <html>
        <head>
          <title>Email Activated</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 50px; }
            .success { color: green; }
            a { display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1 class="success">Email Berhasil Diverifikasi</h1>
          <p>Akun kamu sudah aktif. Silakan login.</p>
        </body>
      </html>
    `);
  } catch (error) {
    return res.status(500).send('Something went wrong');
  }
};


// exports.isTokenActive = async (req, res) => {
//     try {
//         const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
//         if (!token) {
//             return res.status(200).json({ active: false });
//         }
//         jwt.verify(token, process.env.JWT_SECRET);
//         return res.status(200).json({ active: true });
//     } catch (error) {
//         return res.status(200).json({ active: false });
//     }
// }