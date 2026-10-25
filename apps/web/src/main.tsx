import React from "react";
import ReactDOM from "react-dom/client";
import { ExperienceProvider } from "./Experience";
import App from "./App";
import "./styles.css";
import "./studio.css";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ExperienceProvider>
      <App />
    </ExperienceProvider>
  </React.StrictMode>,
);
