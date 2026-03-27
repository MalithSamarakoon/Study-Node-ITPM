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

    useEffect(() => {
        const loadQuiz = async () => {
            const data = await fetchQuizById(quizId);
            setQuiz(data);
        };

        loadQuiz();
    }, [quizId]);

    const currentQuestion = useMemo(() => {
        if (!quiz?.questions?.length) return null;
        return quiz.questions[currentIndex];
    }, [quiz, currentIndex]);

    const handleSelect = (questionId, selectedOptionId) => {
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

    const handleSubmit = async () => {
        if (!quiz) return;

        setSubmitting(true);
        try {
            const payload = quiz.questions.map((question) => ({
                questionId: question.id,
                selectedOptionId: answers[question.id]
            }));

            const result = await submitQuizAttempt(quiz.id, payload);
            navigate(`/quiz/modules/${moduleId}/results/${result.attemptId}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (!quiz || !currentQuestion) {
        return <p className="text-gray-600">Loading quiz...</p>;
    }

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-sm text-gray-600">Duration: {quiz.duration} minutes</p>

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

                {currentIndex === quiz.questions.length - 1 ? (
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50"
                    >
                        {submitting ? "Submitting..." : "Submit Quiz"}
                    </button>
                ) : (
                    <button
                        onClick={goNext}
                        className="px-5 py-2 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700"
                    >
                        Next
                    </button>
                )}
            </div>
        </div>
    );
}

export default QuizAttemptPage;
