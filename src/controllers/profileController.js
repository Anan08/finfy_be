const Profile = require('../models/Profile');

exports.getProfileByUserId = async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await Profile.findOne({ user: userId });
        return profile;
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: error.message });
    }
}

exports.updateProfile = async (req, res) => {
    try {
        const { bio, job, age, goals } = req.body;
        const userId = req.user.id;
        let profile = await Profile.findOne({ user: userId });
        if (!profile) {
            profile = new Profile({ user: userId, bio, job, age, goals });
        } else {
            profile.bio = bio || profile.bio;
            profile.job = job || profile.job;
            profile.age = age !== undefined ? age : profile.age;
            profile.goals = goals || profile.goals;
        }
        await profile.save();
        return res.status(200).json({ profile: profile });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: error.message });
    }
}