import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import SaenggibuApp from "../saenggibu_helper_2026.jsx";
import ExamFormsApp from "../exam_forms.jsx";
import ExamSupervisorApp from "../exam_supervisor.jsx";

const NAV_STYLE = `
  .app-nav {
    display: flex; gap: 0; background: #1e2231; padding: 0 20px;
    position: sticky; top: 0; z-index: 999; box-shadow: 0 2px 8px rgba(0,0,0,.3);
  }
  .app-nav-btn {
    padding: 14px 22px; border: none; background: none; color: #94a3b8;
    font-size: 0.88rem; font-weight: 600; cursor: pointer; font-family: 'Pretendard', sans-serif;
    border-bottom: 3px solid transparent; margin-bottom: -1px; transition: all .2s;
  }
  .app-nav-btn:hover { color: #e2e8f0; }
  .app-nav-btn.active { color: #60a5fa; border-bottom-color: #60a5fa; }
  @media print { .app-nav { display: none !important; } }
`;

function Root() {
  const [app, setApp] = useState("supervisor");
  return (
    <>
      <style>{NAV_STYLE}</style>
      <nav className="app-nav">
        <button className={`app-nav-btn ${app === "supervisor" ? "active" : ""}`} onClick={() => setApp("supervisor")}>
          🗓️ 감독 배정 시스템
        </button>
        <button className={`app-nav-btn ${app === "exam" ? "active" : ""}`} onClick={() => setApp("exam")}>
          📋 정기시험 자료 생성기
        </button>
        <button className={`app-nav-btn ${app === "saenggibu" ? "active" : ""}`} onClick={() => setApp("saenggibu")}>
          ✏️ 생기부 작성 도우미
        </button>
      </nav>
      {app === "supervisor" ? <ExamSupervisorApp /> : app === "exam" ? <ExamFormsApp /> : <SaenggibuApp />}
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
