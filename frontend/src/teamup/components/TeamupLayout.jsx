import { Bell, Mail, UserRound } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser.js";

const linkClasses = ({ isActive }) =>
  [
    "flex items-center rounded-2xl px-4 py-3 text-xl font-semibold transition",
    isActive
      ? "bg-[#fff5ee] text-[#7a3b12] shadow-sm"
      : "text-[#6f3e1f] hover:bg-[#fff4ea]",
  ].join(" ");

function TeamupLayout() {
  const user = useCurrentUser();

  return (
    <div className="min-h-screen bg-[#fdf2e8] px-2 py-3 text-[#693919] sm:px-5 sm:py-5">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-[1280px] overflow-hidden rounded-[28px] border border-[#efceb7] bg-[#fff9f4] shadow-[0_16px_40px_rgba(139,69,19,0.08)] lg:grid-cols-[250px_1fr]">
        <aside className="border-r border-[#f1d7c6] bg-[#fef5ee]">
          <div className="px-7 py-7 text-5xl font-extrabold tracking-tight text-[#9b4a11]">TeamUp</div>
          <div className="px-5 pb-6">
            <NavLink to="/teams/new" className="mb-4 flex items-center justify-center rounded-2xl bg-[#f18f2f] px-4 py-3 text-lg font-semibold text-white shadow-[0_6px_14px_rgba(241,143,47,0.35)] hover:bg-[#e17f21]">
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
          <header className="flex items-center justify-between border-b border-[#f1d7c6] bg-[#fffdfb] px-5 py-4 sm:px-8">
            <NavLink to="/teams" className="text-sm font-semibold text-[#9b5b32] hover:text-[#7f431d]">
              TeamUp Workspace
            </NavLink>
            <div className="flex items-center gap-4 text-[#d88632]">
              <Bell size={18} />
              <Mail size={18} />
              <div className="flex items-center gap-2 rounded-full bg-[#fff3e8] px-3 py-1.5 text-sm font-semibold text-[#88512b]">
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
