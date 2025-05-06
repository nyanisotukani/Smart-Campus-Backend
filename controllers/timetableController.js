// controllers/timetableController.js
const { Timetable, LecturerTimetable, StudentTimetable } = require('../models/Timetable');
const User = require('../models/User');

// Get all timetables with optional filtering
exports.getAllTimetables = async (req, res) => {
  try {
    const { type, search, academicYear, semester } = req.query;
    
    // Build query based on filters
    const query = {};
    
    if (type) {
      query.timetableType = type;
    }
    
    if (academicYear) {
      query.academicYear = academicYear;
    }
    
    if (semester) {
      query.semester = semester;
    }
    
    // Search functionality
    if (search) {
      if (type === 'lecturer') {
        query['lecturerDetails.name'] = { $regex: search, $options: 'i' };
      } else if (type === 'student') {
        query['groupDetails.program'] = { $regex: search, $options: 'i' };
      } else {
        // If no specific type, search in both
        query.$or = [
          { 'lecturerDetails.name': { $regex: search, $options: 'i' } },
          { 'lecturerDetails.department': { $regex: search, $options: 'i' } },
          { 'groupDetails.program': { $regex: search, $options: 'i' } }
        ];
      }
    }
    
    const timetables = await Timetable.find(query).sort({ lastUpdated: -1 });
    
    res.status(200).json({
      success: true,
      count: timetables.length,
      data: timetables
    });
  } catch (error) {
    console.error('Error fetching timetables:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timetables',
      error: error.message
    });
  }
};

// Get a single timetable by ID
exports.getTimetableById = async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);
    
    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: timetable
    });
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timetable',
      error: error.message
    });
  }
};

// Create a new lecturer timetable
exports.createLecturerTimetable = async (req, res) => {
    try {
      const { 
        name, 
        department, 
        courses, 
        timeSlots,
        academicYear,
        semester
      } = req.body;
      
      console.log('Request body:', req.body);
  
      const lecturerTimetable = new LecturerTimetable({
         createdBy: req.user._id, // Assuming you have authentication middleware
        timetableType: 'lecturer',
        academicYear,
        semester,
        lecturerDetails: {
          name,
          department
        },
        courses,
        timeSlots  // Use directly
      });
  
      await lecturerTimetable.save();
  
      res.status(201).json({
        success: true,
        data: lecturerTimetable,
        message: 'Lecturer timetable created successfully'
      });
    } catch (error) {
      console.error('Error creating lecturer timetable:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create lecturer timetable',
        error: error.message
      });
    }
  };
  

// Create a new student timetable
exports.createStudentTimetable = async (req, res) => {
  try {
    const {
      program,
      year,
      courses,
      academicYear,
      semester
    } = req.body;
    
    const studentTimetable = new StudentTimetable({
      createdBy: req.user._id, // Assuming you have authentication middleware
      timetableType: 'student',
      academicYear,
      semester,
      groupDetails: {
        program,
        year
      },
      courses
    });
    
    await studentTimetable.save();
    
    res.status(201).json({
      success: true,
      data: studentTimetable,
      message: 'Student timetable created successfully'
    });
  } catch (error) {
    console.error('Error creating student timetable:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create student timetable',
      error: error.message
    });
  }
};

// Update an existing timetable
exports.updateTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);
    
    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }
    
    // Update based on timetable type
    if (timetable.timetableType === 'lecturer') {
      const { 
        name, 
        department, 
        courses, 
        timeSlots,
        academicYear,
        semester
      } = req.body;
      
      // Update lecturer details
      if (name) timetable.lecturerDetails.name = name;
      if (department) timetable.lecturerDetails.department = department;
      
      // Update courses if provided
      if (courses) timetable.courses = courses;
      
      // Update time slots if provided
      if (timeSlots && typeof timeSlots === 'object') {
        const formattedTimeSlots = [];
        Object.keys(timeSlots).forEach(day => {
          timeSlots[day].forEach(slot => {
            const [startTime, endTime] = slot.split('-');
            // Extract course from the slot if provided, otherwise use the first course
            const course = courses && courses.length > 0 ? courses[0] : '';
            
            formattedTimeSlots.push({
              day,
              startTime,
              endTime,
              course
            });
          });
        });
        timetable.timeSlots = formattedTimeSlots;
      }
    } else if (timetable.timetableType === 'student') {
      const {
        program,
        year,
        courses,
        academicYear,
        semester
      } = req.body;
      
      // Update group details
      if (program) timetable.groupDetails.program = program;
      if (year) timetable.groupDetails.year = year;
      
      // Update courses if provided
      if (courses) timetable.courses = courses;
    }
    
    // Update common fields
    if (req.body.academicYear) timetable.academicYear = req.body.academicYear;
    if (req.body.semester) timetable.semester = req.body.semester;
    
    // Update the lastUpdated field
    timetable.lastUpdated = Date.now();
    
    await timetable.save();
    
    res.status(200).json({
      success: true,
      data: timetable,
      message: 'Timetable updated successfully'
    });
  } catch (error) {
    console.error('Error updating timetable:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update timetable',
      error: error.message
    });
  }
};

// Delete a timetable
exports.deleteTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);
    
    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }
    
    await timetable.remove();
    
    res.status(200).json({
      success: true,
      message: 'Timetable deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting timetable:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete timetable',
      error: error.message
    });
  }
};

// Get timetables for a specific lecturer by user ID
exports.getLecturerTimetablesByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const timetables = await LecturerTimetable.find({
      'lecturerDetails.userId': userId
    }).sort({ lastUpdated: -1 });
    
    res.status(200).json({
      success: true,
      count: timetables.length,
      data: timetables
    });
  } catch (error) {
    console.error('Error fetching lecturer timetables:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lecturer timetables',
      error: error.message
    });
  }
};

// Get timetables for students by program and year
exports.getStudentTimetablesByProgramAndYear = async (req, res) => {
  try {
    const { program, year } = req.query;
    
    const query = {};
    
    if (program) {
      query['groupDetails.program'] = program;
    }
    
    if (year) {
      query['groupDetails.year'] = year;
    }
    
    const timetables = await StudentTimetable.find(query).sort({ lastUpdated: -1 });
    
    res.status(200).json({
      success: true,
      count: timetables.length,
      data: timetables
    });
  } catch (error) {
    console.error('Error fetching student timetables:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student timetables',
      error: error.message
    });
  }
};