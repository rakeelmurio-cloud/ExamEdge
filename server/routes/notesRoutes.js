const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Note = require('../models/Note');

// Configure how files are saved
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("Directory 'uploads' created successfully!");
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/\s+/g, '_');
        cb(null, Date.now() + '-' + safeName);
    }
});

const upload = multer({ storage });

// POST: Upload a note
router.post('/upload', upload.single('pdf'), async (req, res) => {
    try {
        const { title, year, module } = req.body;
        const safePath = req.file.path.replace(/\\/g, "/");

        const newNote = new Note({
            title,
            year,
            module,
            fileUrl: safePath,
            likedBy: [] // Initialize as empty array
        });
        await newNote.save();
        res.status(201).json(newNote);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Fetch all notes
router.get('/', async (req, res) => {
    try {
        const notes = await Note.find().sort({ createdAt: -1 });
        res.json(notes); 
    } catch (err) {
        res.status(500).json([]); 
    }
});

// PUT: Increase like count (The Student A & Student B Fix)
// PUT: Increase like count (The Student A & Student B Fix)
// PUT: Unique Like Logic
router.put('/:id/like', async (req, res) => {
    try {
        const { studentId } = req.body; // This is the email from frontend
        
        if (!studentId) {
            return res.status(400).json({ message: "Student ID missing" });
        }

        // $addToSet adds the email ONLY if it isn't already in the list
        const updatedNote = await Note.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { likedBy: studentId } }, 
            { returnDocument: 'after' } 
        );

        if (!updatedNote) return res.status(404).json({ message: "Note not found" });

        res.json(updatedNote);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;