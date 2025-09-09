const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.authenticate = (req, res, next) => {
    try {

        if (!req.cookies || !req.cookies.token) {
            return res.status(401).json({message: 'Unauthorized'});
        }

        const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({message: 'Unauthorized'});
    }
}