const mongoose = require('mongoose')
const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['Study Room', 'Conference Room', 'Lecture Hall', 'Lab Room', 'Student Centre'],
    required: true
  },
  location: {
    type: String,
    default: "Main Campus"
  },
  capacity: {
    type: Number,
    default: 10
  }
}, { timestamps: true });

module.exports= mongoose.model('Room', roomSchema);
