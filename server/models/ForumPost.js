const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    year: String,
    module: String,
    author: { type: String, default: "Anonymous" },
    // This stores all the answers/comments for this specific post
    replies: [{
        text: String,
        user: String,
        date: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);