// backend/agents/studentTutorAgent.js

const {
    educationalTutor,
    generateQuiz,
    generateEmbedding
} = require("../services/gemmaService");

const retrievalAgent = require("./retrievalAgent");


// ======================================================
// Detect Student Learning Level
// ======================================================

function detectLearningLevel(studentProfile = {}) {

    const {
        grade = "",
        performance = 50,
        age = 12
    } = studentProfile;

    if (performance < 40) {
        return "beginner";
    }

    if (performance >= 40 && performance < 75) {
        return "intermediate";
    }

    return "advanced";
}


// ======================================================
// Generate Personalized Prompt Context
// ======================================================

function buildLearningContext({
    studentName,
    subject,
    topic,
    language,
    studentProfile
}) {

    const level = detectLearningLevel(studentProfile);

    return `
Student Name:
${studentName}

Subject:
${subject}

Topic:
${topic}

Preferred Language:
${language}

Student Profile:
- Grade: ${studentProfile.grade || "Unknown"}
- Age: ${studentProfile.age || "Unknown"}
- Average Performance: ${studentProfile.performance || 50}
- Learning Level: ${level}

Teaching Instructions:
- Explain concepts clearly
- Use practical examples
- Encourage curiosity
- Use supportive language
- Adapt to student's level
`;
}


// ======================================================
// Explain Topic
// ======================================================

async function explainTopic({
    question,
    studentProfile = {},
    subject = "General",
    topic = "",
    language = "English"
}) {

    try {

        const contextData =
            await retrievalAgent.retrieveEducationalContext({
                topic: topic || question,
                subject
            });

        const learningContext = buildLearningContext({
            studentName: studentProfile.name || "Student",
            subject,
            topic: topic || question,
            language,
            studentProfile
        });

        const response = await educationalTutor({

            question,

            studentLevel:
                detectLearningLevel(studentProfile),

            language,

            context: `
${learningContext}

Retrieved Notes:
${contextData.notes}

Past Examples:
${contextData.examples}
`
        });

        return {
            success: true,
            tutor_response: response.response,
            retrieved_sources: contextData.sources || []
        };

    } catch (error) {

        console.error("❌ explainTopic Error:", error);

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Adaptive Teaching Loop
// ======================================================

async function adaptiveLearningSession({

    question,
    studentAnswer,
    studentProfile = {},
    topic = "",
    subject = "General"

}) {

    try {

        // --------------------------------------------
        // Initial Explanation
        // --------------------------------------------

        const explanation =
            await explainTopic({
                question,
                studentProfile,
                topic,
                subject
            });

        // --------------------------------------------
        // Quiz Generation
        // --------------------------------------------

        const quiz =
            await generateQuiz({
                topic: topic || question,
                difficulty:
                    detectLearningLevel(studentProfile),
                questions: 3
            });

        // --------------------------------------------
        // Weakness Detection
        // --------------------------------------------

        let feedback = "";

        if (studentAnswer) {

            feedback = `
Student Answer:
${studentAnswer}

Evaluate:
- Correctness
- Misconceptions
- Weak areas
- Improvement suggestions
`;
        }

        const evaluation =
            await educationalTutor({

                question: feedback ||

                    "Provide encouragement and study tips.",

                studentLevel:
                    detectLearningLevel(studentProfile),

                language: "English",

                context: explanation.tutor_response
            });

        return {

            success: true,

            explanation:
                explanation.tutor_response,

            quiz:
                quiz.response,

            evaluation:
                evaluation.response
        };

    } catch (error) {

        console.error(
            "❌ adaptiveLearningSession Error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Detect Student Struggles
// ======================================================

async function detectStudentStruggles({

    studentMessages = [],
    studentProfile = {}

}) {

    try {

        const joinedMessages =
            studentMessages.join("\n");

        const analysisPrompt = `
Analyze this student's learning behavior.

Messages:
${joinedMessages}

Identify:
- confusion level
- frustration signs
- weak concepts
- confidence level
- recommended intervention
`;

        const analysis =
            await educationalTutor({

                question: analysisPrompt,

                studentLevel:
                    detectLearningLevel(studentProfile),

                language: "English",

                context:
                    "Educational psychology analysis"
            });

        return {
            success: true,
            analysis: analysis.response
        };

    } catch (error) {

        console.error(
            "❌ detectStudentStruggles Error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Personalized Study Plan Generator
// ======================================================

async function generateStudyPlan({

    studentProfile = {},
    weakTopics = [],
    subject = "General"

}) {

    try {

        const prompt = `
Create a personalized study plan.

Student:
${JSON.stringify(studentProfile, null, 2)}

Weak Topics:
${weakTopics.join(", ")}

Subject:
${subject}

Requirements:
- daily schedule
- revision strategy
- quizzes
- practice exercises
- motivation tips
`;

        const plan =
            await educationalTutor({

                question: prompt,

                studentLevel:
                    detectLearningLevel(studentProfile),

                language: "English",

                context:
                    "Adaptive educational planning"
            });

        return {
            success: true,
            study_plan: plan.response
        };

    } catch (error) {

        console.error(
            "❌ generateStudyPlan Error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Learning Memory Embeddings
// ======================================================

async function createLearningMemory({

    studentId,
    topic,
    notes

}) {

    try {

        const embedding =
            await generateEmbedding(
                `${topic}\n${notes}`
            );

        return {

            success: true,

            memory: {
                studentId,
                topic,
                notes,
                embedding: embedding.embedding
            }
        };

    } catch (error) {

        console.error(
            "❌ createLearningMemory Error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Homework Tutor
// ======================================================

async function assistHomework({

    homeworkQuestion,
    studentProfile = {},
    subject = "General"

}) {

    try {

        const explanation =
            await explainTopic({

                question:
                    homeworkQuestion,

                studentProfile,

                subject,

                topic:
                    homeworkQuestion
            });

        return {

            success: true,

            assistance:
                explanation.tutor_response
        };

    } catch (error) {

        console.error(
            "❌ assistHomework Error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Gamified Encouragement System
// ======================================================

function generateEncouragement({

    score = 0,
    improvement = false

}) {

    if (score >= 90) {

        return "🌟 Outstanding work! You are mastering this topic brilliantly!";
    }

    if (score >= 70) {

        return "👏 Great job! Keep practicing and you’ll become even stronger!";
    }

    if (improvement) {

        return "🚀 Huge improvement! Keep going — learning takes persistence!";
    }

    return "💡 Don't give up! Every mistake is part of learning.";
}


// ======================================================
// Exports
// ======================================================

module.exports = {

    explainTopic,

    adaptiveLearningSession,

    detectStudentStruggles,

    generateStudyPlan,

    createLearningMemory,

    assistHomework,

    generateEncouragement,

    detectLearningLevel
};