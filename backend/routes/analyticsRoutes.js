const express = require("express");

const router = express.Router();

// ======================================================
// In-Memory Analytics Store
// ======================================================

const analyticsData = {
    totalStudents: 0,
    activeStudents: 0,
    totalSessions: 0,
    totalQuestions: 0,
    subjects: {},
    activityLog: []
};

// ======================================================
// Health Check
// ======================================================

router.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        service: "Analytics Routes",
        status: "active"
    });
});

// ======================================================
// Dashboard Analytics
// ======================================================

router.get("/dashboard", (req, res) => {
    res.status(200).json({
        success: true,
        analytics: analyticsData
    });
});

// ======================================================
// Record Activity
// ======================================================

router.post("/track", (req, res) => {
    try {
        const {
            student,
            subject,
            topic,
            action
        } = req.body;

        const activity = {
            id: Date.now(),
            student: student || "Unknown",
            subject: subject || "General",
            topic: topic || "Unknown",
            action: action || "interaction",
            timestamp: new Date().toISOString()
        };

        analyticsData.activityLog.push(activity);

        analyticsData.totalQuestions++;

        if (subject) {
            analyticsData.subjects[subject] =
                (analyticsData.subjects[subject] || 0) + 1;
        }

        res.status(200).json({
            success: true,
            activity
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
// Student Analytics
// ======================================================

router.get("/students", (req, res) => {
    res.status(200).json({
        success: true,
        totalStudents: analyticsData.totalStudents,
        activeStudents: analyticsData.activeStudents
    });
});

// ======================================================
// Subject Analytics
// ======================================================

router.get("/subjects", (req, res) => {
    res.status(200).json({
        success: true,
        subjects: analyticsData.subjects
    });
});

// ======================================================
// Recent Activity
// ======================================================

router.get("/activity", (req, res) => {
    res.status(200).json({
        success: true,
        count: analyticsData.activityLog.length,
        activity: analyticsData.activityLog.slice(-50)
    });
});

// ======================================================
// Reset Analytics
// ======================================================

router.delete("/reset", (req, res) => {
    analyticsData.totalStudents = 0;
    analyticsData.activeStudents = 0;
    analyticsData.totalSessions = 0;
    analyticsData.totalQuestions = 0;
    analyticsData.subjects = {};
    analyticsData.activityLog = [];

    res.status(200).json({
        success: true,
        message: "Analytics reset successfully"
    });
});

module.exports = router;