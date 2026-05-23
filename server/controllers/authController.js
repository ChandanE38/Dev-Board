const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

async function registerUser(req, res) {
    const { name, githubUsername, password } = req.body;
    const normalizedGithubUsername = String(githubUsername || '').toLowerCase().trim();

    if (!name || !githubUsername || !password) {
        return res.status(400).json({ message: 'Name, GitHub username, and password are required' });
    }

    const existingUser = await User.findOne({ githubUsername: normalizedGithubUsername });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        name,
        githubUsername: normalizedGithubUsername,
        password: hashedPassword
    });

    return res.status(201).json({
        token: signToken(user._id),
        user: {
            id: user._id,
            name: user.name,
            githubUsername: user.githubUsername,
            leetcodeUsername: user.leetcodeUsername || ''
        }
    });
}

async function loginUser(req, res) {
    const { githubUsername, password } = req.body;
    const normalizedGithubUsername = String(githubUsername || '').toLowerCase().trim();
    const user = await User.findOne({ githubUsername: normalizedGithubUsername });

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.json({
        token: signToken(user._id),
        user: {
            id: user._id,
            name: user.name,
            githubUsername: user.githubUsername,
            leetcodeUsername: user.leetcodeUsername || ''
        }
    });
}

async function getMe(req, res) {
    return res.json({
        user: {
            id: req.user._id,
            name: req.user.name,
            githubUsername: req.user.githubUsername,
            leetcodeUsername: req.user.leetcodeUsername || ''
        }
    });
}

async function updateProfile(req, res) {
    const { name, githubUsername, leetcodeUsername } = req.body;
    const updates = {};

    if (typeof name === 'string') {
        updates.name = name.trim();
    }

    if (typeof githubUsername === 'string') {
        updates.githubUsername = githubUsername.toLowerCase().trim();
    }

    if (typeof leetcodeUsername === 'string') {
        updates.leetcodeUsername = leetcodeUsername.trim();
    }

    if (updates.githubUsername) {
        const duplicate = await User.findOne({
            githubUsername: updates.githubUsername,
            _id: { $ne: req.user._id }
        });

        if (duplicate) {
            return res.status(400).json({ message: 'GitHub username already exists' });
        }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');

    return res.json({
        user: {
            id: user._id,
            name: user.name,
            githubUsername: user.githubUsername,
            leetcodeUsername: user.leetcodeUsername || ''
        }
    });
}

module.exports = { registerUser, loginUser, getMe, updateProfile };