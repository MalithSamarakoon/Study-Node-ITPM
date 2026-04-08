import { useCallback, useEffect, useState } from "react";
import {
  approveMembershipRequest,
  getCreatedTeams,
  getTeamMembers,
  rejectMembershipRequest,
} from "../api/teamApi.js";
import { useCurrentUser } from "../hooks/useCurrentUser.js";

function TeamAdminPage() {
  const user = useCurrentUser();
  const currentUserId = String(user?.id || import.meta.env.VITE_TEAMUP_USER_ID || "1");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyMemberId, setBusyMemberId] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);

  const loadPendingRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const teams = await getCreatedTeams(currentUserId);
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
      setError("Unable to load TeamUp join requests.");
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadPendingRequests();
  }, [loadPendingRequests]);

  async function handleMembershipAction(teamId, memberId, action) {
    setBusyMemberId(memberId);
    try {
      if (action === "approve") {
        await approveMembershipRequest(teamId, memberId);
      } else {
        await rejectMembershipRequest(teamId, memberId);
      }

      await loadPendingRequests();
    } catch (actionError) {
      setError(actionError.message || "Failed to update membership request.");
    } finally {
      setBusyMemberId(null);
    }
  }

  return (
    <section className="space-y-5 text-slate-800">
      {loading ? <p className="text-sm text-slate-700">Loading join requests...</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-2xl font-bold text-slate-900">Join Requests ({pendingRequests.length})</h3>
        <div className="mt-4 space-y-3">
          {pendingRequests.length === 0 ? (
            <p className="text-base text-slate-600">No pending join requests.</p>
          ) : (
            pendingRequests.map((request) => (
              <article
                key={request.id}
                className="rounded-2xl border border-[#dbe5f5] bg-[#f8fbff] p-4"
              >
                <p className="text-lg font-semibold text-slate-800"> {request.userName}</p>
                <p className="text-sm text-slate-600">Team: {request.teamTitle}</p>
                <p className="text-sm text-slate-600">Message: {request.roleInTeam}</p>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleMembershipAction(request.teamId, request.id, "approve")}
                    disabled={busyMemberId === request.id}
                    className="rounded-lg bg-[#2563eb] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-70"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleMembershipAction(request.teamId, request.id, "reject")}
                    disabled={busyMemberId === request.id}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-70"
                  >
                    Reject
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default TeamAdminPage;
