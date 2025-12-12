const Profile = require('../models/Profile');
const { createProfileIfNotExists } = require('../lib/profile');
const User = require('../models/User');

exports.getProfileByUserId = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('username email');
        const profile = await createProfileIfNotExists(userId);
        return res.status(200).json({ user, profile });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: error.message });
    }
}

exports.updateProfile = async (req, res) => {
    try {
        const { job, age, goals, fullName } = req.body;
        const userId = req.user.id;
        let profile = await Profile.findOne({ user: userId });
        if (!profile) {
            profile = new Profile({ user: userId, job, age, goals, fullName });
        } else {
            if (job !== undefined) profile.job = job;
            if (age !== undefined) profile.age = age;
            if (fullName !== undefined) profile.fullName = fullName;
            if (goals !== undefined) {
                if (!Array.isArray(goals)) {
                    return res.status(400).json({ error: 'Goals must be an array of strings' });
                }
                profile.goals = goals;
            };
        }
        await profile.save();
        return res.status(200).json({ profile: profile });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: error.message });
    }
}

exports.deleteGoal = async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const userId = req.user.id;
        
        const profile = await Profile.findOne({ user: userId });
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        if (index < 0 || index >= profile.goals.length) {
            return res.status(400).json({ error: 'Invalid goal index' });
        }

        profile.goals.splice(index, 1);
        await profile.save();

        return res.status(200).json({ profile });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: error.message });
    }
}