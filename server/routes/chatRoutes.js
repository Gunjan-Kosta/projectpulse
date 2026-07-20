const express = require('express');
const router = express.Router();
const { getChatHistory, uploadChatFile } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.get('/:teamId', getChatHistory);
router.post('/upload', upload.single('file'), uploadChatFile);

module.exports = router;
