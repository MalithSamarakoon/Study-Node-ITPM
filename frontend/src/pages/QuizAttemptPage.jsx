import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchQuizById, submitQuizAttempt } from "../api/quizApi";

function QuizAttemptPage() {
    const { moduleId, quizId } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(null);
    const [autoSubmitted, setAutoSubmitted] = useState(false);
    const [feedback, setFeedback] = useState("");

    useEffect(() => {
        const loadQuiz = async () => {
            const data = await fetchQuizById(quizId);
            setQuiz(data);
            setCurrentIndex(0);
            setAnswers({});
            setSecondsLeft((data?.duration || 0) * 60);
            setAutoSubmitted(false);
            setFeedback("");
        };

        loadQuiz();
    }, [quizId]);

    useEffect(() => {
        if (!quiz || secondsLeft === null || secondsLeft <= 0 || submitting) {
            return;
        }

        const timerId = setInterval(() => {
            setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timerId);
    }, [quiz, secondsLeft, submitting]);

    const currentQuestion = useMemo(() => {
        if (!quiz?.questions?.length) return null;
        return quiz.questions[currentIndex];
    }, [quiz, currentIndex]);

    const totalQuestions = quiz?.questions?.length || 0;
    const answeredCount = useMemo(
        () =>
            (quiz?.questions || []).filter(
                (question) => answers[question.id] !== undefined && answers[question.id] !== null
            ).length,
        [answers, quiz]
    );
    const allAnswered = totalQuestions > 0 && (quiz?.questions || []).every(
        (question) => answers[question.id] !== undefined && answers[question.id] !== null
    );

    const timeDisplay = useMemo(() => {
        if (secondsLeft === null) return "--:--";
        const mins = Math.floor(secondsLeft / 60);
        const secs = secondsLeft % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }, [secondsLeft]);

    const handleSelect = (questionId, selectedOptionId) => {
        setFeedback("");
        setAnswers((prev) => ({ ...prev, [questionId]: selectedOptionId }));
    };

    const goNext = () => {
        if (quiz && currentIndex < quiz.questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const goPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const handleSubmit = async ({ forceSubmit = false } = {}) => {
        if (!quiz) return;

        const unansweredIndexes = (quiz.questions || [])
            .map((question, index) =>
                answers[question.id] === undefined || answers[question.id] === null ? index : -1
            )
            .filter((index) => index !== -1);

        if (!forceSubmit && unansweredIndexes.length > 0) {
            setCurrentIndex(unansweredIndexes[0]);
            setFeedback(`Please answer all questions before submitting. ${unansweredIndexes.length} unanswered.`);
            return;
        }

        setSubmitting(true);
        setFeedback("");
        try {
            const payload = quiz.questions.map((question) => ({
                questionId: question.id,
                selectedOptionId:
                    answers[question.id] ?? (forceSubmit ? question.options?.[0]?.id : undefined)
            }));

            if (payload.some((item) => !item.selectedOptionId)) {
                setFeedback("Some questions are still unanswered.");
                return;
            }

            const result = await submitQuizAttempt(quiz.id, payload);
            navigate(`/quiz/modules/${moduleId}/results/${result.attemptId}`);
        } catch (error) {
            const apiMessage = error?.response?.data?.message || error?.response?.data?.error;
            setFeedback(apiMessage || error?.message || "Failed to submit quiz. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (!quiz || autoSubmitted || submitting) return;
        if (secondsLeft !== 0) return;

        setAutoSubmitted(true);
        setFeedback("Time is over. Submitting your quiz...");
        handleSubmit({ forceSubmit: true });
    }, [secondsLeft, quiz, autoSubmitted, submitting]);

    if (!quiz || !currentQuestion) {
        return <p className="text-gray-600">Loading quiz...</p>;
    }

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white border border-violet-100 rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="text-lg font-semibold text-violet-700">{quiz.duration} mins</p>
                </div>
                <div className="bg-white border border-violet-100 rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-500">Answered</p>
                    <p className="text-lg font-semibold text-violet-700">{answeredCount}/{totalQuestions}</p>
                </div>
                <div className={`border rounded-xl px-4 py-3 ${secondsLeft <= 60 ? "bg-rose-50 border-rose-200" : "bg-white border-violet-100"}`}>
                    <p className="text-xs text-gray-500">Time Left</p>
                    <p className={`text-lg font-semibold ${secondsLeft <= 60 ? "text-rose-700" : "text-violet-700"}`}>{timeDisplay}</p>
                </div>
            </div>

            {feedback && (
                <p className="text-sm font-medium text-violet-700 bg-violet-50 border border-violet-200 rounded-lg px-3 py-2">
                    {feedback}
                </p>
            )}

            <article className="bg-white rounded-2xl border border-violet-100 p-5 shadow-sm">
                <p className="text-sm text-gray-500 mb-3">
                    Question {currentIndex + 1} of {quiz.questions.length}
                </p>
                <h2 className="text-lg font-semibold text-indigo-900">{currentQuestion.questionText}</h2>

                <div className="mt-4 space-y-3">
                    {currentQuestion.options.map((option) => (
                        <label
                            key={option.id}
                            className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-violet-300 cursor-pointer"
                        >
                            <input
                                type="radio"
                                name={`q-${currentQuestion.id}`}
                                checked={answers[currentQuestion.id] === option.id}
                                onChange={() => handleSelect(currentQuestion.id, option.id)}
                            />
                            <span className="text-gray-800">{option.optionText}</span>
                        </label>
                    ))}
                </div>
            </article>

            <div className="flex justify-between">
                <button
                    onClick={goPrev}
                    disabled={currentIndex === 0}
                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 disabled:opacity-40"
                >
                    Previous
                </button>

                <div className="flex gap-3">
                    {currentIndex !== quiz.questions.length - 1 && (
                    <button
                        onClick={goNext}
                        className="px-5 py-2 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700"
                    >
                        Next
                    </button>
                    )}
                    <button
                        onClick={() => handleSubmit()}
                        disabled={submitting}
                        className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50"
                    >
                        {submitting ? "Submitting..." : "Submit Quiz"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default QuizAttemptPage;
