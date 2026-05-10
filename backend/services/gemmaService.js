// backend/services/gemmaService.js

const axios = require("axios");


// ======================================================
// Configuration
// ======================================================

const OLLAMA_BASE_URL =
    process.env.OLLAMA_BASE_URL ||
    "http://localhost:11434";

const DEFAULT_MODEL =
    process.env.GEMMA_MODEL ||
    "gemma4";

const REQUEST_TIMEOUT = 1000 * 60 * 5; // 5 minutes


// ======================================================
// Axios Instance
// ======================================================

const ollama = axios.create({
    baseURL: OLLAMA_BASE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
        "Content-Type": "application/json"
    }
});


// ======================================================
// Core Generate Function
// ======================================================

async function generateText({
    prompt,
    systemPrompt = "",
    model = DEFAULT_MODEL,
    temperature = 0.7,
    top_p = 0.9,
    max_tokens = 2048,
    stream = false
}) {

    try {

        const response = await ollama.post(
            "/api/generate",
            {
                model,
                prompt,
                system: systemPrompt,
                stream,

                options: {
                    temperature,
                    top_p,
                    num_predict: max_tokens
                }
            }
        );

        return {
            success: true,
            model,
            response: response.data.response
        };

    } catch (error) {

        console.error("❌ Gemma Generate Error:");

        if (error.response) {

            console.error(error.response.data);

            return {
                success: false,
                error: error.response.data
            };
        }

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Chat Completion
// ======================================================

async function chatCompletion({
    messages,
    model = DEFAULT_MODEL,
    temperature = 0.7,
    max_tokens = 2048
}) {

    try {

        const response = await ollama.post(
            "/api/chat",
            {
                model,
                messages,

                options: {
                    temperature,
                    num_predict: max_tokens
                },

                stream: false
            }
        );

        return {
            success: true,
            model,
            response: response.data.message.content
        };

    } catch (error) {

        console.error("❌ Chat Completion Error:");

        if (error.response) {

            console.error(error.response.data);

            return {
                success: false,
                error: error.response.data
            };
        }

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Educational Tutor Prompt
// ======================================================

async function educationalTutor({
    question,
    studentLevel = "beginner",
    language = "English",
    context = ""
}) {

    const systemPrompt = `
You are LocalMind AI Tutor powered by Gemma 4.

Your responsibilities:

- Teach students clearly
- Explain step-by-step
- Adapt explanations to student's level
- Use simple language
- Encourage critical thinking
- Use examples from real life
- Be supportive and motivating
- If useful, include Swahili phrases
- Never shame students
- Focus on understanding, not memorization

Student Level:
${studentLevel}

Preferred Language:
${language}
`;

    const prompt = `
Context:
${context}

Student Question:
${question}

Provide:
1. Simple explanation
2. Step-by-step breakdown
3. Real-world example
4. Mini practice question
`;

    return await generateText({
        prompt,
        systemPrompt,
        temperature: 0.6,
        max_tokens: 2500
    });
}


// ======================================================
// Quiz Generator
// ======================================================

async function generateQuiz({
    topic,
    difficulty = "medium",
    questions = 5
}) {

    const prompt = `
Generate ${questions} quiz questions about:

${topic}

Difficulty:
${difficulty}

Requirements:
- Multiple choice
- Include correct answer
- Include explanations
- Educational quality
- Curriculum aligned
`;

    return await generateText({
        prompt,
        temperature: 0.5,
        max_tokens: 3000
    });
}


// ======================================================
// Classroom Analytics AI
// ======================================================

async function analyzeClassroom({
    classroomData
}) {

    const prompt = `
Analyze this classroom performance data:

${JSON.stringify(classroomData, null, 2)}

Provide:

1. Weak topics
2. Strong topics
3. Struggling students
4. Suggested interventions
5. Recommended teaching adjustments
6. Priority actions for teacher
`;

    return await generateText({
        prompt,
        temperature: 0.4,
        max_tokens: 3000
    });
}


// ======================================================
// Lesson Plan Generator
// ======================================================

async function generateLessonPlan({
    topic,
    gradeLevel,
    duration
}) {

    const prompt = `
Create a lesson plan.

Topic:
${topic}

Grade Level:
${gradeLevel}

Duration:
${duration}

Include:
- Objectives
- Introduction
- Main lesson
- Activities
- Assessment
- Homework
- Teacher notes
`;

    return await generateText({
        prompt,
        temperature: 0.7,
        max_tokens: 4000
    });
}


// ======================================================
// Homework Assistance
// ======================================================

async function explainHomework({
    question,
    imageDescription = ""
}) {

    const prompt = `
A student needs help with homework.

Question:
${question}

Image Details:
${imageDescription}

Explain carefully step-by-step.
Do not just give final answer immediately.
`;

    return await generateText({
        prompt,
        temperature: 0.6,
        max_tokens: 2500
    });
}


// ======================================================
// Swahili Translation Support
// ======================================================

async function translateEducationalContent({
    text,
    targetLanguage = "Swahili"
}) {

    const prompt = `
Translate the following educational content into ${targetLanguage}.

Requirements:
- Preserve educational meaning
- Keep terminology understandable
- Student-friendly tone

Text:
${text}
`;

    return await generateText({
        prompt,
        temperature: 0.3,
        max_tokens: 2500
    });
}


// ======================================================
// Model Health Check
// ======================================================

async function checkModelHealth() {

    try {

        const response = await ollama.get("/api/tags");

        return {
            success: true,
            models: response.data.models || [],
            ollama_online: true
        };

    } catch (error) {

        return {
            success: false,
            ollama_online: false,
            error: error.message
        };
    }
}


// ======================================================
// Pull Model Automatically
// ======================================================

async function pullModel(model = DEFAULT_MODEL) {

    try {

        const response = await ollama.post(
            "/api/pull",
            {
                name: model,
                stream: false
            }
        );

        return {
            success: true,
            response: response.data
        };

    } catch (error) {

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Embedding Generator
// ======================================================

async function generateEmbedding(text) {

    try {

        const response = await ollama.post(
            "/api/embeddings",
            {
                model: DEFAULT_MODEL,
                prompt: text
            }
        );

        return {
            success: true,
            embedding: response.data.embedding
        };

    } catch (error) {

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Streaming Response Support
// ======================================================

async function streamGenerate({
    prompt,
    res,
    systemPrompt = "",
    model = DEFAULT_MODEL
}) {

    try {

        const response = await ollama.post(
            "/api/generate",
            {
                model,
                prompt,
                system: systemPrompt,
                stream: true
            },
            {
                responseType: "stream"
            }
        );

        response.data.on("data", (chunk) => {

            const lines = chunk
                .toString()
                .split("\n")
                .filter(Boolean);

            for (const line of lines) {

                try {

                    const parsed = JSON.parse(line);

                    if (parsed.response) {

                        res.write(parsed.response);
                    }

                } catch (err) {

                    console.error("Stream parse error:", err);
                }
            }
        });

        response.data.on("end", () => {

            res.end();
        });

    } catch (error) {

        console.error("Streaming Error:", error);

        res.status(500).send("Streaming failed");
    }
}


// ======================================================
// Exports
// ======================================================

module.exports = {

    generateText,

    chatCompletion,

    educationalTutor,

    generateQuiz,

    analyzeClassroom,

    generateLessonPlan,

    explainHomework,

    translateEducationalContent,

    generateEmbedding,

    streamGenerate,

    checkModelHealth,

    pullModel
};