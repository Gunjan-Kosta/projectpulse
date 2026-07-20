const Message = require('../models/Message');

// @desc    Get chat history for a team
// @route   GET /api/chat/:teamId
// @access  Private
const getChatHistory = async (req, res) => {
  try {
    const { teamId } = req.params;
    const messages = await Message.find({ team: teamId })
      .populate('sender', 'name role userId')
      .sort({ createdAt: 1 });

    return res.json({ success: true, messages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Upload file to be sent in chat
// @route   POST /api/chat/upload
// @access  Private
const uploadChatFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a file' });
  }

  // Determine file type
  const isImage = req.file.mimetype.startsWith('image/');
  const fileType = isImage ? 'image' : 'pdf';

  return res.json({
    success: true,
    file: {
      name: req.file.originalname,
      path: `/uploads/${req.file.filename}`,
      fileType: fileType
    }
  });
};

module.exports = {
  getChatHistory,
  uploadChatFile
};
