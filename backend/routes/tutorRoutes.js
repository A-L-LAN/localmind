// backend/routes/tutorRoutes.js

const express = require("express");
const router = express.Router();

// ======================================================
// Agents & Services
// ======================================================

const studentTutorAgent =
    require("../agents/studentTutorAgent");

const retrievalAgent =
    require("../agents/retrievalAgent");

const {
    streamGenerate
} = require("../services/gemmaService");

const {
    routeTask
} = require("../agents/modelRouter");


// ======================================================
// Health Check
// ======================================================

router.get("/", async (req, res) => {

    return res.status(200).json({
        success: true,
        service: "Tutor Routes",
        status: "active"
    });
});


// ======================================================
// Intelligent AI Router (NEW)
// POST /api/tutor/ask
// ======================================================

router.post("/ask", async (req, res) => {

    try {

        const {
            question,
            level,
            classroomData
        } = req.body;

        if (!question?.trim()) {

            return res.status(400).json({
                success: false,
                message: "Question is required."
            });
        }

        const result =
            await routeTask({

                prompt: question,

                studentLevel:
                    level || "Form 1",

                classroomData:
                    classroomData || {}
            });

        return res.status(200).json({
            success: true,
            result
        });

    } catch (error) {

        console.error(
            "❌ /ask Error:",
            error
        );

        return res.status(500).json({
            success: false,
            error:
                error.message ||
                "AI routing failed"
        });
    }
});


// ======================================================
// Explain Topic
// ======================================================

router.post("/explain", async (req, res) => {

    try {

        const {
            question,
            topic,
            subject,
            language,
            studentProfile
        } = req.body;

        if (!question?.trim()) {

            return res.status(400).json({
                success: false,
                message:
                    "Question is required."
            });
        }

        const response =
            await studentTutorAgent
                .explainTopic({

                    question,
                    topic,
                    subject,
                    language,
                    studentProfile
                });

        return res.status(200).json({
            success: true,
            data: response
        });

    } catch (error) {

        console.error(
            "❌ /explain Error:",
            error
        );

        return res.status(500).json({
            success: false,
            error:
                error.message ||
                "Failed to explain topic"
        });
    }
});


// ======================================================
// Adaptive Learning Session
// ======================================================

router.post(
    "/adaptive-session",
    async (req, res) => {

        try {

            const {
                question,
                studentAnswer,
                studentProfile,
                topic,
                subject
            } = req.body;

            if (!question?.trim()) {

                return res.status(400)
                    .json({
                        success: false,
                        message:
                            "Question is required."
                    });
            }

            const session =
                await studentTutorAgent
                    .adaptiveLearningSession({

                        question,
                        studentAnswer,
                        studentProfile,
                        topic,
                        subject
                    });

            return res.status(200)
                .json({
                    success: true,
                    session
                });

        } catch (error) {

            console.error(
                "❌ /adaptive-session Error:",
                error
            );

            return res.status(500)
                .json({
                    success: false,
                    error:
                        error.message ||
                        "Adaptive learning failed"
                });
        }
    }
);


// ======================================================
// Homework Assistance
// ======================================================

router.post(
    "/homework-help",
    async (req, res) => {

        try {

            const {
                homeworkQuestion,
                studentProfile,
                subject
            } = req.body;

            if (
                !homeworkQuestion?.trim()
            ) {

                return res.status(400)
                    .json({
                        success: false,
                        message:
                            "Homework question is required."
                    });
            }

            const assistance =
                await studentTutorAgent
                    .assistHomework({

                        homeworkQuestion,
                        studentProfile,
                        subject
                    });

            return res.status(200)
                .json({
                    success: true,
                    assistance
                });

        } catch (error) {

            console.error(
                "❌ /homework-help Error:",
                error
            );

            return res.status(500)
                .json({
                    success: false,
                    error:
                        error.message ||
                        "Homework assistance failed"
                });
        }
    }
);


// ======================================================
// Detect Student Struggles
// ======================================================

router.post(
    "/detect-struggles",
    async (req, res) => {

        try {

            const {
                studentMessages,
                studentProfile
            } = req.body;

            if (
                !studentMessages ||
                !Array.isArray(
                    studentMessages
                )
            ) {

                return res.status(400)
                    .json({
                        success: false,
                        message:
                            "studentMessages array is required."
                    });
            }

            const analysis =
                await studentTutorAgent
                    .detectStudentStruggles({

                        studentMessages,
                        studentProfile
                    });

            return res.status(200)
                .json({
                    success: true,
                    analysis
                });

        } catch (error) {

            console.error(
                "❌ /detect-struggles Error:",
                error
            );

            return res.status(500)
                .json({
                    success: false,
                    error:
                        error.message ||
                        "Struggle detection failed"
                });
        }
    }
);


// ======================================================
// Generate Personalized Study Plan
// ======================================================

router.post(
    "/study-plan",
    async (req, res) => {

        try {

            const {
                studentProfile,
                weakTopics,
                subject
            } = req.body;

            const plan =
                await studentTutorAgent
                    .generateStudyPlan({

                        studentProfile,
                        weakTopics,
                        subject
                    });

            return res.status(200)
                .json({
                    success: true,
                    plan
                });

        } catch (error) {

            console.error(
                "❌ /study-plan Error:",
                error
            );

            return res.status(500)
                .json({
                    success: false,
                    error:
                        error.message ||
                        "Study plan generation failed"
                });
        }
    }
);


