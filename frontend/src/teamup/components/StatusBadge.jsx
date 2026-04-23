const statusClasses = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-300",
  APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-300",
  REJECTED: "bg-rose-100 text-rose-800 border-rose-300",
  ACTIVE: "bg-blue-100 text-blue-800 border-blue-300",
  CLOSED: "bg-slate-100 text-slate-700 border-slate-300",
};

function StatusBadge({ status }) {
  const safeStatus = status || "PENDING";
  const classes =
    statusClasses[safeStatus] || "bg-slate-100 text-slate-700 border-slate-300";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${classes}`}
    >
      {safeStatus}
    </span>
  );
}

export default StatusBadge;
