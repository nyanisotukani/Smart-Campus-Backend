const Maintenance = require('../models/Maintenance')


const createReport = async (req, res) => {
  try {
    const { name, email, location, description } = req.body;

    if (!name || !email || !location || !description) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newReport = new Maintenance({ name, email, location, description });
    await newReport.save();

    res.status(201).json({ message: 'Report submitted successfully.', report: newReport });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
}

module.exports = { createReport}
