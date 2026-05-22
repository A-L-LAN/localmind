// backend/agents/modelRouter.js

const {

    educationalTutor,
    analyzeClassroom,
    explainHomework

} = require("../services/gemmaService");


// =====================================================
// TASK CLASSIFIER
// =====================================================

function classifyTask(input) {

    const text =
        input.toLowerCase();

    // -----------------------------------
    // Homework / Question Solving
    // -----------------------------------

    if (
        text.includes("solve") ||
        text.includes("explain") ||
        text.includes("teach") ||
        text.includes("question")
    ) {

        return "student_tutor";
    }

    // -----------------------------------
    // Quiz Generation
    // -----------------------------------

    if (
        text.includes("quiz") ||
        text.includes("test")
    ) {

        return "quiz";
    }

    // -----------------------------------
    // Teacher Analytics
    // -----------------------------------

    if (
        text.includes("performance") ||
        text.includes("student progress") ||
        text.includes("classroom")
    ) {

        return "teacher_analytics";
    }

    return "general";
}


// =====================================================
// HARDWARE DETECTOR
// =====================================================

function detectDeploymentMode() {

    const ram =
        require("os")
        .totalmem();

    const ramGB =
        ram / 1024 / 1024 / 1024;

    if (ramGB < 8) {

        return "low_end";
    }

    if (ramGB < 16) {

        return "mid_range";
    }

    return "high_end";
}


// =====================================================
// ROUTING ENGINE
// =====================================================

async function routeTask({

    prompt,
    studentLevel,
    classroomData,
    image

}) {

    const task =
        classifyTask(prompt);

    const hardware =
        detectDeploymentMode();

    console.log(
        "Task:",
        task
    );

    console.log(
        "Hardware:",
        hardware
    );

    // -----------------------------------
    // LOW-END HARDWARE
    // llama.cpp
    // -----------------------------------

    if (
        hardware === "low_end"
    ) {

        return {

            mode:
                "llama.cpp",

            message:
                "Route to lightweight GGUF model."
        };
    }

    // -----------------------------------
    // STUDENT TUTORING
    // -----------------------------------

    if (
        task === "student_tutor"
    ) {

        return await educationalTutor({

            question:
                prompt,

            studentLevel
        });
    }

    // -----------------------------------
    // CLASSROOM ANALYTICS
    // -----------------------------------

    if (
        task ===
        "teacher_analytics"
    ) {

        return await analyzeClassroom({

            classroomData
        });
    }

    // -----------------------------------
    // IMAGE HOMEWORK
    // -----------------------------------

    if (image) {

        return await explainHomework({

            question:
                prompt,

            imageDescription:
                "Homework image uploaded"
        });
    }

    // -----------------------------------
    // DEFAULT
    // -----------------------------------

    return await educationalTutor({

        question:
            prompt,

        studentLevel:
            studentLevel ||
            "beginner"
    });
}


module.exports = {

    routeTask
};