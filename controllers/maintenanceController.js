const Maintenance = require('../models/Maintenance');

// Create a new maintenance report
const createReport = async (req, res) => {
  try {
    const { name, email, location, description, priority } = req.body;
    
    if (!name || !email || !location || !description) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    
    const newReport = new Maintenance({ 
      name, 
      email, 
      location, 
      description,
      priority: priority || 'Medium'
    });
    
    await newReport.save();
    
    res.status(201).json({ 
      message: 'Report submitted successfully.', 
      report: newReport 
    });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Get all maintenance reports
const getAllReports = async (req, res) => {
  try {
    const reports = await Maintenance.find().sort({ submittedAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Get a single maintenance report
const getReportById = async (req, res) => {
  try {
    const report = await Maintenance.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Maintenance report not found.' });
    }
    
    res.status(200).json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Update a maintenance report
const updateReport = async (req, res) => {
  try {
    const allowedUpdates = ['status', 'priority', 'description', 'location'];
    const updates = Object.keys(req.body);
    
    // Validate update fields
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates.' });
    }
    
    const report = await Maintenance.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Maintenance report not found.' });
    }
    
    // Apply updates
    updates.forEach(update => report[update] = req.body[update]);
    await report.save();
    
    res.status(200).json({ 
      message: 'Report updated successfully.', 
      report 
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Delete a maintenance report
const deleteReport = async (req, res) => {
  try {
    const report = await Maintenance.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Maintenance report not found.' });
    }
    
    await Maintenance.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Report deleted successfully.' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

module.exports = { 
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport
};