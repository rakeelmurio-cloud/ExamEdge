const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    year: { type: String, required: true },
    module: { type: String, required: true },
    fileUrl: { type: String, required: true },
    // This MUST be likedBy (Array), not likes (Number)
    likedBy: { 
        type: [String], 
        default: [] 
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', NoteSchema);