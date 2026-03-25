import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMembershipStatuses } from "../api/teamApi.js";
import { mockMembersByTeamId, mockTeams } from "../data/mockTeamupData.js";

function TeamStatusPage() {
  const currentUserId = String(import.meta.env.VITE_TEAMUP_USER_ID || "1");
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMockMode, setIsMockMode] = useState(false);

  const mockStatuses = useMemo(() => {
    return Object.entries(mockMembersByTeamId)
      .flatMap(([teamId, members]) =>
        members
          .filter((member) => String(member.userId) === currentUserId)
          .map((member) => ({
            teamId: Number(teamId),
            ...member,
          })),
      )
      .map((member) => {
        const matchedTeam = mockTeams.find((team) => Number(team.id) === Number(member.teamId));
        return {
          teamId: member.teamId,
          teamTitle: member.teamTitle || matchedTeam?.title || "Team",
          roleInTeam: member.roleInTeam,
          membershipStatus: member.status,
          updatedAt: new Date().toISOString(),
        };
      })
      .filter((status) => status.roleInTeam !== "Owner");
  }, [currentUserId]);

  useEffect(() => {
    let alive = true;

    async function loadStatuses() {
      setLoading(true);
      setError("");

      try {
        const data = await getMembershipStatuses(currentUserId);
        if (!alive) {
          return;
        }

        const requestedStatuses = data.filter((item) => item.roleInTeam !== "Owner");
        setStatuses(requestedStatuses);
        setIsMockMode(false);
      } catch {
        if (alive) {
          setStatuses(mockStatuses);
          setIsMockMode(true);
          setError("Backend unavailable. Showing dummy data.");
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    loadStatuses();

    return () => {
      alive = false;
    };
  }, [currentUserId, mockStatuses]);

  const statusColor = {
    PENDING: {
      bg: "bg-amber-50",
      badge: "text-amber-700 bg-amber-100",
      icon: "⏳",
    },
    APPROVED: {
      bg: "bg-emerald-50",
      badge: "text-emerald-700 bg-emerald-100",
      icon: "✅",
    },
    REJECTED: {
      bg: "bg-rose-50",
      badge: "text-rose-700 bg-rose-100",
      icon: "❌",
    },
  };

  if (loading) {
    return <p className="text-sm text-slate-700">Loading team statuses...</p>;
  }

  return (
    <section className="space-y-5 text-[#6a3a1a]">
      <div className="rounded-3xl border border-[#f0d7c5] bg-[#fff8f2] p-5">
        <h2 className="text-4xl font-extrabold text-[#7f3f16]">Team Requests Status</h2>
        <p className="mt-2 text-lg text-[#8d5a39]">
          View the status of all your team join requests.
        </p>
      </div>

      {error ? <p className="text-base text-rose-700">{error}</p> : null}

      {statuses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#dbb89f] bg-[#fffdfb] p-5 text-base text-[#8d5a39]">
          No join requests yet. Request to join teams on the{" "}
          <Link to="/teams" className="font-semibold text-[#ef8f31] hover:underline">
            All Teams
          </Link>{" "}
          page.
        </div>
      ) : (
        <div className="grid gap-4">
          {statuses.map((item) => {
            const colors = statusColor[item.membershipStatus] || statusColor.PENDING;
            return (
              <article
                key={`${item.teamId}-${item.roleInTeam}-${item.updatedAt}`}
                className={`rounded-3xl border border-[#e7c8b2] ${colors.bg} p-6 shadow-[0_8px_18px_rgba(126,59,18,0.06)]`}
              >
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-[#7b3f17]">{item.teamTitle}</h3>
                    <p className="mt-2 text-base text-[#85522f]">Your Role: {item.roleInTeam}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className={`inline-flex items-center gap-2 rounded-full ${colors.badge} px-4 py-2`}>
                      <span className="text-xl">{colors.icon}</span>
                      <span className="text-sm font-bold">{item.membershipStatus}</span>
                    </div>
                    <p className="text-xs text-[#8f5b39]">
                      Updated:{" "}
                      {new Date(item.updatedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/teams/${item.teamId}`}
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
