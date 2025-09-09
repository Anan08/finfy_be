const User = require('../models/User'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {

    if (req.cookies && req.cookies.token) {
        return res.status(400).json({message: 'Already logged in'});
    }

    if (!req.body.username || !req.body.password) {
        return res.status(400).json({message: 'Please provide username and password'});
    }


    try {
        const { username, password } = req.body;
        const user = await User.findOne({username : username});
        
        if (!user) return res.status(400).json({message: 'Invalid credentials'});
        
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) return res.status(400).json({message: 'Invalid credentials'});
        
        const token = jwt.sign({id : user._id}, process.env.JWT_SECRET, {expiresIn : '1d'});
        
        res.cookie('token', token, {
            maxAge : 24 * 60 * 60 * 1000
        })
        return res.status(200).json({message: 'Login successful', user : {username: user.username, email: user.email}});
    
    } catch (error) {
        return res.status(400).json({error : error.message})
    }
}

exports.register = async (req, res) => {

    if (req.cookies && req.cookies.token) {
        return res.status(400).json({message: 'Already logged in'});
    }

    try {
        const { email, username, password } = req.body;

        const isEmailUsed = await User.findOne({ email: email });

        if (isEmailUsed) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const isUsernameUsed = await User.findOne({ username: username });

        if (isUsernameUsed) {
            return res.status(400).json({ message: 'Username already in use' });
        }

        const user = new User({
            username : username,
            email : email,
            password : await bcrypt.hash(password, 10)
        })

        await user.save();
        return res.status(201).json({message: 'User registered successfully'});

    } catch (error) {
        return res.status(400).json({error : error.message})
    }
}

exports.logout = async (req, res) => {
    
    if (!req.cookies.token) {
        return res.status(400).json({message: 'No active session found'});
    }
    
    try {
        return res.clearCookie('token').json({message: 'Logged out successfully'});
    } catch (error) {
        return res.status(400).json({error : error.message})
    }
}

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