import { useState, useEffect, useMemo, useRef } from "react";
import {
  ClipboardList, Users, Compass, UserCheck, Sparkles, Copy, Check,
  Trash2, Download, AlertTriangle, FileText, Plus, X, Save, ChevronDown,
  Settings, Eye, EyeOff
} from "lucide-react";

/* =========================================================================
   생기부 작성 도우미
   창체 4종(자율·동아리·진로·행동특성) 관찰 메모 → 생기부 문장 변환
   - 규칙 기반 템플릿 생성 + Claude API 다듬기(선택)
   - 금지어 자동 검사 (연수자료 기반)
   - 글자수 카운터 (바이트/항목별 상한)
   - 문장 저장 · 복사 · 내보내기(CSV/TXT)
   ========================================================================= */

// ── 항목 정의 ─────────────────────────────────────────────────────────────
const AREAS = {
  autonomy: {
    id: "autonomy", label: "자율·자치활동", icon: ClipboardList,
    accent: "#3b6cb7",
    limit: 1500, // 글자수(한글 기준 일반 권장)
    fields: [
      { key: "situation", label: "활동 상황", ph: "예) 학급 자치회의, 학교폭력 예방교육" },
      { key: "role", label: "역할", ph: "예) 회장, 서기, 모둠 진행" },
      { key: "behavior", label: "관찰한 행동", ph: "예) 안건을 정리해 회의를 이끎" },
      { key: "result", label: "결과·변화", ph: "예) 학급 규칙 합의 도출" },
    ],
  },
  club: {
    id: "club", label: "동아리활동", icon: Users,
    accent: "#2f8f7a",
    limit: 1500,
    fields: [
      { key: "situation", label: "활동 상황", ph: "예) 과학탐구 동아리 정기활동" },
      { key: "role", label: "역할", ph: "예) 회장, 실험 설계 담당" },
      { key: "behavior", label: "관찰한 행동", ph: "예) 실험 변인을 스스로 통제함" },
      { key: "result", label: "결과·변화", ph: "예) 참여도·협력도 우수" },
    ],
  },
  career: {
    id: "career", label: "진로활동", icon: Compass,
    accent: "#b5642f",
    limit: 2100,
    fields: [
      { key: "hope", label: "희망분야", ph: "예) 생명과학 연구원 (대입 미반영)" },
      { key: "situation", label: "활동 상황", ph: "예) 진로 탐색 프로그램, 직업인 특강" },
      { key: "behavior", label: "관찰한 행동", ph: "예) 관심 분야를 깊이 조사함" },
      { key: "result", label: "태도·변화", ph: "예) 진로 목표가 구체화됨" },
    ],
  },
  behavior: {
    id: "behavior", label: "행동특성 및 종합의견", icon: UserCheck,
    accent: "#7a52a8",
    limit: 1500,
    fields: [
      { key: "situation", label: "관찰 상황", ph: "예) 모둠 활동, 학급 생활 전반" },
      { key: "role", label: "역할·태도", ph: "예) 리더 역할, 배려하는 태도" },
      { key: "behavior", label: "관찰한 행동", ph: "예) 친구 의견을 끝까지 경청함" },
      { key: "result", label: "결과·성장", ph: "예) 모둠 분위기가 밝아짐" },
    ],
  },
};

