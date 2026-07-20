const express = require('express');
const router = express.Router();
const {
  updateProjectDetails,
  uploadProjectDocument,
  createTask,
  getTeamTasks,
  submitMilestone,
  getTeamMilestones,
  getLeaderDashboard
} = require('../controllers/leaderController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.use(authorize('leader'));

router.put('/project', updateProjectDetails);
router.post('/project/document', upload.single('file'), uploadProjectDocument);
router.post('/tasks', createTask);
router.get('/tasks', getTeamTasks);
router.post('/milestones', upload.single('file'), submitMilestone);
router.get('/milestones', getTeamMilestones);
router.get('/dashboard', getLeaderDashboard);

module.exports = router;
