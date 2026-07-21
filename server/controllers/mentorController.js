const Team = require('../models/Team');
const Project = require('../models/Project');
const Milestone = require('../models/Milestone');
const Announcement = require('../models/Announcement');
const Task = require('../models/Task');

// @desc    Get mentor's assigned teams
// @route   GET /api/mentor/teams
// @access  Private/Mentor
const getAssignedTeams = async (req, res) => {
  try {
    const teams = await Team.find({ mentor: req.user._id })
      .populate('leader', 'name email userId')
      .populate('members', 'name email userId')
      .populate('project');

    return res.json({ success: true, teams });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get mentor's pending reviews (Milestones)
// @route   GET /api/mentor/milestones
// @access  Private/Mentor
const getPendingMilestones = async (req, res) => {
  try {
    // Find all teams supervised by this mentor
    const assignedTeams = await Team.find({ mentor: req.user._id });
    const teamIds = assignedTeams.map(t => t._id);

    // Find pending milestones for these teams
    const milestones = await Milestone.find({
      team: { $in: teamIds },
      status: 'Pending'
    })
      .populate('team', 'name')
      .populate('project', 'name')
      .populate('submittedBy', 'name role');

    return res.json({ success: true, milestones });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Approve/reject milestone submission
// @route   PUT /api/mentor/milestones/:id
// @access  Private/Mentor
const reviewMilestone = async (req, res) => {
  const { status, remarks } = req.body;

  if (!status || !['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid status (Approved or Rejected)' });
  }

  try {
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }

    // Verify mentor supervises this team
    const team = await Team.findOne({ _id: milestone.team, mentor: req.user._id });
    if (!team) {
      return res.status(403).json({ success: false, message: 'You are not authorized to review this milestone' });
    }

    milestone.status = status;
    milestone.remarks = remarks || '';
    await milestone.save();

    // If approved, optionally we can auto-update project progress percentage, but let's let the Leader manage progress and mentor review milestones as deliverables.
    return res.json({ success: true, message: `Milestone has been ${status.toLowerCase()}`, milestone });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Mentor create announcement for assigned teams
// @route   POST /api/mentor/announcements
// @access  Private/Mentor
const createMentorAnnouncement = async (req, res) => {
  const { title, content, teamIds } = req.body;

  if (!title || !content || !teamIds || teamIds.length === 0) {
    return res.status(400).json({ success: false, message: 'Title, content, and target teams are required' });
  }

  try {
    // Verify mentor is assigned to all target teams
    const teams = await Team.find({ _id: { $in: teamIds }, mentor: req.user._id });
    if (teams.length !== teamIds.length) {
      return res.status(403).json({ success: false, message: 'Unauthorized to post announcements to one or more of the selected teams' });
    }

    const announcement = await Announcement.create({
      title,
      content,
      createdBy: req.user._id,
      scope: 'team',
      targetTeams: teamIds
    });

    return res.status(201).json({ success: true, announcement });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete mentor announcement
// @route   DELETE /api/mentor/announcements/:id
// @access  Private/Mentor
const deleteMentorAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found or unauthorized' });
    }
    await announcement.deleteOne();
    return res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get Mentor Dashboard Stats
// @route   GET /api/mentor/dashboard
// @access  Private/Mentor
const getMentorDashboard = async (req, res) => {
  try {
    const assignedTeams = await Team.find({ mentor: req.user._id });
    const teamIds = assignedTeams.map(t => t._id);

    const totalTeams = assignedTeams.length;
    const pendingReviews = await Milestone.countDocuments({
      team: { $in: teamIds },
      status: 'Pending'
    });

    // Recent updates (last 5 tasks completed or milestone submissions on supervised teams)
    const recentMilestones = await Milestone.find({ team: { $in: teamIds } })
      .populate('team', 'name')
      .populate('submittedBy', 'name')
      .sort({ submittedAt: -1 })
      .limit(5);

    const recentTasks = await Task.find({ project: { $in: assignedTeams.map(t => t.project).filter(Boolean) } })
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const updates = [];
    recentMilestones.forEach(m => {
      updates.push({
        type: 'milestone',
        message: `Milestone "${m.title}" submitted by Team "${m.team?.name || 'Unknown'}" - Status: ${m.status}`,
        time: m.submittedAt
      });
    });

    recentTasks.forEach(t => {
      updates.push({
        type: 'task',
        message: `Task "${t.title}" status updated to ${t.status} by ${t.assignedTo?.name || 'unassigned'}`,
        time: t.createdAt
      });
    });

    updates.sort((a, b) => new Date(b.time) - new Date(a.time));
    const recentUpdates = updates.slice(0, 10);

    const assignedTeamsPopulated = await Team.find({ mentor: req.user._id }).populate('project');
    const teamProjects = assignedTeamsPopulated.map(t => ({
      name: t.name,
      Completion: t.project ? t.project.progress : 0
    }));

    return res.json({
      success: true,
      stats: {
        totalTeams,
        pendingReviews
      },
      teamProjects,
      recentUpdates
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAssignedTeams,
  getPendingMilestones,
  reviewMilestone,
  createMentorAnnouncement,
  deleteMentorAnnouncement,
  getMentorDashboard
};
