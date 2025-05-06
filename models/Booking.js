const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        name: String,
        surname: String,
        email: String,
        role: {
            type: String,
            enum: ['student', 'lecturer', 'admin'],
            required: true
        }
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    date: {
        type: String, // Store as YYYY-MM-DD
        required: true
    },
    startTime: {
        type: String, // "09:00"
        required: true
    },
    endTime: {
        type: String, // "10:00"
        required: true
    },
    purpose: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Declined'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);