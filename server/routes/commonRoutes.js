const express = require('express');
const router = express.Router();
const { 
  getAnnouncements, 
  getMyTeam, 
  getMyProject, 
  getTeamTasks, 
  getTeamMilestones 
} = require('../controllers/commonController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/announcements', getAnnouncements);
router.get('/team', getMyTeam);
router.get('/project', getMyProject);
router.get('/tasks', getTeamTasks);
router.get('/milestones', getTeamMilestones);

module.exports = router;
