const User = require('../models/User'); // Adjust path to your actual model

const getAllUser = async (req, res) => {
  try {
    const users = await User.find().select('-password'); 
    res.status(200).json({ message: 'Users fetched successfully', users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

module.exports = { getAllUser };
