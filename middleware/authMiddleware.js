const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

const checkRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: 'User not found.' });
      }

      if (!allowedRoles.includes(user.role.toLowerCase())) {
        return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
      }

      req.user = user; 
      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(401).json({ message: 'Invalid or expired token.' });
    }
  };
};

module.exports = checkRole;
