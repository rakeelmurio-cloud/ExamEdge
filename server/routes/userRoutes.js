const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/register', async (req, res) => {
    try {
        const { email, password, role, year, module, grade } = req.body;

        // Create the user object with all possible fields
        const newUser = new User({ 
            email, 
            password, 
            role,
            year,
            module, 
            grade 
        });

        await newUser.save();
        console.log("✅ User registered successfully:", email);
        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        // This will print the EXACT error in your VS Code terminal
        console.error("❌ REGISTRATION FAILED:", err.message);
        res.status(400).json({ error: err.message });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        res.status(200).json({ 
            message: "Login successful", 
            user: { email: user.email, role: user.role } 
        });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;