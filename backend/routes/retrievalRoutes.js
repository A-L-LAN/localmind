const express = require("express");

const router = express.Router();

// ======================================================
// Health Check
// ======================================================

router.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        service: "Retrieval Routes",
        status: "active"
    });
});

// ======================================================
// Mock Knowledge Base
// ======================================================

const knowledgeBase = [
    {
        id: 1,
        subject: "Biology",
        topic: "Photosynthesis",
        content:
            "Photosynthesis is the process by which green plants use sunlight, carbon dioxide, and water to produce glucose and oxygen."
    },
    {
        id: 2,
        subject: "Mathematics",
        topic: "Algebra",
        content:
            "Algebra uses symbols and variables to represent numbers and relationships."
    },
    {
        id: 3,
        subject: "Physics",
        topic: "Force",
        content:
            "Force is a push or pull acting upon an object due to interaction with another object."
    }
];

// ======================================================
// Retrieve Knowledge
// ======================================================

router.post("/search", async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: "Query is required"
            });
        }

        const results = knowledgeBase.filter(item =>
            item.topic.toLowerCase().includes(query.toLowerCase()) ||
            item.subject.toLowerCase().includes(query.toLowerCase()) ||
            item.content.toLowerCase().includes(query.toLowerCase())
        );

        res.status(200).json({
            success: true,
            query,
            results,
            count: results.length
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
// Get All Knowledge
// ======================================================

router.get("/knowledge", async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            count: knowledgeBase.length,
            data: knowledgeBase
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
// Get Topic
// ======================================================

router.get("/topic/:topic", async (req, res) => {
    try {
        const topic = req.params.topic;

        const result = knowledgeBase.find(
            item =>
                item.topic.toLowerCase() ===
                topic.toLowerCase()
        );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Topic not found"
            });
        }

        res.status(200).json({
            success: true,
            data: result
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