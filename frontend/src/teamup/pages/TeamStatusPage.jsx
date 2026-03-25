import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCreatedTeams, getTeamMembers } from "../api/teamApi.js";
import { useAuth } from "../../auth/AuthContext.jsx";

function TeamStatusPage() {
  const { user } = useAuth();
  const currentUserId = String(user?.id || import.meta.env.VITE_TEAMUP_USER_ID || "1");
  const [teamsWithMembers, setTeamsWithMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOwnerTeamMembers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const ownedTeams = await getCreatedTeams(currentUserId);
      const teamsData = await Promise.all(
        ownedTeams.map(async (team) => {
          const members = await getTeamMembers(team.id);
          return {
            teamId: team.id,
            teamTitle: team.title,
            teamStatus: team.status,
            members: members.filter((member) => member.status === "APPROVED"),
          };
        }),
      );

      setTeamsWithMembers(teamsData);
    } catch {
      setTeamsWithMembers([]);
      setError("Unable to load your team members right now.");
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadOwnerTeamMembers();
  }, [loadOwnerTeamMembers]);

  if (loading) {
    return <p className="text-sm text-slate-700">Loading team members...</p>;
  }

  return (
    <section className="space-y-5 text-[#6a3a1a]">
      <div className="rounded-3xl border border-[#f0d7c5] bg-[#fff8f2] p-5">
        <h2 className="text-4xl font-extrabold text-[#7f3f16]">My Team Members</h2>
        <p className="mt-2 text-lg text-[#8d5a39]">
          View members of teams you own.
        </p>
      </div>

      {error ? <p className="text-base text-rose-700">{error}</p> : null}

      {teamsWithMembers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#dbb89f] bg-[#fffdfb] p-5 text-base text-[#8d5a39]">
          You do not own any teams yet. Create one on the{" "}
          <Link to="/teams/new" className="font-semibold text-[#ef8f31] hover:underline">
            Create Team
          </Link>{" "}
          page.
        </div>
      ) : (
        <div className="grid gap-4">
          {teamsWithMembers.map((team) => {
            return (
              <article
                key={team.teamId}
                className="rounded-3xl border border-[#e7c8b2] bg-[#fffdfb] p-6 shadow-[0_8px_18px_rgba(126,59,18,0.06)]"
              >
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-[#7b3f17]">{team.teamTitle}</h3>
                    <p className="mt-2 text-base text-[#85522f]">Status: {team.teamStatus}</p>
                  </div>

                  <div className="rounded-full bg-[#fff1e5] px-4 py-2 text-sm font-semibold text-[#8f5f41]">
                    Members: {team.members.length}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {team.members.length === 0 ? (
                    <p className="text-sm text-[#8f5f41]">No approved members yet.</p>
                  ) : (
                    team.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-xl border border-[#ebd2c0] bg-[#fff8f3] px-3 py-2"
                      >
                        <p className="text-sm font-semibold text-[#7e461f]">{member.userName}</p>
                        <p className="text-xs text-[#8f5f41]">Role: {member.roleInTeam}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/teams/${team.teamId}`}
                    className="rounded-lg border border-[#daac8c] px-3 py-2 text-sm font-semibold text-[#7e461f] hover:bg-[#fff1e5]"
                  >
                    View Team
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default TeamStatusPage;
