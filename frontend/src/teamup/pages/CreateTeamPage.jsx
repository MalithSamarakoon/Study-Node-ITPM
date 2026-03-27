import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { createTeam } from "../api/teamApi.js";
import { buildDescriptionWithMeta } from "../utils/teamMeta.js";
import { useAuth } from "../../auth/AuthContext.jsx";

const initialForm = {
  title: "AI Research Project",
  type: "PROJECT",
  description: "We are building an AI LMS chatbot and need backend + ML members.",
  maxMembers: "5",
  skillInput: "",
  skills: ["Java", "SpringBoot"],
  deadline: "2026-03-15",
};

function CreateTeamPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = Number(user?.id || import.meta.env.VITE_TEAMUP_USER_ID || "1");

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [serverMessage, setServerMessage] = useState("");

  function addSkill(rawValue) {
    const value = rawValue.trim();
    if (!value) {
      return;
    }

    // Validate skill length
    if (value.length < 2) {
      setErrors((prev) => ({ ...prev, skillInput: "Skill must be at least 2 characters" }));
      return;
    }

    if (value.length > 20) {
      setErrors((prev) => ({ ...prev, skillInput: "Skill must be no more than 20 characters" }));
      return;
    }

    setForm((prev) => {
      if (prev.skills.some((skill) => skill.toLowerCase() === value.toLowerCase())) {
        setErrors((prev) => ({ ...prev, skillInput: "This skill is already added" }));
        return prev;
      }
      setErrors((prev) => ({ ...prev, skillInput: "" }));
      return {
        ...prev,
        skills: [...prev.skills, value],
        skillInput: "",
      };
    });
  }

  function removeSkill(skillToRemove) {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSuccessMessage("");
    setServerMessage("");
  }

  function validate() {
    const nextErrors = {};
    const trimmedTitle = form.title.trim();
    const trimmedDescription = form.description.trim();
    const parsedMembers = Number(form.maxMembers);

    // Title validation
    if (!trimmedTitle) {
      nextErrors.title = "Team name is required";
    } else if (trimmedTitle.length < 3) {
      nextErrors.title = "Team name must be at least 3 characters long";
    } else if (trimmedTitle.length > 100) {
      nextErrors.title = "Team name must be no more than 100 characters";
    }

    // Description validation
    if (!trimmedDescription) {
      nextErrors.description = "Description is required";
    } else if (trimmedDescription.length < 10) {
      nextErrors.description = "Description must be at least 10 characters long";
    } else if (trimmedDescription.length > 1000) {
      nextErrors.description = "Description must be no more than 1000 characters";
    }

    // Max members validation
    if (!form.maxMembers.trim() || Number.isNaN(parsedMembers)) {
      nextErrors.maxMembers = "Max members must be a valid number";
    } else if (parsedMembers < 2) {
      nextErrors.maxMembers = "Team must have at least 2 members";
    } else if (parsedMembers > 10) {
      nextErrors.maxMembers = "Team cannot have more than 10 members";
    } else if (!Number.isInteger(parsedMembers)) {
      nextErrors.maxMembers = "Max members must be a whole number";
    }

    // Skills validation
    if (form.skills.length === 0) {
      nextErrors.requiredSkills = "At least one skill is required";
    } else {
      const invalidSkill = form.skills.find(skill => {
        const trimmed = skill.trim();
        return trimmed.length < 2 || trimmed.length > 20;
      });
      if (invalidSkill) {
        nextErrors.requiredSkills = "Each skill must be 2-20 characters long";
      }
    }

    // Deadline validation (if provided)
    if (form.deadline) {
      const deadlineDate = new Date(form.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deadlineDate < today) {
        nextErrors.deadline = "Deadline cannot be in the past";
      }
    }

    // Type validation
    if (!["PROJECT", "EVENT"].includes(form.type)) {
      nextErrors.type = "Please select a valid team type";
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
        description: buildDescriptionWithMeta(
          form.description,
          form.type,
          Number(form.maxMembers),
          form.deadline,
        ),
        requiredSkills: form.skills.join(", "),
        createdByUserId: currentUserId,
      });

      setForm(initialForm);
      setErrors({});
      setSuccessMessage("Team created successfully.");
      setServerMessage("");
      
      // Navigate to All Teams after successful creation
      setTimeout(() => navigate("/teams"), 1000);
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
    <section className="rounded-3xl border border-[#e7cab5] bg-[#fffdfb] p-6 text-[#6a3c1c] shadow-[0_8px_20px_rgba(123,63,23,0.06)] sm:p-8">
      <h2 className="text-5xl font-extrabold text-[#7b3f17]">Create a New Team</h2>
      <p className="mt-2 text-xl text-[#885534]">
        Fill in the details to create a new project team.
      </p>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="title" className="block text-lg font-semibold text-[#704021]">
              Team Name
            </label>
            <span className="text-sm text-[#9b6d4e]">
              {form.title.length}/100
            </span>
          </div>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            maxLength={100}
            className="mt-1 w-full rounded-xl border border-[#e5c5ad] px-4 py-3 text-lg outline-none focus:border-[#eb8f3a]"
            placeholder="Enter team name..."
          />
          {errors.title ? <p className="mt-1 text-sm text-rose-600">{errors.title}</p> : null}
        </div>

        <div>
          <p className="block text-lg font-semibold text-[#704021]">Type</p>
          <div className="mt-2 flex flex-wrap gap-5 text-base">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="type"
                value="PROJECT"
                checked={form.type === "PROJECT"}
                onChange={handleChange}
              />
              Project
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="type"
                value="EVENT"
                checked={form.type === "EVENT"}
                onChange={handleChange}
              />
              Event
            </label>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="description"
              className="block text-lg font-semibold text-[#704021]"
            >
              Description
            </label>
            <span className="text-sm text-[#9b6d4e]">
              {form.description.length}/1000
            </span>
          </div>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            maxLength={1000}
            rows={5}
            className="mt-1 w-full rounded-xl border border-[#e5c5ad] px-4 py-3 text-lg outline-none focus:border-[#eb8f3a]"
            placeholder="Describe the project, goals, and objectives..."
          />
          {errors.description ? (
            <p className="mt-1 text-sm text-rose-600">{errors.description}</p>
          ) : null}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="maxMembers"
              className="block text-lg font-semibold text-[#704021]"
            >
              Max Members
            </label>
            <input
              id="maxMembers"
              name="maxMembers"
              value={form.maxMembers}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-[#e5c5ad] px-4 py-3 text-lg outline-none focus:border-[#eb8f3a]"
              placeholder="5"
            />
            {errors.maxMembers ? (
              <p className="mt-1 text-sm text-rose-600">{errors.maxMembers}</p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="deadline"
              className="block text-lg font-semibold text-[#704021]"
            >
              Deadline (optional)
            </label>
            <input
              id="deadline"
              name="deadline"
              type="date"
              value={form.deadline}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-[#e5c5ad] px-4 py-3 text-lg outline-none focus:border-[#eb8f3a]"
            />
            {errors.deadline ? (
              <p className="mt-1 text-sm text-rose-600">{errors.deadline}</p>
            ) : null}
          </div>
        </div>

        <div>
          <label className="block text-lg font-semibold text-[#704021]">Skills Required</label>
          <div className="mt-2 flex flex-wrap gap-2 rounded-xl border border-[#e5c5ad] bg-[#fffcfa] p-3">
            {form.skills.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => removeSkill(skill)}
                className="rounded-full bg-[#ffe7d3] px-3 py-1 text-sm font-semibold text-[#8a4f26]"
                title="Remove skill"
              >
                {skill} x
              </button>
            ))}
            {form.skills.length === 0 ? (
              <span className="text-sm text-[#9b6d4e]">No skills added yet.</span>
            ) : null}
          </div>
          <div className="mt-2 flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                name="skillInput"
                value={form.skillInput}
                onChange={handleChange}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addSkill(form.skillInput);
                  }
                }}
                maxLength={20}
                className="w-full rounded-xl border border-[#e5c5ad] px-4 py-3 text-lg outline-none focus:border-[#eb8f3a]"
                placeholder="Add skill (2-20 characters)"
              />
              <button
                type="button"
                onClick={() => addSkill(form.skillInput)}
                className="rounded-xl border border-[#d7b69e] px-4 py-3 text-sm font-semibold text-[#8a4f26]"
              >
                + Add
              </button>
            </div>
            {errors.skillInput ? (
              <p className="text-sm text-rose-600">{errors.skillInput}</p>
            ) : null}
          </div>
          {errors.requiredSkills ? (
            <p className="mt-1 text-sm text-rose-600">{errors.requiredSkills}</p>
          ) : null}
        </div>

        {serverMessage ? <p className="text-sm text-rose-600">{serverMessage}</p> : null}
        {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-xl bg-[#ef8f31] px-6 py-3 text-lg font-semibold text-white transition hover:bg-[#dd7f23] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Creating..." : "Create Team"}
        </button>
      </form>
    </section>
  );
}

export default CreateTeamPage;