// ── AI 프로바이더 정의 ────────────────────────────────────────────────────────
const AI_PROVIDERS = {
  claude: {
    id: "claude",
    label: "Claude (Anthropic)",
    models: [
      { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
      { id: "claude-opus-4-8", label: "Claude Opus 4.8" },
      { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" },
    ],
    placeholder: "sk-ant-api03-...",
    docsUrl: "https://console.anthropic.com/",
  },
  openai: {
    id: "openai",
    label: "ChatGPT (OpenAI)",
    models: [
      { id: "gpt-4o", label: "GPT-4o" },
      { id: "gpt-4o-mini", label: "GPT-4o mini" },
      { id: "o3-mini", label: "o3-mini" },
    ],
    placeholder: "sk-proj-...",
    docsUrl: "https://platform.openai.com/",
  },
  gemini: {
    id: "gemini",
    label: "Gemini (Google)",
    models: [
      { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
      { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    ],
    placeholder: "AIza...",
    docsUrl: "https://aistudio.google.com/",
  },
};

const DEFAULT_AI_CONFIG = { provider: "claude", model: "claude-sonnet-4-6", apiKey: "" };

// ── 행동특성: 칩 선택 그룹 (이미지 방식, 다중 선택) ─────────────────────────
const BEHAVIOR_CHIPS = [
  {
    key: "situation", label: "어떤 상황에서",
    items: ["모둠 활동", "학급 행사 준비", "청소·정리 시간", "발표 수업", "친구 간 갈등", "1인 1역 수행",
      "토론 활동", "체험학습", "수행평가", "학급 회의", "교우 관계", "어려운 과제"],
  },
  {
    key: "role", label: "어떤 역할·태도를",
    items: ["먼저 나서서 이끎", "묵묵히 도움", "갈등을 중재함", "맡은 일을 끝까지", "꼼꼼히 기록·점검", "친구를 챙김",
      "의견을 경청함", "솔선수범함", "차분히 집중함", "적극적으로 질문함", "규칙을 잘 지킴", "끈기 있게 노력함"],
  },
  {
    key: "result", label: "그래서 어떤 변화·성장이",
    items: ["학급 분위기 향상", "친구들의 신뢰", "협력하는 태도", "책임감 성장", "자신감 향상", "배려심 발휘",
      "리더십 발휘", "성실함 인정", "소통 능력 향상", "문제 해결력 성장", "공동체 의식 함양", "긍정적 태도 확립"],
  },
];

// ── 금지어 / 주의어 사전 (2026 학생부 기재요령 연수자료 기반) ──────────────
const FORBIDDEN = [
  // 상호명
  { term: "챗GPT", cat: "상호명", alt: "생성형 인공지능" },
  { term: "ChatGPT", cat: "상호명", alt: "생성형 인공지능" },
  { term: "GPT", cat: "상호명", alt: "생성형 인공지능" },
  { term: "클로드", cat: "상호명", alt: "생성형 인공지능" },
  { term: "Claude", cat: "상호명", alt: "생성형 인공지능" },
  { term: "제미나이", cat: "상호명", alt: "생성형 인공지능" },
  { term: "퍼플렉시티", cat: "상호명", alt: "생성형 인공지능" },
  { term: "노션", cat: "상호명", alt: "온라인 협업 플랫폼" },
  { term: "Notion", cat: "상호명", alt: "온라인 협업 플랫폼" },
  { term: "패들렛", cat: "상호명", alt: "온라인 협업 플랫폼" },
  { term: "Padlet", cat: "상호명", alt: "온라인 협업 플랫폼" },
  { term: "구글", cat: "상호명", alt: "포털사이트" },
  { term: "Google", cat: "상호명", alt: "포털사이트" },
  { term: "네이버", cat: "상호명", alt: "포털사이트" },
  { term: "NAVER", cat: "상호명", alt: "포털사이트" },
  { term: "유튜브", cat: "상호명", alt: "동영상 플랫폼" },
  { term: "YouTube", cat: "상호명", alt: "동영상 플랫폼" },
  { term: "유튜버", cat: "상호명", alt: "동영상 크리에이터" },
  { term: "넷플릭스", cat: "상호명", alt: "동영상 플랫폼" },
  { term: "인스타그램", cat: "상호명", alt: "소셜네트워크서비스" },
  { term: "Instagram", cat: "상호명", alt: "소셜네트워크서비스" },
  { term: "페이스북", cat: "상호명", alt: "소셜네트워크서비스" },
  { term: "카카오톡", cat: "상호명", alt: "메신저" },
  { term: "틱톡", cat: "상호명", alt: "엔터테인먼트 플랫폼" },
  { term: "TikTok", cat: "상호명", alt: "엔터테인먼트 플랫폼" },
  { term: "줌", cat: "상호명", alt: "화상 회의 프로그램" },
  { term: "Zoom", cat: "상호명", alt: "화상 회의 프로그램" },
  { term: "캔바", cat: "상호명", alt: "디자인 제작 플랫폼" },
  { term: "Canva", cat: "상호명", alt: "디자인 제작 플랫폼" },
  { term: "미리캔버스", cat: "상호명", alt: "디자인 제작 플랫폼" },
  { term: "엑셀", cat: "상호명", alt: "문서 작성 프로그램" },
  { term: "한글프로그램", cat: "상호명", alt: "문서 작성 프로그램" },
  { term: "파워포인트", cat: "상호명", alt: "문서 작성 프로그램" },
  { term: "아이패드", cat: "상호명", alt: "태블릿PC" },
  { term: "iPad", cat: "상호명", alt: "태블릿PC" },
  { term: "갤럭시탭", cat: "상호명", alt: "태블릿PC" },
  // 기관명
  { term: "유네스코", cat: "기관명", alt: "국제기구" },
  { term: "UNESCO", cat: "기관명", alt: "국제기구" },
  { term: "유엔", cat: "기관명", alt: "국제기구" },
  { term: "OECD", cat: "기관명", alt: "국제기구" },
  { term: "WHO", cat: "기관명", alt: "국제기구" },
  { term: "통계청", cat: "기관명", alt: "통계 관련 전문기관" },
  { term: "질병관리청", cat: "기관명", alt: "질병 관련 전문기관" },
  // 진로/심리검사 상호명
  { term: "MBTI", cat: "검사명", alt: "성격유형 검사" },
  { term: "홀랜드", cat: "검사명", alt: "직업선호도 검사" },
  { term: "커리어넷", cat: "검사명", alt: "진로정보망" },
  // 지양 표현(서술어)
  { term: "라고 생각함", cat: "지양표현", alt: "직접 관찰·평가한 내용으로 서술" },
  { term: "라고 느낌", cat: "지양표현", alt: "직접 관찰·평가한 내용으로 서술" },
  { term: "느꼈다", cat: "지양표현", alt: "직접 관찰·평가한 내용으로 서술" },
  { term: "알게 됨", cat: "지양표현", alt: "직접 관찰·평가한 내용으로 서술" },
  { term: "다짐함", cat: "지양표현", alt: "직접 관찰·평가한 내용으로 서술" },
  { term: "이해함", cat: "지양표현", alt: "정확하게 이해하여 표현함 등으로 구체화" },
];

// 사교육·기재금지 키워드(맥락 확인 권고)
const CAUTION = [
  { term: "대회", cat: "수상/대회", note: "교내대회는 '수상경력'에만 기재. 교외 수상실적 기재 불가" },
  { term: "수상", cat: "수상/대회", note: "교외상·성적 기재 불가" },
  { term: "자격증", cat: "자격증", note: "'자격증 및 국가직무능력표준 이수상황' 외 기재 불가" },
  { term: "토익", cat: "공인어학", note: "공인어학시험 사실·성적 기재 불가" },
  { term: "토플", cat: "공인어학", note: "공인어학시험 사실·성적 기재 불가" },
  { term: "모의고사", cat: "성적", note: "모의고사 성적 관련 일체 기재 불가" },
  { term: "논문", cat: "논문", note: "교육과정을 앞선 논문 탐구·활용 내용 기재 불가" },
  { term: "특허", cat: "지식재산권", note: "출원·등록 사실 기재 불가" },
  { term: "방과후", cat: "방과후학교", note: "방과후학교 활동 기재 불가" },
];

// ── 규칙 기반 문장 생성 (오프라인 폴백) ──────────────────────────────────
function buildDraft(areaId, f) {
  const j = (s) => (s || "").trim();
  const arr = (v) => (Array.isArray(v) ? v.filter(Boolean) : (v ? [v] : []));
  if (areaId === "behavior") {
    const sit = arr(f.situation), role = arr(f.role), res = arr(f.result);
    const parts = [];
    if (sit.length) parts.push(`${sit.join(", ")}에서`);
    if (role.length) parts.push(`${role.join("며 ")}`);
    let s1 = parts.join(" ");
    s1 = s1 ? s1.replace(/[.\s]*$/, "는 모습을 보임.") : "";
    const s2 = res.length ? `이러한 태도로 ${res.join(", ")}에 기여함.` : "";
    return [s1, s2].filter(Boolean).join(" ");
  }
  if (areaId === "career") {
    const hope = j(f.hope) ? `진로 희망 분야(${j(f.hope)})와 관련하여 ` : "";
    const a = j(f.situation) ? `${hope}${j(f.situation)}에 참여함.` : "";
    const b = j(f.behavior) ? `${j(f.behavior)}.` : "";
    const c = j(f.result) ? `이를 통해 ${j(f.result)}.` : "";
    return [a, b, c].filter(Boolean).join(" ");
  }
  // 자율 / 동아리 공통
  const lead = j(f.role) ? `${j(f.situation) || "활동"}에서 ${j(f.role)}을 맡아` : `${j(f.situation) || "활동"}에 참여하여`;
  const a = j(f.behavior) ? `${lead} ${j(f.behavior)}.` : `${lead} 적극적으로 활동함.`;
  const b = j(f.result) ? `그 결과 ${j(f.result)}.` : "";
  return [a, b].filter(Boolean).join(" ");
}

// ── 검사기 ───────────────────────────────────────────────────────────────
function scanText(text) {
  const t = text || "";
  const hits = [];
  for (const w of FORBIDDEN) {
    if (t.includes(w.term)) hits.push({ ...w, level: "forbidden" });
  }
  const cautions = [];
  for (const w of CAUTION) {
    if (t.includes(w.term)) cautions.push({ ...w, level: "caution" });
  }
  return { hits, cautions };
}

// 바이트 수(EUC-KR 기준 근사: 한글 2, ASCII 1) — 나이스 글자수 감각
function byteLen(s) {
  let n = 0;
  for (const ch of s || "") n += ch.charCodeAt(0) > 127 ? 2 : 1;
  return n;
}

// ── AI 프로바이더별 API 호출 ──────────────────────────────────────────────
async function callAI(config, systemPrompt, userPrompt) {
  const { provider, model, apiKey } = config;

  if (provider === "claude") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Claude API 오류");
    return (data.content || []).filter((c) => c.type === "text").map((c) => c.text).join("\n").trim();
  }

  if (provider === "openai") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        max_tokens: 1000,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "OpenAI API 오류");
    return (data.choices?.[0]?.message?.content || "").trim();
  }

  if (provider === "gemini") {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: { maxOutputTokens: 1000 },
        }),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Gemini API 오류");
    return (data.candidates?.[0]?.content?.parts?.[0]?.text || "").trim();
  }

  throw new Error("알 수 없는 프로바이더");
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("autonomy");
  const [student, setStudent] = useState("");
  const [fields, setFields] = useState({});
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiOn, setAiOn] = useState(true);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState([]);
  const [toast, setToast] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [aiConfig, setAiConfig] = useState(() => {
    try { return { ...DEFAULT_AI_CONFIG, ...JSON.parse(localStorage.getItem("saenggibu_ai_config") || "{}") }; }
    catch { return DEFAULT_AI_CONFIG; }
  });
  const [showKey, setShowKey] = useState(false);

  const area = AREAS[tab];
  const f = fields[tab] || {};

  const setField = (k, v) =>
    setFields((p) => ({ ...p, [tab]: { ...(p[tab] || {}), [k]: v } }));

  const toggleChip = (k, item) =>
    setFields((p) => {
      const cur = (p[tab] || {})[k];
      const list = Array.isArray(cur) ? cur : [];
      const next = list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
      return { ...p, [tab]: { ...(p[tab] || {}), [k]: next } };
    });

  const scan = useMemo(() => scanText(draft), [draft]);
  const chars = (draft || "").replace(/\s/g, "").length;
  const bytes = byteLen(draft || "");
  const overLimit = chars > area.limit;

  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 2200); };

  function saveAiConfig(cfg) {
    setAiConfig(cfg);
    localStorage.setItem("saenggibu_ai_config", JSON.stringify(cfg));
  }

  // 생성
  async function generate() {
    const isChip = tab === "behavior";
    const hasInput = isChip
      ? BEHAVIOR_CHIPS.some((g) => (f[g.key] || []).length)
      : area.fields.some((fd) => (f[fd.key] || "").trim());
    if (!hasInput) { flash(isChip ? "칩을 하나 이상 선택해 주세요." : "관찰 메모를 먼저 입력해 주세요."); return; }

    const fallback = buildDraft(tab, f);
    if (!aiOn) { setDraft(fallback); flash("규칙 기반 초안을 생성했어요."); return; }
    if (!aiConfig.apiKey.trim()) {
      setShowSettings(true);
      flash("AI 서비스 API 키를 먼저 설정해 주세요.");
      return;
    }

    setLoading(true);
    try {
      const memo = isChip
        ? BEHAVIOR_CHIPS
            .map((g) => `- ${g.label}: ${((f[g.key] || []).join(", ")) || "(없음)"}`)
            .join("\n")
        : area.fields
            .map((fd) => `- ${fd.label}: ${(f[fd.key] || "").trim() || "(없음)"}`)
            .join("\n");
      const sys = `당신은 한국 고등학교 학교생활기록부 작성을 돕는 교사 보조입니다.
교사가 직접 관찰·평가한 메모를 '${area.label}' 특기사항 문장으로 다듬습니다.

규칙(2026 학생부 기재요령):
- 명사형 어미('~함.', '~임.')로 종결. '~라고 생각함/느낌', '~알게 됨', '~다짐함'은 사용 금지.
- 교사가 관찰한 사실·태도·노력에 의한 변화와 성장 중심으로 서술.
- 상호명/기관명/대학명/강사명, 공인어학·모의고사 성적, 교외 수상, 자격증명 등은 절대 쓰지 않음.
- 생성형 AI, 특정 앱·플랫폼명은 일반 명사로(예: 생성형 인공지능, 온라인 협업 플랫폼).
- 학생 개별 특성이 드러나게, 단순 나열을 지양하고 2~4문장으로 자연스럽게 작성.
- 결과 문장만 출력. 따옴표·머리말·설명 없이 완성된 특기사항 문장만.`;
      const usr = `학생 메모:\n${memo}\n\n위 메모를 '${area.label}' 특기사항 문장으로 다듬어 주세요.`;

      const out = await callAI(aiConfig, sys, usr);
      setDraft(out || fallback);
    } catch (e) {
      setDraft(fallback);
      flash(`AI 오류: ${e.message || "연결 실패"} — 규칙 기반 초안으로 대체했어요.`);
    } finally {
      setLoading(false);
    }
  }

  function copyDraft() {
    if (!draft) return;
    navigator.clipboard?.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function saveDraft() {
    if (!draft.trim()) { flash("저장할 문장이 없어요."); return; }
    setSaved((p) => [
      { id: Date.now(), area: area.label, areaId: tab, student: student || "이름 미입력", text: draft, chars },
      ...p,
    ]);
    flash("문장을 저장했어요.");
  }

  function removeSaved(id) { setSaved((p) => p.filter((s) => s.id !== id)); }

  function exportFile(type) {
    if (!saved.length) { flash("내보낼 저장 문장이 없어요."); return; }
    let content, mime, name;
    if (type === "csv") {
      const esc = (s) => `"${(s || "").replace(/"/g, '""')}"`;
      content = "\uFEFF" + ["학생,항목,글자수,특기사항",
        ...saved.map((s) => [esc(s.student), esc(s.area), s.chars, esc(s.text)].join(","))].join("\n");
      mime = "text/csv;charset=utf-8"; name = "생기부_문장.csv";
    } else {
      content = saved.map((s) => `[${s.area}] ${s.student} (${s.chars}자)\n${s.text}\n`).join("\n");
      mime = "text/plain;charset=utf-8"; name = "생기부_문장.txt";
    }
    const url = URL.createObjectURL(new Blob([content], { type: mime }));
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
    flash(`${saved.length}건을 ${type.toUpperCase()}로 내보냈어요.`);
  }

  function clearForm() {
    setFields((p) => ({ ...p, [tab]: {} }));
    setDraft("");
  }

  return (
    <div style={S.page}>
      <style>{CSS}</style>

      {/* 설정 모달 */}
      {showSettings && (
        <div style={S.modalBackdrop} onClick={() => setShowSettings(false)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalHead}>
              <h2 style={{ ...S.h2, fontSize: 16 }}><Settings size={16} /> AI 서비스 설정</h2>
              <button style={S.savedDel} onClick={() => setShowSettings(false)}><X size={18} /></button>
            </div>

            <div style={S.modalBody}>
              <label style={S.lbl}>AI 서비스 선택</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {Object.values(AI_PROVIDERS).map((p) => (
                  <label key={p.id} style={S.providerRow}>
                    <input type="radio" name="provider" value={p.id}
                      checked={aiConfig.provider === p.id}
                      onChange={() => {
                        const defaultModel = AI_PROVIDERS[p.id].models[0].id;
                        saveAiConfig({ ...aiConfig, provider: p.id, model: defaultModel });
                      }} />
                    <span style={{ fontWeight: 600, fontSize: 13.5 }}>{p.label}</span>
                  </label>
                ))}
              </div>

              <label style={S.lbl}>모델 선택</label>
              <select style={{ ...S.input, marginBottom: 16 }}
                value={aiConfig.model}
                onChange={(e) => saveAiConfig({ ...aiConfig, model: e.target.value })}>
                {AI_PROVIDERS[aiConfig.provider].models.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>

              <label style={S.lbl}>
                API 키&nbsp;
                <a href={AI_PROVIDERS[aiConfig.provider].docsUrl} target="_blank" rel="noreferrer"
                  style={{ color: "#3b6cb7", fontWeight: 400, fontSize: 11 }}>
                  키 발급 →
                </a>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  style={{ ...S.input, paddingRight: 38, marginBottom: 6, fontFamily: "monospace", fontSize: 12.5 }}
                  type={showKey ? "text" : "password"}
                  value={aiConfig.apiKey}
                  placeholder={AI_PROVIDERS[aiConfig.provider].placeholder}
                  onChange={(e) => saveAiConfig({ ...aiConfig, apiKey: e.target.value })}
                  autoComplete="off"
                />
                <button style={S.eyeBtn} onClick={() => setShowKey((v) => !v)}>
                  {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <p style={{ fontSize: 11, color: "#aaa", margin: "4px 0 0" }}>
                API 키는 이 기기의 브라우저(localStorage)에만 저장되며 외부로 전송되지 않아요.
              </p>
            </div>

            <div style={{ padding: "14px 20px 18px", borderTop: "1px solid #f0f0f0" }}>
              <div style={{ ...S.flagOk, marginTop: 0, display: aiConfig.apiKey ? "flex" : "none" }}>
                <Check size={13} /> {AI_PROVIDERS[aiConfig.provider]?.label} · {aiConfig.model} 연결 준비 완료
              </div>
              <button style={{ ...S.primary, background: "#2d3b53", marginTop: 10 }}
                onClick={() => setShowSettings(false)}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <header style={S.header}>
        <div style={S.brandRow}>
          <div style={S.logo}><FileText size={20} strokeWidth={2.4} /></div>
          <div>
            <h1 style={S.h1}>생기부 작성 도우미</h1>
            <p style={S.sub}>관찰 메모를 고르면, 항목에 맞는 특기사항 문장으로 다듬어 드려요.</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button style={S.settingsBtn} onClick={() => setShowSettings(true)}>
            <Settings size={14} />
            {aiConfig.apiKey
              ? <><span style={S.providerDot} />{AI_PROVIDERS[aiConfig.provider]?.label}</>
              : "AI 서비스 설정"}
          </button>
          <label style={S.aiToggle}>
            <input type="checkbox" checked={aiOn} onChange={(e) => setAiOn(e.target.checked)} />
            <span><Sparkles size={13} /> AI 다듬기</span>
          </label>
        </div>
      </header>

      {/* 탭 */}
      <nav style={S.tabs}>
        {Object.values(AREAS).map((a) => {
          const Icon = a.icon; const on = tab === a.id;
          return (
            <button key={a.id} onClick={() => { setTab(a.id); setDraft(""); }}
              style={{ ...S.tab, ...(on ? { color: a.accent, borderColor: a.accent, background: "#fff" } : {}) }}>
              <Icon size={16} /> {a.label}
            </button>
          );
        })}
      </nav>

      <main style={S.main}>
        {/* 왼쪽: 입력 */}
        <section style={S.panel}>
          <div style={S.panelHead}>
            <span style={{ ...S.dot, background: area.accent }} />
            <h2 style={S.h2}>{area.label} · 관찰 메모</h2>
          </div>

          <div style={S.studentRow}>
            <label style={S.lbl}>학생</label>
            <input style={S.input} value={student} placeholder="예) 12번 홍길동"
              onChange={(e) => setStudent(e.target.value)} />
          </div>

          {tab === "behavior" ? (
            <div style={S.chipGroups}>
              {BEHAVIOR_CHIPS.map((g) => {
                const sel = f[g.key] || [];
                return (
                  <div key={g.key} style={S.chipGroup}>
                    <div style={S.chipGroupLabel}>{g.label}</div>
                    <div style={S.chipWrap}>
                      {g.items.map((item) => {
                        const on = sel.includes(item);
                        return (
                          <button key={item} onClick={() => toggleChip(g.key, item)}
                            style={{
                              ...S.chip,
                              ...(on ? { background: area.accent, color: "#fff", borderColor: area.accent } : {}),
                            }}>
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={S.fieldGrid}>
              {area.fields.map((fd) => (
                <div key={fd.key}>
                  <label style={S.lbl}>{fd.label}</label>
                  <input style={S.input} value={f[fd.key] || ""} placeholder={fd.ph}
                    onChange={(e) => setField(fd.key, e.target.value)} />
                </div>
              ))}
            </div>
          )}

          <p style={S.hint}>
            {tab === "behavior"
              ? "본 그대로 칩을 누르기만 하면 됩니다. 여러 개 선택 가능해요."
              : "긴 문장을 쓰지 않고, 본 그대로 항목만 채우면 됩니다."}
          </p>

          <div style={S.btnRow}>
            <button style={{ ...S.primary, background: area.accent }} onClick={generate} disabled={loading}>
              {loading ? <span className="spin" style={S.spinner} /> : <Sparkles size={16} />}
              {loading ? "다듬는 중…" : "문장 생성"}
            </button>
            <button style={S.ghost} onClick={clearForm}><Trash2 size={15} /> 비우기</button>
          </div>
        </section>

        {/* 오른쪽: 결과 */}
        <section style={S.panel}>
          <div style={S.panelHead}>
            <h2 style={S.h2}>특기사항 (초안)</h2>
            <div style={S.counter}>
              <span style={{ color: overLimit ? "#c0392b" : "#555", fontWeight: overLimit ? 700 : 500 }}>
                {chars}자
              </span>
              <span style={S.counterMuted}> / 권장 {area.limit}자 · {bytes}byte</span>
            </div>
          </div>

          <textarea
            style={{ ...S.textarea, borderColor: overLimit ? "#e6b0aa" : "#e3e3e3" }}
            value={draft} placeholder="문장 생성을 누르면 초안이 여기에 나타나요. 직접 수정도 가능합니다."
            onChange={(e) => setDraft(e.target.value)} />

          {/* 검사 결과 */}
          {(scan.hits.length > 0 || scan.cautions.length > 0) && (
            <div style={S.scanBox}>
              {scan.hits.map((h, i) => (
                <div key={"h" + i} style={S.flagForbidden}>
                  <AlertTriangle size={13} />
                  <b>{h.term}</b> · {h.cat} 기재 불가 → <i>{h.alt}</i>(으)로
                </div>
              ))}
              {scan.cautions.map((c, i) => (
                <div key={"c" + i} style={S.flagCaution}>
                  <AlertTriangle size={13} /> <b>{c.term}</b> · {c.note}
                </div>
              ))}
            </div>
          )}
          {draft && scan.hits.length === 0 && scan.cautions.length === 0 && (
            <div style={S.flagOk}><Check size={13} /> 금지어가 발견되지 않았어요.</div>
          )}

          <div style={S.btnRow}>
            <button style={S.action} onClick={copyDraft}>
              {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "복사됨" : "복사"}
            </button>
            <button style={{ ...S.action, ...S.actionAccent }} onClick={saveDraft}>
              <Save size={15} /> 저장
            </button>
          </div>
        </section>
      </main>

      {/* 저장 목록 */}
      <section style={S.savedSection}>
        <div style={S.savedHead}>
          <h2 style={S.h2}>저장한 문장 <span style={S.badge}>{saved.length}</span></h2>
          <div style={S.exportRow}>
            <button style={S.exportBtn} onClick={() => exportFile("txt")}><Download size={14} /> TXT</button>
            <button style={S.exportBtn} onClick={() => exportFile("csv")}><Download size={14} /> CSV</button>
          </div>
        </div>
        {saved.length === 0 ? (
          <p style={S.empty}>아직 저장한 문장이 없어요. 초안을 다듬은 뒤 ‘저장’을 눌러 모아 두세요.</p>
        ) : (
          <div style={S.savedList}>
            {saved.map((s) => (
              <div key={s.id} style={S.savedCard}>
                <div style={S.savedTop}>
                  <span style={{ ...S.savedTag, background: AREAS[s.areaId]?.accent || "#777" }}>{s.area}</span>
                  <span style={S.savedStudent}>{s.student}</span>
                  <span style={S.savedChars}>{s.chars}자</span>
                  <button style={S.savedDel} onClick={() => removeSaved(s.id)}><X size={14} /></button>
                </div>
                <p style={S.savedText}>{s.text}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer style={S.footer}>
        금지어 검사는 2026 학생부 기재요령 연수자료를 바탕으로 한 보조 기능입니다.
        최종 기재는 반드시 담당 교사가 기재요령을 확인해 판단해 주세요.
      </footer>

      {toast && <div style={S.toast}>{toast}</div>}
    </div>
  );
}

// ── 스타일 ───────────────────────────────────────────────────────────────
const S = {
  page: { maxWidth: 1080, margin: "0 auto", padding: "20px 16px 60px", fontFamily: "'Pretendard', -apple-system, 'Apple SD Gothic Neo', sans-serif", color: "#222" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" },
  brandRow: { display: "flex", gap: 12, alignItems: "center" },
  logo: { width: 38, height: 38, borderRadius: 10, background: "#2d3b53", color: "#fff", display: "grid", placeItems: "center", flexShrink: 0 },
  h1: { fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" },
  sub: { fontSize: 12.5, color: "#777", margin: "3px 0 0" },
  aiToggle: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#444", cursor: "pointer", userSelect: "none", border: "1px solid #e0e0e0", padding: "7px 12px", borderRadius: 999, background: "#fafafa" },
  tabs: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 },
  tab: { display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 600, color: "#888", background: "#f3f3f3", border: "1.5px solid transparent", borderRadius: 999, padding: "8px 14px", cursor: "pointer", transition: "all .15s" },
  main: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" },
  panel: { background: "#fff", border: "1px solid #ececec", borderRadius: 16, padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,.03)" },
  panelHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 14 },
  dot: { width: 9, height: 9, borderRadius: 99, marginRight: 2 },
  h2: { fontSize: 15, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 },
  studentRow: { marginBottom: 12 },
  lbl: { display: "block", fontSize: 11.5, fontWeight: 600, color: "#999", marginBottom: 5 },
  input: { width: "100%", boxSizing: "border-box", fontSize: 13.5, padding: "9px 11px", border: "1px solid #e3e3e3", borderRadius: 9, outline: "none", fontFamily: "inherit" },
  fieldGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  chipGroups: { display: "flex", flexDirection: "column", gap: 14 },
  chipGroup: {},
  chipGroupLabel: { fontSize: 12.5, fontWeight: 700, color: "#555", marginBottom: 8 },
  chipWrap: { display: "flex", flexWrap: "wrap", gap: 7 },
  chip: { fontSize: 12.5, fontWeight: 500, color: "#555", background: "#fff", border: "1.5px solid #e0e0e0", borderRadius: 999, padding: "7px 13px", cursor: "pointer", fontFamily: "inherit", transition: "all .12s" },
  hint: { fontSize: 11.5, color: "#aaa", margin: "12px 0 14px", fontStyle: "italic" },
  btnRow: { display: "flex", gap: 8, marginTop: 14 },
  primary: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, color: "#fff", border: "none", borderRadius: 10, padding: "11px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  ghost: { display: "flex", alignItems: "center", gap: 6, color: "#888", background: "#f5f5f5", border: "none", borderRadius: 10, padding: "11px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  spinner: { width: 15, height: 15, border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff", borderRadius: 99, display: "inline-block" },
  counter: { fontSize: 12 },
  counterMuted: { color: "#bbb" },
  textarea: { width: "100%", boxSizing: "border-box", minHeight: 150, fontSize: 14, lineHeight: 1.7, padding: 13, border: "1px solid #e3e3e3", borderRadius: 11, outline: "none", resize: "vertical", fontFamily: "inherit" },
  scanBox: { marginTop: 12, display: "flex", flexDirection: "column", gap: 6 },
  flagForbidden: { display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "#a93226", background: "#fdedec", border: "1px solid #f5c9c4", borderRadius: 8, padding: "8px 10px" },
  flagCaution: { display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "#9a6a00", background: "#fef9e7", border: "1px solid #f5e3a8", borderRadius: 8, padding: "8px 10px" },
  flagOk: { marginTop: 12, display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "#1e8449", background: "#eafaf1", border: "1px solid #c8ecd5", borderRadius: 8, padding: "8px 10px" },
  action: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#444", background: "#f5f5f5", border: "none", borderRadius: 10, padding: "10px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  actionAccent: { background: "#2d3b53", color: "#fff" },
  savedSection: { marginTop: 20, background: "#fff", border: "1px solid #ececec", borderRadius: 16, padding: 18 },
  savedHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  badge: { display: "inline-grid", placeItems: "center", minWidth: 20, height: 20, padding: "0 6px", background: "#2d3b53", color: "#fff", borderRadius: 99, fontSize: 11.5, fontWeight: 700, marginLeft: 6 },
  exportRow: { display: "flex", gap: 7 },
  exportBtn: { display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 600, color: "#444", background: "#f5f5f5", border: "1px solid #e7e7e7", borderRadius: 8, padding: "7px 12px", cursor: "pointer", fontFamily: "inherit" },
  empty: { fontSize: 13, color: "#aaa", textAlign: "center", padding: "20px 0" },
  savedList: { display: "flex", flexDirection: "column", gap: 10 },
  savedCard: { border: "1px solid #eee", borderRadius: 11, padding: 13, background: "#fcfcfc" },
  savedTop: { display: "flex", alignItems: "center", gap: 8, marginBottom: 7 },
  savedTag: { color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99 },
  savedStudent: { fontSize: 12.5, fontWeight: 600, color: "#555" },
  savedChars: { fontSize: 11.5, color: "#aaa" },
  savedDel: { marginLeft: "auto", border: "none", background: "transparent", color: "#bbb", cursor: "pointer", display: "grid", placeItems: "center" },
  savedText: { fontSize: 13.5, lineHeight: 1.7, margin: 0, color: "#333" },
  footer: { fontSize: 11.5, color: "#bbb", textAlign: "center", marginTop: 22, lineHeight: 1.6 },
  toast: { position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#2d3b53", color: "#fff", padding: "11px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 16px rgba(0,0,0,.2)", zIndex: 50 },
  // 설정 모달
  modalBackdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", zIndex: 100, display: "grid", placeItems: "center", padding: 16 },
  modal: { background: "#fff", borderRadius: 18, width: "100%", maxWidth: 440, boxShadow: "0 8px 40px rgba(0,0,0,.18)", overflow: "hidden" },
  modalHead: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 14px", borderBottom: "1px solid #f0f0f0" },
  modalBody: { padding: "18px 20px 10px" },
  providerRow: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "9px 12px", borderRadius: 9, border: "1px solid #e8e8e8", fontSize: 13.5 },
  settingsBtn: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#444", background: "#f3f3f3", border: "1px solid #e0e0e0", borderRadius: 999, padding: "7px 13px", cursor: "pointer", fontFamily: "inherit" },
  providerDot: { width: 7, height: 7, borderRadius: 99, background: "#27ae60", display: "inline-block" },
  eyeBtn: { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", color: "#aaa", cursor: "pointer", display: "grid", placeItems: "center", padding: 0 },
};

const CSS = `
@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin .7s linear infinite; }
input:focus, textarea:focus { border-color: #2d3b53 !important; }
button:hover { filter: brightness(0.97); }
@media (max-width: 720px) {
  main { grid-template-columns: 1fr !important; }
}
`;
