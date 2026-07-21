const express = require('express');
const router = express.Router();
const {
  getAssignedTeams,
  getPendingMilestones,
  reviewMilestone,
  createMentorAnnouncement,
  deleteMentorAnnouncement,
  getMentorDashboard
} = require('../controllers/mentorController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('mentor'));

router.get('/teams', getAssignedTeams);
router.get('/milestones', getPendingMilestones);
router.put('/milestones/:id', reviewMilestone);
router.post('/announcements', createMentorAnnouncement);
router.delete('/announcements/:id', deleteMentorAnnouncement);
router.get('/dashboard', getMentorDashboard);

module.exports = router;
