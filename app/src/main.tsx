import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./design-system/tokens.css";
import "./index.css";
import App from "./App.tsx";
import { LocalizationProvider } from "./localization";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LocalizationProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LocalizationProvider>
  </StrictMode>,
);
