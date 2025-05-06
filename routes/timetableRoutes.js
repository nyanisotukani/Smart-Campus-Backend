// routes/timetableRoutes.js
const express = require('express');
const checkRole = require('../middleware/authMiddleware');
const router = express.Router();
const {
  getAllTimetables,
  getTimetableById,
  createLecturerTimetable,
  createStudentTimetable,
  updateTimetable,
  deleteTimetable,
  getLecturerTimetablesByUserId,
  getStudentTimetablesByProgramAndYear
} = require('../controllers/timetableController');

// Lecturer timetable routes
router.post('/lecturer/create', checkRole('admin'), createLecturerTimetable);

router.route('/lecturer/user/:userId')
  .get( getLecturerTimetablesByUserId);

// Student timetable routes
router.post('/student/create', checkRole('admin'), createStudentTimetable);

router.route('/student/program')
  .get( getStudentTimetablesByProgramAndYear);

// Base route for all timetables
router.route('/')
  .get( getAllTimetables);

// Timetable by ID (generic)
router.route('/:id')
  .get( getTimetableById)
  .put( updateTimetable)
  .delete( deleteTimetable);

module.exports = router;
