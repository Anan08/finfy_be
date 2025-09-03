exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        return res.cookie('token', 'jwt');
        
    } catch (error) {
        return res.status(400).json({error : error.message})
    }
}

exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;
        

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