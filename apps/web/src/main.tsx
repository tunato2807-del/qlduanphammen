import { ErrorBoundary } from "./shared/ErrorBoundary";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ExperienceProvider } from "./Experience";
import "./styles.css";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ExperienceProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </ExperienceProvider>
  </React.StrictMode>,
);
