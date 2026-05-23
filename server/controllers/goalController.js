const Goal = require('../models/Goal');

async function getGoals(req, res) {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
    const completedCount = goals.filter((goal) => goal.completed).length;
    const completionPercent = goals.length ? Math.round((completedCount / goals.length) * 100) : 0;

    res.json({ goals, completionPercent });
}

async function createGoal(req, res) {
    const { text } = req.body;

    if (!text || !text.trim()) {
        return res.status(400).json({ message: 'Goal text is required' });
    }

    const goal = await Goal.create({ user: req.user._id, text: text.trim() });
    res.status(201).json({ goal });
}

async function toggleGoal(req, res) {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) {
        return res.status(404).json({ message: 'Goal not found' });
    }

    goal.completed = !goal.completed;
    await goal.save();
    res.json({ goal });
}

async function deleteGoal(req, res) {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) {
        return res.status(404).json({ message: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted' });
}

module.exports = { getGoals, createGoal, toggleGoal, deleteGoal };