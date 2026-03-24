import { useEffect, useMemo, useState } from "react";
import {
  approveTeam,
  getTeams,
  rejectTeam,
  updateTeamStatus,
} from "../api/teamApi.js";
import StatusBadge from "../components/StatusBadge.jsx";

const allStatuses = ["PENDING", "APPROVED", "REJECTED", "ACTIVE", "CLOSED"];

function TeamAdminPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyTeamId, setBusyTeamId] = useState(null);

  async function loadTeams() {
    setLoading(true);
    setError("");

    try {
      const data = await getTeams();
      setTeams(data);
    } catch (loadError) {
      setError(loadError.message || "Failed to load teams.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeams();
  }, []);

  const pendingTeams = useMemo(
    () => teams.filter((team) => team.status === "PENDING"),
    [teams],
  );

  async function handleApprove(id) {
    setBusyTeamId(id);
    try {
      await approveTeam(id);
      await loadTeams();
    } catch (actionError) {
      setError(actionError.message || "Failed to approve team.");
    } finally {
      setBusyTeamId(null);
    }
  }

  async function handleReject(id) {
    setBusyTeamId(id);
    try {
      await rejectTeam(id);
      await loadTeams();
    } catch (actionError) {
      setError(actionError.message || "Failed to reject team.");
    } finally {
      setBusyTeamId(null);
    }
  }

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

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Admin / Management</h2>
        <p className="mt-2 text-sm text-slate-600">
          Review pending teams, approve or reject requests, and update statuses.
        </p>
      </div>

      {loading ? <p className="text-sm text-slate-700">Loading management data...</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Pending Teams</h3>

        {pendingTeams.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No pending teams right now.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {pendingTeams.map((team) => (
              <article
                key={team.id}
                className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">{team.title}</p>
                  <p className="text-sm text-slate-700">{team.requiredSkills}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(team.id)}
                    disabled={busyTeamId === team.id}
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(team.id)}
                    disabled={busyTeamId === team.id}
                    className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Update Status</h3>
        <div className="mt-4 space-y-3">
          {teams.map((team) => (
            <article
              key={team.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-slate-900">{team.title}</p>
                <div className="mt-2">
                  <StatusBadge status={team.status} />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <span>Set status:</span>
                <select
                  value={team.status}
                  onChange={(event) => handleStatusChange(team.id, event.target.value)}
                  disabled={busyTeamId === team.id}
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
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
