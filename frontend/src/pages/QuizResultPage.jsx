import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchAttemptResult } from "../api/quizApi";

function QuizResultPage() {
    const { moduleId, attemptId } = useParams();
    const [result, setResult] = useState(null);

    const getCurrentUserName = () => {
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            return user.username || user.studentId || "Student";
        } catch {
            return "Student";
        }
    };

    const escapeXml = (value) => String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

    const downloadCertificate = () => {
        if (!result) return;

        const studentName = escapeXml(getCurrentUserName());
        const quizTitle = escapeXml(result.quizTitle);
        const scoreLabel = escapeXml(`${result.score} / ${result.totalMarks}`);
        const dateLabel = escapeXml(result.attemptDate);
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="840" viewBox="0 0 1200 840">
                <defs>
                    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stop-color="#fff7ed" />
                        <stop offset="100%" stop-color="#ecfeff" />
                    </linearGradient>
                </defs>
                <rect width="1200" height="840" rx="40" fill="url(#bg)" stroke="#f59e0b" stroke-width="12" />
                <rect x="56" y="56" width="1088" height="728" rx="28" fill="none" stroke="#0f766e" stroke-width="4" stroke-dasharray="14 12" />
                <text x="600" y="150" text-anchor="middle" font-family="Georgia, serif" font-size="52" fill="#0f172a" font-weight="700">Certificate of Achievement</text>
                <text x="600" y="240" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#475569">Awarded to</text>
                <text x="600" y="320" text-anchor="middle" font-family="Georgia, serif" font-size="64" fill="#0f172a" font-weight="700">${studentName}</text>
                <text x="600" y="390" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="#334155">for scoring above 70% in</text>
                <text x="600" y="452" text-anchor="middle" font-family="Georgia, serif" font-size="40" fill="#0f766e" font-weight="700">${quizTitle}</text>
                <text x="600" y="530" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#1f2937">Final Score: ${scoreLabel}</text>
                <text x="600" y="580" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#475569">Completed on ${dateLabel}</text>
                <text x="600" y="700" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#64748b">Study Node Quiz Platform</text>
            </svg>
        `;

        const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${result.quizTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-certificate.svg`;
        link.click();
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        const loadResult = async () => {
            const data = await fetchAttemptResult(attemptId);
            setResult(data);
        };

        loadResult();
    }, [attemptId]);

    if (!result) {
        return <p className="text-gray-600">Loading result...</p>;
    }

    const scorePercent = result.totalMarks > 0 ? (result.score / result.totalMarks) * 100 : 0;
    const passedWithDistinction = scorePercent > 70;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Quiz Completed</h1>
            <div className={`rounded-2xl border p-6 shadow-sm ${passedWithDistinction ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
                <p className={`font-semibold text-lg ${passedWithDistinction ? "text-emerald-700" : "text-amber-800"}`}>
                    {passedWithDistinction ? "Congratulations! Great work on your quiz." : "Keep going. You can improve on your next attempt."}
                </p>
                <p className={`mt-2 text-sm ${passedWithDistinction ? "text-emerald-900" : "text-amber-900"}`}>
                    {passedWithDistinction
                        ? "You scored more than 70%, which is an excellent result."
                        : "You did not reach 70% yet, but another attempt can help you improve."}
                </p>
                {passedWithDistinction && (
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        Achievement badge unlocked
                    </div>
                )}
            </div>

            <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
                <p className="text-emerald-700 font-semibold text-lg">{result.quizTitle}</p>
                <p className="mt-4 text-gray-800">Score: <span className="font-bold">{result.score} / {result.totalMarks}</span></p>
                <p className="text-gray-700">Correct Answers: {result.correctAnswers}</p>
                <p className="text-gray-700">Wrong Answers: {result.wrongAnswers}</p>
                <p className="text-gray-700">Attempt Date: {result.attemptDate}</p>

                <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                        to={`/quiz/modules/${moduleId}/quizzes/${result.quizId}/attempt`}
                        className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700"
                    >
                        Attempt Again
                    </Link>
                    {passedWithDistinction && (
                        <button
                            type="button"
                            onClick={downloadCertificate}
                            className="inline-block bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-amber-600"
                        >
                            Download Certificate
                        </button>
                    )}
                    <Link
                        to={`/quiz/modules/${moduleId}/quizzes`}
                        className="inline-block bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-violet-700"
                    >
                        Back to Module
                    </Link>
                </div>
            </div>

            {Array.isArray(result.questionReviews) && result.questionReviews.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">Answer Review</h2>
                    <div className="space-y-3">
                        {result.questionReviews.map((item, index) => (
                            <article
                                key={item.questionId}
                                className={`rounded-2xl border p-4 shadow-sm ${item.correct ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-500">Question {index + 1}</p>
                                        <h3 className="text-lg font-semibold text-gray-900">{item.questionText}</h3>
                                    </div>
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.correct ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
                                        {item.correct ? "Correct" : "Wrong"}
                                    </span>
                                </div>

                                <p className="mt-2 text-sm text-gray-600">Marks: {item.marks}</p>

                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-xl bg-white/80 p-3">
                                        <p className="text-xs uppercase tracking-wide text-gray-500">Your Answer</p>
                                        <p className="mt-1 text-sm font-medium text-gray-900">
                                            {item.selectedOptionText || "No answer selected"}
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-white/80 p-3">
                                        <p className="text-xs uppercase tracking-wide text-gray-500">Correct Answer</p>
                                        <p className="mt-1 text-sm font-medium text-gray-900">{item.correctOptionText}</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

export default QuizResultPage;
