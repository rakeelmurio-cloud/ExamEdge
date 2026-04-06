const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// 1. UPDATED SCHEMA: Added the replies array
const PostSchema = new mongoose.Schema({
    title: String,
    content: String,
    module: String,
    year: String,
    author: { type: String, default: "Anonymous Student" },
    // --- THIS WAS MISSING ---
    replies: [{
        text: String,
        user: String,
        date: { type: Date, default: Date.now }
    }],
    // ------------------------
    createdAt: { type: Date, default: Date.now }
});

// Avoid "OverwriteModelError" if the model is already defined
const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

// GET all posts
router.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new discussion
router.post('/create', async (req, res) => {
    try {
        const post = new Post(req.body);
        const newPost = await post.save();
        res.status(201).json(newPost);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// POST a reply to a specific post
router.post('/:postId/reply', async (req, res) => {
    try {
        const { text, user } = req.body;
        const post = await Post.findById(req.params.postId);
        
        if (!post) return res.status(404).json({ message: "Post not found" });

        // Now this will work because 'replies' exists in the Schema
        post.replies.push({ text, user, date: new Date() });
        await post.save();
        
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a post
router.delete('/:postId', async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.postId);
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// EDIT a reply
router.put('/:postId/reply/:replyIndex', async (req, res) => {
    try {
        const { text } = req.body;
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        post.replies[req.params.replyIndex].text = text;
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;