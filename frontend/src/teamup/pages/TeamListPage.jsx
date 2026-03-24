import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getTeams, joinTeam } from "../api/teamApi.js";
import StatusBadge from "../components/StatusBadge.jsx";

function TeamListPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [joiningTeamId, setJoiningTeamId] = useState(null);

  async function loadTeams(skill) {
    setLoading(true);
    setError("");

    try {
      const data = await getTeams(skill);
      setTeams(data);
    } catch (loadError) {
      setError(loadError.message || "Failed to load teams.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeams("");
  }, []);

  const orderedTeams = useMemo(
    () => [...teams].sort((a, b) => Number(b.id) - Number(a.id)),
    [teams],
  );

  async function handleSkillSearch(event) {
    event.preventDefault();
    await loadTeams(skillFilter.trim());
  }

  async function handleJoin(teamId) {
    const userId = window.prompt("Enter your user ID to join this team:");
    if (!userId) {
      return;
    }

    const roleInTeam = window.prompt("Enter your role in team:", "Member");
    if (!roleInTeam) {
      return;
    }

    setJoiningTeamId(teamId);

    try {
      await joinTeam(teamId, { userId: Number(userId), roleInTeam: roleInTeam.trim() });
      window.alert("Join request submitted.");
    } catch (joinError) {
      window.alert(joinError.message || "Failed to submit join request.");
    } finally {
      setJoiningTeamId(null);
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Team List</h2>
        <p className="mt-2 text-sm text-slate-600">Browse all teams and request to join.</p>

        <form onSubmit={handleSkillSearch} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={skillFilter}
            onChange={(event) => setSkillFilter(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
            placeholder="Filter by skill (optional)"
          />
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Search
          </button>
        </form>
      </div>

      {loading ? <p className="text-sm text-slate-700">Loading teams...</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {!loading && !error && orderedTeams.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">
          No teams found.
        </p>
      ) : null}

      <div className="grid gap-4">
        {orderedTeams.map((team) => (
          <article
            key={team.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">{team.title}</h3>
                <p className="text-sm text-slate-600">{team.description}</p>
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">Required skills:</span> {team.requiredSkills}
                </p>
              </div>
              <StatusBadge status={team.status} />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to={`/teams/${team.id}`}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                View Details
              </Link>
              <button
                onClick={() => handleJoin(team.id)}
                disabled={joiningTeamId === team.id}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {joiningTeamId === team.id ? "Joining..." : "Join"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default TeamListPage;
