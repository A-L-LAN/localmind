"use client";

import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";


// ======================================================
// Socket Connection
// ======================================================

const socket = io(
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:5000"
);


// ======================================================
// Types
// ======================================================

interface TutorResponse {
    explanation?: string;
    quiz?: string;
    evaluation?: string;
}

interface Message {
    role: "user" | "assistant";
    content: string;
}


// ======================================================
// Student Page
// ======================================================

export default function StudentPage() {

    // ==================================================
    // State
    // ==================================================

    const [question, setQuestion] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [response, setResponse] =
        useState<TutorResponse | null>(null);

    const [messages, setMessages] =
        useState<Message[]>([]);

    const [subject, setSubject] =
        useState("Mathematics");

    const [language, setLanguage] =
        useState("English");

    const [studentLevel, setStudentLevel] =
        useState("beginner");

    const [voiceEnabled, setVoiceEnabled] =
        useState(false);

    const [streamingText, setStreamingText] =
        useState("");

    const [isStreaming, setIsStreaming] =
        useState(false);

    const chatEndRef =
        useRef<HTMLDivElement | null>(null);


    // ==================================================
    // Auto Scroll
    // ==================================================

    useEffect(() => {

        chatEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [messages, streamingText]);


    // ==================================================
    // Ask AI Tutor
    // ==================================================

    async function askTutor() {

        if (!question.trim()) return;

        setLoading(true);

        setStreamingText("");

        setMessages((prev) => [
            ...prev,
            {
                role: "user",
                content: question
            }
        ]);

        try {

            const response =
                await fetch(
                    `${
                        process.env.NEXT_PUBLIC_BACKEND_URL ||
                        "http://localhost:5000"
                    }/api/tutor/adaptive-session`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            question,

                            topic: question,

                            subject,

                            studentProfile: {
                                name: "Student",
                                performance: 60,
                                grade: "Grade 8",
                                age: 14
                            }
                        })
                    }
                );

            const data =
                await response.json();

            setResponse(data.session);

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        data.session.explanation
                }
            ]);

            // -----------------------------------------
            // Emit Progress to Teacher Dashboard
            // -----------------------------------------

            socket.emit("student-progress", {

                student: "Student",

                subject,

                topic: question,

                timestamp:
                    new Date().toISOString()
            });

            // -----------------------------------------
            // Detect Struggle
            // -----------------------------------------

            if (
                data.session.explanation
                    ?.toLowerCase()
                    .includes("difficult")
            ) {

                socket.emit(
                    "student-struggling",
                    {
                        student: "Student",
                        topic: question,
                        subject
                    }
                );
            }

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

            setQuestion("");
        }
    }


    // ==================================================
    // Stream AI Response
    // ==================================================

    async function streamTutorResponse() {

        if (!question.trim()) return;

        setIsStreaming(true);

        setStreamingText("");

        try {

            const response =
                await fetch(
                    `${
                        process.env.NEXT_PUBLIC_BACKEND_URL ||
                        "http://localhost:5000"
                    }/api/tutor/stream`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            prompt: question,

                            systemPrompt:
                                "You are LocalMind AI Tutor powered by Gemma 4."
                        })
                    }
                );

            const reader =
                response.body?.getReader();

            const decoder =
                new TextDecoder();

            if (!reader) return;

            while (true) {

                const {
                    done,
                    value
                } = await reader.read();

                if (done) break;

                const chunk =
                    decoder.decode(value);

                setStreamingText(
                    (prev) => prev + chunk
                );
            }

        } catch (error) {

            console.error(error);

        } finally {

            setIsStreaming(false);
        }
    }


    // ==================================================
    // Voice Recognition
    // ==================================================

    function startVoiceRecognition() {

        // @ts-ignore
        const recognition =
            new webkitSpeechRecognition();

        recognition.lang = "en-KE";

        recognition.continuous = false;

        recognition.interimResults = false;

        recognition.onstart = () => {

            setVoiceEnabled(true);
        };

        recognition.onend = () => {

            setVoiceEnabled(false);
        };

        recognition.onresult = (
            event: any
        ) => {

            const transcript =
                event.results[0][0].transcript;

            setQuestion(transcript);
        };

        recognition.start();
    }


    // ==================================================
    // Text-to-Speech
    // ==================================================

    function speakText(text: string) {

        const utterance =
            new SpeechSynthesisUtterance(text);

        utterance.lang = "en-US";

        speechSynthesis.speak(utterance);
    }


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
                    🧠 LocalMind
                </h1>

                <p className="mt-2 text-gray-300">
                    Offline-First AI Learning Ecosystem
                    powered by Gemma 4
                </p>
            </div>


            {/* ====================================== */}
            {/* Main Layout */}
            {/* ====================================== */}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">

                {/* ================================== */}
                {/* Sidebar */}
                {/* ================================== */}

                <div className="bg-white rounded-2xl p-6 shadow-md h-fit">

                    <h2 className="text-2xl font-bold mb-4">
                        ⚙️ Learning Settings
                    </h2>

                    {/* Subject */}

                    <div className="mb-4">

                        <label className="font-semibold">
                            Subject
                        </label>

                        <select
                            value={subject}
                            onChange={(e) =>
                                setSubject(
                                    e.target.value
                                )
                            }
                            className="w-full border p-3 rounded-lg mt-2"
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

                    {/* Language */}

                    <div className="mb-4">

                        <label className="font-semibold">
                            Language
                        </label>

                        <select
                            value={language}
                            onChange={(e) =>
                                setLanguage(
                                    e.target.value
                                )
                            }
                            className="w-full border p-3 rounded-lg mt-2"
                        >
                            <option>
                                English
                            </option>

                            <option>
                                Swahili
                            </option>

                        </select>
                    </div>

                    {/* Level */}

                    <div className="mb-4">

                        <label className="font-semibold">
                            Student Level
                        </label>

                        <select
                            value={studentLevel}
                            onChange={(e) =>
                                setStudentLevel(
                                    e.target.value
                                )
                            }
                            className="w-full border p-3 rounded-lg mt-2"
                        >
                            <option value="beginner">
                                Beginner
                            </option>

                            <option value="intermediate">
                                Intermediate
                            </option>

                            <option value="advanced">
                                Advanced
                            </option>

                        </select>
                    </div>

                    {/* Voice */}

                    <button
                        onClick={
                            startVoiceRecognition
                        }
                        className="w-full bg-blue-600 text-white p-3 rounded-xl mt-4 hover:bg-blue-700 transition"
                    >
                        🎤 {
                            voiceEnabled
                                ? "Listening..."
                                : "Voice Input"
                        }
                    </button>
                </div>


                {/* ================================== */}
                {/* Chat Section */}
                {/* ================================== */}

                <div className="lg:col-span-3 bg-white rounded-2xl shadow-md p-6">

                    <div className="flex items-center justify-between mb-6">

                        <h2 className="text-3xl font-bold">
                            📚 AI Tutor
                        </h2>

                        <button
                            onClick={
                                streamTutorResponse
                            }
                            className="bg-purple-600 text-white px-5 py-2 rounded-xl hover:bg-purple-700"
                        >
                            ⚡ Stream Response
                        </button>
                    </div>


                    {/* ============================== */}
                    {/* Chat Messages */}
                    {/* ============================== */}

                    <div className="h-[500px] overflow-y-auto border rounded-2xl p-4 bg-gray-50">

                        {
                            messages.map(
                                (
                                    message,
                                    index
                                ) => (

                                    <div
                                        key={index}
                                        className={`mb-4 ${
                                            message.role ===
                                            "user"
                                                ? "text-right"
                                                : "text-left"
                                        }`}
                                    >

                                        <div
                                            className={`inline-block p-4 rounded-2xl max-w-[80%] whitespace-pre-wrap ${
                                                message.role ===
                                                "user"
                                                    ? "bg-black text-white"
                                                    : "bg-white border"
                                            }`}
                                        >
                                            {
                                                message.content
                                            }
                                        </div>

                                    </div>
                                )
                            )
                        }


                        {/* Streaming */}

                        {
                            isStreaming && (

                                <div className="bg-white border p-4 rounded-2xl whitespace-pre-wrap">
                                    {streamingText}
                                </div>
                            )
                        }

                        <div ref={chatEndRef} />

                    </div>


                    {/* ============================== */}
                    {/* Input Area */}
                    {/* ============================== */}

                    <div className="mt-6">

                        <textarea
                            value={question}
                            onChange={(e) =>
                                setQuestion(
                                    e.target.value
                                )
                            }
                            rows={5}
                            placeholder="Ask LocalMind anything..."
                            className="w-full border rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-black"
                        />

                        <div className="flex flex-wrap gap-4 mt-4">

                            <button
                                onClick={askTutor}
                                disabled={loading}
                                className="bg-black text-white px-6 py-3 rounded-2xl hover:bg-gray-800 transition"
                            >
                                {
                                    loading
                                        ? "Thinking..."
                                        : "🧠 Ask Gemma 4"
                                }
                            </button>

                            {
                                response?.explanation && (

                                    <button
                                        onClick={() =>
                                            speakText(
                                                response.explanation ||
                                                ""
                                            )
                                        }
                                        className="bg-green-600 text-white px-6 py-3 rounded-2xl hover:bg-green-700 transition"
                                    >
                                        🔊 Read Aloud
                                    </button>
                                )
                            }

                        </div>

                    </div>


                    {/* ============================== */}
                    {/* Quiz */}
                    {/* ============================== */}

                    {
                        response?.quiz && (

                            <div className="mt-8 border-t pt-6">

                                <h3 className="text-2xl font-bold mb-4">
                                    📝 Adaptive Quiz
                                </h3>

                                <div className="bg-gray-50 p-6 rounded-2xl whitespace-pre-wrap border">
                                    {response.quiz}
                                </div>

                            </div>
                        )
                    }


                    {/* ============================== */}
                    {/* Evaluation */}
                    {/* ============================== */}

                    {
                        response?.evaluation && (

                            <div className="mt-8 border-t pt-6">

                                <h3 className="text-2xl font-bold mb-4">
                                    📊 Learning Feedback
                                </h3>

                                <div className="bg-gray-50 p-6 rounded-2xl whitespace-pre-wrap border">
                                    {
                                        response.evaluation
                                    }
                                </div>

                            </div>
                        )
                    }

                </div>

            </div>

        </div>
    );
}