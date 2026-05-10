// backend/agents/teacherAgent.js

const {
    analyzeClassroom,
    educationalTutor,
    generateLessonPlan,
    generateEmbedding
} = require("../services/gemmaService");

const retrievalAgent = require("./retrievalAgent");


// ======================================================
// Analyze Full Classroom Performance
// ======================================================

async function analyzeClassPerformance({

    classroomName = "Unnamed Classroom",
    subject = "General",
    studentData = []

}) {

    try {

        const analytics =
            await analyzeClassroom({
                classroomData: {
                    classroomName,
                    subject,
                    studentData
                }
            });

        return {

            success: true,

            classroom: classroomName,

            subject,

            analysis:
                analytics.response
        };

    } catch (error) {

        console.error(
            "❌ analyzeClassPerformance Error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Detect At-Risk Students
// ======================================================

async function detectAtRiskStudents({

    studentData = []

}) {

    try {

        const prompt = `
Analyze these student records.

Student Data:
${JSON.stringify(studentData, null, 2)}

Identify:
- at-risk students
- performance decline
- absenteeism patterns
- weak subjects
- emotional distress indicators
- recommended interventions
`;

        const analysis =
            await educationalTutor({

                question: prompt,

                studentLevel: "advanced",

                language: "English",

                context:
                    "Educational risk assessment"
            });

        return {

            success: true,

            at_risk_analysis:
                analysis.response
        };

    } catch (error) {

        console.error(
            "❌ detectAtRiskStudents Error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Generate AI Lesson Plan
// ======================================================

async function createLessonPlan({

    topic,
    subject = "General",
    gradeLevel = "Secondary",
    duration = "40 minutes"

}) {

    try {

        const retrieved =
            await retrievalAgent.retrieveEducationalContext({
                topic,
                subject
            });

        const lesson =
            await generateLessonPlan({

                topic,

                gradeLevel,

                duration
            });

        return {

            success: true,

            lesson_plan:
                lesson.response,

            supporting_materials:
                retrieved.notes
        };

    } catch (error) {

        console.error(
            "❌ createLessonPlan Error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Generate Classroom Insights
// ======================================================

async function generateClassroomInsights({

    classroomMetrics = {}

}) {

    try {

        const prompt = `
Analyze this classroom data.

Metrics:
${JSON.stringify(classroomMetrics, null, 2)}

Provide:
- engagement trends
- strongest topics
- weakest topics
- student participation analysis
- learning gaps
- teaching recommendations
`;

        const insights =
            await educationalTutor({

                question: prompt,

                studentLevel: "advanced",

                language: "English",

                context:
                    "AI classroom analytics"
            });

        return {

            success: true,

            insights:
                insights.response
        };

    } catch (error) {

        console.error(
            "❌ generateClassroomInsights Error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Curriculum Alignment Agent
// ======================================================

async function alignCurriculum({

    curriculum = "KCSE",
    topic,
    subject = "General"

}) {

    try {

        const prompt = `
Align this lesson topic with curriculum standards.

Curriculum:
${curriculum}

Subject:
${subject}

Topic:
${topic}

Provide:
- curriculum objectives
- competencies
- expected outcomes
- assessment alignment
- teaching recommendations
`;

        const alignment =
            await educationalTutor({

                question: prompt,

                studentLevel: "advanced",

                language: "English",

                context:
                    "Curriculum alignment system"
            });

        return {

            success: true,

            curriculum_alignment:
                alignment.response
        };

    } catch (error) {

        console.error(
            "❌ alignCurriculum Error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Smart Classroom Grouping
// ======================================================

async function createStudentGroups({

    students = [],
    strategy = "mixed"

}) {

    try {

        const prompt = `
Create classroom learning groups.

Grouping Strategy:
${strategy}

Students:
${JSON.stringify(students, null, 2)}

Requirements:
- balanced collaboration
- skill diversity
- peer learning optimization
- fair distribution
`;

        const groups =
            await educationalTutor({

                question: prompt,

                studentLevel: "advanced",

                language: "English",

                context:
                    "AI classroom grouping"
            });

        return {

            success: true,

            student_groups:
                groups.response
        };

    } catch (error) {

        console.error(
            "❌ createStudentGroups Error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Attendance Pattern Analysis
// ======================================================

async function analyzeAttendance({

    attendanceRecords = []

}) {

    try {

        const prompt = `
Analyze attendance records.

Records:
${JSON.stringify(attendanceRecords, null, 2)}

Identify:
- absenteeism trends
- high-risk students
- attendance correlations
- intervention suggestions
`;

        const attendanceAnalysis =
            await educationalTutor({

                question: prompt,

                studentLevel: "advanced",

                language: "English",

                context:
                    "Educational attendance analytics"
            });

        return {

            success: true,

            attendance_analysis:
                attendanceAnalysis.response
        };

    } catch (error) {

        console.error(
            "❌ analyzeAttendance Error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Parent Report Generator
// ======================================================

async function generateParentReport({

    studentName,
    performanceData = {},
    teacherComments = ""

}) {

    try {

        const prompt = `
Generate a parent-friendly student report.

Student:
${studentName}

Performance Data:
${JSON.stringify(performanceData, null, 2)}

Teacher Comments:
${teacherComments}

Requirements:
- professional tone
- easy to understand
- encouraging
- actionable recommendations
`;

        const report =
            await educationalTutor({

                question: prompt,

                studentLevel: "intermediate",

                language: "English",

                context:
                    "Educational parent communication"
            });

        return {

            success: true,

            parent_report:
                report.response
        };

    } catch (error) {

        console.error(
            "❌ generateParentReport Error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Generate Teacher Recommendations
// ======================================================

async function generateTeachingRecommendations({

    weakTopics = [],
    classroomPerformance = {}

}) {

    try {

        const prompt = `
Generate teaching recommendations.

Weak Topics:
${weakTopics.join(", ")}

Classroom Performance:
${JSON.stringify(classroomPerformance, null, 2)}

Provide:
- teaching strategies
- engagement techniques
- remedial methods
- practical activities
- assessment improvements
`;

        const recommendations =
            await educationalTutor({

                question: prompt,

                studentLevel: "advanced",

                language: "English",

                context:
                    "AI teaching assistant"
            });

        return {

            success: true,

            recommendations:
                recommendations.response
        };

    } catch (error) {

        console.error(
            "❌ generateTeachingRecommendations Error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Teacher Knowledge Embedding
// ======================================================

async function createTeacherKnowledgeMemory({

    teacherId,
    content,
    topic

}) {

    try {

        const embedding =
            await generateEmbedding(
                `${topic}\n${content}`
            );

        return {

            success: true,

            memory: {
                teacherId,
                topic,
                content,
                embedding:
                    embedding.embedding
            }
        };

    } catch (error) {

        console.error(
            "❌ createTeacherKnowledgeMemory Error:",
            error
        );

        return {
            success: false,
            error: error.message
        };
    }
}


// ======================================================
// Classroom Intervention Planner
// ======================================================

async function createInterventionPlan({

    strugglingStudents = [],
    weakTopics = []

}) {

    try {

        const prompt = `
Create an intervention plan.

Struggling Students:
${JSON.stringify(strugglingStudents, null, 2)}

Weak Topics:
${weakTopics.join(", ")}

Provide:
- intervention timeline
- personalized support
- peer mentoring suggestions
- assessment checkpoints
- measurable goals
`;

        const intervention =
            await educationalTutor({

                question: prompt,

                studentLevel: "advanced",

                language: "English",

                context:
                    "Educational intervention planning"
            });

        return {

            success: true,

            intervention_plan:
                intervention.response
        };

    } catch (error) {

        console.error(
            "❌ createInterventionPlan Error:",
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

    analyzeClassPerformance,

    detectAtRiskStudents,

    createLessonPlan,

    generateClassroomInsights,

    alignCurriculum,

    createStudentGroups,

    analyzeAttendance,

    generateParentReport,

    generateTeachingRecommendations,

    createTeacherKnowledgeMemory,

    createInterventionPlan
};