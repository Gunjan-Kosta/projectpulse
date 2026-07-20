const Announcement = require('../models/Announcement');
const Team = require('../models/Team');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Milestone = require('../models/Milestone');

// @desc    Get announcements scoped to current user
// @route   GET /api/common/announcements
// @access  Private
const getAnnouncements = async (req, res) => {
  try {
    let announcements = [];

    if (req.user.role === 'admin') {
      // Admins see all announcements
      announcements = await Announcement.find({})
        .populate('createdBy', 'name role')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'mentor') {
      // Mentors see global announcements and their own announcements
      announcements = await Announcement.find({
        $or: [
          { scope: 'all' },
          { createdBy: req.user._id }
        ]
      })
        .populate('createdBy', 'name role')
        .sort({ createdAt: -1 });
    } else {
      // Leader/Members see global announcements and announcements targeting their team
      const query = { scope: 'all' };
      if (req.user.team) {
        query.$or = [
          { scope: 'all' },
          { targetTeams: req.user.team }
        ];
      }
      
      announcements = await Announcement.find(query)
        .populate('createdBy', 'name role')
        .sort({ createdAt: -1 });
    }

    return res.json({ success: true, announcements });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get current user's team details
// @route   GET /api/common/team
// @access  Private
const getMyTeam = async (req, res) => {
  try {
    let teamId = req.user.team;

    // Mentors don't have a single team, they supervisor multiple. They should specify a team ID.
    // Admins don't have a team. They can also pass a teamId.
    if (req.query.teamId) {
      teamId = req.query.teamId;
    }

    if (!teamId) {
      return res.status(400).json({ success: false, message: 'No team identifier provided' });
    }

    const team = await Team.findById(teamId)
      .populate('mentor', 'name email userId')
      .populate('leader', 'name email userId')
      .populate('members', 'name email userId')
      .populate('project');

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    return res.json({ success: true, team });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get project details of team
// @route   GET /api/common/project
// @access  Private
const getMyProject = async (req, res) => {
  try {
    let teamId = req.user.team;
    if (req.query.teamId) {
      teamId = req.query.teamId;
    }

    if (!teamId) {
      return res.status(400).json({ success: false, message: 'No team identifier provided' });
    }

    const project = await Project.findOne({ team: teamId });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found for this team' });
    }

    return res.json({ success: true, project });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get tasks of a team project (for common/admin/mentor/member views)
// @route   GET /api/common/tasks
// @access  Private
const getTeamTasks = async (req, res) => {
  try {
    let teamId = req.user.team;
    if (req.query.teamId) {
      teamId = req.query.teamId;
    }

    if (!teamId) {
      return res.status(400).json({ success: false, message: 'No team identifier provided' });
    }

    const team = await Team.findById(teamId);
    if (!team || !team.project) {
      return res.json({ success: true, tasks: [] });
    }

    const tasks = await Task.find({ project: team.project })
      .populate('assignedTo', 'name email userId')
      .populate('createdBy', 'name email userId');

    return res.json({ success: true, tasks });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get milestones of a team (for common/admin/mentor/member views)
// @route   GET /api/common/milestones
// @access  Private
const getTeamMilestones = async (req, res) => {
  try {
    let teamId = req.user.team;
    if (req.query.teamId) {
      teamId = req.query.teamId;
    }

    if (!teamId) {
      return res.status(400).json({ success: false, message: 'No team identifier provided' });
    }

    const milestones = await Milestone.find({ team: teamId })
      .populate('submittedBy', 'name role')
      .sort({ submittedAt: -1 });

    return res.json({ success: true, milestones });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAnnouncements,
  getMyTeam,
  getMyProject,
  getTeamTasks,
  getTeamMilestones
};
