import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ExamSupervisorApp from "../exam_supervisor.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ExamSupervisorApp />
  </StrictMode>
);
