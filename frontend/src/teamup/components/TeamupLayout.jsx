import { NavLink, Outlet } from "react-router-dom";

const linkClasses = ({ isActive }) =>
  [
    "rounded-full px-4 py-2 text-sm font-semibold transition",
    isActive
      ? "bg-emerald-600 text-white"
      : "bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700",
  ].join(" ");

function TeamupLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 text-slate-900">
      <header className="border-b border-emerald-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-extrabold tracking-tight text-emerald-900">
              TeamUp Workspace
            </h1>
            <NavLink
              to="/"
              className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
            >
              Back to Home
            </NavLink>
          </div>
          <nav className="flex flex-wrap gap-2">
            <NavLink to="/teams/new" className={linkClasses}>
              Create Team
            </NavLink>
            <NavLink to="/teams" className={linkClasses} end>
              Team List
            </NavLink>
            <NavLink to="/admin/teamup" className={linkClasses}>
              Admin / Management
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

export default TeamupLayout;