// ======================================================
// Learning Memory Embedding
// ======================================================

router.post("/memory", async (req, res) => {

    try {

        const {
            studentId,
            topic,
            notes
        } = req.body;

        if (
            !studentId ||
            !topic?.trim() ||
            !notes?.trim()
        ) {

            return res.status(400)
                .json({
                    success: false,
                    message:
                        "studentId, topic and notes are required."
                });
        }

        const memory =
            await studentTutorAgent
                .createLearningMemory({

                    studentId,
                    topic,
                    notes
                });

        return res.status(200)
            .json({
                success: true,
                memory
            });

    } catch (error) {

        console.error(
            "❌ /memory Error:",
            error
        );

        return res.status(500)
            .json({
                success: false,
                error:
                    error.message ||
                    "Memory creation failed"
            });
    }
});


// ======================================================
// Educational Retrieval Search
// ======================================================

router.post("/retrieve", async (req, res) => {

    try {

        const {
            topic,
            subject
        } = req.body;

        if (!topic?.trim()) {

            return res.status(400)
                .json({
                    success: false,
                    message:
                        "Topic is required."
                });
        }

        const retrieval =
            await retrievalAgent
                .retrieveEducationalContext({

                    topic,
                    subject
                });

        return res.status(200)
            .json({
                success: true,
                retrieval
            });

    } catch (error) {

        console.error(
            "❌ /retrieve Error:",
            error
        );

        return res.status(500)
            .json({
                success: false,
                error:
                    error.message ||
                    "Retrieval failed"
            });
    }
});


// ======================================================
// Knowledge Summary
// ======================================================

router.post("/summarize", async (req, res) => {

    try {

        const { topic } = req.body;

        if (!topic?.trim()) {

            return res.status(400)
                .json({
                    success: false,
                    message:
                        "Topic is required."
                });
        }

        const summary =
            await retrievalAgent
                .summarizeKnowledge({
                    topic
                });

        return res.status(200)
            .json({
                success: true,
                summary
            });

    } catch (error) {

        console.error(
            "❌ /summarize Error:",
            error
        );

        return res.status(500)
            .json({
                success: false,
                error:
                    error.message ||
                    "Summary generation failed"
            });
    }
});


// ======================================================
// Streaming Tutor Response
// ======================================================

router.post("/stream", async (req, res) => {

    try {

        const {
            prompt,
            systemPrompt
        } = req.body;

        if (!prompt?.trim()) {

            return res.status(400)
                .json({
                    success: false,
                    message:
                        "Prompt is required."
                });
        }

        res.setHeader(
            "Content-Type",
            "text/plain"
        );

        res.setHeader(
            "Transfer-Encoding",
            "chunked"
        );

        await streamGenerate({
            prompt,
            res,
            systemPrompt
        });

    } catch (error) {

        console.error(
            "❌ /stream Error:",
            error
        );

        return res.status(500)
            .json({
                success: false,
                error:
                    error.message ||
                    "Streaming failed"
            });
    }
});


// ======================================================
// Generate Encouragement
// ======================================================

router.post(
    "/encouragement",
    async (req, res) => {

        try {

            const {
                score,
                improvement
            } = req.body;

            const encouragement =
                studentTutorAgent
                    .generateEncouragement({

                        score,
                        improvement
                    });

            return res.status(200)
                .json({
                    success: true,
                    encouragement
                });

        } catch (error) {

            console.error(
                "❌ /encouragement Error:",
                error
            );

            return res.status(500)
                .json({
                    success: false,
                    error:
                        error.message ||
                        "Encouragement generation failed"
                });
        }
    }
);


// ======================================================
// Save Knowledge File
// ======================================================

router.post(
    "/knowledge/save",
    async (req, res) => {

        try {

            const {
                filename,
                content
            } = req.body;

            if (
                !filename?.trim() ||
                !content?.trim()
            ) {

                return res.status(400)
                    .json({
                        success: false,
                        message:
                            "filename and content are required."
                    });
            }

            const saved =
                await retrievalAgent
                    .saveKnowledgeDocument({

                        filename,
                        content
                    });

            return res.status(200)
                .json({
                    success: true,
                    saved
                });

        } catch (error) {

            console.error(
                "❌ /knowledge/save Error:",
                error
            );

            return res.status(500)
                .json({
                    success: false,
                    error:
                        error.message ||
                        "Knowledge save failed"
                });
        }
    }
);


// ======================================================
// Build Vector Cache
// ======================================================

router.post(
    "/vector-cache/build",
    async (req, res) => {

        try {

            const cache =
                await retrievalAgent
                    .buildVectorCache();

            return res.status(200)
                .json({
                    success: true,
                    cache
                });

        } catch (error) {

            console.error(
                "❌ /vector-cache/build Error:",
                error
            );

            return res.status(500)
                .json({
                    success: false,
                    error:
                        error.message ||
                        "Vector cache build failed"
                });
        }
    }
);


// ======================================================
// Export Router
// ======================================================

module.exports = router;