// backend/agents/retrievalAgent.js

const fs = require("fs");
const path = require("path");

const {
    generateEmbedding,
    educationalTutor
} = require("../services/gemmaService");


// ======================================================
// Knowledge Base Paths
// ======================================================

const KNOWLEDGE_BASE_PATH =
    path.join(__dirname, "../knowledge");

const CACHE_PATH =
    path.join(__dirname, "../cache");


// ======================================================
// Ensure Required Directories Exist
// ======================================================

function ensureDirectories() {

    if (!fs.existsSync(KNOWLEDGE_BASE_PATH)) {

        fs.mkdirSync(KNOWLEDGE_BASE_PATH, {
            recursive: true
        });
    }

    if (!fs.existsSync(CACHE_PATH)) {

        fs.mkdirSync(CACHE_PATH, {
            recursive: true
        });
    }
}

ensureDirectories();


// ======================================================
// Read All Knowledge Files
// ======================================================

function readKnowledgeFiles() {

    try {

        const files =
            fs.readdirSync(KNOWLEDGE_BASE_PATH);

        let documents = [];

        files.forEach((file) => {

            const filePath =
                path.join(KNOWLEDGE_BASE_PATH, file);

            const stats =
                fs.statSync(filePath);

            if (stats.isFile()) {

                const content =
                    fs.readFileSync(
                        filePath,
                        "utf8"
                    );

                documents.push({
                    file,
                    content
                });
            }
        });

        return documents;

    } catch (error) {

        console.error(
            "❌ readKnowledgeFiles Error:",
            error
        );

        return [];
    }
}


// ======================================================
// Simple Keyword Retrieval
// ======================================================

function keywordSearch({

    topic,
    documents = []

}) {

    const lowerTopic =
        topic.toLowerCase();

    const matches = [];

    documents.forEach((doc) => {

        if (
            doc.content
                .toLowerCase()
                .includes(lowerTopic)
        ) {

            matches.push(doc);
        }
    });

    return matches;
}


// ======================================================
// Semantic Retrieval (Basic)
// ======================================================

async function semanticSearch({

    topic,
    documents = []

}) {

    try {

        const topicEmbedding =
            await generateEmbedding(topic);

        // Placeholder similarity ranking
        // Future: cosine similarity

        const rankedDocuments =
            documents.map((doc) => ({

                file: doc.file,

                content: doc.content,

                score: Math.random()
            }));

        rankedDocuments.sort(
            (a, b) => b.score - a.score
        );

        return rankedDocuments.slice(0, 5);

    } catch (error) {

        console.error(
            "❌ semanticSearch Error:",
            error
        );

        return [];
    }
}


// ======================================================
// Retrieve Educational Context
// ======================================================

async function retrieveEducationalContext({

    topic,
    subject = "General"

}) {

    try {

        const documents =
            readKnowledgeFiles();

        // --------------------------------------------
        // Keyword Search
        // --------------------------------------------

        const keywordResults =
            keywordSearch({
                topic,
                documents
            });

        // --------------------------------------------
        // Semantic Search
        // --------------------------------------------

        const semanticResults =
            await semanticSearch({
                topic,
                documents
            });

        // --------------------------------------------
        // Merge Results
        // --------------------------------------------

        const mergedContent = [
            ...keywordResults,
            ...semanticResults
        ];

        const uniqueSources =
            [...new Set(
                mergedContent.map(
                    item => item.file
                )
            )];

        let combinedText = "";

        mergedContent.forEach((item) => {

            combinedText += `
==================================================
SOURCE: ${item.file}
==================================================

${item.content}

`;
        });

        return {

            success: true,

            topic,

            subject,

            notes:
                combinedText.slice(0, 12000),

            examples:
                combinedText.slice(0, 4000),

            sources:
                uniqueSources
        };

    } catch (error) {

        console.error(
            "❌ retrieveEducationalContext Error:",
            error
        );

        return {

            success: false,

            error: error.message,

            notes: "",

            examples: "",

            sources: []
        };
    }
}


