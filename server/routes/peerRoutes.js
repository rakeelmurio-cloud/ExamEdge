const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Session = require('../models/Session');

// GET: Find tutors based on Year and Module
router.get('/tutors', async (req, res) => {
    const { year, module } = req.query;
    try {
        const tutors = await User.find({
            role: 'tutor',
            year: year,
            module: module 
        }).select('-password'); 
        res.status(200).json(tutors);
    } catch (err) {
        console.error("Peer Matching Error:", err);
        res.status(500).json({ message: "Server error while fetching tutors" });
    }
});

// POST: Create a new session request
router.post('/request-session', async (req, res) => {
    try {
        const { studentEmail, tutorEmail, module } = req.body;
        
        // CRITICAL: Normalize emails to lowercase to prevent "not found" errors
        const newSession = new Session({ 
            studentEmail: studentEmail.toLowerCase().trim(), 
            tutorEmail: tutorEmail.toLowerCase().trim(), 
            module 
        });
        
        await newSession.save();
        res.status(201).json({ message: "Request sent to tutor!" });
    } catch (err) {
        console.error("Request Session Error:", err);
        res.status(500).json({ error: "Could not send request" });
    }
});

// TUTOR: Accept and provide details
router.put('/accept-session/:id', async (req, res) => {
    try {
        const { date, time, googleMeetLink } = req.body;
        const updatedSession = await Session.findByIdAndUpdate(
            req.params.id,
            { 
                status: 'Accepted', 
                date, 
                time, 
                googleMeetLink 
            },
            { new: true }
        );
        res.status(200).json(updatedSession);
    } catch (err) {
        res.status(500).json({ error: "Could not accept session" });
    }
});

// TUTOR: Get pending requests for a specific tutor
router.get('/requests/:tutorEmail', async (req, res) => {
    try {
        // Normalize email from URL params
        const email = req.params.tutorEmail.toLowerCase().trim();
        const requests = await Session.find({ 
            tutorEmail: email, 
            status: 'Pending' 
        });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: "Error fetching requests" });
    }
});

// STUDENT: Get accepted sessions
router.get('/sessions/student/:email', async (req, res) => {
    try {
        const email = req.params.email.toLowerCase().trim();
        const sessions = await Session.find({ 
            studentEmail: email, 
            status: 'Accepted' 
        });
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ error: "Error fetching student sessions" });
    }
});

// TUTOR: Get accepted (scheduled) sessions
router.get('/sessions/tutor/:email', async (req, res) => {
    try {
        const email = req.params.email.toLowerCase().trim();
        const sessions = await Session.find({ 
            tutorEmail: email, 
            status: 'Accepted' 
        });
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ error: "Error fetching tutor sessions" });
    }
});

module.exports = router;