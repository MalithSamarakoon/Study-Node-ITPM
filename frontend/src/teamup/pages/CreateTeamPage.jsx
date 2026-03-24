import { useState } from "react";
import { createTeam } from "../api/teamApi.js";

const initialForm = {
  title: "",
  description: "",
  requiredSkills: "",
  createdByUserId: "",
};

function CreateTeamPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [serverMessage, setServerMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSuccessMessage("");
    setServerMessage("");
  }

  function validate() {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Title is required";
    }

    if (!form.description.trim()) {
      nextErrors.description = "Description is required";
    }

    if (!form.requiredSkills.trim()) {
      nextErrors.requiredSkills = "Required skills are required";
    }

    if (!form.createdByUserId.trim()) {
      nextErrors.createdByUserId = "Creator user ID is required";
    } else if (Number.isNaN(Number(form.createdByUserId))) {
      nextErrors.createdByUserId = "Creator user ID must be a number";
    }

    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);

    try {
      await createTeam({
        title: form.title.trim(),
        description: form.description.trim(),
        requiredSkills: form.requiredSkills.trim(),
        createdByUserId: Number(form.createdByUserId),
      });

      setForm(initialForm);
      setErrors({});
      setSuccessMessage("Team created successfully.");
      setServerMessage("");
    } catch (error) {
      if (error?.payload?.message && typeof error.payload.message === "object") {
        setErrors((prev) => ({ ...prev, ...error.payload.message }));
      } else {
        setServerMessage(error.message || "Failed to create team.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-bold text-slate-900">Create Team</h2>
      <p className="mt-2 text-sm text-slate-600">
        Start a new study team and describe what kind of members you need.
      </p>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-slate-700">
            Title
          </label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
            placeholder="AI Project Sprint Team"
          />
          {errors.title ? <p className="mt-1 text-sm text-rose-600">{errors.title}</p> : null}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-semibold text-slate-700"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
            placeholder="Describe team goals, timeline, and collaboration style."
          />
          {errors.description ? (
            <p className="mt-1 text-sm text-rose-600">{errors.description}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="requiredSkills"
            className="block text-sm font-semibold text-slate-700"
          >
            Required Skills
          </label>
          <input
            id="requiredSkills"
            name="requiredSkills"
            value={form.requiredSkills}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
            placeholder="React, Spring Boot, SQL"
          />
          {errors.requiredSkills ? (
            <p className="mt-1 text-sm text-rose-600">{errors.requiredSkills}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="createdByUserId"
            className="block text-sm font-semibold text-slate-700"
          >
            Creator User ID
          </label>
          <input
            id="createdByUserId"
            name="createdByUserId"
            value={form.createdByUserId}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
            placeholder="1"
          />
          {errors.createdByUserId ? (
            <p className="mt-1 text-sm text-rose-600">{errors.createdByUserId}</p>
          ) : null}
        </div>

        {serverMessage ? <p className="text-sm text-rose-600">{serverMessage}</p> : null}
        {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </section>
  );
}

export default CreateTeamPage;
