const Team = require('../models/Team');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Milestone = require('../models/Milestone');
const User = require('../models/User');

// Helper to get Leader's Team and Project
const getLeaderTeamAndProject = async (leaderId) => {
  const team = await Team.findOne({ leader: leaderId }).populate('project');
  if (!team) {
    throw new Error('You are not assigned to any team as Team Leader');
  }
  return { team, project: team.project };
};

// @desc    Update project details
// @route   PUT /api/leader/project
// @access  Private/Leader
const updateProjectDetails = async (req, res) => {
  const { name, description, techStack, startDate, endDate, status, progress } = req.body;

  try {
    const { project } = await getLeaderTeamAndProject(req.user._id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found for your team' });
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (techStack) {
      project.techStack = Array.isArray(techStack) 
        ? techStack 
        : techStack.split(',').map(t => t.trim()).filter(Boolean);
    }
    if (startDate) project.startDate = startDate;
    if (endDate) project.endDate = endDate;
    if (status) project.status = status;
    if (progress !== undefined) project.progress = Number(progress);

    await project.save();

    return res.json({ success: true, message: 'Project updated successfully', project });
  } catch (error) {
    console.error(error);
    return res.status(error.message.includes('not assigned') ? 403 : 500)
      .json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Upload project document
// @route   POST /api/leader/project/document
// @access  Private/Leader
const uploadProjectDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a file' });
  }

  try {
    const { project } = await getLeaderTeamAndProject(req.user._id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const document = {
      name: req.file.originalname,
      path: `/uploads/${req.file.filename}`,
      uploadedAt: new Date()
    };

    project.documents.push(document);
    await project.save();

    return res.json({ success: true, message: 'Document uploaded successfully', documents: project.documents });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create a task and assign it to a team member
// @route   POST /api/leader/tasks
// @access  Private/Leader
const createTask = async (req, res) => {
  const { title, description, assignedToId, deadline } = req.body;

  if (!title || !assignedToId) {
    return res.status(400).json({ success: false, message: 'Title and Assignee are required' });
  }

  try {
    const { team, project } = await getLeaderTeamAndProject(req.user._id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Verify assigned user is in the team
    const isMember = team.members.some(id => id.toString() === assignedToId) || team.leader.toString() === assignedToId;
    if (!isMember) {
      return res.status(400).json({ success: false, message: 'Assigned user is not part of this team' });
    }

    const task = await Task.create({
      title,
      description: description || '',
      assignedTo: assignedToId,
      project: project._id,
      deadline: deadline || null,
      status: 'Pending',
      createdBy: req.user._id
    });

    return res.status(201).json({ success: true, message: 'Task created and assigned successfully', task });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all tasks for the team's project
// @route   GET /api/leader/tasks
// @access  Private/Leader
const getTeamTasks = async (req, res) => {
  try {
    const { project } = await getLeaderTeamAndProject(req.user._id);
    if (!project) {
      return res.json({ success: true, tasks: [] });
    }

    const tasks = await Task.find({ project: project._id })
      .populate('assignedTo', 'name email userId')
      .populate('createdBy', 'name email userId');

    return res.json({ success: true, tasks });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Submit a milestone
// @route   POST /api/leader/milestones
// @access  Private/Leader
const submitMilestone = async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Milestone title is required' });
  }

  try {
    const { team, project } = await getLeaderTeamAndProject(req.user._id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    let attachment = undefined;
    if (req.file) {
      attachment = {
        name: req.file.originalname,
        path: `/uploads/${req.file.filename}`
      };
    }

    const milestone = await Milestone.create({
      title,
      description: description || '',
      project: project._id,
      team: team._id,
      status: 'Pending',
      submittedBy: req.user._id,
      attachment
    });

    return res.status(201).json({ success: true, message: 'Milestone submitted for review', milestone });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get team milestones (including reviews and remarks)
// @route   GET /api/leader/milestones
// @access  Private/Leader
const getTeamMilestones = async (req, res) => {
  try {
    const { team } = await getLeaderTeamAndProject(req.user._id);
    const milestones = await Milestone.find({ team: team._id })
      .populate('submittedBy', 'name role')
      .sort({ submittedAt: -1 });

    return res.json({ success: true, milestones });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get Leader Dashboard stats
// @route   GET /api/leader/dashboard
// @access  Private/Leader
const getLeaderDashboard = async (req, res) => {
  try {
    const { team, project } = await getLeaderTeamAndProject(req.user._id);
    
    const projectProgress = project ? project.progress : 0;
    const projectStatus = project ? project.status : 'Not Started';

    let pendingTasks = 0;
    let completedTasks = 0;
    let recentTasks = [];

    if (project) {
      pendingTasks = await Task.countDocuments({ project: project._id, status: { $ne: 'Completed' } });
      completedTasks = await Task.countDocuments({ project: project._id, status: 'Completed' });
      recentTasks = await Task.find({ project: project._id })
        .populate('assignedTo', 'name')
        .sort({ createdAt: -1 })
        .limit(5);
    }

    const milestones = await Milestone.find({ team: team._id }).sort({ submittedAt: -1 }).limit(3);

    return res.json({
      success: true,
      stats: {
        projectName: project ? project.name : 'No Project Assigned',
        projectStatus,
        projectProgress,
        pendingTasks,
        completedTasks
      },
      recentTasks,
      milestones
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

module.exports = {
  updateProjectDetails,
  uploadProjectDocument,
  createTask,
  getTeamTasks,
  submitMilestone,
  getTeamMilestones,
  getLeaderDashboard
};
