import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "../../../apps/workbench/src/styles/button.css";
import "../../html/src/style.css";

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);