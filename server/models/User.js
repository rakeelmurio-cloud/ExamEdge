const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // email and password are the only required fields for the form
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['student', 'tutor'], 
        default: 'student' 
    },
    // name is NOT required because your Register.js form doesn't have a name input
    name: { type: String, required: false }, 
    
    // Academic fields for Tutors
    year: { type: String }, 
    module: { type: String }, 
    grade: { type: String },
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);