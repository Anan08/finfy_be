const User = require('../models/User'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createProfileIfNotExists } = require('../lib/profile');

exports.login = async (req, res) => {

    if (!req.body.username || !req.body.password) {
        return res.status(400).json({message: 'Please provide username and password'});
    }


    try {
        const { username, password } = req.body;
        const user = await User.findOne({username : username});
        
        if (!user) return res.status(400).json({message: 'Invalid credentials'});
        
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
    });

    await user.save();

    await createProfileIfNotExists(user._id);

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// exports.logout = async (req, res) => {
//     try {
//         return res.clearCookie('token').json({message: 'Logged out successfully'});
//     } catch (error) {
//         return res.status(400).json({error : error.message})
//     }
// }

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
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({message : 'User not found'});
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({message : 'Current password is incorrect'});
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        return res.status(200).json({message : 'Password changed successfully'});
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({error : error.message})
    }
}

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