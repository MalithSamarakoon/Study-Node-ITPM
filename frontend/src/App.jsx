import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import TeamupLayout from "./teamup/components/TeamupLayout.jsx";
import CreateTeamPage from "./teamup/pages/CreateTeamPage.jsx";
import TeamListPage from "./teamup/pages/TeamListPage.jsx";
import TeamDetailsPage from "./teamup/pages/TeamDetailsPage.jsx";
import TeamStatusPage from "./teamup/pages/TeamStatusPage.jsx";
import TeamEditPage from "./teamup/pages/TeamEditPage.jsx";
import TeamAdminPage from "./teamup/pages/TeamAdminPage.jsx";
import LoginPage from "./auth/pages/LoginPage.jsx";
import RegisterPage from "./auth/pages/RegisterPage.jsx";
import RequireAuth from "./auth/RequireAuth.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<RequireAuth><TeamupLayout /></RequireAuth>}>
        <Route path="/teams/new" element={<CreateTeamPage />} />
        <Route path="/teams" element={<TeamListPage />} />
        <Route path="/teams/my" element={<TeamListPage onlyMine />} />
        <Route path="/teams/status" element={<TeamStatusPage />} />
        <Route path="/teams/:id" element={<TeamDetailsPage />} />
        <Route path="/teams/:id/edit" element={<TeamEditPage />} />
        <Route path="/admin/teamup" element={<TeamAdminPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
