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
    <section className="space-y-5 text-[#6a3a1a]">
      {loading ? <p className="text-sm text-slate-700">Loading join requests...</p> : null}
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
                <p className="text-lg font-semibold text-[#7e461f]"> {request.userName}</p>
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
    </section>
  );
}

export default TeamAdminPage;
