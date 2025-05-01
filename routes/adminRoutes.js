const router = require('express').Router();
const checkRole = require('../middleware/authMiddleware');
const { getAllUser } = require('../controllers/adminController');

router.get('/users', checkRole('admin'), getAllUser); 

module.exports = router;
