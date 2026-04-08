import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  deleteTeam,
  getCreatedTeams,
  getJoinedTeams,
  getTeams,
  joinTeam,
  updateTeamStatus,
} from "../api/teamApi.js";
import { mockMembersByTeamId, mockTeams } from "../data/mockTeamupData.js";
import { useCurrentUser } from "../hooks/useCurrentUser.js";
import {
  formatTeamStatus,
  parseTeamMeta,
  splitSkills,
} from "../utils/teamMeta.js";

function TeamListPage({ onlyMine = false }) {
  const user = useCurrentUser();
  const currentUserId = String(user?.id || import.meta.env.VITE_TEAMUP_USER_ID || "1");
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [joiningTeamId, setJoiningTeamId] = useState(null);
  const [requestPendingIds, setRequestPendingIds] = useState({});
  const [statusUpdatingTeamId, setStatusUpdatingTeamId] = useState(null);
  const [joinModal, setJoinModal] = useState({
    open: false,
    teamId: null,
    teamTitle: "",
    message: "Hi, I have SpringBoot experience",
    error: "",
  });
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    teamId: null,
    teamTitle: "",
    deleting: false,
  });
  const [isMockMode, setIsMockMode] = useState(false);
  const [ownedTeamIds, setOwnedTeamIds] = useState(new Set());

  const markPendingFromJoinedTeams = useCallback(async () => {
    try {
      const joinedTeams = await getJoinedTeams(currentUserId);
      const pendingLookup = joinedTeams.reduce((acc, team) => {
        acc[team.id] = true;
        return acc;
      }, {});
      setRequestPendingIds((prev) => ({ ...prev, ...pendingLookup }));
    } catch {
      // Best-effort enhancement: keep local pending state when joined teams cannot be loaded.
    }
  }, [currentUserId]);

  const loadTeams = useCallback(async (skill) => {
    setLoading(true);
    setError("");

    try {
      let data = [];
      let ownedTeams = [];

      if (onlyMine) {
        data = await getCreatedTeams(currentUserId, skill);
      } else {
        data = await getTeams(skill);
        ownedTeams = await getCreatedTeams(currentUserId);
      }

      if (onlyMine) {
        ownedTeams = data;
      }

      setOwnedTeamIds(new Set(ownedTeams.map((team) => team.id)));

      const resolved = data.length > 0 ? data : mockTeams;
      if (onlyMine) {
        setTeams(resolved);
      } else {
        setTeams(data.length > 0 ? data : resolved);
      }
      setIsMockMode(data.length === 0);
    } catch {
      if (onlyMine) {
        const filteredMock = mockTeams.filter((team) => ownedTeamIds.has(team.id));
        setTeams(filteredMock);
      } else {
        setTeams(mockTeams);
      }
      setIsMockMode(true);
      setError("Backend unavailable. Showing dummy TeamUp data.");
    } finally {
      setLoading(false);
    }
  }, [currentUserId, onlyMine]);

  useEffect(() => {
    loadTeams("");
  }, [loadTeams]);

  useEffect(() => {
    if (!onlyMine) {
      markPendingFromJoinedTeams();
    }
  }, [markPendingFromJoinedTeams, onlyMine]);

  const list = useMemo(() => {
    const sorted = [...teams].sort((a, b) => Number(b.id) - Number(a.id));

    return sorted
      .map((team) => {
        const meta = parseTeamMeta(team.description);
        const skills = splitSkills(team.requiredSkills);
        const status = formatTeamStatus(team.status, team.memberCount, meta.maxMembers);

        return {
          ...team,
          meta,
          skills,
          cardStatus: status,
        };
      })
      .filter((team) => {
        if (typeFilter !== "ALL" && team.meta.type !== typeFilter) {
          return false;
        }

        if (!searchText.trim()) {
          return true;
        }

        const q = searchText.toLowerCase();
        return (
          team.title.toLowerCase().includes(q) ||
          team.meta.cleanDescription.toLowerCase().includes(q) ||
          team.requiredSkills.toLowerCase().includes(q)
        );
      });
  }, [teams, searchText, typeFilter]);

  function openJoinModal(team) {
    setJoinModal({
      open: true,
      teamId: team.id,
      teamTitle: team.title,
      message: "Hi, I have SpringBoot experience",
      error: "",
    });
  }

  function closeJoinModal() {
    setJoinModal((prev) => ({ ...prev, open: false }));
  }

  async function sendJoinRequest() {
    if (!joinModal.message.trim()) {
      setJoinModal((prev) => ({ ...prev, error: "Message is required." }));
      return;
    }

    setJoiningTeamId(joinModal.teamId);
    try {
      if (!isMockMode) {
        await joinTeam(joinModal.teamId, {
          userId: Number(currentUserId),
          roleInTeam: joinModal.message.trim(),
        });
      }

      setRequestPendingIds((prev) => ({ ...prev, [joinModal.teamId]: true }));
      closeJoinModal();
    } catch (joinError) {
      setJoinModal((prev) => ({
        ...prev,
        error: joinError.message || "Failed to send join request.",
      }));
    } finally {
      setJoiningTeamId(null);
    }
  }

  function openDeleteModal(team) {
    setDeleteModal({
      open: true,
      teamId: team.id,
      teamTitle: team.title,
      deleting: false,
    });
  }

  function closeDeleteModal() {
    setDeleteModal((prev) => ({ ...prev, open: false }));
  }

  async function confirmDelete() {
    setDeleteModal((prev) => ({ ...prev, deleting: true }));
    try {
      if (!isMockMode) {
        await deleteTeam(deleteModal.teamId);
      }
      // Remove deleted team from list
      setTeams((prev) => prev.filter((t) => t.id !== deleteModal.teamId));
      closeDeleteModal();
    } catch (deleteError) {
      alert(deleteError.message || "Failed to delete team.");
      setDeleteModal((prev) => ({ ...prev, deleting: false }));
    }
  }

  async function handleOwnerStatusToggle(teamId, nextStatus) {
    setStatusUpdatingTeamId(teamId);
    setError("");
    try {
      await updateTeamStatus(teamId, nextStatus);
      await loadTeams("");
    } catch (statusError) {
      setError(statusError.message || "Failed to update team status.");
    } finally {
      setStatusUpdatingTeamId(null);
    }
  }

  return (
    <section className="space-y-6 text-slate-800">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
          {onlyMine ? "My Teams" : "TeamUp - Find or Create Teams"}
        </h2>
        <p className="mt-2 text-base text-slate-600 sm:text-lg">
          A platform for finding partners for projects, hackathons, and academic events.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_180px_140px]">
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            placeholder="Search Teams..."
          />

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          >
            <option value="ALL">Filter: All</option>
            <option value="PROJECT">Filter: Project</option>
            <option value="EVENT">Filter: Event</option>
          </select>

          <button
            onClick={() => loadTeams("")}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

      </div>

      {loading ? <p className="text-sm text-slate-600">Loading teams...</p> : null}
      {error ? <p className="text-base text-rose-700">{error}</p> : null}

      {!loading && !error && list.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-base text-slate-600">
          No teams found.
        </p>
      ) : null}

      <div className="grid gap-4">
        {list.map((team) => {
          const isOwner = ownedTeamIds.has(team.id);
          const isOpen = team.status !== "CLOSED";
          const canToggleStatus = ["PENDING", "APPROVED", "ACTIVE", "CLOSED"].includes(team.status);

          return (
          <article
            key={team.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 sm:text-3xl">{team.title}</h3>
                <p className="mt-1 text-base text-slate-600">Type: {team.meta.type}</p>
                <p className="text-base text-slate-600">Created by: {team.createdByName}</p>
                <p className="text-base text-slate-600">
                  Members: {team.memberCount} / {team.meta.maxMembers}
                </p>
                <p className="text-base text-slate-600">
                  Skills Needed: {team.skills.join(", ") || "Not specified"}
                </p>
                <p className="text-base font-semibold text-slate-700">Status: {team.cardStatus}</p>
              </div>

              <div className="flex items-center gap-2">
                {requestPendingIds[team.id] ? (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                    Request Pending
                  </span>
                ) : null}
                {isOwner ? (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isOpen}
                    onClick={() => handleOwnerStatusToggle(team.id, isOpen ? "CLOSED" : "ACTIVE")}
                    disabled={statusUpdatingTeamId === team.id || !canToggleStatus}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span className={`relative h-6 w-11 rounded-full transition ${isOpen ? "bg-emerald-500" : "bg-slate-300"}`}>
                      <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${isOpen ? "translate-x-5" : "translate-x-0"}`} />
                    </span>
                    <span>
                      {statusUpdatingTeamId === team.id ? "Updating..." : isOpen ? "Open" : "Closed"}
                    </span>
                  </button>
                ) : null}
              </div>
            </div>

            <div className="my-4 border-t border-slate-200" />

            <p className="text-base text-slate-700 sm:text-lg">
              {team.meta.cleanDescription || "No description provided."}
            </p>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Deadline: {team.meta.deadline || "Not specified"}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to={`/teams/${team.id}`}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                View Details
              </Link>
              {!isOwner ? (
                requestPendingIds[team.id] ? (
                  <button
                    disabled
                    className="rounded-xl bg-blue-100 px-4 py-2.5 text-base font-semibold text-blue-800 disabled:cursor-not-allowed"
                  >
                    Requested
                  </button>
                ) : (
                  <button
                    onClick={() => openJoinModal(team)}
                    disabled={joiningTeamId === team.id}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {joiningTeamId === team.id ? "Sending..." : "Request to Join"}
                  </button>
                )
              ) : null}
              {onlyMine && isOwner ? (
                <>
                  <Link
                    to={`/teams/${team.id}/edit`}
                    className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-base font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => openDeleteModal(team)}
                    className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-base font-semibold text-rose-700 hover:bg-rose-100"
                  >
                    Delete
                  </button>
                </>
              ) : null}
            </div>
          </article>
        );
      })}
      </div>

      {joinModal.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-xl rounded-3xl border border-[#ebc4a9] bg-[#fffdfb] p-6">
            <h3 className="text-2xl font-bold text-[#7c3f16]">Request to Join</h3>
            <p className="mt-1 text-base text-[#8c5d3e]">{joinModal.teamTitle}</p>

            <label className="mt-4 block text-sm font-semibold text-[#764121]">Message to Leader</label>
            <textarea
              value={joinModal.message}
              onChange={(event) =>
                setJoinModal((prev) => ({ ...prev, message: event.target.value, error: "" }))
              }
              rows={4}
              className="mt-1 w-full rounded-xl border border-[#efcfbb] px-4 py-3 outline-none focus:border-[#eb8f3a]"
            />

            {joinModal.error ? <p className="mt-2 text-sm text-rose-700">{joinModal.error}</p> : null}

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={closeJoinModal}
                className="rounded-xl border border-[#d7b69e] px-4 py-2 text-sm font-semibold text-[#7e461f]"
              >
                Cancel
              </button>
              <button
                onClick={sendJoinRequest}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteModal.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-xl rounded-3xl border border-rose-300 bg-[#fffdfb] p-6">
            <h3 className="text-2xl font-bold text-rose-700">Delete Team</h3>
            <p className="mt-2 text-base text-[#8c5d3e]">
              Are you sure you want to delete <span className="font-semibold">{deleteModal.teamTitle}</span>? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={closeDeleteModal}
                disabled={deleteModal.deleting}
                className="rounded-xl border border-[#d7b69e] px-4 py-2 text-sm font-semibold text-[#7e461f] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteModal.deleting}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleteModal.deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default TeamListPage;
