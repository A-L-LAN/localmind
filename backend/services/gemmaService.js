// backend/services/gemmaService.js

const axios = require("axios");
require("dotenv").config();


// ======================================================
// CONFIGURATION
// ======================================================

const OLLAMA_BASE_URL =
    process.env.OLLAMA_BASE_URL ||
    "http://localhost:11434";

const DEFAULT_MODEL =
    process.env.GEMMA_MODEL ||
    "gemma4:latest";

const REQUEST_TIMEOUT =
    1000 * 60 * 5; // 5 minutes


// ======================================================
// AXIOS INSTANCE
// ======================================================

const ollama = axios.create({
    baseURL: OLLAMA_BASE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
        "Content-Type": "application/json"
    }
});


// ======================================================
// GENERIC TEXT GENERATION
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
            response:
                response.data.response
        };

    } catch (error) {

        console.error(
            "❌ Gemma Generate Error:"
        );

        return {
            success: false,
            error:
                error.response?.data ||
                error.message
        };
    }
}


// ======================================================
// CHAT COMPLETION
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
                    num_predict:
                        max_tokens
                },

                stream: false
            }
        );

        return {
            success: true,
            model,
            response:
                response.data.message
                    .content
        };

    } catch (error) {

        console.error(
            "❌ Chat Completion Error"
        );

        return {
            success: false,
            error:
                error.response?.data ||
                error.message
        };
    }
}


// ======================================================
// EDUCATIONAL AI TUTOR
// ======================================================

async function educationalTutor({
    question,
    studentLevel = "beginner",
    language = "English",
    context = ""
}) {

    const systemPrompt = `
You are EduWeave AI Tutor powered by Gemma 4 E4B-IT.

ROLE:
You are an intelligent, patient, and supportive teacher.

RULES:
- Teach clearly
- Explain step-by-step
- Adapt to student level
- Use simple language
- Use examples
- Encourage understanding
- Be motivating
- Never shame students
- Use English and Swahili if helpful
- Encourage critical thinking

Student Level:
${studentLevel}

Preferred Language:
${language}
`;

    const prompt = `
Learning Context:
${context}

Student Question:
${question}

Provide:

1. Clear explanation
2. Step-by-step teaching
3. Real-world example
4. Quick recap
5. Mini practice question
`;

    return await generateText({
        prompt,
        systemPrompt,
        temperature: 0.6,
        max_tokens: 2500
    });
}


// ======================================================
// QUIZ GENERATOR
// ======================================================

async function generateQuiz({
    topic,
    difficulty = "medium",
    questions = 5
}) {

    const prompt = `
Generate ${questions}
educational quiz questions.

Topic:
${topic}

Difficulty:
${difficulty}

Requirements:
- Multiple choice
- Correct answer
- Explanation
- Curriculum aligned
- Student friendly
`;

    return await generateText({
        prompt,
        temperature: 0.5,
        max_tokens: 3000
    });
}


// ======================================================
// CLASSROOM ANALYTICS
// ======================================================

async function analyzeClassroom({
    classroomData
}) {

    const prompt = `
Analyze classroom data.

Data:
${JSON.stringify(
    classroomData,
    null,
    2
)}

Provide:

1. Weak topics
2. Strong topics
3. Students needing help
4. Intervention ideas
5. Teaching improvements
6. Priority recommendations
`;

    return await generateText({
        prompt,
        temperature: 0.4,
        max_tokens: 3000
    });
}


// ======================================================
// LESSON PLAN GENERATOR
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

Grade:
${gradeLevel}

Duration:
${duration}

Include:

- Objectives
- Introduction
- Main teaching
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
// HOMEWORK EXPLAINER
// ======================================================

async function explainHomework({
    question,
    imageDescription = ""
}) {

    const prompt = `
A student needs help.

Question:
${question}

Image Context:
${imageDescription}

Explain carefully
step-by-step.

Do not immediately give
the final answer.
Teach first.
`;

    return await generateText({
        prompt,
        temperature: 0.6,
        max_tokens: 2500
    });
}


// ======================================================
// EDUCATIONAL TRANSLATION
// ======================================================

async function translateEducationalContent({
    text,
    targetLanguage = "Swahili"
}) {

    const prompt = `
Translate this educational content into:

${targetLanguage}

Rules:
- Keep meaning accurate
- Student friendly
- Educational tone

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
// EMBEDDING GENERATION
// FOR CHROMADB / RAG
// ======================================================

async function generateEmbedding(
    text
) {

    try {

        const response =
            await ollama.post(
                "/api/embeddings",
                {
                    model:
                        DEFAULT_MODEL,
                    prompt: text
                }
            );

        return {
            success: true,
            embedding:
                response.data.embedding
        };

    } catch (error) {

        return {
            success: false,
            error:
                error.response?.data ||
                error.message
        };
    }
}


// ======================================================
// STREAMING SUPPORT
// ======================================================

async function streamGenerate({
    prompt,
    res,
    systemPrompt = "",
    model = DEFAULT_MODEL
}) {

    try {

        const response =
            await ollama.post(
                "/api/generate",
                {
                    model,
                    prompt,
                    system:
                        systemPrompt,
                    stream: true
                },
                {
                    responseType:
                        "stream"
                }
            );

        response.data.on(
            "data",
            (chunk) => {

                const lines =
                    chunk
                        .toString()
                        .split("\n")
                        .filter(Boolean);

                for (
                    const line of lines
                ) {

                    try {

                        const parsed =
                            JSON.parse(
                                line
                            );

                        if (
                            parsed.response
                        ) {

                            res.write(
                                parsed.response
                            );
                        }

                    } catch (err) {

                        console.error(
                            "Stream parse error:",
                            err.message
                        );
                    }
                }
            }
        );

        response.data.on(
            "end",
            () => {

                res.end();
            }
        );

    } catch (error) {

        console.error(
            "❌ Streaming Error:",
            error.message
        );

        res.status(500).send(
            "Streaming failed"
        );
    }
}


// ======================================================
// HEALTH CHECK
// ======================================================

async function checkModelHealth() {

    try {

        const response =
            await ollama.get(
                "/api/tags"
            );

        return {
            success: true,
            ollama_online: true,
            current_model:
                DEFAULT_MODEL,
            models:
                response.data.models
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
// AUTO MODEL DOWNLOAD
// ======================================================

async function pullModel(
    model = DEFAULT_MODEL
) {

    try {

        const response =
            await ollama.post(
                "/api/pull",
                {
                    name: model,
                    stream: false
                }
            );

        return {
            success: true,
            response:
                response.data
        };

    } catch (error) {

        return {
            success: false,
            error:
                error.response?.data ||
                error.message
        };
    }
}


// ======================================================
// MULTIMODAL IMAGE SUPPORT
// HOMEWORK SCANNER
// ======================================================

async function analyzeImage({
    prompt,
    imageBase64,
    model = DEFAULT_MODEL
}) {

    try {

        const response =
            await ollama.post(
                "/api/generate",
                {
                    model,
                    prompt,
                    images: [
                        imageBase64
                    ],
                    stream: false
                }
            );

        return {
            success: true,
            response:
                response.data.response
        };

    } catch (error) {

        return {
            success: false,
            error:
                error.response?.data ||
                error.message
        };
    }
}


// ======================================================
// EXPORTS
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

    pullModel,

    analyzeImage
};