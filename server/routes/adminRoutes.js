const express = require('express');
const router = express.Router();
const {
  createUser,
  getUsers,
  resetPassword,
  createTeam,
  getTeams,
  getAdminDashboard,
  createAnnouncement,
  deleteAnnouncement
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Apply admin protection to all routes
router.use(protect);
router.use(authorize('admin'));

router.post('/users', createUser);
router.get('/users', getUsers);
router.post('/users/reset-password/:id', resetPassword);
router.post('/teams', createTeam);
router.get('/teams', getTeams);
router.get('/dashboard', getAdminDashboard);
router.post('/announcements', createAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

module.exports = router;
