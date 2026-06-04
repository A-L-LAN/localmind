const express = require("express");

const router = express.Router();

// ========================================
// In-memory teacher dashboard data
// ========================================

let students = [
    {
        id: 1,
        name: "Student",
        subject: "Mathematics",
        performance: 60,
        status: "active",
    },
];

let alerts = [];

let analytics = {
    totalStudents: 1,
    activeStudents: 1,
    strugglingStudents: 0,
};

// ========================================
// GET Teacher Dashboard Overview
// ========================================

router.get("/dashboard", (req, res) => {
    res.json({
        success: true,
        analytics,
        students,
        alerts,
    });
});

// ========================================
// GET Students
// ========================================

router.get("/students", (req, res) => {
    res.json({
        success: true,
        students,
    });
});

// ========================================
// GET Alerts
// ========================================

router.get("/alerts", (req, res) => {
    res.json({
        success: true,
        alerts,
    });
});

// ========================================
// POST Student Progress
// ========================================

router.post("/progress", (req, res) => {
    const {
        student,
        subject,
        topic,
        score,
    } = req.body;

    res.json({
        success: true,
        message: "Progress recorded",
        data: {
            student,
            subject,
            topic,
            score,
            timestamp: new Date(),
        },
    });
});

// ========================================
// POST Struggling Student Alert
// ========================================

router.post("/struggling", (req, res) => {
    const {
        student,
        topic,
        subject,
    } = req.body;

    const alert = {
        id: Date.now(),
        student,
        topic,
        subject,
        timestamp: new Date(),
    };

    alerts.push(alert);

    analytics.strugglingStudents += 1;

    res.json({
        success: true,
        alert,
    });
});

// ========================================
// GET Analytics
// ========================================

router.get("/analytics", (req, res) => {
    res.json({
        success: true,
        analytics,
    });
});

module.exports = router;