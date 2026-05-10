// backend/server.js

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const http = require("http");

const { Server } = require("socket.io");

const tutorRoutes = require("./routes/tutorRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const retrievalRoutes = require("./routes/retrievalRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});


// ======================================================
// Middleware
// ======================================================

app.use(cors());

app.use(
    helmet({
        crossOriginResourcePolicy: false
    })
);

app.use(compression());

app.use(morgan("dev"));

app.use(express.json({
    limit: "20mb"
}));

app.use(express.urlencoded({
    extended: true
}));


// ======================================================
// App Metadata
// ======================================================

const APP_NAME = "LocalMind";
const APP_VERSION = "1.0.0";


// ======================================================
// In-Memory Classroom State
// ======================================================

const classroomState = {
    activeStudents: 0,
    sessions: {},
    analytics: [],
    strugglingStudents: [],
    latestTopics: []
};


// ======================================================
// Socket.IO Real-Time System
// ======================================================

io.on("connection", (socket) => {

    console.log(`📡 Teacher connected: ${socket.id}`);

    classroomState.activeStudents++;

    io.emit("classroom-stats", {
        activeStudents: classroomState.activeStudents
    });

    // --------------------------------------------
    // Student progress updates
    // --------------------------------------------

    socket.on("student-progress", (data) => {

        console.log("📘 Student Progress:", data);

        classroomState.analytics.push(data);

        io.emit("dashboard-update", {
            type: "student-progress",
            payload: data
        });
    });

    // --------------------------------------------
    // Student struggle detection
    // --------------------------------------------

    socket.on("student-struggling", (data) => {

        console.log("⚠️ Student struggling:", data);

        classroomState.strugglingStudents.push(data);

        io.emit("teacher-alert", {
            type: "student-struggling",
            payload: data
        });
    });

    // --------------------------------------------
    // Topic analytics
    // --------------------------------------------

    socket.on("topic-analytics", (data) => {

        classroomState.latestTopics.push(data);

        io.emit("topic-update", {
            type: "topic-analytics",
            payload: data
        });
    });

    // --------------------------------------------
    // Disconnect
    // --------------------------------------------

    socket.on("disconnect", () => {

        console.log(`❌ Disconnected: ${socket.id}`);

        classroomState.activeStudents--;

        io.emit("classroom-stats", {
            activeStudents: classroomState.activeStudents
        });
    });
});


// ======================================================
// Health Check Route
// ======================================================

app.get("/", (req, res) => {

    res.status(200).json({
        success: true,
        application: APP_NAME,
        version: APP_VERSION,
        status: "running",
        message: "🚀 LocalMind AI Server is running."
    });
});


// ======================================================
// System Status Route
// ======================================================

app.get("/api/status", (req, res) => {

    res.status(200).json({
        success: true,
        server: "online",
        ai_engine: "Gemma 4",
        offline_mode: true,
        vector_database: "connected",
        active_students: classroomState.activeStudents,
        analytics_records: classroomState.analytics.length
    });
});


// ======================================================
// API Routes
// ======================================================

app.use("/api/tutor", tutorRoutes);

app.use("/api/teacher", teacherRoutes);

app.use("/api/assessment", assessmentRoutes);

app.use("/api/retrieval", retrievalRoutes);

app.use("/api/analytics", analyticsRoutes);


// ======================================================
// 404 Route
// ======================================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});


// ======================================================
// Global Error Handler
// ======================================================

app.use((err, req, res, next) => {

    console.error("🔥 SERVER ERROR:");
    console.error(err);

    res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: err.message
    });
});


// ======================================================
// Server Boot
// ======================================================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {

    console.log(`
======================================================
🧠 LocalMind AI Server Started
======================================================

🚀 Application : ${APP_NAME}
📦 Version     : ${APP_VERSION}
🌐 Port        : ${PORT}
🤖 AI Engine   : Gemma 4
📚 Mode        : Offline-First Learning
🔒 Privacy     : On-Device AI
⚡ Status      : ACTIVE

======================================================
    `);
});