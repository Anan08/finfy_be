const Goal = require('../models/Goal');

exports.createGoal = async (req, res) => {
    try {
        const { title, targetAmount, currentAmount } = req.body;
        const userId = req.user.id;
        const newGoal = new Goal({ userId, title, targetAmount, currentAmount });
        await newGoal.save();
        res.status(201).json({ message: 'Goal created successfully', goal: newGoal });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

exports.getGoals = async (req, res) => {
    try {
        const userId = req.user.id;
        const goals = await Goal.find({ userId });
        res.status(200).json({message : 'Goals fetched successfully', goals });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

exports.updateGoal = async (req, res) => {
    try {
        const { title, targetAmount, currentAmount } = req.body;
        const goalId = req.params.goalId;
        const goal = await Goal.findById(goalId);
        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }
        if (goal.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        if (title !== undefined) goal.title = title;
        if (targetAmount !== undefined) goal.targetAmount = targetAmount;
        if (currentAmount !== undefined) goal.currentAmount = currentAmount;
        
        const updatedGoal = await goal.save();
        res.status(200).json({message : 'Goal updated successfully', goal: updatedGoal});
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

exports.deleteGoal = async (req, res) => {
    try {
        const userId = req.user.id;
        const goalId = req.params.goalId;
        const deletedGoal = await Goal.deleteOne({ _id: goalId, userId: userId });
        if (deletedGoal.deletedCount === 0) {
            return res.status(404).json({ message: 'Goal not found or unauthorized' });
        }
        res.status(200).json({ message: 'Goal deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};