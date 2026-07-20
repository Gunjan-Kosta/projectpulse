const User = require('../models/User');

const generateUserId = async () => {
  try {
    const count = await User.countDocuments();
    let nextNum = count + 1001;
    let userId = `PP-${nextNum}`;
    let exists = await User.findOne({ userId });
    
    // Loop to ensure uniqueness
    while (exists) {
      nextNum++;
      userId = `PP-${nextNum}`;
      exists = await User.findOne({ userId });
    }
    return userId;
  } catch (error) {
    console.error('Error generating user ID:', error);
    throw error;
  }
};

module.exports = { generateUserId };
