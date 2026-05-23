const express = require('express');
const { createGoal, deleteGoal, getGoals, toggleGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getGoals);
router.post('/', createGoal);
router.patch('/:id/toggle', toggleGoal);
router.delete('/:id', deleteGoal);

module.exports = router;