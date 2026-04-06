const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Registration Route
router.post('/register', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const newUser = new User({ email, password, role });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        res.status(400).json({ error: "Email already exists or invalid data" });
    }
});

// Login Route (Simple version)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 1. Find the user by email only
        const user = await User.findOne({ email });

        // 2. If user doesn't exist OR password doesn't match, FAIL
        if (!user || user.password !== password) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // 3. Only if BOTH match, allow login
        res.status(200).json({ 
            message: "Login successful", 
            user: { email: user.email, role: user.role } 
        });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;