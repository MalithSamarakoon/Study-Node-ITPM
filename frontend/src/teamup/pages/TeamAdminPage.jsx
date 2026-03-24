import { useEffect, useMemo, useState } from "react";
import {
  approveMembershipRequest,
  approveTeam,
  getTeams,
  getTeamMembers,
  rejectMembershipRequest,
  rejectTeam,
  updateTeamStatus,
} from "../api/teamApi.js";
import { mockPendingRequests, mockTeams } from "../data/mockTeamupData.js";
import StatusBadge from "../components/StatusBadge.jsx";

const allStatuses = ["PENDING", "APPROVED", "REJECTED", "ACTIVE", "CLOSED"];

function TeamAdminPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyTeamId, setBusyTeamId] = useState(null);
  const [busyMemberId, setBusyMemberId] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isMockMode, setIsMockMode] = useState(false);

  async function loadTeams() {
    setLoading(true);
    setError("");

    try {
      const data = await getTeams();
      const resolved = data.length > 0 ? data : mockTeams;
      setTeams(resolved);
      setIsMockMode(data.length === 0);
    } catch {
      setTeams(mockTeams);
      setPendingRequests(mockPendingRequests);
      setIsMockMode(true);
      setError("Backend unavailable. Showing dummy TeamUp admin data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    async function loadPendingRequests() {
      if (isMockMode) {
        setPendingRequests(mockPendingRequests);
        return;
      }

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
  }, [isMockMode, teams]);

  const pendingTeams = useMemo(
    () => teams.filter((team) => team.status === "PENDING"),
    [teams],
  );

  async function handleApprove(id) {
    setBusyTeamId(id);
    try {
      if (isMockMode) {
        setTeams((prev) => prev.map((team) => (team.id === id ? { ...team, status: "APPROVED" } : team)));
      } else {
        await approveTeam(id);
        await loadTeams();
      }
    } catch (actionError) {
      setError(actionError.message || "Failed to approve team.");
    } finally {
      setBusyTeamId(null);
    }
  }

  async function handleReject(id) {
    setBusyTeamId(id);
    try {
      if (isMockMode) {
        setTeams((prev) => prev.map((team) => (team.id === id ? { ...team, status: "REJECTED" } : team)));
      } else {
        await rejectTeam(id);
        await loadTeams();
      }
    } catch (actionError) {
      setError(actionError.message || "Failed to reject team.");
    } finally {
      setBusyTeamId(null);
    }
  }

  async function handleStatusChange(id, status) {
    setBusyTeamId(id);
    try {
      if (isMockMode) {
        setTeams((prev) => prev.map((team) => (team.id === id ? { ...team, status } : team)));
      } else {
        await updateTeamStatus(id, status);
        await loadTeams();
      }
    } catch (actionError) {
      setError(actionError.message || "Failed to update status.");
    } finally {
      setBusyTeamId(null);
    }
  }

  async function handleMembershipAction(teamId, memberId, action) {
    setBusyMemberId(memberId);
    try {
      if (isMockMode) {
        setPendingRequests((prev) => prev.filter((request) => request.id !== memberId));
      } else {
        if (action === "approve") {
          await approveMembershipRequest(teamId, memberId);
        } else {
          await rejectMembershipRequest(teamId, memberId);
        }

        await loadTeams();
      }
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
        <h3 className="text-2xl font-bold text-[#7b3f17]">Pending Teams</h3>

        {pendingTeams.length === 0 ? (
          <p className="mt-3 text-base text-[#8d5e3f]">No pending teams right now.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {pendingTeams.map((team) => (
              <article
                key={team.id}
                className="flex flex-col gap-3 rounded-2xl border border-[#efd1bc] bg-[#fff4eb] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-lg font-semibold text-[#7e461f]">{team.title}</p>
                  <p className="text-base text-[#8f5f41]">{team.requiredSkills}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(team.id)}
                    disabled={busyTeamId === team.id}
                    className="rounded-lg bg-[#ef8f31] px-3 py-2 text-sm font-semibold text-white hover:bg-[#e17f21] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(team.id)}
                    disabled={busyTeamId === team.id}
                    className="rounded-lg border border-[#d0aa8f] px-3 py-2 text-sm font-semibold text-[#7e461f] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

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
