// backend/agents/assessmentAgent.js

const {
    generateQuiz,
    educationalTutor,
    generateEmbedding
} = require("../services/gemmaService");

const retrievalAgent = require("./retrievalAgent");


// ======================================================
// Difficulty Levels
// ======================================================

const DIFFICULTY_LEVELS = {
    beginner: {
        questions: 3,
        complexity: "simple"
    },

    intermediate: {
        questions: 5,
        complexity: "moderate"
    },

    advanced: {
        questions: 10,
        complexity: "challenging"
    }
};


// ======================================================
// Create Assessment
// ======================================================

async function createAssessment({

    topic,
    subject = "General",
    level = "beginner",
    curriculum = "KCSE"

}) {

    try {

        const config =
            DIFFICULTY_LEVELS[level] ||
            DIFFICULTY_LEVELS.beginner;

        // --------------------------------------------
        // Retrieve educational context
        // --------------------------------------------

        const retrieval =
            await retrievalAgent.retrieveEducationalContext({
                topic,
                subject
            });

        const prompt = `
Create an educational assessment.

Subject:
${subject}

Topic:
${topic}

Curriculum:
${curriculum}

Difficulty:
${config.complexity}

Requirements:
- ${config.questions} questions
- Include answers
- Include explanations
- Include marking scheme
- Align with ${curriculum}
- Encourage critical thinking

Retrieved Notes:
${retrieval.notes}
`;

        const assessment =
            await educationalTutor({

                question: prompt,

                studentLevel: level,

                language: "English",

                context:
                    retrieval.notes
            });

        return {

            success: true,

            assessment:
                assessment.response,

            metadata: {
                topic,
                subject,
                level,
                curriculum,
                questions:
                    config.questions
            }
        };

    } catch (error) {

        console.error(
            "❌ createAssessment Error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Auto Quiz Generator
// ======================================================

async function generateAdaptiveQuiz({

    topic,
    performance = 50

}) {

    try {

        let difficulty = "beginner";

        if (performance >= 40 && performance < 75) {
            difficulty = "intermediate";
        }

        if (performance >= 75) {
            difficulty = "advanced";
        }

        const quiz =
            await generateQuiz({

                topic,

                difficulty,

                questions:
                    DIFFICULTY_LEVELS[difficulty]
                        .questions
            });

        return {

            success: true,

            difficulty,

            quiz:
                quiz.response
        };

    } catch (error) {

        console.error(
            "❌ generateAdaptiveQuiz Error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Evaluate Student Answer
// ======================================================

async function evaluateAnswer({

    question,
    studentAnswer,
    correctAnswer,
    level = "beginner"

}) {

    try {

        const prompt = `
Evaluate this student's answer.

Question:
${question}

Student Answer:
${studentAnswer}

Correct Answer:
${correctAnswer}

Provide:
1. Score out of 100
2. Mistakes
3. Correct explanation
4. Suggestions for improvement
5. Encouraging feedback
`;

        const evaluation =
            await educationalTutor({

                question: prompt,

                studentLevel: level,

                language: "English",

                context:
                    "Educational answer evaluation"
            });

        return {

            success: true,

            evaluation:
                evaluation.response
        };

    } catch (error) {

        console.error(
            "❌ evaluateAnswer Error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Misconception Detector
// ======================================================

async function detectMisconceptions({

    topic,
    studentAnswers = []

}) {

    try {

        const prompt = `
Analyze these student answers.

Topic:
${topic}

Answers:
${JSON.stringify(studentAnswers, null, 2)}

Identify:
- recurring misconceptions
- weak concepts
- probable confusion causes
- intervention strategies
`;

        const analysis =
            await educationalTutor({

                question: prompt,

                studentLevel: "intermediate",

                language: "English",

                context:
                    "Educational misconception analysis"
            });

        return {

            success: true,

            misconceptions:
                analysis.response
        };

    } catch (error) {

        console.error(
            "❌ detectMisconceptions Error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Generate Performance Report
// ======================================================

async function generatePerformanceReport({

    studentName,
    subject,
    assessments = []

}) {

    try {

        const prompt = `
Generate a student performance report.

Student:
${studentName}

Subject:
${subject}

Assessment Data:
${JSON.stringify(assessments, null, 2)}

Include:
- strengths
- weaknesses
- trends
- recommendations
- motivational feedback
`;

        const report =
            await educationalTutor({

                question: prompt,

                studentLevel: "intermediate",

                language: "English",

                context:
                    "Educational reporting system"
            });

        return {

            success: true,

            report:
                report.response
        };

    } catch (error) {

        console.error(
            "❌ generatePerformanceReport Error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Bloom's Taxonomy Question Generator
// ======================================================

async function generateBloomsQuestions({

    topic,
    level = "beginner"

}) {

    try {

        const prompt = `
Generate educational questions based on Bloom's Taxonomy.

Topic:
${topic}

Student Level:
${level}

Create:
1. Remembering question
2. Understanding question
3. Applying question
4. Analyzing question
5. Evaluating question
6. Creating question
`;

        const response =
            await educationalTutor({

                question: prompt,

                studentLevel: level,

                language: "English",

                context:
                    "Bloom taxonomy educational design"
            });

        return {

            success: true,

            blooms_questions:
                response.response
        };

    } catch (error) {

        console.error(
            "❌ generateBloomsQuestions Error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Oral Assessment Generator
// ======================================================

async function generateOralAssessment({

    topic,
    level = "beginner"

}) {

    try {

        const prompt = `
Create oral assessment questions.

Topic:
${topic}

Level:
${level}

Requirements:
- conversational questions
- confidence-building
- oral fluency support
- follow-up prompts
`;

        const oralAssessment =
            await educationalTutor({

                question: prompt,

                studentLevel: level,

                language: "English",

                context:
                    "Oral educational assessment"
            });

        return {

            success: true,

            oral_assessment:
                oralAssessment.response
        };

    } catch (error) {

        console.error(
            "❌ generateOralAssessment Error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Assessment Memory Embedding
// ======================================================

async function createAssessmentEmbedding({

    assessmentId,
    topic,
    content

}) {

    try {

        const embedding =
            await generateEmbedding(
                `${topic}\n${content}`
            );

        return {

            success: true,

            embedding: {
                assessmentId,
                topic,
                vector:
                    embedding.embedding
            }
        };

    } catch (error) {

        console.error(
            "❌ createAssessmentEmbedding Error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Generate Exam Predictions
// ======================================================

async function predictExamPerformance({

    studentProfile = {},
    historicalScores = []

}) {

    try {

        const prompt = `
Predict educational performance.

Student Profile:
${JSON.stringify(studentProfile, null, 2)}

Historical Scores:
${JSON.stringify(historicalScores, null, 2)}

Provide:
- predicted performance
- confidence level
- risk factors
- improvement strategy
`;

        const prediction =
            await educationalTutor({

                question: prompt,

                studentLevel: "advanced",

                language: "English",

                context:
                    "Educational predictive analytics"
            });

        return {

            success: true,

            prediction:
                prediction.response
        };

    } catch (error) {

        console.error(
            "❌ predictExamPerformance Error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Exports
// ======================================================

module.exports = {

    createAssessment,

    generateAdaptiveQuiz,

    evaluateAnswer,

    detectMisconceptions,

    generatePerformanceReport,

    generateBloomsQuestions,

    generateOralAssessment,

    createAssessmentEmbedding,

    predictExamPerformance
};