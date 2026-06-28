// exam_forms.jsx — 정기시험 자료 생성기 v1.1
import { useState, useMemo, useCallback, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Upload, FileText, Users, Clock, MapPin, Printer, AlertCircle,
  CheckCircle, Settings, ChevronDown, ChevronUp, Grid3x3,
  BookOpen, List, LayoutGrid, X, Info
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════════════════ */
const STYLE = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Pretendard', sans-serif; background: #f5f6fa; color: #1e2231; }
  button { cursor: pointer; font-family: inherit; }

  .ef-root { max-width: 1100px; margin: 0 auto; padding: 24px 16px 80px; }
  .ef-header { text-align: center; margin-bottom: 32px; }
  .ef-header h1 { font-size: 1.7rem; font-weight: 700; color: #1e2231; }
  .ef-header p { margin-top: 6px; font-size: 0.9rem; color: #64748b; }

  /* Tabs */
  .ef-tabs { display: flex; gap: 4px; margin-bottom: 24px; border-bottom: 2px solid #e2e8f0; }
  .ef-tab { padding: 10px 20px; font-size: 0.88rem; font-weight: 600; border: none;
            background: none; color: #64748b; border-bottom: 3px solid transparent;
            margin-bottom: -2px; transition: all .2s; display: flex; align-items: center; gap: 6px; }
  .ef-tab:hover { color: #334155; }
  .ef-tab.active { color: #2563eb; border-bottom-color: #2563eb; }
  .ef-tab-badge { background: #2563eb; color: #fff; border-radius: 999px;
                  font-size: 0.7rem; padding: 1px 6px; }

  /* Cards */
  .ef-card { background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,.07);
             margin-bottom: 16px; overflow: hidden; }
  .ef-card-head { padding: 14px 20px; display: flex; align-items: center; gap: 10px;
                  background: #f8fafc; border-bottom: 1px solid #e2e8f0; cursor: pointer; }
  .ef-card-head h3 { font-size: 0.95rem; font-weight: 600; flex: 1; }
  .ef-card-body { padding: 20px; }

  /* Upload zone */
  .ef-upload { border: 2px dashed #cbd5e1; border-radius: 10px; padding: 24px;
               text-align: center; transition: all .2s; position: relative; }
  .ef-upload:hover, .ef-upload.drag { border-color: #2563eb; background: #eff6ff; }
  .ef-upload input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
  .ef-upload-icon { color: #94a3b8; margin-bottom: 8px; }
  .ef-upload p { font-size: 0.85rem; color: #64748b; }
  .ef-upload strong { color: #334155; }
  .ef-upload.has-file { border-color: #22c55e; background: #f0fdf4; }
  .ef-upload.has-file .ef-upload-icon { color: #22c55e; }

  .ef-format-hint { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;
                    padding: 12px 16px; margin-top: 12px; font-size: 0.78rem; color: #64748b; }
  .ef-format-hint code { background: #e2e8f0; padding: 2px 5px; border-radius: 4px;
                         font-family: monospace; font-size: 0.85em; }
  .ef-format-hint pre { background: #1e2231; color: #e2e8f0; padding: 10px 14px;
                         border-radius: 6px; margin-top: 8px; font-size: 0.78rem;
                         line-height: 1.6; overflow-x: auto; }

  /* Settings */
  .ef-row { display: flex; gap: 16px; flex-wrap: wrap; }
  .ef-field { display: flex; flex-direction: column; gap: 6px; min-width: 160px; }
  .ef-field label { font-size: 0.82rem; font-weight: 600; color: #475569; }
  .ef-field input, .ef-field select {
    padding: 8px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px;
    font-size: 0.9rem; font-family: inherit; outline: none;
    transition: border-color .2s;
  }
  .ef-field input:focus, .ef-field select:focus { border-color: #2563eb; }

  /* Badges */
  .ef-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px;
              border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
  .ef-badge.ok { background: #dcfce7; color: #166534; }
  .ef-badge.warn { background: #fef9c3; color: #854d0e; }
  .ef-badge.err { background: #fee2e2; color: #991b1b; }

  /* Preview table */
  .ef-table-wrap { overflow-x: auto; }
  .ef-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
  .ef-table th { background: #f1f5f9; padding: 8px 12px; text-align: left;
                 font-weight: 600; border-bottom: 2px solid #e2e8f0; white-space: nowrap; }
  .ef-table td { padding: 7px 12px; border-bottom: 1px solid #f1f5f9; white-space: nowrap; }
  .ef-table tr:hover td { background: #f8fafc; }

  /* Output selector */
  .ef-out-selector { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
  .ef-out-btn { padding: 9px 18px; border-radius: 8px; border: 2px solid #e2e8f0;
                background: #fff; font-size: 0.85rem; font-weight: 600; color: #475569;
                display: flex; align-items: center; gap: 6px; transition: all .2s; }
  .ef-out-btn:hover { border-color: #2563eb; color: #2563eb; }
  .ef-out-btn.active { border-color: #2563eb; background: #eff6ff; color: #2563eb; }

  .ef-period-selector { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
  .ef-period-btn { padding: 6px 14px; border-radius: 999px; border: 1.5px solid #e2e8f0;
                   background: #fff; font-size: 0.82rem; font-weight: 500; color: #475569;
                   transition: all .2s; }
  .ef-period-btn:hover { border-color: #2563eb; color: #2563eb; }
  .ef-period-btn.active { border-color: #2563eb; background: #2563eb; color: #fff; }

  /* ── 자리배치표 ── */
  .ef-seat-wrap { margin-top: 8px; }
  .ef-board { text-align: center; background: #334155; color: #fff; padding: 8px;
              border-radius: 6px 6px 0 0; font-size: 0.8rem; font-weight: 700;
              letter-spacing: .1em; margin-bottom: 4px; }
  .ef-seat-grid { display: grid; gap: 4px; }
  .ef-seat { border: 1.5px solid #e2e8f0; border-radius: 6px; padding: 5px 4px;
             text-align: center; font-size: 0.72rem; min-height: 52px;
             display: flex; flex-direction: column; align-items: center; justify-content: center;
             gap: 2px; }
  .ef-seat.empty { background: #f8fafc; border-style: dashed; }
  .ef-seat.homeroom { background: #fff; }
  .ef-seat.selfstudy { background: #f0fdf4; border-color: #86efac; }
  .ef-seat.exam-goer { background: #eff6ff; border-color: #93c5fd; }
  .ef-seat .sn { font-size: 0.65rem; color: #94a3b8; }
  .ef-seat .nm { font-weight: 700; color: #1e2231; font-size: 0.78rem; }
  .ef-seat .subj { font-size: 0.62rem; color: #2563eb; }

  /* 학생별 시간표 */
  .ef-sch-table th { min-width: 90px; }
  .ef-sch-table td.home { background: #f0fdf4; }
  .ef-sch-table td.elec { background: #eff6ff; }
  .ef-sch-table td.none { color: #94a3b8; }

  /* Legend */
  .ef-legend { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; font-size: 0.78rem; }
  .ef-legend-item { display: flex; align-items: center; gap: 5px; }
  .ef-legend-box { width: 14px; height: 14px; border-radius: 3px; border: 1.5px solid; }

  /* Print button */
  .ef-print-btn { display: flex; align-items: center; gap: 7px; padding: 10px 20px;
                  border-radius: 8px; border: none; background: #2563eb; color: #fff;
                  font-size: 0.88rem; font-weight: 600; margin-bottom: 16px;
                  box-shadow: 0 2px 6px rgba(37,99,235,.3); transition: background .2s; }
  .ef-print-btn:hover { background: #1d4ed8; }

  .ef-section-title { font-size: 1rem; font-weight: 700; color: #1e2231;
                      margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; }
  .ef-sub-label { font-size: 0.8rem; color: #64748b; margin-bottom: 8px; }

  .ef-info-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px;
                 padding: 12px 16px; font-size: 0.82rem; color: #1e40af; margin-bottom: 16px;
                 display: flex; gap: 8px; align-items: flex-start; }

  .ef-elec-room-block { margin-bottom: 32px; }
  .ef-elec-room-title { font-size: 0.9rem; font-weight: 700; margin-bottom: 10px;
                        padding: 8px 12px; background: #f1f5f9; border-radius: 6px;
                        display: flex; gap: 8px; align-items: center; }

  /* Print styles */
  @media print {
    .ef-no-print { display: none !important; }
    .ef-root { padding: 0; max-width: 100%; }
    .ef-card { box-shadow: none; border: 1px solid #e2e8f0; break-inside: avoid; }
    .ef-seat { min-height: 44px; }
    body { background: #fff; }
    .ef-print-area { display: block !important; }
  }
`;

/* ═══════════════════════════════════════════════════════════
   Utilities
═══════════════════════════════════════════════════════════ */
function parseCSV(text) {
  if (!text) return [];
  text = text.replace(/^﻿/, ""); // BOM
  const lines = text.trim().split(/\r?\n/);
  if (!lines.length) return [];
  const first = lines[0];
  const delim = first.includes("\t") ? "\t" : ",";
  return lines.map((line) => {
    const cells = [];
    let inQ = false, cell = "";
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') { inQ = !inQ; }
      else if (line[i] === delim && !inQ) { cells.push(cell.trim()); cell = ""; }
      else { cell += line[i]; }
    }
    cells.push(cell.trim());
    return cells;
  });
}

function colIdx(headers, ...keywords) {
  const h = headers.map((x) => x.replace(/\s/g, "").toLowerCase());
  for (const kw of keywords) {
    const i = h.findIndex((x) => x.includes(kw));
    if (i !== -1) return i;
  }
  return -1;
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    const isExcel = /\.(xlsx|xls|ods)$/i.test(file.name);
    if (isExcel) {
      r.onload = (e) => {
        try {
          const wb = XLSX.read(e.target.result, { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const csv = XLSX.utils.sheet_to_csv(ws, { FS: ",", blankrows: false });
          resolve(csv);
        } catch (err) { reject(err); }
      };
      r.onerror = reject;
      r.readAsArrayBuffer(file);
    } else {
      r.onload = (e) => resolve(e.target.result);
      r.onerror = reject;
      r.readAsText(file, "utf-8");
    }
  });
}

/* ═══════════════════════════════════════════════════════════
   Sub-components
═══════════════════════════════════════════════════════════ */
function UploadZone({ label, hint, fileName, onChange, example }) {
  const [drag, setDrag] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    const text = await readFile(file);
    onChange(text, file.name);
  };

  return (
    <div>
      <div
        className={`ef-upload ${drag ? "drag" : ""} ${fileName ? "has-file" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.tsv,.txt,.xlsx,.xls,.ods"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => handleFile(e.target.files[0])}
          style={{ display: "none" }}
        />
        <div className="ef-upload-icon">
          {fileName ? <CheckCircle size={28} /> : <Upload size={28} />}
        </div>
        <p>
          {fileName
            ? <><strong>{fileName}</strong> 업로드 완료</>
            : <><strong>클릭하거나 파일을 끌어다 놓으세요</strong><br />엑셀(.xlsx) · CSV · TSV 모두 지원</>
          }
        </p>
      </div>
      <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
        <button
          className="ef-period-btn"
          onClick={() => setOpen((v) => !v)}
          style={{ fontSize: "0.75rem" }}
        >
          <Info size={12} style={{ display: "inline", marginRight: 4 }} />
          형식 예시 {open ? "▲" : "▼"}
        </button>
        {fileName && (
          <button
            className="ef-period-btn"
            onClick={() => onChange("", "")}
            style={{ color: "#ef4444", borderColor: "#fca5a5" }}
          >
            <X size={12} style={{ display: "inline", marginRight: 4 }} />
            초기화
          </button>
        )}
      </div>
      {open && (
        <div className="ef-format-hint">
          <strong>{label} 형식</strong>
          <pre>{example}</pre>
          <div style={{ marginTop: 6 }}>
            <code>.xlsx</code> / <code>.xls</code> 엑셀 파일 직접 업로드 가능 (첫 번째 시트 사용)<br />
            또는 <code>.csv</code> · 엑셀에서 복사해 붙여넣기한 <code>TSV</code> 지원
          </div>
        </div>
      )}
    </div>
  );
}

function CollapseCard({ title, icon: Icon, badge, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="ef-card">
      <div className="ef-card-head" onClick={() => setOpen((v) => !v)}>
        {Icon && <Icon size={18} color="#2563eb" />}
        <h3>{title}</h3>
        {badge}
        {open ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
      </div>
      {open && <div className="ef-card-body">{children}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Seating Grid Component
═══════════════════════════════════════════════════════════ */
function SeatGrid({ seatData, rows, cols, title, subtitle }) {
  return (
    <div className="ef-seat-wrap">
      {title && <div className="ef-section-title">{title}</div>}
      {subtitle && <div className="ef-sub-label">{subtitle}</div>}
      <div className="ef-board">📋 칠판 (앞)</div>
      <div
        className="ef-seat-grid"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {seatData.map((cell, i) => (
          <div
            key={i}
            className={`ef-seat ${cell ? (cell.type === "exam-goer" ? "exam-goer" : cell.type === "selfstudy" ? "selfstudy" : "homeroom") : "empty"}`}
          >
            {cell ? (
              <>
                <span className="sn">{cell.num}번</span>
                <span className="nm">{cell.name}</span>
                {cell.type === "exam-goer" && (
                  <span className="subj">{cell.subject}</span>
                )}
                {cell.type === "selfstudy" && (
                  <span className="subj" style={{ color: "#16a34a" }}>자습</span>
                )}
              </>
            ) : (
              <span style={{ color: "#cbd5e1", fontSize: "0.7rem" }}>빈자리</span>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 10, fontSize: "0.75rem", color: "#64748b", flexWrap: "wrap" }}>
        <span>※ 좌석 순서: 앞줄 왼쪽부터 오른쪽, 다음 줄 순</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main App
═══════════════════════════════════════════════════════════ */
export default function ExamForms() {
  // ── Raw file texts ──────────────────────────────────────
  const [classText, setClassText] = useState("");
  const [electText, setElectText] = useState("");
  const [schedText, setSchedText] = useState("");
  const [roomText, setRoomText] = useState("");

  // ── Config ──────────────────────────────────────────────
  const [className, setClassName] = useState("1-1");
  const [rows, setRows] = useState(6);
  const [cols, setCols] = useState(5);
  const [electRoomRows, setElectRoomRows] = useState(5);
  const [electRoomCols, setElectRoomCols] = useState(6);

  // ── UI ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("upload");
  const [outputType, setOutputType] = useState("student");
  const [selPeriod, setSelPeriod] = useState("");
  const [selSubject, setSelSubject] = useState("");

  /* ── Parse: students ── */
  const students = useMemo(() => {
    if (!classText) return [];
    const rows = parseCSV(classText);
    if (rows.length < 2) return [];
    const [h, ...data] = rows;
    const ni = colIdx(h, "번호", "번", "no", "num");
    const mi = colIdx(h, "이름", "성명", "name");
    if (mi === -1) return [];
    return data
      .filter((r) => r[mi])
      .map((r) => ({ num: parseInt(r[ni]) || 0, name: r[mi] }))
      .sort((a, b) => a.num - b.num);
  }, [classText]);

  /* ── Parse: electives → { subject: [{num, name, cls}] } ── */
  const electives = useMemo(() => {
    if (!electText) return {};
    const rows = parseCSV(electText);
    if (rows.length < 2) return {};
    const [h, ...data] = rows;
    const si = colIdx(h, "과목", "교과");
    const ci = colIdx(h, "학반", "학급", "반", "class");
    const ni = colIdx(h, "번호", "번", "no", "num");
    const mi = colIdx(h, "이름", "성명", "name");
    if (si === -1 || mi === -1) return {};
    const res = {};
    data.filter((r) => r[mi]).forEach((r) => {
      const subj = r[si];
      if (!res[subj]) res[subj] = [];
      res[subj].push({
        num: parseInt(r[ni]) || 0,
        name: r[mi],
        cls: ci !== -1 ? r[ci] : className,
      });
    });
    return res;
  }, [electText, className]);

  /* ── Parse: schedule → [{date, period, subject, key}] ── */
  const schedule = useMemo(() => {
    if (!schedText) return [];
    const rows = parseCSV(schedText);
    if (rows.length < 2) return [];
    const [h, ...data] = rows;
    const di = colIdx(h, "날짜", "일자", "date");
    const pi = colIdx(h, "교시", "시간", "period");
    const si = colIdx(h, "과목", "교과", "subject");
    if (pi === -1 || si === -1) return [];
    return data
      .filter((r) => r[si])
      .map((r) => ({
        date: di !== -1 ? r[di] : "",
        period: r[pi],
        subject: r[si],
        key: `${di !== -1 ? r[di] : ""}_${r[pi]}`,
      }));
  }, [schedText]);

  /* ── Parse: rooms → { `date_period_subject` : location } ── */
  const roomMap = useMemo(() => {
    if (!roomText) return {};
    const rows = parseCSV(roomText);
    if (rows.length < 2) return {};
    const [h, ...data] = rows;
    const di = colIdx(h, "날짜", "일자", "date");
    const pi = colIdx(h, "교시", "시간", "period");
    const si = colIdx(h, "과목", "교과", "subject");
    const ri = colIdx(h, "장소", "교실", "시험실", "room");
    if (pi === -1 || si === -1 || ri === -1) return {};
    const res = {};
    data.filter((r) => r[si]).forEach((r) => {
      const k = `${di !== -1 ? r[di] : ""}_${r[pi]}_${r[si]}`;
      res[k] = r[ri];
    });
    return res;
  }, [roomText]);

  /* ── Derived: unique periods ── */
  const periods = useMemo(() => {
    const seen = new Set();
    return schedule.reduce((acc, s) => {
      if (!seen.has(s.key)) { seen.add(s.key); acc.push({ date: s.date, period: s.period, key: s.key }); }
      return acc;
    }, []);
  }, [schedule]);

  /* ── Helper: subjects for a period with their location ── */
  const getPeriodInfo = useCallback((periodKey) => {
    return schedule
      .filter((s) => s.key === periodKey)
      .map((s) => {
        const loc = roomMap[`${s.date}_${s.period}_${s.subject}`] ?? "본교실";
        const isElec = loc !== "본교실" && loc.trim() !== "";
        return { ...s, location: loc, isElec };
      });
  }, [schedule, roomMap]);

  /* ── Helper: is student an exam-goer in this period? ── */
  const getStudentElective = useCallback((student, periodSubjects) => {
    for (const subj of periodSubjects) {
      if (!subj.isElec) continue;
      const list = electives[subj.subject] || [];
      if (list.some((e) => e.name === student.name || (e.num && e.num === student.num && e.cls === className))) {
        return subj;
      }
    }
    return null;
  }, [electives, className]);

  /* ── Computed: per-student schedules ── */
  const studentSchedules = useMemo(() => {
    return students.map((student) => {
      const periodMap = {};
      periods.forEach((p) => {
        const pSubjs = getPeriodInfo(p.key);
        const elecSubj = getStudentElective(student, pSubjs);
        if (elecSubj) {
          periodMap[p.key] = { subject: elecSubj.subject, location: elecSubj.location, type: "elec" };
        } else {
          const common = pSubjs.find((s) => !s.isElec);
          if (common) {
            periodMap[p.key] = { subject: common.subject, location: common.location || "본교실", type: "home" };
          } else {
            periodMap[p.key] = null;
          }
        }
      });
      return { ...student, periodMap };
    });
  }, [students, periods, getPeriodInfo, getStudentElective]);

  /* ── Computed: homeroom seating for a period ── */
  const getHomeroomSeating = useCallback((periodKey) => {
    const pSubjs = getPeriodInfo(periodKey);
    const hasElec = pSubjs.some((s) => s.isElec);
    const total = rows * cols;
    const grid = new Array(total).fill(null);

    if (!hasElec) {
      // Normal: students in number order
      students.forEach((s, i) => {
        if (i < total) grid[i] = { ...s, type: "homeroom" };
      });
      return grid;
    }

    // Separate exam-goers and self-study
    const examGoers = [];
    const selfStudy = [];
    students.forEach((s) => {
      const elec = getStudentElective(s, pSubjs);
      if (elec) examGoers.push({ ...s, type: "exam-goer", subject: elec.subject, location: elec.location });
      else selfStudy.push({ ...s, type: "selfstudy" });
    });

    // Seat order: column-major from right for exam-goers, left for self-study
    const rightOrder = [];
    for (let c = cols - 1; c >= 0; c--)
      for (let r = 0; r < rows; r++) rightOrder.push(r * cols + c);

    const leftOrder = [];
    for (let c = 0; c < cols; c++)
      for (let r = 0; r < rows; r++) leftOrder.push(r * cols + c);

    const examSeats = new Set(rightOrder.slice(0, examGoers.length));
    const studySeats = leftOrder.filter((i) => !examSeats.has(i));

    examGoers.forEach((s, i) => { if (i < rightOrder.length) grid[rightOrder[i]] = s; });
    selfStudy.forEach((s, i) => { if (i < studySeats.length) grid[studySeats[i]] = s; });

    return grid;
  }, [students, getPeriodInfo, getStudentElective, rows, cols]);

  /* ── Computed: elective room seating ── */
  const getElectiveSeating = useCallback((subject) => {
    const list = (electives[subject] || []).slice().sort((a, b) => {
      if (a.cls !== b.cls) return (a.cls || "").localeCompare(b.cls || "");
      return (a.num || 0) - (b.num || 0);
    });
    const total = electRoomRows * electRoomCols;
    const grid = new Array(total).fill(null);
    list.forEach((s, i) => { if (i < total) grid[i] = { ...s, type: "homeroom" }; });
    return grid;
  }, [electives, electRoomRows, electRoomCols]);

  /* ── Unique elective subjects ── */
  const electSubjects = useMemo(() => Object.keys(electives), [electives]);

  /* ── Validation ── */
  const dataStatus = useMemo(() => ({
    students: students.length > 0,
    electives: Object.keys(electives).length > 0,
    schedule: schedule.length > 0,
    rooms: Object.keys(roomMap).length > 0,
  }), [students, electives, schedule, roomMap]);

  const readyCount = Object.values(dataStatus).filter(Boolean).length;

  /* ── Init selectors ── */
  const handleOutputTab = (type) => {
    setOutputType(type);
    if (type === "homeroom" && !selPeriod && periods.length) setSelPeriod(periods[0].key);
    if (type === "elective" && !selSubject && electSubjects.length) setSelSubject(electSubjects[0]);
  };

  /* ── Period label ── */
  const periodLabel = (p) => p.date ? `${p.date} ${p.period}교시` : `${p.period}교시`;

  /* ══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */
  return (
    <>
      <style>{STYLE}</style>
      <div className="ef-root">
        {/* Header */}
        <div className="ef-header">
          <h1>📋 정기시험 자료 생성기</h1>
          <p>학급 명렬 · 선택과목 명렬 · 시험시간표 · 장소 파일을 업로드하면<br />
             학생별 시험시간표와 자리배치표를 자동으로 생성합니다.</p>
        </div>

        {/* Tabs */}
        <div className="ef-tabs ef-no-print">
          {[
            { id: "upload", label: "파일 업로드", icon: Upload },
            { id: "config", label: "설정", icon: Settings },
            { id: "preview", label: "데이터 미리보기", icon: FileText },
            { id: "output", label: "출력", icon: Printer },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`ef-tab ${activeTab === id ? "active" : ""}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={15} />
              {label}
              {id === "upload" && readyCount > 0 && (
                <span className="ef-tab-badge">{readyCount}/4</span>
              )}
            </button>
          ))}
        </div>

        {/* ── UPLOAD TAB ── */}
        {activeTab === "upload" && (
          <div>
            <CollapseCard title="① 학급 학생 명렬" icon={Users}
              badge={<span className={`ef-badge ${dataStatus.students ? "ok" : "warn"}`}>{dataStatus.students ? `${students.length}명` : "미업로드"}</span>}>
              <UploadZone
                label="학급 학생 명렬"
                fileName={classText ? "업로드됨" : ""}
                onChange={(text) => setClassText(text)}
                example={`번호,이름\n1,홍길동\n2,김민준\n3,이서연\n...`}
              />
            </CollapseCard>

            <CollapseCard title="② 선택과목 학생 명렬" icon={BookOpen}
              badge={<span className={`ef-badge ${dataStatus.electives ? "ok" : "warn"}`}>{dataStatus.electives ? `${electSubjects.length}과목` : "미업로드"}</span>}>
              <UploadZone
                label="선택과목 학생 명렬"
                fileName={electText ? "업로드됨" : ""}
                onChange={(text) => setElectText(text)}
                example={`과목,학반,번호,이름\n물리학Ⅱ,1-1,1,홍길동\n물리학Ⅱ,1-2,5,김민준\n화학Ⅱ,1-1,3,이서연\n\n※ 학반 열이 없으면 설정의 학반명 사용`}
              />
            </CollapseCard>

            <CollapseCard title="③ 시험시간표" icon={Clock}
              badge={<span className={`ef-badge ${dataStatus.schedule ? "ok" : "warn"}`}>{dataStatus.schedule ? `${periods.length}교시` : "미업로드"}</span>}>
              <UploadZone
                label="시험시간표"
                fileName={schedText ? "업로드됨" : ""}
                onChange={(text) => setSchedText(text)}
                example={`날짜,교시,과목\n6/30,1,국어\n6/30,2,수학\n6/30,3,물리학Ⅱ\n6/30,3,화학Ⅱ\n7/1,1,영어\n\n※ 같은 날짜+교시에 여러 과목 = 선택과목 교시`}
              />
            </CollapseCard>

            <CollapseCard title="④ 시간별 장소" icon={MapPin}
              badge={<span className={`ef-badge ${dataStatus.rooms ? "ok" : "warn"}`}>{dataStatus.rooms ? "업로드됨" : "미업로드"}</span>}>
              <UploadZone
                label="시간별 장소"
                fileName={roomText ? "업로드됨" : ""}
                onChange={(text) => setRoomText(text)}
                example={`날짜,교시,과목,장소\n6/30,1,국어,본교실\n6/30,2,수학,본교실\n6/30,3,물리학Ⅱ,301호\n6/30,3,화학Ⅱ,302호\n7/1,1,영어,본교실\n\n※ 장소가 '본교실'이면 전원 응시, 나머지는 선택과목 시험실`}
              />
            </CollapseCard>

            <div style={{ textAlign: "center", marginTop: 8 }}>
              <button
                className="ef-print-btn"
                style={{ display: "inline-flex", marginLeft: "auto", marginRight: "auto" }}
                onClick={() => setActiveTab("output")}
                disabled={readyCount < 3}
              >
                <Printer size={16} /> 출력 화면으로 이동
              </button>
            </div>
          </div>
        )}

        {/* ── CONFIG TAB ── */}
        {activeTab === "config" && (
          <div>
            <CollapseCard title="학반 기본 설정" icon={Settings}>
              <div className="ef-row">
                <div className="ef-field">
                  <label>학반</label>
                  <input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="예) 1-1" />
                </div>
              </div>
              <div style={{ marginTop: 16, fontWeight: 600, fontSize: "0.85rem", color: "#475569", marginBottom: 8 }}>담임학반 교실 크기</div>
              <div className="ef-row">
                <div className="ef-field">
                  <label>줄 수 (행)</label>
                  <input type="number" min={1} max={10} value={rows} onChange={(e) => setRows(+e.target.value)} />
                </div>
                <div className="ef-field">
                  <label>열 수 (열)</label>
                  <input type="number" min={1} max={10} value={cols} onChange={(e) => setCols(+e.target.value)} />
                </div>
                <div className="ef-field" style={{ justifyContent: "flex-end" }}>
                  <label>총 좌석</label>
                  <div style={{ padding: "8px 12px", background: "#f1f5f9", borderRadius: 8, fontWeight: 700 }}>{rows * cols}석</div>
                </div>
              </div>
            </CollapseCard>

            <CollapseCard title="선택시험실 크기" icon={Grid3x3}>
              <div className="ef-row">
                <div className="ef-field">
                  <label>줄 수 (행)</label>
                  <input type="number" min={1} max={10} value={electRoomRows} onChange={(e) => setElectRoomRows(+e.target.value)} />
                </div>
                <div className="ef-field">
                  <label>열 수 (열)</label>
                  <input type="number" min={1} max={10} value={electRoomCols} onChange={(e) => setElectRoomCols(+e.target.value)} />
                </div>
                <div className="ef-field" style={{ justifyContent: "flex-end" }}>
                  <label>총 좌석</label>
                  <div style={{ padding: "8px 12px", background: "#f1f5f9", borderRadius: 8, fontWeight: 700 }}>{electRoomRows * electRoomCols}석</div>
                </div>
              </div>
            </CollapseCard>
          </div>
        )}

        {/* ── PREVIEW TAB ── */}
        {activeTab === "preview" && (
          <div>
            {students.length > 0 && (
              <CollapseCard title={`학급 학생 명렬 (${students.length}명)`} icon={Users}>
                <div className="ef-table-wrap">
                  <table className="ef-table">
                    <thead><tr><th>번호</th><th>이름</th></tr></thead>
                    <tbody>{students.map((s) => (
                      <tr key={s.num}><td>{s.num}</td><td>{s.name}</td></tr>
                    ))}</tbody>
                  </table>
                </div>
              </CollapseCard>
            )}

            {electSubjects.length > 0 && (
              <CollapseCard title={`선택과목 명렬 (${electSubjects.length}과목)`} icon={BookOpen}>
                {electSubjects.map((subj) => (
                  <div key={subj} style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6, color: "#2563eb" }}>{subj} ({electives[subj].length}명)</div>
                    <div className="ef-table-wrap">
                      <table className="ef-table">
                        <thead><tr><th>학반</th><th>번호</th><th>이름</th></tr></thead>
                        <tbody>{electives[subj].map((s, i) => (
                          <tr key={i}><td>{s.cls}</td><td>{s.num}</td><td>{s.name}</td></tr>
                        ))}</tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </CollapseCard>
            )}

            {periods.length > 0 && (
              <CollapseCard title={`시험시간표 (${periods.length}교시)`} icon={Clock}>
                <div className="ef-table-wrap">
                  <table className="ef-table">
                    <thead><tr><th>날짜</th><th>교시</th><th>과목</th><th>장소</th><th>유형</th></tr></thead>
                    <tbody>{schedule.map((s, i) => {
                      const loc = roomMap[`${s.date}_${s.period}_${s.subject}`] ?? "본교실";
                      const isElec = loc !== "본교실";
                      return (
                        <tr key={i}>
                          <td>{s.date}</td><td>{s.period}교시</td><td>{s.subject}</td><td>{loc}</td>
                          <td><span className={`ef-badge ${isElec ? "warn" : "ok"}`}>{isElec ? "선택" : "공통"}</span></td>
                        </tr>
                      );
                    })}</tbody>
                  </table>
                </div>
              </CollapseCard>
            )}

            {students.length === 0 && electSubjects.length === 0 && periods.length === 0 && (
              <div className="ef-info-box">
                <Info size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>파일 업로드 탭에서 CSV 파일을 업로드하면 여기서 파싱 결과를 확인할 수 있습니다.</span>
              </div>
            )}
          </div>
        )}

        {/* ── OUTPUT TAB ── */}
        {activeTab === "output" && (
          <div>
            {/* Output type selector */}
            <div className="ef-out-selector ef-no-print">
              {[
                { id: "student", label: "학생별 시험시간표", icon: List },
                { id: "homeroom", label: "담임학반 자리배치표", icon: LayoutGrid },
                { id: "elective", label: "선택시험실 자리배치표", icon: Grid3x3 },
              ].map(({ id, label, icon: Icon }) => (
                <button key={id} className={`ef-out-btn ${outputType === id ? "active" : ""}`}
                  onClick={() => handleOutputTab(id)}>
                  <Icon size={15} />{label}
                </button>
              ))}
            </div>

            <button className="ef-print-btn ef-no-print" onClick={() => window.print()}>
              <Printer size={16} /> 인쇄 / PDF 저장
            </button>

            {/* ── 학생별 시험시간표 ── */}
            {outputType === "student" && (
              <div className="ef-card">
                <div className="ef-card-body">
                  <div className="ef-section-title">{className}반 학생별 시험시간표</div>
                  {students.length === 0 ? (
                    <div className="ef-info-box"><Info size={16} /><span>학급 명렬을 먼저 업로드하세요.</span></div>
                  ) : periods.length === 0 ? (
                    <div className="ef-info-box"><Info size={16} /><span>시험시간표를 먼저 업로드하세요.</span></div>
                  ) : (
                    <div className="ef-table-wrap">
                      <table className="ef-table ef-sch-table">
                        <thead>
                          <tr>
                            <th>번호</th>
                            <th>이름</th>
                            {periods.map((p) => (
                              <th key={p.key}>{p.date && <span style={{ display: "block", fontSize: "0.7rem", fontWeight: 400 }}>{p.date}</span>}{p.period}교시</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {studentSchedules.map((s) => (
                            <tr key={s.num}>
                              <td>{s.num}</td>
                              <td><strong>{s.name}</strong></td>
                              {periods.map((p) => {
                                const info = s.periodMap[p.key];
                                if (!info) return <td key={p.key} className="none">—</td>;
                                return (
                                  <td key={p.key} className={info.type === "elec" ? "elec" : "home"}>
                                    <strong>{info.subject}</strong>
                                    <br /><span style={{ fontSize: "0.75rem", color: "#64748b" }}>{info.location}</span>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="ef-legend" style={{ marginTop: 12 }}>
                    <div className="ef-legend-item">
                      <div className="ef-legend-box" style={{ background: "#f0fdf4", borderColor: "#86efac" }} />
                      본교실(공통) 시험
                    </div>
                    <div className="ef-legend-item">
                      <div className="ef-legend-box" style={{ background: "#eff6ff", borderColor: "#93c5fd" }} />
                      선택과목 시험
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── 담임학반 자리배치표 ── */}
            {outputType === "homeroom" && (
              <div>
                <div className="ef-period-selector ef-no-print">
                  {periods.map((p) => {
                    const pSubjs = getPeriodInfo(p.key);
                    const hasElec = pSubjs.some((s) => s.isElec);
                    return (
                      <button key={p.key} className={`ef-period-btn ${selPeriod === p.key ? "active" : ""}`}
                        onClick={() => setSelPeriod(p.key)}>
                        {periodLabel(p)}
                        {hasElec && " 🔀"}
                      </button>
                    );
                  })}
                </div>

                {!selPeriod ? (
                  <div className="ef-info-box"><Info size={16} /><span>교시를 선택하세요.</span></div>
                ) : (() => {
                  const p = periods.find((x) => x.key === selPeriod);
                  const pSubjs = getPeriodInfo(selPeriod);
                  const hasElec = pSubjs.some((s) => s.isElec);
                  const seating = getHomeroomSeating(selPeriod);
                  const examGoerCount = seating.filter((c) => c?.type === "exam-goer").length;
                  const selfStudyCount = seating.filter((c) => c?.type === "selfstudy").length;

                  return (
                    <div className="ef-card">
                      <div className="ef-card-body">
                        <div className="ef-section-title">
                          {className}반 자리배치표 — {p && periodLabel(p)}
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          {pSubjs.map((s) => (
                            <span key={s.subject} style={{ marginRight: 10, fontSize: "0.82rem" }}>
                              <strong>{s.subject}</strong> · {s.location}
                              <span className={`ef-badge ${s.isElec ? "warn" : "ok"}`} style={{ marginLeft: 6 }}>
                                {s.isElec ? "선택" : "공통"}
                              </span>
                            </span>
                          ))}
                        </div>

                        {hasElec && (
                          <div className="ef-legend" style={{ marginBottom: 12 }}>
                            <div className="ef-legend-item">
                              <div className="ef-legend-box" style={{ background: "#f0fdf4", borderColor: "#86efac" }} />
                              자습 ({selfStudyCount}명) — 왼쪽 배치
                            </div>
                            <div className="ef-legend-item">
                              <div className="ef-legend-box" style={{ background: "#eff6ff", borderColor: "#93c5fd" }} />
                              선택시험 ({examGoerCount}명) — 오른쪽 배치
                            </div>
                          </div>
                        )}

                        <SeatGrid
                          seatData={seating}
                          rows={rows}
                          cols={cols}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ── 선택시험실 자리배치표 ── */}
            {outputType === "elective" && (
              <div>
                {electSubjects.length === 0 ? (
                  <div className="ef-info-box"><Info size={16} /><span>선택과목 명렬을 먼저 업로드하세요.</span></div>
                ) : (
                  <>
                    <div className="ef-period-selector ef-no-print">
                      {electSubjects.map((subj) => (
                        <button key={subj} className={`ef-period-btn ${selSubject === subj ? "active" : ""}`}
                          onClick={() => setSelSubject(subj)}>
                          {subj} ({(electives[subj] || []).length}명)
                        </button>
                      ))}
                      <button className={`ef-period-btn ${selSubject === "__all__" ? "active" : ""}`}
                        onClick={() => setSelSubject("__all__")}>
                        전체 출력
                      </button>
                    </div>

                    {(selSubject === "__all__" ? electSubjects : selSubject ? [selSubject] : []).map((subj) => {
                      const seating = getElectiveSeating(subj);
                      const periodInfo = schedule.filter((s) => s.subject === subj);
                      const firstPeriod = periodInfo[0];
                      const loc = firstPeriod
                        ? roomMap[`${firstPeriod.date}_${firstPeriod.period}_${firstPeriod.subject}`] ?? "미지정"
                        : "미지정";

                      return (
                        <div key={subj} className="ef-card ef-elec-room-block">
                          <div className="ef-card-body">
                            <div className="ef-elec-room-title">
                              <BookOpen size={16} color="#2563eb" />
                              {subj} 시험실 자리배치표
                              {loc !== "미지정" && (
                                <span style={{ fontWeight: 400, color: "#64748b", fontSize: "0.82rem" }}>
                                  <MapPin size={12} style={{ display: "inline", marginRight: 2 }} />{loc}
                                </span>
                              )}
                              {firstPeriod && (
                                <span style={{ fontWeight: 400, color: "#64748b", fontSize: "0.82rem" }}>
                                  {firstPeriod.date} {firstPeriod.period}교시
                                </span>
                              )}
                              <span className="ef-badge ok" style={{ marginLeft: "auto" }}>
                                {(electives[subj] || []).length}명
                              </span>
                            </div>

                            <SeatGrid
                              seatData={seating}
                              rows={electRoomRows}
                              cols={electRoomCols}
                            />

                            <div className="ef-table-wrap" style={{ marginTop: 16 }}>
                              <table className="ef-table">
                                <thead><tr><th>좌석</th><th>학반</th><th>번호</th><th>이름</th></tr></thead>
                                <tbody>
                                  {seating.filter(Boolean).map((s, i) => (
                                    <tr key={i}>
                                      <td>{i + 1}번</td>
                                      <td>{s.cls}</td>
                                      <td>{s.num}</td>
                                      <td><strong>{s.name}</strong></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
