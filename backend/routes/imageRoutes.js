// backend/routes/imageRoutes.js

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const studentTutorAgent =
    require("../agents/studentTutorAgent");


// ======================================================
// Upload Configuration
// ======================================================

const UPLOAD_DIR =
    path.join(__dirname, "../uploads");

if (!fs.existsSync(UPLOAD_DIR)) {

    fs.mkdirSync(UPLOAD_DIR, {
        recursive: true
    });
}

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, UPLOAD_DIR);
    },

    filename: function (req, file, cb) {

        const uniqueName =
            `${Date.now()}-${file.originalname}`;

        cb(null, uniqueName);
    }
});

const upload = multer({

    storage,

    limits: {
        fileSize: 15 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        const allowedTypes = [

            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/webp"
        ];

        if (
            allowedTypes.includes(file.mimetype)
        ) {

            cb(null, true);

        } else {

            cb(
                new Error(
                    "Only image files are allowed."
                )
            );
        }
    }
});


// ======================================================
// Utility Functions
// ======================================================

function imageToBase64(imagePath) {

    const imageBuffer =
        fs.readFileSync(imagePath);

    return imageBuffer.toString("base64");
}

function cleanupFile(filePath) {

    try {

        if (
            fs.existsSync(filePath)
        ) {

            fs.unlinkSync(filePath);
        }

    } catch (error) {

        console.error(
            "❌ cleanupFile Error:",
            error
        );
    }
}


// ======================================================
// Health Check
// ======================================================

router.get("/", async (req, res) => {

    return res.status(200).json({

        success: true,

        service: "Image Processing Routes",

        status: "active"
    });
});


// ======================================================
// Explain Homework / Image
// ======================================================

router.post(

    "/explain",

    upload.single("image"),

    async (req, res) => {

        let uploadedPath = "";

        try {

            // -----------------------------------------
            // Validate
            // -----------------------------------------

            if (!req.file) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Image upload is required."
                });
            }

            uploadedPath =
                req.file.path;

            const {

                question,
                subject,
                language

            } = req.body;


            // -----------------------------------------
            // Convert Image
            // -----------------------------------------

            const imageBase64 =
                imageToBase64(uploadedPath);


            // -----------------------------------------
            // AI Explanation
            // -----------------------------------------

            const response =
                await studentTutorAgent
                    .explainImage({

                        imageBase64,

                        question:
                            question ||
                            "Explain this educational image.",

                        subject:
                            subject || "General",

                        language:
                            language || "English"
                    });


            // -----------------------------------------
            // Cleanup
            // -----------------------------------------

            cleanupFile(uploadedPath);


            return res.status(200).json({

                success: true,

                data: response
            });

        } catch (error) {

            cleanupFile(uploadedPath);

            console.error(
                "❌ /image/explain Error:",
                error
            );

            return res.status(500).json({

                success: false,

                error: error.message
            });
        }
    }
);


// ======================================================
// Solve Math Problem From Image
// ======================================================

router.post(

    "/solve-math",

    upload.single("image"),

    async (req, res) => {

        let uploadedPath = "";

        try {

            if (!req.file) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Image upload is required."
                });
            }

            uploadedPath =
                req.file.path;

            const imageBase64 =
                imageToBase64(uploadedPath);

            const result =
                await studentTutorAgent
                    .solveFromImage({

                        imageBase64
                    });

            cleanupFile(uploadedPath);

            return res.status(200).json({

                success: true,

                solution: result
            });

        } catch (error) {

            cleanupFile(uploadedPath);

            console.error(
                "❌ /solve-math Error:",
                error
            );

            return res.status(500).json({

                success: false,

                error: error.message
            });
        }
    }
);


// ======================================================
// OCR + Text Extraction
// ======================================================

router.post(

    "/extract-text",

    upload.single("image"),

    async (req, res) => {

        let uploadedPath = "";

        try {

            if (!req.file) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Image upload is required."
                });
            }

            uploadedPath =
                req.file.path;

            const imageBase64 =
                imageToBase64(uploadedPath);

            const extracted =
                await studentTutorAgent
                    .extractFromImage({

                        imageBase64
                    });

            cleanupFile(uploadedPath);

            return res.status(200).json({

                success: true,

                extracted
            });

        } catch (error) {

            cleanupFile(uploadedPath);

            console.error(
                "❌ /extract-text Error:",
                error
            );

            return res.status(500).json({

                success: false,

                error: error.message
            });
        }
    }
);


