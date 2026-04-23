import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCreatedTeams, getTeamMembers } from "../api/teamApi.js";
import { useCurrentUser } from "../hooks/useCurrentUser.js";

function TeamStatusPage() {
  const user = useCurrentUser();
  const currentUserId = user?.id != null ? String(user.id) : null;
  const [teamsWithMembers, setTeamsWithMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOwnerTeamMembers = useCallback(async () => {
    if (!currentUserId) {
      setTeamsWithMembers([]);
      setError("Unable to resolve your TeamUp account. Please log in again.");
      setLoading(false);
      return;
    }

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
            ownerName: team.createdByName,
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
    <section className="space-y-5 text-slate-800">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-4xl font-extrabold text-slate-900">My Team Members</h2>
        <p className="mt-2 text-lg text-slate-600">
          View members of teams you own.
        </p>
      </div>

      {error ? <p className="text-base text-rose-700">{error}</p> : null}

      {teamsWithMembers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-base text-slate-600">
          You do not own any teams yet. Create one on the{" "}
          <Link to="/teams/new" className="font-semibold text-violet-700 hover:underline">
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
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{team.teamTitle}</h3>
                    <p className="mt-2 text-base text-slate-600">Status: {team.teamStatus}</p>
                  </div>

                  <div className="rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
                    Members: {team.members.length}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-sm font-semibold text-slate-800">{team.ownerName || "Team Owner"}</p>
                    <p className="text-xs text-slate-600">Role: Owner</p>
                  </div>

                  {team.members.length === 0 ? (
                    <p className="text-sm text-slate-600">No approved members yet.</p>
                  ) : (
                    team.members
                      .filter((member) => member.userName !== team.ownerName)
                      .map((member) => (
                      <div
                        key={member.id}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                      >
                        <p className="text-sm font-semibold text-slate-800">{member.userName}</p>
                        <p className="text-xs text-slate-600">Note: {member.roleInTeam}</p>
                      </div>
                      ))
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/teams/${team.teamId}`}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
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
