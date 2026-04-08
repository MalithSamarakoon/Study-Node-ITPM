import { Bell, Mail, UserRound } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser.js";

const linkClasses = ({ isActive }) =>
  [
    "flex items-center rounded-2xl px-4 py-3 text-xl font-semibold transition",
    isActive
      ? "bg-[#eef4ff] text-[#1e3a8a] shadow-sm"
      : "text-slate-700 hover:bg-[#f3f7ff]",
  ].join(" ");

function TeamupLayout() {
  const user = useCurrentUser();

  return (
    <div className="min-h-screen bg-[#f5f8ff] px-2 py-3 text-slate-800 sm:px-5 sm:py-5">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-[1280px] overflow-hidden rounded-[28px] border border-[#dbe5f5] bg-white shadow-[0_16px_40px_rgba(37,99,235,0.08)] lg:grid-cols-[250px_1fr]">
        <aside className="border-r border-[#e3ebf8] bg-[#f8fbff]">
          <div className="px-7 py-7 text-5xl font-extrabold tracking-tight text-[#1d4ed8]">TeamUp</div>
          <div className="px-5 pb-6">
            <NavLink to="/teams/new" className="mb-4 flex items-center justify-center rounded-2xl bg-[#2563eb] px-4 py-3 text-lg font-semibold text-white shadow-[0_6px_14px_rgba(37,99,235,0.3)] hover:bg-[#1d4ed8]">
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
          <header className="flex items-center justify-between border-b border-[#e3ebf8] bg-white px-5 py-4 sm:px-8">
            <NavLink to="/teams" className="text-sm font-semibold text-[#334155] hover:text-[#1e3a8a]">
              TeamUp Workspace
            </NavLink>
            <div className="flex items-center gap-4 text-[#3b82f6]">
              <Bell size={18} />
              <Mail size={18} />
              <div className="flex items-center gap-2 rounded-full bg-[#eef4ff] px-3 py-1.5 text-sm font-semibold text-[#1e3a8a]">
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
