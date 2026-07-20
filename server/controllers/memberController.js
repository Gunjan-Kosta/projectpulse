const Task = require('../models/Task');
const Team = require('../models/Team');
const Project = require('../models/Project');

// @desc    Get member's assigned tasks
// @route   GET /api/member/tasks
// @access  Private/Member
const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('assignedTo', 'name email userId')
      .populate('createdBy', 'name email userId')
      .populate('project', 'name');

    return res.json({ success: true, tasks });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update task status and upload completed work
// @route   PUT /api/member/tasks/:id
// @access  Private/Member
const updateTask = async (req, res) => {
  const { status } = req.body;

  if (!status || !['Pending', 'In Progress', 'Completed'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid status' });
  }

  try {
    const task = await Task.findOne({ _id: req.params.id, assignedTo: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found or not assigned to you' });
    }

    task.status = status;

    if (req.file) {
      task.attachments.push({
        name: req.file.originalname,
        path: `/uploads/${req.file.filename}`,
        uploadedAt: new Date()
      });
    }

    await task.save();

    return res.json({ success: true, message: 'Task updated successfully', task });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get member dashboard details
// @route   GET /api/member/dashboard
// @access  Private/Member
const getMemberDashboard = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments({ assignedTo: req.user._id });
    const pendingTasks = await Task.countDocuments({ assignedTo: req.user._id, status: { $ne: 'Completed' } });
    const completedTasks = await Task.countDocuments({ assignedTo: req.user._id, status: 'Completed' });

    const recentTasks = await Task.find({ assignedTo: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(5);

    let projectProgress = 0;
    let projectName = 'No Project Assigned';
    
    if (req.user.team) {
      const team = await Team.findById(req.user.team).populate('project');
      if (team && team.project) {
        projectName = team.project.name;
        projectProgress = team.project.progress;
      }
    }

    return res.json({
      success: true,
      stats: {
        totalTasks,
        pendingTasks,
        completedTasks,
        projectName,
        projectProgress
      },
      recentTasks
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getMyTasks,
  updateTask,
  getMemberDashboard
};
