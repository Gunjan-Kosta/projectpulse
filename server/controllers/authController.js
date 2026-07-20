const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Team = require('../models/Team');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'pulse_jwt_secret_token_123_abc_xyz', {
    expiresIn: '30d'
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { emailOrId, password } = req.body;

  if (!emailOrId || !password) {
    return res.status(400).json({ success: false, message: 'Please enter all fields' });
  }

  try {
    // Check for user email or userId
    const user = await User.findOne({
      $or: [
        { email: emailOrId.toLowerCase() },
        { userId: emailOrId.toUpperCase() }
      ]
    }).populate('team');

    if (user && (await user.comparePassword(password))) {
      return res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          userId: user.userId,
          team: user.team ? user.team._id : null,
          teamName: user.team ? user.team.name : null
        }
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: String(error.stack || error.message || error) });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'team',
      populate: { path: 'project' }
    });
    if (user) {
      return res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          userId: user.userId,
          team: user.team
        }
      });
    } else {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Please fill in all fields' });
  }

  try {
    const user = await User.findById(req.user._id);

    if (user && (await user.comparePassword(currentPassword))) {
      user.password = newPassword;
      await user.save();
      return res.json({ success: true, message: 'Password changed successfully' });
    } else {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  loginUser,
  getUserProfile,
  changePassword
};
