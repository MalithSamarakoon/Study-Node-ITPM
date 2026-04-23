import { Bell, Mail, UserRound } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser.js";

const linkClasses = ({ isActive }) =>
  [
    "flex items-center rounded-2xl px-4 py-3 text-xl font-semibold transition",
    isActive
      ? "bg-violet-100 text-violet-700 shadow-sm"
      : "text-slate-700 hover:bg-slate-100",
  ].join(" ");

function TeamupLayout() {
  const user = useCurrentUser();

  return (
    <div className="min-h-screen bg-slate-50 px-2 py-3 text-slate-800 sm:px-5 sm:py-5">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-[1280px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm lg:grid-cols-[250px_1fr]">
        <aside className="border-r border-slate-200 bg-white">
          <div className="px-7 py-7 text-5xl font-extrabold tracking-tight text-violet-700">TeamUp</div>
          <div className="px-5 pb-6">
            <NavLink to="/teams/new" className="mb-4 flex items-center justify-center rounded-2xl bg-violet-600 px-4 py-3 text-lg font-semibold text-white hover:bg-violet-700">
              + Create Team
            </NavLink>
          </div>

          <nav className="space-y-1 px-3 pb-6">
            <NavLink to="/teams" className={linkClasses} end>
              All Teams
            </NavLink>
            <NavLink to="/teams/my" className={linkClasses}>
              My Teams
            </NavLink>
            <NavLink to="/teams/status" className={linkClasses}>
              Team Status
            </NavLink>
            <NavLink to="/admin/teamup" className={linkClasses}>
              TeamUp Requests
            </NavLink>
            <NavLink to="/" className={linkClasses}>Back to Home</NavLink>
          </nav>
        </aside>

        <section className="flex min-h-full flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
            <NavLink to="/teams" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
              TeamUp Workspace
            </NavLink>
            <div className="flex items-center gap-4 text-slate-400">
              <Bell size={18} />
              <Mail size={18} />
              <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                <UserRound size={16} />
                {user?.name || "Student"}
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-5 sm:px-8 sm:py-8">
            <Outlet />
          </main>
        </section>
      </div>
    </div>
  );
}

export default TeamupLayout;
