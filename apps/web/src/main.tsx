import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ExperienceProvider } from "./Experience";
import "./studio.css";
import "./styles.css";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ExperienceProvider>
      <App />
    </ExperienceProvider>
  </React.StrictMode>,
);
