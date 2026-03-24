import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getTeams, joinTeam } from "../api/teamApi.js";
import { mockTeams } from "../data/mockTeamupData.js";
import {
  formatTeamStatus,
  parseTeamMeta,
  splitSkills,
} from "../utils/teamMeta.js";

function TeamListPage({ onlyMine = false }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [joiningTeamId, setJoiningTeamId] = useState(null);
  const [viewerUserId, setViewerUserId] = useState(
    () => window.localStorage.getItem("teamup.viewerUserId") || "",
  );
  const [requestPendingIds, setRequestPendingIds] = useState({});
  const [joinModal, setJoinModal] = useState({
    open: false,
    teamId: null,
    teamTitle: "",
    userId: "",
    message: "Hi, I have SpringBoot experience",
    error: "",
  });
  const [isMockMode, setIsMockMode] = useState(false);

  async function loadTeams(skill) {
    setLoading(true);
    setError("");

    try {
      const data = await getTeams(skill);
      const resolved = data.length > 0 ? data : mockTeams;
      setTeams(resolved);
      setIsMockMode(data.length === 0);
    } catch {
      setTeams(mockTeams);
      setIsMockMode(true);
      setError("Backend unavailable. Showing dummy TeamUp data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeams("");
  }, []);

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
        if (onlyMine && viewerUserId.trim()) {
          if (String(team.createdByUserId) !== viewerUserId.trim()) {
            return false;
          }
        }

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
  }, [onlyMine, teams, searchText, typeFilter, viewerUserId]);

  function openJoinModal(team) {
    setJoinModal({
      open: true,
      teamId: team.id,
      teamTitle: team.title,
      userId: "",
      message: "Hi, I have SpringBoot experience",
      error: "",
    });
  }

  function closeJoinModal() {
    setJoinModal((prev) => ({ ...prev, open: false }));
  }

  async function sendJoinRequest() {
    if (!joinModal.userId.trim() || Number.isNaN(Number(joinModal.userId))) {
      setJoinModal((prev) => ({ ...prev, error: "Valid user ID is required." }));
      return;
    }

    if (!joinModal.message.trim()) {
      setJoinModal((prev) => ({ ...prev, error: "Message is required." }));
      return;
    }

    setJoiningTeamId(joinModal.teamId);
    try {
      if (!isMockMode) {
        await joinTeam(joinModal.teamId, {
          userId: Number(joinModal.userId),
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

  return (
    <section className="space-y-5 text-[#6a3a1a]">
      <div className="rounded-3xl border border-[#f0d7c5] bg-[#fff8f2] p-5">
        <h2 className="text-4xl font-extrabold text-[#7f3f16]">
          {onlyMine ? "My Teams" : "TeamUp - Find or Create Teams"}
        </h2>
        <p className="mt-2 text-lg text-[#8d5a39]">
          A platform for finding partners for projects, hackathons, and academic events.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_190px_190px_auto]">
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className="rounded-2xl border border-[#efcfbb] bg-white px-4 py-3 text-lg outline-none focus:border-[#eb8f3a]"
            placeholder="Search Teams..."
          />

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="rounded-2xl border border-[#efcfbb] bg-white px-4 py-3 text-lg outline-none focus:border-[#eb8f3a]"
          >
            <option value="ALL">Filter: All</option>
            <option value="PROJECT">Filter: Project</option>
            <option value="EVENT">Filter: Event</option>
          </select>

          <button
            onClick={() => loadTeams("")}
            className="rounded-2xl border border-[#efcfbb] bg-white px-4 py-3 text-lg font-semibold text-[#7d4824] hover:bg-[#fff2e8]"
          >
            Refresh
          </button>

          <Link
            to="/teams/new"
            className="rounded-2xl bg-[#ef8f31] px-5 py-3 text-lg font-semibold text-white shadow-[0_6px_16px_rgba(239,143,49,0.35)] hover:bg-[#e18125]"
          >
            + Create Team
          </Link>
        </div>

        {onlyMine ? (
          <div className="mt-3">
            <input
              value={viewerUserId}
              onChange={(event) => {
                const value = event.target.value;
                setViewerUserId(value);
                window.localStorage.setItem("teamup.viewerUserId", value);
              }}
              className="w-full rounded-2xl border border-[#efcfbb] bg-white px-4 py-3 text-base outline-none focus:border-[#eb8f3a]"
              placeholder="Enter your user ID to load your teams"
            />
          </div>
        ) : null}
      </div>

      {loading ? <p className="text-base text-[#8d5a39]">Loading teams...</p> : null}
      {error ? <p className="text-base text-rose-700">{error}</p> : null}

      {!loading && !error && list.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#dbb89f] bg-[#fffdfb] p-5 text-base text-[#8d5a39]">
          No teams found.
        </p>
      ) : null}

      <div className="grid gap-4">
        {list.map((team) => (
          <article
            key={team.id}
            className="rounded-3xl border border-[#e7c8b2] bg-[#fffdfb] p-6 shadow-[0_8px_18px_rgba(126,59,18,0.06)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-4xl font-bold text-[#7b3f17]">{team.title}</h3>
                <p className="mt-1 text-lg text-[#85522f]">Type: {team.meta.type}</p>
                <p className="text-lg text-[#85522f]">Created by: {team.createdByName}</p>
                <p className="text-lg text-[#85522f]">
                  Members: {team.memberCount} / {team.meta.maxMembers}
                </p>
                <p className="text-lg text-[#85522f]">
                  Skills Needed: {team.skills.join(", ") || "Not specified"}
                </p>
                <p className="text-lg font-semibold text-[#9c4f1b]">Status: {team.cardStatus}</p>
              </div>

              {requestPendingIds[team.id] ? (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                  Request Pending
                </span>
              ) : null}
            </div>

            <div className="my-4 border-t border-[#efdfd2]" />

            <p className="text-lg text-[#7e4c2a]">
              {team.meta.cleanDescription || "No description provided."}
            </p>
            <p className="mt-2 text-base text-[#8f5f41]">
              Deadline: {team.meta.deadline || "Not specified"}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to={`/teams/${team.id}`}
                className="rounded-xl border border-[#daac8c] px-4 py-2.5 text-base font-semibold text-[#7e461f] hover:bg-[#fff1e5]"
              >
                View Details
              </Link>
              <button
                onClick={() => openJoinModal(team)}
                disabled={joiningTeamId === team.id}
                className="rounded-xl bg-[#ef8f31] px-4 py-2.5 text-base font-semibold text-white hover:bg-[#df7f21] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {joiningTeamId === team.id ? "Sending..." : "Request to Join"}
              </button>
            </div>
          </article>
        ))}
      </div>

      {joinModal.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-xl rounded-3xl border border-[#ebc4a9] bg-[#fffdfb] p-6">
            <h3 className="text-2xl font-bold text-[#7c3f16]">Request to Join</h3>
            <p className="mt-1 text-base text-[#8c5d3e]">{joinModal.teamTitle}</p>

            <label className="mt-4 block text-sm font-semibold text-[#764121]">Your User ID</label>
            <input
              value={joinModal.userId}
              onChange={(event) =>
                setJoinModal((prev) => ({ ...prev, userId: event.target.value, error: "" }))
              }
              className="mt-1 w-full rounded-xl border border-[#efcfbb] px-4 py-3 outline-none focus:border-[#eb8f3a]"
              placeholder="Enter your user ID"
            />

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
                className="rounded-xl bg-[#ef8f31] px-4 py-2 text-sm font-semibold text-white"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default TeamListPage;