// ======================================================
// Analyze Educational Diagram
// ======================================================

router.post(

    "/analyze-diagram",

    upload.single("image"),

    async (req, res) => {

        let uploadedPath = "";

        try {

            if (!req.file) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Image upload is required."
                });
            }

            uploadedPath =
                req.file.path;

            const {

                subject,
                topic

            } = req.body;

            const imageBase64 =
                imageToBase64(uploadedPath);

            const analysis =
                await studentTutorAgent
                    .analyzeDiagram({

                        imageBase64,

                        subject:
                            subject || "Science",

                        topic:
                            topic || "Diagram Analysis"
                    });

            cleanupFile(uploadedPath);

            return res.status(200).json({

                success: true,

                analysis
            });

        } catch (error) {

            cleanupFile(uploadedPath);

            console.error(
                "❌ /analyze-diagram Error:",
                error
            );

            return res.status(500).json({

                success: false,

                error: error.message
            });
        }
    }
);


// ======================================================
// Generate Quiz From Image
// ======================================================

router.post(

    "/generate-quiz",

    upload.single("image"),

    async (req, res) => {

        let uploadedPath = "";

        try {

            if (!req.file) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Image upload is required."
                });
            }

            uploadedPath =
                req.file.path;

            const imageBase64 =
                imageToBase64(uploadedPath);

            const quiz =
                await studentTutorAgent
                    .generateQuizFromImage({

                        imageBase64
                    });

            cleanupFile(uploadedPath);

            return res.status(200).json({

                success: true,

                quiz
            });

        } catch (error) {

            cleanupFile(uploadedPath);

            console.error(
                "❌ /generate-quiz Error:",
                error
            );

            return res.status(500).json({

                success: false,

                error: error.message
            });
        }
    }
);


// ======================================================
// Detect Misconceptions
// ======================================================

router.post(

    "/detect-misconception",

    upload.single("image"),

    async (req, res) => {

        let uploadedPath = "";

        try {

            if (!req.file) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Image upload is required."
                });
            }

            uploadedPath =
                req.file.path;

            const {

                subject

            } = req.body;

            const imageBase64 =
                imageToBase64(uploadedPath);

            const result =
                await studentTutorAgent
                    .detectMisconceptionFromImage({

                        imageBase64,

                        subject:
                            subject || "General"
                    });

            cleanupFile(uploadedPath);

            return res.status(200).json({

                success: true,

                result
            });

        } catch (error) {

            cleanupFile(uploadedPath);

            console.error(
                "❌ /detect-misconception Error:",
                error
            );

            return res.status(500).json({

                success: false,

                error: error.message
            });
        }
    }
);


// ======================================================
// Batch Image Analysis
// ======================================================

router.post(

    "/batch-analyze",

    upload.array("images", 10),

    async (req, res) => {

        let uploadedFiles = [];

        try {

            if (
                !req.files ||
                req.files.length === 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "At least one image is required."
                });
            }

            uploadedFiles =
                req.files.map(
                    file => file.path
                );

            const analyses = [];

            for (const file of req.files) {

                const imageBase64 =
                    imageToBase64(file.path);

                const result =
                    await studentTutorAgent
                        .explainImage({

                            imageBase64,

                            question:
                                "Analyze this educational image."
                        });

                analyses.push({

                    filename:
                        file.filename,

                    analysis: result
                });
            }

            uploadedFiles.forEach(
                cleanupFile
            );

            return res.status(200).json({

                success: true,

                analyses
            });

        } catch (error) {

            uploadedFiles.forEach(
                cleanupFile
            );

            console.error(
                "❌ /batch-analyze Error:",
                error
            );

            return res.status(500).json({

                success: false,

                error: error.message
            });
        }
    }
);


// ======================================================
// Export Router
// ======================================================

module.exports = router;