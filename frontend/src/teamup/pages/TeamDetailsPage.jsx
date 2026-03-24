import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTeamById, getTeamMembers, joinTeam } from "../api/teamApi.js";
import StatusBadge from "../components/StatusBadge.jsx";

function TeamDetailsPage() {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joinForm, setJoinForm] = useState({ userId: "", roleInTeam: "" });
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState("");
  const [joining, setJoining] = useState(false);

  async function loadTeamDetails(teamId) {
    setLoading(true);
    setError("");

    try {
      const [teamData, membersData] = await Promise.all([
        getTeamById(teamId),
        getTeamMembers(teamId),
      ]);
      setTeam(teamData);
      setMembers(membersData);
    } catch (loadError) {
      setError(loadError.message || "Failed to load team details.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) {
      return;
    }

    loadTeamDetails(id);
  }, [id]);

  function handleJoinChange(event) {
    const { name, value } = event.target;
    setJoinForm((prev) => ({ ...prev, [name]: value }));
    setJoinError("");
    setJoinSuccess("");
  }

  async function handleJoinRequest(event) {
    event.preventDefault();

    if (!joinForm.userId.trim() || Number.isNaN(Number(joinForm.userId))) {
      setJoinError("Valid user ID is required.");
      return;
    }

    if (!joinForm.roleInTeam.trim()) {
      setJoinError("Role in team is required.");
      return;
    }

    setJoining(true);

    try {
      await joinTeam(id, {
        userId: Number(joinForm.userId),
        roleInTeam: joinForm.roleInTeam.trim(),
      });
      setJoinSuccess("Join request sent successfully.");
      setJoinForm({ userId: "", roleInTeam: "" });
      setJoinError("");
      await loadTeamDetails(id);
    } catch (requestError) {
      setJoinError(requestError.message || "Failed to send join request.");
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-700">Loading team details...</p>;
  }

  if (error) {
    return <p className="text-sm text-rose-600">{error}</p>;
  }

  if (!team) {
    return <p className="text-sm text-slate-600">Team not found.</p>;
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[2fr_1fr]">
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-slate-900">{team.title}</h2>
          <StatusBadge status={team.status} />
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-700">{team.description}</p>

        <div className="mt-5 space-y-2 text-sm text-slate-700">
          <p>
            <span className="font-semibold">Required skills:</span> {team.requiredSkills}
          </p>
          <p>
            <span className="font-semibold">Created by:</span> {team.createdByName} (ID: {team.createdByUserId})
          </p>
          <p>
            <span className="font-semibold">Members:</span> {team.memberCount}
          </p>
        </div>
      </article>

      <aside className="space-y-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Join Request</h3>
          <form className="mt-4 space-y-3" onSubmit={handleJoinRequest}>
            <input
              name="userId"
              value={joinForm.userId}
              onChange={handleJoinChange}
              placeholder="User ID"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-emerald-500"
            />
            <input
              name="roleInTeam"
              value={joinForm.roleInTeam}
              onChange={handleJoinChange}
              placeholder="Role in Team"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-emerald-500"
            />

            {joinError ? <p className="text-sm text-rose-600">{joinError}</p> : null}
            {joinSuccess ? <p className="text-sm text-emerald-600">{joinSuccess}</p> : null}

            <button
              type="submit"
              disabled={joining}
              className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {joining ? "Sending..." : "Join Request"}
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Members List</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {members.length === 0 ? (
              <li className="text-slate-500">No members yet.</li>
            ) : (
              members.map((member) => (
                <li key={member.id} className="rounded-xl border border-slate-200 p-3">
                  <p className="font-semibold text-slate-800">{member.userName}</p>
                  <p>Role: {member.roleInTeam}</p>
                  <p>Status: {member.status}</p>
                </li>
              ))
            )}
          </ul>
        </div>
      </aside>
    </section>
  );
}

export default TeamDetailsPage;
