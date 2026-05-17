// backend/agents/studentTutorAgent.js

const {

    educationalTutor,
    generateQuiz,
    generateEmbedding,
    explainHomework

} = require("../services/gemmaService");

const retrievalAgent =
    require("./retrievalAgent");


// ======================================================
// LEARNING LEVEL DETECTION
// ======================================================

function detectLearningLevel(
    studentProfile = {}
) {

    const {

        grade = "",
        performance = 50,
        age = 12

    } = studentProfile;

    if (
        performance < 40 ||
        age <= 10
    ) {

        return "beginner";
    }

    if (
        performance >= 40 &&
        performance < 75
    ) {

        return "intermediate";
    }

    return "advanced";
}


// ======================================================
// BUILD EDUCATIONAL CONTEXT
// ======================================================

function buildLearningContext({

    studentName,
    subject,
    topic,
    language,
    studentProfile

}) {

    const level =
        detectLearningLevel(
            studentProfile
        );

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
- Grade:
${studentProfile.grade || "Unknown"}

- Age:
${studentProfile.age || "Unknown"}

- Performance:
${studentProfile.performance || 50}

- Learning Level:
${level}

Teaching Style:
- Explain patiently
- Step-by-step teaching
- Use examples
- Use simple English
- Use Swahili when useful
- Encourage confidence
- Encourage curiosity
- Relate concepts to real life
`;
}


// ======================================================
// EXPLAIN TOPIC
// ======================================================

async function explainTopic({

    question,
    studentProfile = {},
    subject = "General",
    topic = "",
    language = "English"

}) {

    try {

        const level =
            detectLearningLevel(
                studentProfile
            );

        // ---------------------------------
        // Retrieve Educational Notes
        // ---------------------------------

        const contextData =
            await retrievalAgent
                .retrieveEducationalContext({

                    topic:
                        topic ||
                        question,

                    subject
                });

        // ---------------------------------
        // Build Personalized Context
        // ---------------------------------

        const learningContext =
            buildLearningContext({

                studentName:
                    studentProfile.name ||
                    "Student",

                subject,

                topic:
                    topic ||
                    question,

                language,

                studentProfile
            });

        // ---------------------------------
        // Tutor Request
        // ---------------------------------

        const response =
            await educationalTutor({

                question,

                studentLevel:
                    level,

                language,

                context: `
${learningContext}

Retrieved Notes:
${contextData.notes || ""}

Examples:
${contextData.examples || ""}

Teaching Rules:
1. Explain clearly
2. Teach step-by-step
3. Avoid difficult words
4. Use examples
5. Give recap
6. Give mini exercise
`
            });

        return {

            success: true,

            tutor_response:
                response.response,

            learning_level:
                level,

            retrieved_sources:
                contextData.sources || []
        };

    } catch (error) {

        console.error(
            "❌ explainTopic Error:",
            error
        );

        return {

            success: false,
            error:
                error.message
        };
    }
}


// ======================================================
// ADAPTIVE LEARNING SESSION
// ======================================================

async function adaptiveLearningSession({

    question,
    studentAnswer,
    studentProfile = {},
    topic = "",
    subject = "General"

}) {

    try {

        // ---------------------------------
        // STEP 1: Explain Topic
        // ---------------------------------

        const explanation =
            await explainTopic({

                question,
                studentProfile,
                topic,
                subject
            });

        // ---------------------------------
        // STEP 2: Generate Quiz
        // ---------------------------------

        const quiz =
            await generateQuiz({

                topic:
                    topic ||
                    question,

                difficulty:
                    detectLearningLevel(
                        studentProfile
                    ),

                questions: 3
            });

        // ---------------------------------
        // STEP 3: Evaluate Student
        // ---------------------------------

        let evaluation =
            null;

        if (studentAnswer) {

            evaluation =
                await educationalTutor({

                    question: `
Question:
${question}

Student Answer:
${studentAnswer}

Evaluate:

1. Correctness
2. Misconceptions
3. Weak areas
4. Improvement suggestions
5. Encouragement
`,

                    studentLevel:
                        detectLearningLevel(
                            studentProfile
                        ),

                    language:
                        "English",

                    context:
                        explanation
                            .tutor_response
                });
        }

        return {

            success: true,

            explanation:
                explanation
                    .tutor_response,

            quiz:
                quiz.response,

            evaluation:
                evaluation
                    ?.response ||

                "Keep practicing! You're doing great.",

            encouragement:
                generateEncouragement({

                    improvement: true
                })
        };

    } catch (error) {

        console.error(
            "❌ adaptiveLearningSession Error:",
            error
        );

        return {

            success: false,
            error:
                error.message
        };
    }
}


// ======================================================
// STUDENT STRUGGLE DETECTOR
// ======================================================

async function detectStudentStruggles({

    studentMessages = [],
    studentProfile = {}

}) {

    try {

        const messages =
            studentMessages.join(
                "\n"
            );

        const analysis =
            await educationalTutor({

                question: `
Analyze this student.

Messages:
${messages}

Identify:

1. Confusion level
2. Frustration signs
3. Weak concepts
4. Confidence level
5. Recommended intervention
`,

                studentLevel:
                    detectLearningLevel(
                        studentProfile
                    ),

                language:
                    "English",

                context:
                    "Educational psychology analysis"
            });

        return {

            success: true,

            analysis:
                analysis.response
        };

    } catch (error) {

        console.error(
            "❌ detectStudentStruggles Error:",
            error
        );

        return {

            success: false,
            error:
                error.message
        };
    }
}


// ======================================================
// STUDY PLAN GENERATOR
// ======================================================

async function generateStudyPlan({

    studentProfile = {},
    weakTopics = [],
    subject = "General"

}) {

    try {

        const response =
            await educationalTutor({

                question: `
Create a personalized study plan.

Student:
${JSON.stringify(
    studentProfile,
    null,
    2
)}

Weak Topics:
${weakTopics.join(
    ", "
)}

Subject:
${subject}

Requirements:

- daily study schedule
- revision strategy
- quizzes
- exercises
- motivation tips
- exam preparation
`,

                studentLevel:
                    detectLearningLevel(
                        studentProfile
                    ),

                language:
                    "English",

                context:
                    "Adaptive learning planning"
            });

        return {

            success: true,

            study_plan:
                response.response
        };

    } catch (error) {

        console.error(
            "❌ generateStudyPlan Error:",
            error
        );

        return {

            success: false,
            error:
                error.message
        };
    }
}


// ======================================================
// LEARNING MEMORY
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

                embedding:
                    embedding.embedding
            }
        };

    } catch (error) {

        console.error(
            "❌ createLearningMemory Error:",
            error
        );

        return {

            success: false,
            error:
                error.message
        };
    }
}


// ======================================================
// HOMEWORK ASSISTANT
// ======================================================

async function assistHomework({

    homeworkQuestion,
    studentProfile = {},
    subject = "General"

}) {

    try {

        const response =
            await explainHomework({

                question:
                    homeworkQuestion
            });

        return {

            success: true,

            assistance:
                response.response
        };

    } catch (error) {

        console.error(
            "❌ assistHomework Error:",
            error
        );

        return {

            success: false,
            error:
                error.message
        };
    }
}


// ======================================================
// ENCOURAGEMENT ENGINE
// ======================================================

function generateEncouragement({

    score = 0,
    improvement = false

}) {

    if (score >= 90) {

        return `
🌟 Outstanding work!
You are mastering
this topic brilliantly!
`;
    }

    if (score >= 70) {

        return `
👏 Great job!

Keep practicing and
you'll become even
stronger!
`;
    }

    if (improvement) {

        return `
🚀 Huge improvement!

Keep going —
learning takes persistence!
`;
    }

    return `
💡 Don't give up!

Every mistake is
part of learning.
`;
}


// ======================================================
// EXPORTS
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