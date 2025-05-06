const router = require('express').Router();
const checkRole = require('../middleware/authMiddleware');
const { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser,
  updateUserStatus
} = require('../controllers/adminController');

// Get all users with optional filtering and pagination
router.get('/users', checkRole('admin'), getAllUsers);

// Get single user by ID
router.get('/users/:id', checkRole('admin'), getUserById);

// Create new user
router.post('/users', checkRole('admin'), createUser);

// Update user
router.put('/users/:id', checkRole('admin'), updateUser);

// Delete user
router.delete('/users/:id', checkRole('admin'), deleteUser);

// Update user status
router.patch('/users/:id/status', checkRole('admin'), updateUserStatus);

module.exports = router;