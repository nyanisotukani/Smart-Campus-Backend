const User = require('../models/User'); // Adjust path to your actual model
const bcrypt = require('bcryptjs');

// Get all users with pagination support
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    // Add filter by role if provided
    if (req.query.role && req.query.role !== 'all') {
      filter.role = req.query.role;
    }
    
    // Add filter by search term if provided
    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Count total documents for pagination
    const total = await User.countDocuments(filter);
    
    // Fetch users with pagination
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.status(200).json({ 
      message: 'Users fetched successfully', 
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User fetched successfully', user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, status } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || 'student',
      status: status || 'pending'
    });
    
    await newUser.save();
    
    // Return user without password
    const savedUser = newUser.toObject();
    delete savedUser.password;
    
    res.status(201).json({ 
      message: 'User created successfully', 
      user: savedUser 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error while creating user' });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, role, status } = req.body;
    
    // Check if trying to update password and hash it
    let updateData = { firstName, lastName, email, role, status };
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      updateData.password = hashedPassword;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ 
      message: 'User updated successfully', 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error while updating user' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
};

// Update user status
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'inactive', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ 
      message: 'User status updated successfully', 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Server error while updating user status' });
  }
};

module.exports = { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser,
  updateUserStatus
};