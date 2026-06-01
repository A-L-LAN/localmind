"use client";

import { useEffect, useMemo, useState } from "react";
import io from "socket.io-client";


// ======================================================
// Socket.IO Connection
// ======================================================

const socket = io(
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:5000"
);


// ======================================================
// Types
// ======================================================

interface StudentProgress {

    student: string;

    subject: string;

    topic: string;

    timestamp: string;
}

interface TeacherAlert {

    student: string;

    topic: string;

    subject: string;
}

interface ClassroomStats {

    activeStudents: number;
}


// ======================================================
// Teacher Dashboard
// ======================================================

export default function TeacherDashboard() {

    // ==================================================
    // State
    // ==================================================

    const [progressUpdates, setProgressUpdates] =
        useState<StudentProgress[]>([]);

    const [alerts, setAlerts] =
        useState<TeacherAlert[]>([]);

    const [stats, setStats] =
        useState<ClassroomStats>({
            activeStudents: 0
        });

    const [loadingInsights, setLoadingInsights] =
        useState(false);

    const [insights, setInsights] =
        useState("");

    const [lessonPlan, setLessonPlan] =
        useState("");

    const [topic, setTopic] =
        useState("Quadratic Equations");

    const [subject, setSubject] =
        useState("Mathematics");

    const [search, setSearch] =
        useState("");

    const [attendanceData] =
        useState([
            {
                name: "Brian",
                attendance: 90
            },
            {
                name: "Amina",
                attendance: 74
            },
            {
                name: "Kevin",
                attendance: 60
            }
        ]);


    // ==================================================
    // Socket Listeners
    // ==================================================

    useEffect(() => {

        socket.on(
            "dashboard-update",
            (data) => {

                setProgressUpdates(
                    (prev) => [
                        data.payload,
                        ...prev
                    ]
                );
            }
        );

        socket.on(
            "teacher-alert",
            (data) => {

                setAlerts((prev) => [
                    data.payload,
                    ...prev
                ]);
            }
        );

        socket.on(
            "classroom-stats",
            (data) => {

                setStats(data);
            }
        );

        return () => {

            socket.off("dashboard-update");

            socket.off("teacher-alert");

            socket.off("classroom-stats");
        };

    }, []);


    // ==================================================
    // Generate AI Insights
    // ==================================================

    async function generateInsights() {

        setLoadingInsights(true);

        try {

            const response =
                await fetch(
                    `${
                        process.env.NEXT_PUBLIC_BACKEND_URL ||
                        "http://localhost:5000"
                    }/api/teacher/classroom-insights`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            classroomMetrics: {

                                totalStudents:
                                    stats.activeStudents,

                                progressUpdates,

                                alerts
                            }
                        })
                    }
                );

            const data =
                await response.json();

            setInsights(
                data.insights.insights
            );

        } catch (error) {

            console.error(error);

        } finally {

            setLoadingInsights(false);
        }
    }


    // ==================================================
    // Generate AI Lesson Plan
    // ==================================================

    async function generateLessonPlan() {

        try {

            const response =
                await fetch(
                    `${
                        process.env.NEXT_PUBLIC_BACKEND_URL ||
                        "http://localhost:5000"
                    }/api/teacher/lesson-plan`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            topic,

                            subject,

                            gradeLevel:
                                "Grade 8",

                            duration:
                                "40 minutes"
                        })
                    }
                );

            const data =
                await response.json();

            setLessonPlan(
                data.lesson.lesson_plan
            );

        } catch (error) {

            console.error(error);
        }
    }


    // ==================================================
    // Filtered Students
    // ==================================================

    const filteredUpdates =
        useMemo(() => {

            return progressUpdates.filter(
                (item) =>
                    item.student
                        .toLowerCase()
                        .includes(
                            search.toLowerCase()
                        ) ||
                    item.topic
                        .toLowerCase()
                        .includes(
                            search.toLowerCase()
                        )
            );

        }, [progressUpdates, search]);


    // ==================================================
    // Calculate Weak Topics
    // ==================================================

    const weakTopics =
        useMemo(() => {

            const topicCount: Record<
                string,
                number
            > = {};

            alerts.forEach((alert) => {

                topicCount[
                    alert.topic
                ] =
                    (topicCount[
                        alert.topic
                    ] || 0) + 1;
            });

            return Object.entries(
                topicCount
            )
                .sort(
                    (a, b) =>
                        b[1] - a[1]
                )
                .slice(0, 5);

        }, [alerts]);


    // ==================================================
    // UI
    // ==================================================

    return (

        <div className="min-h-screen bg-gray-100">

            {/* ====================================== */}
            {/* Header */}
            {/* ====================================== */}

            <div className="bg-black text-white p-6 shadow-lg">

                <h1 className="text-4xl font-bold">
                    👨‍🏫 LocalMind Teacher Dashboard
                </h1>

                <p className="text-gray-300 mt-2">
                    Real-Time Classroom Intelligence
                    powered by Gemma 4
                </p>

            </div>


            {/* ====================================== */}
            {/* Stats */}
            {/* ====================================== */}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">

                <div className="bg-white rounded-2xl p-6 shadow-md">

                    <h2 className="text-lg font-semibold text-gray-500">
                        Active Students
                    </h2>

                    <p className="text-5xl font-bold mt-2">
                        {stats.activeStudents}
                    </p>

                </div>

                <div className="bg-white rounded-2xl p-6 shadow-md">

                    <h2 className="text-lg font-semibold text-gray-500">
                        Progress Updates
                    </h2>

                    <p className="text-5xl font-bold mt-2">
                        {progressUpdates.length}
                    </p>

                </div>

                <div className="bg-white rounded-2xl p-6 shadow-md">

                    <h2 className="text-lg font-semibold text-gray-500">
                        Student Alerts
                    </h2>

                    <p className="text-5xl font-bold mt-2 text-red-600">
                        {alerts.length}
                    </p>

                </div>

                <div className="bg-white rounded-2xl p-6 shadow-md">

                    <h2 className="text-lg font-semibold text-gray-500">
                        Weak Topics
                    </h2>

                    <p className="text-5xl font-bold mt-2">
                        {weakTopics.length}
                    </p>

                </div>

            </div>


            {/* ====================================== */}
            {/* Main Grid */}
            {/* ====================================== */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 pb-6">

                {/* ================================== */}
                {/* Student Activity */}
                {/* ================================== */}

                <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">

                    <div className="flex justify-between items-center mb-6">

                        <h2 className="text-3xl font-bold">
                            📚 Student Activity
                        </h2>

                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            className="border p-3 rounded-xl"
                        />
                    </div>

                    <div className="h-[500px] overflow-y-auto space-y-4">

                        {
                            filteredUpdates.map(
                                (
                                    update,
                                    index
                                ) => (

                                    <div
                                        key={index}
                                        className="border rounded-2xl p-4 bg-gray-50"
                                    >

                                        <div className="flex justify-between">

                                            <div>

                                                <p className="font-bold">
                                                    {
                                                        update.student
                                                    }
                                                </p>

                                                <p className="text-gray-600">
                                                    {
                                                        update.subject
                                                    }
                                                </p>

                                            </div>

                                            <div className="text-sm text-gray-500">

                                                {
                                                    new Date(
                                                        update.timestamp
                                                    ).toLocaleTimeString()
                                                }

                                            </div>

                                        </div>

                                        <p className="mt-3">
                                            Topic:
                                            <span className="font-semibold ml-2">
                                                {
                                                    update.topic
                                                }
                                            </span>
                                        </p>

                                    </div>
                                )
                            )
                        }

                    </div>

                </div>


                {/* ================================== */}
                {/* Alerts */}
                {/* ================================== */}

                <div className="bg-white rounded-2xl shadow-md p-6">

                    <h2 className="text-3xl font-bold mb-6">
                        🚨 Student Alerts
                    </h2>

                    <div className="space-y-4 h-[500px] overflow-y-auto">

                        {
                            alerts.length === 0 && (

                                <div className="text-gray-500">
                                    No alerts yet.
                                </div>
                            )
                        }

                        {
                            alerts.map(
                                (
                                    alert,
                                    index
                                ) => (

                                    <div
                                        key={index}
                                        className="bg-red-50 border border-red-200 rounded-2xl p-4"
                                    >

                                        <p className="font-bold text-red-700">
                                            {
                                                alert.student
                                            }
                                        </p>

                                        <p className="mt-2">
                                            Struggling with:
                                            <span className="font-semibold ml-2">
                                                {
                                                    alert.topic
                                                }
                                            </span>
                                        </p>

                                        <p className="text-gray-600 mt-1">
                                            {
                                                alert.subject
                                            }
                                        </p>

                                    </div>
                                )
                            )
                        }

                    </div>

                </div>

            </div>


            {/* ====================================== */}
            {/* Weak Topics */}
            {/* ====================================== */}

            <div className="px-6 pb-6">

                <div className="bg-white rounded-2xl shadow-md p-6">

                    <h2 className="text-3xl font-bold mb-6">
                        📉 Weak Topics Analysis
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

                        {
                            weakTopics.map(
                                (
                                    topic,
                                    index
                                ) => (

                                    <div
                                        key={index}
                                        className="bg-gray-50 border rounded-2xl p-4"
                                    >

                                        <h3 className="font-bold">
                                            {topic[0]}
                                        </h3>

                                        <p className="text-4xl font-bold mt-2">
                                            {topic[1]}
                                        </p>

                                        <p className="text-gray-500 mt-2">
                                            alerts
                                        </p>

                                    </div>
                                )
                            )
                        }

                    </div>

                </div>

            </div>


            {/* ====================================== */}
            {/* AI Insights + Lesson Plan */}
            {/* ====================================== */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 pb-10">

                {/* ================================== */}
                {/* AI Insights */}
                {/* ================================== */}

                <div className="bg-white rounded-2xl shadow-md p-6">

                    <div className="flex justify-between items-center mb-6">

                        <h2 className="text-3xl font-bold">
                            🧠 AI Classroom Insights
                        </h2>

                        <button
                            onClick={
                                generateInsights
                            }
                            className="bg-black text-white px-5 py-3 rounded-2xl hover:bg-gray-800"
                        >
                            {
                                loadingInsights
                                    ? "Analyzing..."
                                    : "Generate Insights"
                            }
                        </button>

                    </div>

                    <div className="bg-gray-50 border rounded-2xl p-6 whitespace-pre-wrap min-h-[350px]">

                        {
                            insights ||
                            "AI insights will appear here..."
                        }

                    </div>

                </div>


                {/* ================================== */}
                {/* AI Lesson Planner */}
                {/* ================================== */}

                <div className="bg-white rounded-2xl shadow-md p-6">

                    <div className="flex justify-between items-center mb-6">

                        <h2 className="text-3xl font-bold">
                            📖 AI Lesson Planner
                        </h2>

                        <button
                            onClick={
                                generateLessonPlan
                            }
                            className="bg-blue-600 text-white px-5 py-3 rounded-2xl hover:bg-blue-700"
                        >
                            Generate Plan
                        </button>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                        <input
                            type="text"
                            value={topic}
                            onChange={(e) =>
                                setTopic(
                                    e.target.value
                                )
                            }
                            placeholder="Lesson Topic"
                            className="border p-3 rounded-xl"
                        />

                        <select
                            value={subject}
                            onChange={(e) =>
                                setSubject(
                                    e.target.value
                                )
                            }
                            className="border p-3 rounded-xl"
                        >

                            <option>
                                Mathematics
                            </option>

                            <option>
                                Biology
                            </option>

                            <option>
                                Chemistry
                            </option>

                            <option>
                                Physics
                            </option>

                            <option>
                                English
                            </option>

                        </select>

                    </div>

                    <div className="bg-gray-50 border rounded-2xl p-6 whitespace-pre-wrap min-h-[350px]">

                        {
                            lessonPlan ||
                            "Generated lesson plan will appear here..."
                        }

                    </div>

                </div>

            </div>


            {/* ====================================== */}
            {/* Attendance Analytics */}
            {/* ====================================== */}

            <div className="px-6 pb-10">

                <div className="bg-white rounded-2xl shadow-md p-6">

                    <h2 className="text-3xl font-bold mb-6">
                        📅 Attendance Analytics
                    </h2>

                    <div className="space-y-4">

                        {
                            attendanceData.map(
                                (
                                    student,
                                    index
                                ) => (

                                    <div
                                        key={index}
                                        className="border rounded-2xl p-4"
                                    >

                                        <div className="flex justify-between mb-2">

                                            <span className="font-semibold">
                                                {
                                                    student.name
                                                }
                                            </span>

                                            <span className="font-bold">
                                                {
                                                    student.attendance
                                                }
                                                %
                                            </span>

                                        </div>

                                        <div className="w-full bg-gray-200 rounded-full h-4">

                                            <div
                                                className="bg-black h-4 rounded-full"
                                                style={{
                                                    width: `${student.attendance}%`
                                                }}
                                            />

                                        </div>

                                    </div>
                                )
                            )
                        }

                    </div>

                </div>

            </div>

        </div>
    );
}