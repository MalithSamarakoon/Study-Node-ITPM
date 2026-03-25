import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTeamById, updateTeam } from "../api/teamApi.js";
import { mockTeams } from "../data/mockTeamupData.js";
import { buildDescriptionWithMeta, parseTeamMeta } from "../utils/teamMeta.js";

function TeamEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUserId = String(import.meta.env.VITE_TEAMUP_USER_ID || "1");

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    type: "PROJECT",
    description: "",
    maxMembers: "5",
    skillInput: "",
    skills: [],
    deadline: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [isMockMode, setIsMockMode] = useState(false);

  useEffect(() => {
    async function loadTeamDetails() {
      setLoading(true);
      try {
        const data = await getTeamById(id);
        setTeam(data);
        const meta = parseTeamMeta(data.description);

        setForm({
          title: data.title,
          type: meta.type || "PROJECT",
          description: meta.cleanDescription || "",
          maxMembers: String(meta.maxMembers || "5"),
          deadline: meta.deadline || "",
          skillInput: "",
          skills: data.requiredSkills.split(",").map((s) => s.trim()),
        });
        setIsMockMode(false);
      } catch {
        const mockTeam = mockTeams.find((t) => String(t.id) === String(id));
        if (mockTeam) {
          const meta = parseTeamMeta(mockTeam.description);
          setTeam(mockTeam);
          setForm({
            title: mockTeam.title,
            type: meta.type || "PROJECT",
            description: meta.cleanDescription || "",
            maxMembers: String(meta.maxMembers || "5"),
            deadline: meta.deadline || "",
            skillInput: "",
            skills: mockTeam.requiredSkills.split(",").map((s) => s.trim()),
          });
          setIsMockMode(true);
        } else {
          setError("Team not found.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadTeamDetails();
  }, [id]);

  if (loading) {
    return <p className="text-sm text-slate-700">Loading team details...</p>;
  }

  if (!team) {
    return <p className="text-sm text-slate-600">Team not found.</p>;
  }

  if (String(team.createdByUserId) !== currentUserId) {
    return <p className="text-sm text-rose-600">You don't have permission to edit this team.</p>;
  }

  function addSkill(rawValue) {
    const value = rawValue.trim();
    if (!value) return;

    setForm((prev) => {
      if (prev.skills.some((skill) => skill.toLowerCase() === value.toLowerCase())) {
        return { ...prev, skillInput: "" };
      }
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

    if (!form.maxMembers.trim() || Number.isNaN(Number(form.maxMembers))) {
      nextErrors.maxMembers = "Max members must be a valid number";
    }

    if (form.skills.length === 0) {
      nextErrors.requiredSkills = "Required skills are required";
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
      const updateData = {
        title: form.title.trim(),
        description: buildDescriptionWithMeta(
          form.description,
          form.type,
          Number(form.maxMembers),
          form.deadline,
        ),
        requiredSkills: form.skills.join(", "),
      };

      if (!isMockMode) {
        await updateTeam(id, updateData);
      }
      
      // Navigate to All Teams after successful update
      navigate("/teams");
    } catch (err) {
      setServerMessage(err.message || "Failed to update team.");
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-3xl border border-[#e7cab5] bg-[#fffdfb] p-6 text-[#6a3c1c] shadow-[0_8px_20px_rgba(123,63,23,0.06)] sm:p-8">
      <h2 className="text-5xl font-extrabold text-[#7b3f17]">Edit Team: {team.title}</h2>
      <p className="mt-2 text-xl text-[#885534]">Update the team details.</p>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="title" className="block text-lg font-semibold text-[#704021]">
            Team Name
          </label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
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
          <label htmlFor="description" className="block text-lg font-semibold text-[#704021]">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
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
            <label htmlFor="maxMembers" className="block text-lg font-semibold text-[#704021]">
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
            <label htmlFor="deadline" className="block text-lg font-semibold text-[#704021]">
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
          <div className="mt-2 flex gap-2">
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
              className="w-full rounded-xl border border-[#e5c5ad] px-4 py-3 text-lg outline-none focus:border-[#eb8f3a]"
              placeholder="Add skill"
            />
            <button
              type="button"
              onClick={() => addSkill(form.skillInput)}
              className="rounded-xl border border-[#d7b69e] px-4 py-3 text-sm font-semibold text-[#8a4f26]"
            >
              + Add
            </button>
          </div>
          {errors.requiredSkills ? (
            <p className="mt-1 text-sm text-rose-600">{errors.requiredSkills}</p>
          ) : null}
        </div>

        {serverMessage ? <p className="text-sm text-rose-600">{serverMessage}</p> : null}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center rounded-xl bg-[#ef8f31] px-6 py-3 text-lg font-semibold text-white transition hover:bg-[#dd7f23] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/teams/${id}`)}
            className="inline-flex items-center rounded-xl border border-[#d7b69e] px-6 py-3 text-lg font-semibold text-[#8a512a]"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

export default TeamEditPage;
