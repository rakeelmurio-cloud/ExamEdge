const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    studentEmail: { type: String, required: true },
    tutorEmail: { type: String, required: true },
    module: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
    date: { type: String }, // Provided by tutor
    time: { type: String }, // Provided by tutor
    googleMeetLink: { type: String }, // Provided by tutor
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', SessionSchema);