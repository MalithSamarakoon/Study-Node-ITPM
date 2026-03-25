import { useEffect, useState } from "react";
import {
  approveMembershipRequest,
  getTeams,
  getTeamMembers,
  rejectMembershipRequest,
  updateTeamStatus,
} from "../api/teamApi.js";
import StatusBadge from "../components/StatusBadge.jsx";

const allStatuses = ["PENDING", "APPROVED", "REJECTED", "ACTIVE", "CLOSED"];

function TeamAdminPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyTeamId, setBusyTeamId] = useState(null);
  const [busyMemberId, setBusyMemberId] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);

  async function loadTeams() {
    setLoading(true);
    setError("");

    try {
      const data = await getTeams();
      setTeams(data);
    } catch {
      setTeams([]);
      setPendingRequests([]);
      setError("Unable to load TeamUp admin data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    async function loadPendingRequests() {
      try {
        const requestGroups = await Promise.all(
          teams.map(async (team) => {
            const members = await getTeamMembers(team.id);
            return members
              .filter((member) => member.status === "PENDING")
              .map((member) => ({
                ...member,
                teamId: team.id,
                teamTitle: team.title,
              }));
          }),
        );

        setPendingRequests(requestGroups.flat());
      } catch {
        setPendingRequests([]);
      }
    }

    if (teams.length > 0) {
      loadPendingRequests();
    } else {
      setPendingRequests([]);
    }
  }, [teams]);

  async function handleStatusChange(id, status) {
    setBusyTeamId(id);
    try {
      await updateTeamStatus(id, status);
      await loadTeams();
    } catch (actionError) {
      setError(actionError.message || "Failed to update status.");
    } finally {
      setBusyTeamId(null);
    }
  }

  async function handleMembershipAction(teamId, memberId, action) {
    setBusyMemberId(memberId);
    try {
      if (action === "approve") {
        await approveMembershipRequest(teamId, memberId);
      } else {
        await rejectMembershipRequest(teamId, memberId);
      }

      await loadTeams();
    } catch (actionError) {
      setError(actionError.message || "Failed to update membership request.");
    } finally {
      setBusyMemberId(null);
    }
  }

  return (
    <section className="space-y-5 text-[#6a3a1a]">
      <div className="rounded-3xl border border-[#e8cab5] bg-[#fffdfb] p-6 shadow-[0_8px_20px_rgba(123,63,23,0.06)]">
        <h2 className="text-4xl font-extrabold text-[#7b3f17]">Admin / Management</h2>
        <p className="mt-2 text-base text-[#8d5e3f]">
          Review pending teams, approve or reject requests, and update statuses.
        </p>
      </div>

      {loading ? <p className="text-sm text-slate-700">Loading management data...</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="rounded-3xl border border-[#e8cab5] bg-[#fffdfb] p-5 shadow-[0_8px_20px_rgba(123,63,23,0.06)]">
        <h3 className="text-2xl font-bold text-[#7b3f17]">Join Requests ({pendingRequests.length})</h3>
        <div className="mt-4 space-y-3">
          {pendingRequests.length === 0 ? (
            <p className="text-base text-[#8d5e3f]">No pending join requests.</p>
          ) : (
            pendingRequests.map((request) => (
              <article
                key={request.id}
                className="rounded-2xl border border-[#ebd2c0] bg-[#fff8f3] p-4"
              >
                <p className="text-lg font-semibold text-[#7e461f]">👤 {request.userName}</p>
                <p className="text-sm text-[#8f5f41]">Team: {request.teamTitle}</p>
                <p className="text-sm text-[#8f5f41]">Message: {request.roleInTeam}</p>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleMembershipAction(request.teamId, request.id, "approve")}
                    disabled={busyMemberId === request.id}
                    className="rounded-lg bg-[#ef8f31] px-3 py-2 text-sm font-semibold text-white disabled:opacity-70"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleMembershipAction(request.teamId, request.id, "reject")}
                    disabled={busyMemberId === request.id}
                    className="rounded-lg border border-[#d0aa8f] px-3 py-2 text-sm font-semibold text-[#7e461f] disabled:opacity-70"
                  >
                    Reject
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-[#e8cab5] bg-[#fffdfb] p-5 shadow-[0_8px_20px_rgba(123,63,23,0.06)]">
        <h3 className="text-2xl font-bold text-[#7b3f17]">Update Team Status</h3>
        <div className="mt-4 space-y-3">
          {teams.map((team) => (
            <article
              key={team.id}
              className="flex flex-col gap-3 rounded-2xl border border-[#ebd2c0] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-[#7e461f]">{team.title}</p>
                <div className="mt-2">
                  <StatusBadge status={team.status} />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-[#8f5f41]">
                <span>Set status:</span>
                <select
                  value={team.status}
                  onChange={(event) => handleStatusChange(team.id, event.target.value)}
                  disabled={busyTeamId === team.id}
                  className="rounded-lg border border-[#d6b59d] px-3 py-2 outline-none focus:border-[#eb8f3a] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {allStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TeamAdminPage;