// ======================================================
// Save Knowledge Document
// ======================================================

async function saveKnowledgeDocument({

    filename,
    content

}) {

    try {

        const safeFilename =
            filename.replace(/\s+/g, "_");

        const filePath =
            path.join(
                KNOWLEDGE_BASE_PATH,
                safeFilename
            );

        fs.writeFileSync(
            filePath,
            content,
            "utf8"
        );

        return {

            success: true,

            message:
                "Knowledge document saved.",

            filePath
        };

    } catch (error) {

        console.error(
            "❌ saveKnowledgeDocument Error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Retrieve Similar Educational Examples
// ======================================================

async function retrieveExamples({

    topic

}) {

    try {

        const documents =
            readKnowledgeFiles();

        const results =
            await semanticSearch({
                topic,
                documents
            });

        let examples = "";

        results.forEach((result) => {

            examples += `
--------------------------------------------
EXAMPLE SOURCE:
${result.file}
--------------------------------------------

${result.content}

`;
        });

        return {

            success: true,

            topic,

            examples
        };

    } catch (error) {

        console.error(
            "❌ retrieveExamples Error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Generate Context Summary
// ======================================================

async function summarizeKnowledge({

    topic

}) {

    try {

        const retrieved =
            await retrieveEducationalContext({
                topic
            });

        const summary =
            await educationalTutor({

                question: `
Summarize these educational notes.

Topic:
${topic}

Notes:
${retrieved.notes}
`,

                studentLevel: "intermediate",

                language: "English",

                context:
                    "Educational summarization"
            });

        return {

            success: true,

            summary:
                summary.response
        };

    } catch (error) {

        console.error(
            "❌ summarizeKnowledge Error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Build Vector Cache
// ======================================================

async function buildVectorCache() {

    try {

        const documents =
            readKnowledgeFiles();

        const cache = [];

        for (const doc of documents) {

            const embedding =
                await generateEmbedding(
                    doc.content.slice(0, 3000)
                );

            cache.push({

                file: doc.file,

                embedding:
                    embedding.embedding
            });
        }

        const cacheFile =
            path.join(
                CACHE_PATH,
                "vector-cache.json"
            );

        fs.writeFileSync(
            cacheFile,
            JSON.stringify(cache, null, 2)
        );

        return {

            success: true,

            vectors:
                cache.length
        };

    } catch (error) {

        console.error(
            "❌ buildVectorCache Error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Retrieve by Subject
// ======================================================

async function retrieveBySubject({

    subject

}) {

    try {

        const documents =
            readKnowledgeFiles();

        const filtered =
            documents.filter((doc) =>
                doc.file
                    .toLowerCase()
                    .includes(
                        subject.toLowerCase()
                    )
            );

        return {

            success: true,

            subject,

            documents: filtered
        };

    } catch (error) {

        console.error(
            "❌ retrieveBySubject Error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Search Curriculum Materials
// ======================================================

async function searchCurriculum({

    curriculum = "KCSE",
    topic

}) {

    try {

        const retrieved =
            await retrieveEducationalContext({
                topic
            });

        const prompt = `
Analyze whether these materials align with the curriculum.

Curriculum:
${curriculum}

Topic:
${topic}

Materials:
${retrieved.notes}

Provide:
- alignment analysis
- gaps
- recommendations
`;

        const analysis =
            await educationalTutor({

                question: prompt,

                studentLevel: "advanced",

                language: "English",

                context:
                    "Curriculum alignment retrieval"
            });

        return {

            success: true,

            curriculum,

            analysis:
                analysis.response
        };

    } catch (error) {

        console.error(
            "❌ searchCurriculum Error:",
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

    retrieveEducationalContext,

    saveKnowledgeDocument,

    retrieveExamples,

    summarizeKnowledge,

    buildVectorCache,

    retrieveBySubject,

    searchCurriculum,

    semanticSearch,

    keywordSearch,

    readKnowledgeFiles
};