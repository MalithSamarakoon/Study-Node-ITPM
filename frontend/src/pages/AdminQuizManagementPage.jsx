import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
    createModule,
    createQuiz,
    deleteModule,
    deleteQuiz,
    fetchModuleQuizzes,
    fetchModules,
    fetchQuizById,
    updateModule,
    updateQuiz
} from "../api/quizApi";

const emptyModuleForm = { title: "", description: "" };

const makeEmptyQuestion = () => ({
    questionText: "",
    marks: 1,
    options: [
        { optionText: "", isCorrect: true },
        { optionText: "", isCorrect: false }
    ]
});

const emptyQuizForm = {
    moduleId: "",
    title: "",
    duration: 20,
    totalMarks: 10,
    status: "ACTIVE",
    questions: [makeEmptyQuestion()]
};

function AdminQuizManagementPage({ view = "dashboard" }) {
    const [modules, setModules] = useState([]);
    const [selectedModuleId, setSelectedModuleId] = useState("");
    const [moduleQuizzes, setModuleQuizzes] = useState([]);

    const [moduleForm, setModuleForm] = useState(emptyModuleForm);
    const [editingModuleId, setEditingModuleId] = useState(null);

    const [quizForm, setQuizForm] = useState(emptyQuizForm);
    const [editingQuizId, setEditingQuizId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const showModuleArea = view === "dashboard" || view === "modules";
    const showQuizArea = view === "dashboard" || view === "quizzes";
    const allowCreateInCurrentView = view !== "quizzes";
    const showQuizForm = allowCreateInCurrentView || editingQuizId !== null;

    const selectedModule = useMemo(
        () => modules.find((item) => String(item.id) === String(selectedModuleId)),
        [modules, selectedModuleId]
    );

    const correctAnswersConfigured = useMemo(
        () =>
            quizForm.questions.reduce(
                (count, question) => count + question.options.filter((option) => option.isCorrect).length,
                0
            ),
        [quizForm.questions]
    );

    const loadModules = async () => {
        const moduleData = await fetchModules();
        setModules(moduleData);

        if (moduleData.length === 0) {
            setSelectedModuleId("");
            setModuleQuizzes([]);
            setQuizForm((prev) => ({ ...prev, moduleId: "" }));
            return;
        }

        const fallbackId = selectedModuleId || String(moduleData[0].id);
        const exists = moduleData.some((m) => String(m.id) === String(fallbackId));
        const nextModuleId = exists ? fallbackId : String(moduleData[0].id);

        setSelectedModuleId(nextModuleId);
        setQuizForm((prev) => ({ ...prev, moduleId: nextModuleId }));
    };

    const loadQuizzesByModule = async (moduleId) => {
        if (!moduleId) {
            setModuleQuizzes([]);
            return;
        }

        const quizzes = await fetchModuleQuizzes(moduleId);
        setModuleQuizzes(quizzes);
    };

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                await loadModules();
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    useEffect(() => {
        loadQuizzesByModule(selectedModuleId);
    }, [selectedModuleId]);

    const resetModuleForm = () => {
        setModuleForm(emptyModuleForm);
        setEditingModuleId(null);
    };

    const resetQuizForm = () => {
        setQuizForm((prev) => ({
            ...emptyQuizForm,
            moduleId: prev.moduleId || selectedModuleId || ""
        }));
        setEditingQuizId(null);
    };

    const handleModuleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);

        try {
            if (editingModuleId) {
                await updateModule(editingModuleId, moduleForm);
                toast.success("Module updated successfully.");
            } else {
                await createModule(moduleForm);
                toast.success("Module created successfully.");
            }

            resetModuleForm();
            await loadModules();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to save module.");
        } finally {
            setSaving(false);
        }
    };

    const handleEditModule = (module) => {
        setEditingModuleId(module.id);
        setModuleForm({
            title: module.title || "",
            description: module.description || ""
        });
    };

    const handleDeleteModule = async (module) => {
        const confirmed = window.confirm(
            `Delete module '${module.title}'? This will also delete quizzes in this module.`
        );
        if (!confirmed) return;

        setSaving(true);

        try {
            await deleteModule(module.id);
            if (String(selectedModuleId) === String(module.id)) {
                setSelectedModuleId("");
            }
            toast.success("Module deleted successfully.");
            resetModuleForm();
            await loadModules();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to delete module.");
        } finally {
            setSaving(false);
        }
    };

    const handleQuizFieldChange = (field, value) => {
        setQuizForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleQuestionChange = (questionIndex, field, value) => {
        setQuizForm((prev) => {
            const nextQuestions = [...prev.questions];
            nextQuestions[questionIndex] = {
                ...nextQuestions[questionIndex],
                [field]: value
            };
            return { ...prev, questions: nextQuestions };
        });
    };

    const handleOptionChange = (questionIndex, optionIndex, field, value) => {
        setQuizForm((prev) => {
            const nextQuestions = [...prev.questions];
            const nextOptions = [...nextQuestions[questionIndex].options];

            if (field === "isCorrect" && value) {
                nextOptions.forEach((option, index) => {
                    nextOptions[index] = {
                        ...option,
                        isCorrect: index === optionIndex
                    };
                });
            } else {
                nextOptions[optionIndex] = {
                    ...nextOptions[optionIndex],
                    [field]: value
                };
            }

            nextQuestions[questionIndex] = {
                ...nextQuestions[questionIndex],
                options: nextOptions
            };

            return { ...prev, questions: nextQuestions };
        });
    };

    const addQuestion = () => {
        setQuizForm((prev) => ({ ...prev, questions: [...prev.questions, makeEmptyQuestion()] }));
    };

    const removeQuestion = (questionIndex) => {
        setQuizForm((prev) => {
            if (prev.questions.length === 1) return prev;
            const nextQuestions = prev.questions.filter((_, index) => index !== questionIndex);
            return { ...prev, questions: nextQuestions };
        });
    };

    const addOption = (questionIndex) => {
        setQuizForm((prev) => {
            const nextQuestions = [...prev.questions];
            const currentOptions = nextQuestions[questionIndex].options;
            if (currentOptions.length >= 6) return prev;

            nextQuestions[questionIndex] = {
                ...nextQuestions[questionIndex],
                options: [...currentOptions, { optionText: "", isCorrect: false }]
            };

            return { ...prev, questions: nextQuestions };
        });
    };

    const removeOption = (questionIndex, optionIndex) => {
        setQuizForm((prev) => {
            const nextQuestions = [...prev.questions];
            const currentOptions = nextQuestions[questionIndex].options;
            if (currentOptions.length <= 2) return prev;

            const wasCorrect = currentOptions[optionIndex].isCorrect;
            const nextOptions = currentOptions.filter((_, index) => index !== optionIndex);

            if (wasCorrect && !nextOptions.some((option) => option.isCorrect)) {
                nextOptions[0] = { ...nextOptions[0], isCorrect: true };
            }

            nextQuestions[questionIndex] = {
                ...nextQuestions[questionIndex],
                options: nextOptions
            };

            return { ...prev, questions: nextQuestions };
        });
    };

    const handleQuizSubmit = async (event) => {
        event.preventDefault();

        if (view === "quizzes" && !editingQuizId) {
            toast.error("Select a quiz first to manage and update it.");
            return;
        }

        if (!quizForm.moduleId) {
            toast.error("Please select a module for this quiz.");
            return;
        }

        const hasInvalidQuestion = quizForm.questions.some((question) => {
            const hasText = question.questionText.trim().length > 0;
            const hasCorrectOption = question.options.some((option) => option.isCorrect);
            const hasValidOptions = question.options.every((option) => option.optionText.trim().length > 0);
            return !hasText || !hasCorrectOption || !hasValidOptions;
        });

        if (hasInvalidQuestion) {
            toast.error("Each question needs text, non-empty options, and one correct option.");
            return;
        }

        const payload = {
            title: quizForm.title,
            duration: Number(quizForm.duration),
            totalMarks: Number(quizForm.totalMarks),
            status: quizForm.status,
            questions: quizForm.questions.map((question) => ({
                questionText: question.questionText,
                marks: Number(question.marks),
                options: question.options.map((option) => ({
                    optionText: option.optionText,
                    isCorrect: Boolean(option.isCorrect)
                }))
            }))
        };

        setSaving(true);
        try {
            if (editingQuizId) {
                await updateQuiz(editingQuizId, payload);
                toast.success("Quiz updated successfully.");
            } else {
                await createQuiz(quizForm.moduleId, payload);
                toast.success("Quiz created successfully.");
            }

            await loadQuizzesByModule(quizForm.moduleId);
            resetQuizForm();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to save quiz.");
        } finally {
            setSaving(false);
        }
    };

    const handleEditQuiz = async (quizId) => {
        setSaving(true);

        try {
            const detail = await fetchQuizById(quizId);
            setEditingQuizId(detail.id);
            setQuizForm({
                moduleId: String(detail.moduleId),
                title: detail.title,
                duration: detail.duration,
                totalMarks: detail.totalMarks,
                status: detail.status,
                questions: detail.questions.map((question) => ({
                    questionText: question.questionText,
                    marks: question.marks,
                    options: question.options.map((option) => ({
                        optionText: option.optionText,
                        isCorrect: Boolean(option.isCorrect)
                    }))
                }))
            });
            setSelectedModuleId(String(detail.moduleId));
            toast.info("Edit mode loaded. You can keep or change the correct options before saving.");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to load quiz details.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteQuiz = async (quiz) => {
        const confirmed = window.confirm(`Delete quiz '${quiz.title}'?`);
        if (!confirmed) return;

        setSaving(true);

        try {
            await deleteQuiz(quiz.id);
            toast.success("Quiz deleted successfully.");
            if (editingQuizId === quiz.id) {
                resetQuizForm();
            }
            await loadQuizzesByModule(selectedModuleId);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to delete quiz.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p className="text-gray-600">Loading admin quiz panel...</p>;
    }

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-2xl font-bold text-gray-900">Admin Quiz Management</h1>
                <p className="text-sm text-gray-600 mt-1">
                    Full CRUD for modules and quizzes in one admin panel.
                </p>
            </header>

            {showModuleArea && (
                <section className="bg-white border border-violet-100 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-indigo-900">Modules</h2>
                        {editingModuleId && (
                            <button
                                onClick={resetModuleForm}
                                className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleModuleSubmit} className="grid md:grid-cols-2 gap-3">
                        <input
                            type="text"
                            placeholder="Module title"
                            value={moduleForm.title}
                            onChange={(event) => setModuleForm((prev) => ({ ...prev, title: event.target.value }))}
                            className="border border-violet-200 rounded-lg px-3 py-2"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Module description"
                            value={moduleForm.description}
                            onChange={(event) => setModuleForm((prev) => ({ ...prev, description: event.target.value }))}
                            className="border border-violet-200 rounded-lg px-3 py-2"
                        />
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-60"
                            >
                                {editingModuleId ? "Update Module" : "Create Module"}
                            </button>
                        </div>
                    </form>

                    <div className="space-y-2">
                        {modules.length === 0 && <p className="text-sm text-gray-500">No modules found.</p>}
                        {modules.map((module) => (
                            <article key={module.id} className="border border-violet-100 rounded-xl p-3 flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-gray-900">{module.title}</p>
                                    <p className="text-sm text-gray-600">{module.description || "No description"}</p>
                                    <p className="text-xs text-gray-500 mt-1">Quizzes: {module.quizCount || 0}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEditModule(module)}
                                        className="px-3 py-1.5 text-sm rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteModule(module)}
                                        className="px-3 py-1.5 text-sm rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            {showQuizArea && (
                <section className="bg-white border border-violet-100 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-indigo-900">Quizzes</h2>
                        {editingQuizId && (
                            <button
                                onClick={resetQuizForm}
                                className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                        <label className="text-sm text-gray-700">
                            Module
                            <select
                                value={selectedModuleId}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    setSelectedModuleId(value);
                                    setQuizForm((prev) => ({ ...prev, moduleId: value }));
                                }}
                                className="mt-1 w-full border border-violet-200 rounded-lg px-3 py-2"
                            >
                                <option value="">Select module</option>
                                {modules.map((module) => (
                                    <option key={module.id} value={module.id}>
                                        {module.title}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="space-y-2">
                        {selectedModule && (
                            <p className="text-sm text-gray-600">
                                Showing quizzes for <span className="font-medium">{selectedModule.title}</span>
                            </p>
                        )}
                        {moduleQuizzes.length === 0 && (
                            <p className="text-sm text-gray-500">No quizzes found for selected module.</p>
                        )}
                        {moduleQuizzes.map((quiz) => (
                            <article key={quiz.id} className="border border-violet-100 rounded-xl p-3 flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-gray-900">{quiz.title}</p>
                                    <p className="text-sm text-gray-600">Duration: {quiz.duration} mins</p>
                                    <p className="text-sm text-gray-600">Total Marks: {quiz.totalMarks}</p>
                                    <p className="text-xs text-gray-500 mt-1">Status: {quiz.status}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEditQuiz(quiz.id)}
                                        className="px-3 py-1.5 text-sm rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteQuiz(quiz)}
                                        className="px-3 py-1.5 text-sm rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>

                    {!showQuizForm && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            Select a quiz from the list and click <span className="font-semibold">Edit</span> to open the manage form.
                        </div>
                    )}

                    {showQuizForm && (
                    <form onSubmit={handleQuizSubmit} className="space-y-4 border border-violet-100 rounded-xl p-4 bg-violet-50/40">
                        <h3 className="font-semibold text-gray-900">
                            {editingQuizId ? "Edit Quiz" : "Create New Quiz"}
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="rounded-lg bg-white border border-violet-200 px-3 py-2">
                                <p className="text-xs text-gray-500">Duration</p>
                                <p className="text-base font-semibold text-violet-700">{quizForm.duration} mins</p>
                            </div>
                            <div className="rounded-lg bg-white border border-violet-200 px-3 py-2">
                                <p className="text-xs text-gray-500">Total Marks</p>
                                <p className="text-base font-semibold text-violet-700">{quizForm.totalMarks}</p>
                            </div>
                            <div className="rounded-lg bg-white border border-violet-200 px-3 py-2">
                                <p className="text-xs text-gray-500">Questions</p>
                                <p className="text-base font-semibold text-violet-700">{quizForm.questions.length}</p>
                            </div>
                            <div className="rounded-lg bg-white border border-violet-200 px-3 py-2">
                                <p className="text-xs text-gray-500">Correct Answers Marked</p>
                                <p className="text-base font-semibold text-emerald-700">{correctAnswersConfigured}</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                            <input
                                type="text"
                                placeholder="Quiz title"
                                value={quizForm.title}
                                onChange={(event) => handleQuizFieldChange("title", event.target.value)}
                                className="border border-violet-200 rounded-lg px-3 py-2"
                                required
                            />
                            <select
                                value={quizForm.status}
                                onChange={(event) => handleQuizFieldChange("status", event.target.value)}
                                className="border border-violet-200 rounded-lg px-3 py-2"
                            >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                            <input
                                type="number"
                                min="1"
                                placeholder="Duration (minutes)"
                                value={quizForm.duration}
                                onChange={(event) => handleQuizFieldChange("duration", event.target.value)}
                                className="border border-violet-200 rounded-lg px-3 py-2"
                                required
                            />
                            <input
                                type="number"
                                min="1"
                                placeholder="Total marks"
                                value={quizForm.totalMarks}
                                onChange={(event) => handleQuizFieldChange("totalMarks", event.target.value)}
                                className="border border-violet-200 rounded-lg px-3 py-2"
                                required
                            />
                        </div>

                        <div className="space-y-4">
                            {quizForm.questions.map((question, questionIndex) => (
                                <div key={`question-${questionIndex}`} className="bg-white border border-violet-100 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-gray-900">Question {questionIndex + 1}</p>
                                        <button
                                            type="button"
                                            onClick={() => removeQuestion(questionIndex)}
                                            className="text-sm px-2 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100"
                                        >
                                            Remove
                                        </button>
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Question text"
                                        value={question.questionText}
                                        onChange={(event) =>
                                            handleQuestionChange(questionIndex, "questionText", event.target.value)
                                        }
                                        className="w-full border border-violet-200 rounded-lg px-3 py-2"
                                        required
                                    />

                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Marks"
                                        value={question.marks}
                                        onChange={(event) =>
                                            handleQuestionChange(questionIndex, "marks", event.target.value)
                                        }
                                        className="w-40 border border-violet-200 rounded-lg px-3 py-2"
                                        required
                                    />

                                    <div className="space-y-2">
                                        {question.options.map((option, optionIndex) => (
                                            <div
                                                key={`option-${questionIndex}-${optionIndex}`}
                                                className={`flex items-center gap-2 rounded-lg border px-2 py-2 ${
                                                    option.isCorrect
                                                        ? "border-emerald-300 bg-emerald-50"
                                                        : "border-violet-100 bg-white"
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    checked={option.isCorrect}
                                                    onChange={() =>
                                                        handleOptionChange(questionIndex, optionIndex, "isCorrect", true)
                                                    }
                                                    name={`correct-option-${questionIndex}`}
                                                    title="Mark as correct option"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder={`Option ${optionIndex + 1}`}
                                                    value={option.optionText}
                                                    onChange={(event) =>
                                                        handleOptionChange(
                                                            questionIndex,
                                                            optionIndex,
                                                            "optionText",
                                                            event.target.value
                                                        )
                                                    }
                                                    className="flex-1 border border-violet-200 rounded-lg px-3 py-2"
                                                    required
                                                />
                                                {option.isCorrect && (
                                                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md">
                                                        Correct Answer
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeOption(questionIndex, optionIndex)}
                                                    className="text-sm px-2 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => addOption(questionIndex)}
                                        className="text-sm px-3 py-1.5 rounded-lg bg-violet-100 text-violet-800 hover:bg-violet-200"
                                    >
                                        Add Option
                                    </button>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addQuestion}
                                className="text-sm px-3 py-1.5 rounded-lg bg-violet-100 text-violet-800 hover:bg-violet-200"
                            >
                                Add Question
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-60"
                        >
                            {editingQuizId ? "Update Quiz" : "Create Quiz"}
                        </button>
                    </form>
                    )}
                </section>
            )}
        </div>
    );
}

export default AdminQuizManagementPage;
