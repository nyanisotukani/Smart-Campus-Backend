// models/timetableModel.js
const mongoose = require('mongoose');

// Time slot schema (embedded in lecturer timetable)
const timeSlotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  }
});

// Course schema (embedded in student timetable)
const courseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  schedule: {
    type: String,
    required: true
  }
});

// Base timetable schema with common fields
const timetableSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timetableType: {
    type: String,
    enum: ['lecturer', 'student'],
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true, discriminatorKey: 'timetableType' });

// Create the base Timetable model
const Timetable = mongoose.model('Timetable', timetableSchema);

// Create the Lecturer Timetable using discriminator
const LecturerTimetable = Timetable.discriminator('lecturer', new mongoose.Schema({
  lecturerDetails: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    }
  },
  courses: [{
    type: String,
    trim: true
  }],
  timeSlots: [timeSlotSchema]
}));

// Create the Student Timetable using discriminator
const StudentTimetable = Timetable.discriminator('student', new mongoose.Schema({
  groupDetails: {
    program: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: String,
      required: true,
      trim: true
    }
  },
  courses: [courseSchema]
}));

module.exports = {
  Timetable,
  LecturerTimetable,
  StudentTimetable
};