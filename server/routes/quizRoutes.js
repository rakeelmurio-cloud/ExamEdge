const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads_quizzes/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

router.post('/generate', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const filePath = path.resolve(req.file.path);
        const dataBuffer = new Uint8Array(fs.readFileSync(filePath));

        const loadingTask = pdfjsLib.getDocument({ data: dataBuffer });
        const pdfDoc = await loadingTask.promise;
        const numPages = pdfDoc.numPages;

        let extractedText = '';
        for (let i = 1; i <= numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const content = await page.getTextContent();
            extractedText += content.items.map(item => item.str).join(' ');
        }

        // Question count based on page count
        let questionCount;
        if (numPages < 2)       questionCount = 8;
        else if (numPages <= 3) questionCount = 15;
        else if (numPages <= 5) questionCount = 25;
        else                    questionCount = 35;

        // Timer: 1 minute per question
        const timerSeconds = questionCount * 60;

        extractedText = extractedText.substring(0, 7000);

        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: `You are a quiz generator. Return ONLY a JSON object with a 'questions' array containing exactly ${questionCount} questions. Format: { "questions": [{ "question": "", "options": ["", "", "", ""], "answer": "" }] }. The answer field must exactly match one of the options strings.`
                    },
                    {
                        role: "user",
                        content: `Generate exactly ${questionCount} multiple choice questions from this content: ${extractedText}`
                    }
                ],
                response_format: { type: "json_object" }
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const parsed = JSON.parse(response.data.choices[0].message.content);
        res.json({ ...parsed, timerSeconds, numPages, questionCount });

    } catch (error) {
        console.error("Quiz Error:", error.message);
        res.status(500).json({ error: "Generation failed", details: error.message });
    }
});

module.exports = router;