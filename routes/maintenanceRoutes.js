const router = require('express').Router();
const {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport
} = require('../controllers/maintenanceController');

// Create a new maintenance report
router.post('/', createReport);

// Get all maintenance reports
router.get('/', getAllReports);

// Get a single maintenance report
router.get('/:id', getReportById);

// Update a maintenance report
router.patch('/:id', updateReport);

// Delete a maintenance report
router.delete('/:id', deleteReport);

module.exports = router;