const express = require("express");

const router = express.Router();

// ======================================================
// Health Check
// ======================================================

router.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        service: "Assessment Routes",
        status: "active"
    });
});

// ======================================================
// Generate Assessment
// ======================================================

router.post("/generate", async (req, res) => {
    try {
        const {
            subject,
            topic,
            level
        } = req.body;

        const assessment = {
            subject: subject || "General",
            topic: topic || "Unknown Topic",
            level: level || "beginner",
            questions: [
                {
                    id: 1,
                    type: "multiple-choice",
                    question: `What is the main concept of ${topic}?`,
                    options: [
                        "Option A",
                        "Option B",
                        "Option C",
                        "Option D"
                    ],
                    answer: "Option A"
                },
                {
                    id: 2,
                    type: "short-answer",
                    question: `Explain ${topic} in your own words.`
                }
            ]
        };

        res.status(200).json({
            success: true,
            assessment
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ======================================================
// Submit Assessment
// ======================================================

router.post("/submit", async (req, res) => {
    try {
        const { answers } = req.body;

        const result = {
            totalQuestions: answers?.length || 0,
            score: Math.floor(Math.random() * 100),
            feedback: "Assessment submitted successfully."
        };

        res.status(200).json({
            success: true,
            result
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ======================================================
// Adaptive Evaluation
// ======================================================

router.post("/evaluate", async (req, res) => {
    try {
        const {
            studentName,
            score
        } = req.body;

        let recommendation = "Continue learning.";

        if (score < 40) {
            recommendation = "Student requires additional support.";
        } else if (score < 70) {
            recommendation = "Student is progressing well.";
        } else {
            recommendation = "Student is ready for advanced topics.";
        }

        res.status(200).json({
            success: true,
            evaluation: {
                studentName,
                score,
                recommendation
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;