const express = require('express');
const router = express.Router();
const { getMyTasks, updateTask, getMemberDashboard } = require('../controllers/memberController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.use(authorize('member', 'leader'));

router.get('/tasks', getMyTasks);
router.put('/tasks/:id', upload.single('file'), updateTask);
router.get('/dashboard', getMemberDashboard);

module.exports = router;
