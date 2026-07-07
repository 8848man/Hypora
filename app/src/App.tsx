import { Navigate, Route, Routes } from "react-router-dom";
import { LandingLayout } from "./layout/LandingLayout";
import { WorkspaceProjectLayout } from "./layout/WorkspaceProjectLayout";
import { HomePage } from "./pages/landing/HomePage";
import { FeaturesPage } from "./pages/landing/FeaturesPage";
import { RoadmapPage } from "./pages/landing/RoadmapPage";
import { ProjectListPage } from "./features/project-management/ProjectListPage";
import { CanvasPage } from "./features/business-structuring/CanvasPage";
import { MvpPlanningPage } from "./features/mvp-planning/MvpPlanningPage";
import { ValidationPage } from "./features/validation-planning/ValidationPage";
import { SummaryPage } from "./features/project-summary/SummaryPage";

function App() {
  return (
    <Routes>
      {/* Public (Landing) route group — see sdd/frontend/01_architecture.md */}
      <Route element={<LandingLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
      </Route>

      {/* Workspace route group */}
      <Route path="/app" element={<ProjectListPage />} />
      <Route path="/app/projects/:projectId" element={<WorkspaceProjectLayout />}>
        <Route index element={<Navigate to="canvas" replace />} />
        <Route path="canvas" element={<CanvasPage />} />
        <Route path="scope" element={<MvpPlanningPage />} />
        <Route path="validation" element={<ValidationPage />} />
        <Route path="summary" element={<SummaryPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
