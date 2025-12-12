const Profile = require('../models/Profile');

exports.createProfileIfNotExists = async (userId) => {
    try {
        let profile = await Profile.findOne({ user: userId });
        if (!profile) {
            profile = new Profile({ user: userId });
            await profile.save();
        }
        return profile;
    } catch (error) {
        console.log(error);
        throw new Error('Error creating profile');
    }
}