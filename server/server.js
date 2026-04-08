const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static folders for file access
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads_quizzes', express.static(path.join(__dirname, 'uploads_quizzes')));

// Import Route Files
const peerRoutes = require('./routes/peerRoutes');
const forumRoutes = require('./routes/forumRoutes');
const notesRoutes = require('./routes/notesRoutes');
const quizRoutes = require('./routes/quizRoutes');
const userRoutes = require('./routes/userRoutes');

// Link Routes to API endpoints
app.use('/api/peer', peerRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/users', userRoutes);

// Port and Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/examedge";

mongoose.connect(MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📁 Quiz uploads folder: ${path.join(__dirname, 'uploads_quizzes')}`);
        });
    })
    .catch(err => {
        console.error("❌ MongoDB connection error:", err);
    });