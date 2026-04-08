import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  approveMembershipRequest,
  deleteTeam,
  getCreatedTeams,
  getTeamById,
  getTeamMembers,
  joinTeam,
  rejectMembershipRequest,
} from "../api/teamApi.js";
import { mockMembersByTeamId, mockTeams } from "../data/mockTeamupData.js";
import { formatTeamStatus, parseTeamMeta, splitSkills } from "../utils/teamMeta.js";
import { useCurrentUser } from "../hooks/useCurrentUser.js";

function TeamDetailsPage() {
  const user = useCurrentUser();
  const currentUserId = String(user?.id || import.meta.env.VITE_TEAMUP_USER_ID || "1");
  const navigate = useNavigate();

  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinForm, setJoinForm] = useState({ message: "Hi, I have SpringBoot experience" });
  const [joinMessage, setJoinMessage] = useState({ error: "", success: "" });
  const [joining, setJoining] = useState(false);
  const [updatingMemberId, setUpdatingMemberId] = useState(null);
  const [isMockMode, setIsMockMode] = useState(false);
  const [isLeaderView, setIsLeaderView] = useState(false);

  async function loadTeamDetails(teamId) {
    setLoading(true);
    setError("");

    try {
      const [teamData, membersData, createdTeams] = await Promise.all([
        getTeamById(teamId),
        getTeamMembers(teamId),
        getCreatedTeams(currentUserId),
      ]);
      setTeam(teamData);
      setMembers(membersData);
      setIsLeaderView(createdTeams.some((createdTeam) => String(createdTeam.id) === String(teamId)));
      setIsMockMode(false);
    } catch {
      const fallbackTeam = mockTeams.find((mock) => String(mock.id) === String(teamId)) || mockTeams[0];
      setTeam(fallbackTeam || null);
      setMembers(mockMembersByTeamId[fallbackTeam?.id] || []);
      setIsLeaderView(false);
      setIsMockMode(true);
      setError("Backend unavailable. Showing dummy TeamUp details.");
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
    setJoinMessage({ error: "", success: "" });
  }

  async function handleJoinRequest(event) {
    event.preventDefault();

    if (!joinForm.message.trim()) {
      setJoinMessage({ error: "Message is required.", success: "" });
      return;
    }

    setJoining(true);

    try {
      if (isMockMode) {
        const nextId = Math.max(0, ...members.map((member) => Number(member.id))) + 1;
        setMembers((prev) => [
          ...prev,
          {
            id: nextId,
            userId: Number(currentUserId),
            userName: `Student ${currentUserId}`,
            roleInTeam: joinForm.message.trim(),
            status: "PENDING",
          },
        ]);
      } else {
        await joinTeam(id, {
          userId: Number(currentUserId),
          roleInTeam: joinForm.message.trim(),
        });
      }

      setJoinMessage({ error: "", success: "Request Pending" });
      setJoinForm({ message: "Hi, I have SpringBoot experience" });
      setJoinModalOpen(false);

      if (!isMockMode) {
        await loadTeamDetails(id);
      }
    } catch (requestError) {
      setJoinMessage({
        error: requestError.message || "Failed to send join request.",
        success: "",
      });
    } finally {
      setJoining(false);
    }
  }

  async function handleRequestAction(memberId, action) {
    setUpdatingMemberId(memberId);
    try {
      if (isMockMode) {
        setMembers((prev) =>
          prev.map((member) =>
            member.id === memberId
              ? { ...member, status: action === "approve" ? "APPROVED" : "REJECTED" }
              : member,
          ),
        );
      } else {
        if (action === "approve") {
          await approveMembershipRequest(id, memberId);
        } else {
          await rejectMembershipRequest(id, memberId);
        }

        await loadTeamDetails(id);
      }
    } catch (actionError) {
      setError(actionError.message || "Failed to update join request.");
    } finally {
      setUpdatingMemberId(null);
    }
  }

  async function handleDeleteTeam() {
    const confirmed = window.confirm("Are you sure you want to delete this team?");
    if (!confirmed) {
      return;
    }

    try {
      if (!isMockMode) {
        await deleteTeam(id);
      }
      navigate("/teams");
    } catch (deleteError) {
      setError(deleteError.message || "Failed to delete team.");
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

  const meta = parseTeamMeta(team.description);
  const skills = splitSkills(team.requiredSkills);
  const currentMembers = members.filter((member) => member.status === "APPROVED");
  const pendingMembers = members.filter((member) => member.status === "PENDING");
  const uiStatus = formatTeamStatus(team.status, team.memberCount, meta.maxMembers);
  const currentUserMembership = members.find((member) => String(member.userId) === currentUserId);
  const hasRequested = currentUserMembership?.status === "PENDING";
  const isAlreadyMember = currentUserMembership?.status === "APPROVED";

  return (
    <section className="space-y-5 text-slate-800">
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-5xl font-extrabold text-slate-900">{team.title}</h2>
        <div className="mt-4 grid gap-1 text-lg text-slate-600">
          <p>Created by: {team.createdByName}</p>
          <p>Type: {meta.type}</p>
          <p>
            Members: {team.memberCount} / {meta.maxMembers}
          </p>
          <p>Status: {uiStatus}</p>
          <p>Deadline: {meta.deadline || "Not specified"}</p>
        </div>

        <div className="mt-6">
          <h3 className="text-2xl font-bold text-slate-900">Required Skills:</h3>
          <ul className="mt-2 space-y-1 text-lg text-slate-700">
            {skills.length === 0 ? <li>No skills listed.</li> : null}
            {skills.map((skill) => (
              <li key={skill}>✔ {skill}</li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-2xl font-bold text-slate-900">Description:</h3>
          <p className="mt-2 rounded-2xl border border-[#dbe5f5] bg-[#f8fbff] p-4 text-lg text-slate-700">
            {meta.cleanDescription || "No description provided."}
          </p>
        </div>

        <div className="mt-6">
          <h3 className="text-2xl font-bold text-slate-900">Current Members:</h3>
          <ul className="mt-2 space-y-1 text-lg text-slate-700">
            <li>👑 {team.createdByName} (Leader)</li>
            {currentMembers
              .filter((member) => member.userName !== team.createdByName)
              .map((member) => (
                <li key={member.id}>👤 {member.userName}</li>
              ))}
          </ul>
        </div>

        {isLeaderView ? (
          <div className="mt-7 rounded-2xl border border-[#dbe5f5] bg-[#f8fbff] p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                onClick={() => navigate(`/teams/${id}/edit`)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Edit Team
              </button>
              <button
                onClick={handleDeleteTeam}
                className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Delete Team
              </button>
            </div>

            <h3 className="text-2xl font-bold text-slate-900">
              Join Requests ({pendingMembers.length})
            </h3>

            <div className="mt-3 space-y-3">
              {pendingMembers.length === 0 ? (
                <p className="text-base text-slate-600">No pending requests.</p>
              ) : (
                pendingMembers.map((member) => (
                  <article key={member.id} className="rounded-xl border border-[#dbe5f5] bg-white p-4">
                    <p className="text-lg font-semibold text-slate-800">👤 {member.userName}</p>
                    <p className="text-base text-slate-600">Message: {member.roleInTeam}</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleRequestAction(member.id, "approve")}
                        disabled={updatingMemberId === member.id}
                        className="rounded-lg bg-[#2563eb] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-70"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRequestAction(member.id, "reject")}
                        disabled={updatingMemberId === member.id}
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
        ) : null}

        {!isLeaderView ? (
          <div className="mt-7 flex flex-wrap items-center gap-3">
            {hasRequested ? (
              <button
                disabled
                className="rounded-xl bg-amber-100 px-5 py-2.5 text-base font-semibold text-amber-800 disabled:cursor-not-allowed"
              >
                Requested
              </button>
            ) : isAlreadyMember ? (
              <button
                disabled
                className="rounded-xl bg-emerald-100 px-5 py-2.5 text-base font-semibold text-emerald-800 disabled:cursor-not-allowed"
              >
                Joined
              </button>
            ) : (
              <button
                onClick={() => setJoinModalOpen(true)}
                className="rounded-xl bg-[#2563eb] px-5 py-2.5 text-base font-semibold text-white hover:bg-[#1d4ed8]"
              >
                Request to Join
              </button>
            )}
          </div>
        ) : null}

        {joinMessage.success ? <p className="mt-3 text-base font-semibold text-blue-700">{joinMessage.success}</p> : null}
        {joinMessage.error ? <p className="mt-3 text-base text-rose-700">{joinMessage.error}</p> : null}
      </article>

      {joinModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6">
            <h3 className="text-2xl font-bold text-slate-900">Message to Leader</h3>
            <form className="mt-3 space-y-3" onSubmit={handleJoinRequest}>
              <textarea
                name="message"
                value={joinForm.message}
                onChange={handleJoinChange}
                rows={4}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setJoinModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={joining}
                  className="rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-70"
                >
                  {joining ? "Sending..." : "Send Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default TeamDetailsPage;
