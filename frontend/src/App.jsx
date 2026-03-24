import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import TeamupLayout from "./teamup/components/TeamupLayout.jsx";
import CreateTeamPage from "./teamup/pages/CreateTeamPage.jsx";
import TeamListPage from "./teamup/pages/TeamListPage.jsx";
import TeamDetailsPage from "./teamup/pages/TeamDetailsPage.jsx";
import TeamAdminPage from "./teamup/pages/TeamAdminPage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route element={<TeamupLayout />}>
        <Route path="/teams/new" element={<CreateTeamPage />} />
        <Route path="/teams" element={<TeamListPage />} />
        <Route path="/teams/:id" element={<TeamDetailsPage />} />
        <Route path="/admin/teamup" element={<TeamAdminPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
