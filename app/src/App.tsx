import { Navigate, Route, Routes } from "react-router-dom";
import { LandingLayout } from "./layout/LandingLayout";
import { WorkspaceProjectLayout } from "./layout/WorkspaceProjectLayout";
import { HomePage } from "./pages/landing/HomePage";
import { FeaturesPage } from "./pages/landing/FeaturesPage";
import { ProjectListPage } from "./features/project-management/ProjectListPage";
import { BusinessStructuringPage } from "./features/business-structuring/BusinessStructuringPage";
import { MvpPlanningPage } from "./features/mvp-planning/MvpPlanningPage";
import { ValidationPage } from "./features/validation-planning/ValidationPage";
import { RiskMemoPage } from "./features/risk-memo/RiskMemoPage";
import { SummaryPage } from "./features/project-summary/SummaryPage";
import { AdminAnalyticsPage } from "./pages/admin/analytics/AdminAnalyticsPage";
import { DesignSystemCatalogPage } from "./pages/design-system-catalog/DesignSystemCatalogPage";

function App() {
  return (
    <Routes>
      {/* Public (Landing) route group — see sdd/frontend/01_architecture.md */}
      <Route element={<LandingLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesPage />} />
      </Route>

      {/* Workspace route group */}
      <Route path="/app" element={<ProjectListPage />} />
      <Route path="/app/projects/:projectId" element={<WorkspaceProjectLayout />}>
        <Route index element={<Navigate to="canvas" replace />} />
        <Route path="canvas" element={<BusinessStructuringPage />} />
        <Route path="scope" element={<MvpPlanningPage />} />
        <Route path="validation" element={<ValidationPage />} />
        <Route path="risks" element={<RiskMemoPage />} />
        <Route path="summary" element={<SummaryPage />} />
      </Route>

      {/* Internal-only, not part of Landing/Workspace IA — see sdd/analytics/06_query_and_reporting.md */}
      <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />

      {/* Internal-only living documentation — see sdd/design-system/01_design_system.md#html-catalog */}
      <Route path="/design-system" element={<DesignSystemCatalogPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
