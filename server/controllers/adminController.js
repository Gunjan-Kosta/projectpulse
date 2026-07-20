const User = require('../models/User');
const Team = require('../models/Team');
const Project = require('../models/Project');
const Announcement = require('../models/Announcement');
const Task = require('../models/Task');
const Milestone = require('../models/Milestone');
const { generateUserId } = require('../utils/helpers');

// @desc    Create user account (Mentor/Leader/Member)
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = async (req, res) => {
  const { name, email, role } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ success: false, message: 'Please enter name, email, and role' });
  }

  try {
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Auto-generate User ID and password
    const userId = await generateUserId();
    const tempPassword = 'Pulse@123'; // Default temporary password

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      role,
      userId,
      password: tempPassword // Will be hashed automatically by pre-save hook
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userId: user.userId,
        tempPassword // Returned once to show to Admin
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  const { role } = req.query;
  const filter = {};
  if (role) {
    filter.role = role;
  }

  try {
    const users = await User.find(filter).select('-password').populate('team');
    return res.json({ success: true, users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Reset user password
// @route   POST /api/admin/users/reset-password/:id
// @access  Private/Admin
const resetPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const tempPassword = 'Pulse@123';
    user.password = tempPassword; // Pre-save hook hashes it
    await user.save();

    return res.json({
      success: true,
      message: `Password reset successfully for ${user.name}. Temporary password is: ${tempPassword}`
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create a Team and Project
// @route   POST /api/admin/teams
// @access  Private/Admin
const createTeam = async (req, res) => {
  const { teamName, mentorId, leaderId, memberIds, projectName, projectDescription } = req.body;

  if (!teamName || !mentorId || !leaderId || !projectName) {
    return res.status(400).json({ success: false, message: 'Please provide team name, mentor, team leader, and project name' });
  }

  try {
    // Check if team name already exists
    const teamExists = await Team.findOne({ name: teamName });
    if (teamExists) {
      return res.status(400).json({ success: false, message: 'Team name already exists' });
    }

    // Create the team
    const team = new Team({
      name: teamName,
      mentor: mentorId,
      leader: leaderId,
      members: memberIds || []
    });

    // Create corresponding Project
    const project = new Project({
      name: projectName,
      description: projectDescription || '',
      team: team._id,
      status: 'Not Started',
      progress: 0
    });

    await project.save();

    team.project = project._id;
    await team.save();

    // Assign team reference to Leader and Members (and Mentor if they have a single team, but Mentors can supervise multiple teams. Users have a single team reference, let's update them)
    await User.findByIdAndUpdate(leaderId, { team: team._id });
    if (memberIds && memberIds.length > 0) {
      await User.updateMany({ _id: { $in: memberIds } }, { team: team._id });
    }

    return res.status(201).json({
      success: true,
      message: 'Team and Project created successfully',
      team,
      project
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all teams and projects
// @route   GET /api/admin/teams
// @access  Private/Admin
const getTeams = async (req, res) => {
  try {
    const teams = await Team.find({})
      .populate('mentor', 'name email userId')
      .populate('leader', 'name email userId')
      .populate('members', 'name email userId')
      .populate('project');

    return res.json({ success: true, teams });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getAdminDashboard = async (req, res) => {
  try {
    const totalTeams = await Team.countDocuments();
    const totalUsers = await User.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'In Progress' });
    
    // Construct Recent Activity (Combine user creations, team creations, project updates, milestone submissions)
    const recentUsers = await User.find({}).sort({ createdAt: -1 }).limit(5);
    const recentMilestones = await Milestone.find({}).populate('team', 'name').populate('submittedBy', 'name').sort({ submittedAt: -1 }).limit(5);
    const recentTasks = await Task.find({}).populate('assignedTo', 'name').sort({ createdAt: -1 }).limit(5);

    const activity = [];
    recentUsers.forEach(u => {
      activity.push({
        type: 'user',
        message: `New user account created: ${u.name} (${u.role})`,
        time: u.createdAt
      });
    });

    recentMilestones.forEach(m => {
      activity.push({
        type: 'milestone',
        message: `Milestone "${m.title}" submitted by Team "${m.team?.name || 'Unknown'}" - Status: ${m.status}`,
        time: m.submittedAt
      });
    });

    recentTasks.forEach(t => {
      activity.push({
        type: 'task',
        message: `Task "${t.title}" created for ${t.assignedTo?.name || 'unassigned'}`,
        time: t.createdAt
      });
    });

    // Sort activity by time descending
    activity.sort((a, b) => new Date(b.time) - new Date(a.time));
    const recentActivity = activity.slice(0, 10);

    // Calculate real team projects progress and role stats
    const teams = await Team.find({}).populate('project');
    const teamProjects = teams.map(t => ({
      name: t.name,
      Progress: t.project ? t.project.progress : 0
    }));

    const mentors = await User.countDocuments({ role: 'mentor' });
    const leaders = await User.countDocuments({ role: 'leader' });
    const members = await User.countDocuments({ role: 'member' });

    const roleData = [
      { name: 'Mentors', value: mentors },
      { name: 'Team Leaders', value: leaders },
      { name: 'Team Members', value: members }
    ];

    return res.json({
      success: true,
      stats: {
        totalTeams,
        totalUsers,
        activeProjects
      },
      teamProjects,
      roleData,
      recentActivity
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Manage announcements (admin and mentor can do this, admin endpoints)
// @route   POST /api/admin/announcements
// @access  Private/Admin
const createAnnouncement = async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and Content are required' });
  }

  try {
    const announcement = await Announcement.create({
      title,
      content,
      createdBy: req.user._id,
      scope: 'all' // Admin announcements are visible to everyone
    });

    return res.status(201).json({ success: true, announcement });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/admin/announcements/:id
// @access  Private/Admin
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    await announcement.deleteOne();
    return res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createUser,
  getUsers,
  resetPassword,
  createTeam,
  getTeams,
  getAdminDashboard,
  createAnnouncement,
  deleteAnnouncement
};
