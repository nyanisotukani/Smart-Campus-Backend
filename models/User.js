const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    role: {
        type: String,
        enum: ['student', 'lecturer', 'admin'],
        default: 'student',
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'pending',
    },
    lastLogin: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
