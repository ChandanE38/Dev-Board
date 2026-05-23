const express = require('express');
const router = express.Router();

router.get('/:username', async(req, res) => {
    try {
        const response = await fetch(
            `https://leetcode-stats.tashif.codes/${req.params.username}`
        );
        if (!response.ok) throw new Error('API failed');
        const data = await response.json();
        res.json(data);
    } catch {
        res.status(502).json({ message: 'LeetCode stats unavailable' });
    }
});

module.exports = router;