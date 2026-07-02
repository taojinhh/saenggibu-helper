import { useState } from "react";

// ── 상수 ──────────────────────────────────────────────────────────────────
const CL1 = ['1-1','1-2','1-3','1-4','1-5','1-6','1-7','1-8','1-9','1-10'];
const CL2 = ['2-1','2-2','2-3','2-4','2-5','2-6','2-7','2-8','2-9','2-10'];
const CL3 = ['3-1','3-2','3-3','3-4','3-5','3-6','3-7','3-8','3-9','3-10'];
const CLS = [...CL1, ...CL2, ...CL3, '수교실1','수교실2'];

// 교사 구분
// 'normal'  : 일반 → 정감독·부감독·자습감독·예비감독 모두 가능
// 'care'    : 배려 → 부감독·자습감독만 가능 (정감독·예비감독 제외)
// 'admin'   : 관리자 → 배정 제외

const DEF_DATES = [];
const DEF_TIMES = [];

const STORAGE_KEY = 'exam_supervisor_v1';
function loadSaved() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}

function buildDefaultSchedule() {
  const s = {};
  const set = (date, p, classes, subj) => classes.forEach(c => { s[`${date}_${p}_${c}`] = subj; });
  set('2026-06-29',1,CL1,'통합사회1'); set('2026-06-29',1,CL2,'영어Ⅰ'); set('2026-06-29',1,CL3,'자습');
  set('2026-06-29',2,CL1,'자습'); set('2026-06-29',2,['2-1','2-2','2-3','2-4','2-5','2-6'],'자습');
  set('2026-06-29',2,['2-7','2-8','2-9','2-10'],'물리학'); set('2026-06-29',2,CL3,'영어독해와작문');
  set('2026-06-29',3,CL1,'공통수학1'); set('2026-06-29',3,CL2,'세계시민과지리'); set('2026-06-29',3,CL3,'자습');
  s['2026-06-29_3_수교실1']='공통수학1'; s['2026-06-29_3_수교실2']='심화수학Ⅰ';
  set('2026-06-30',1,CL1,'자습'); set('2026-06-30',1,CL2,'문학'); set('2026-06-30',1,CL3,'언어와매체');
  set('2026-06-30',2,CL1,'자습'); set('2026-06-30',2,['2-1','2-2','2-3','2-4','2-5','2-6'],'세계사(2)');
  set('2026-06-30',2,['2-7','2-8','2-9','2-10'],'화학'); set('2026-06-30',2,['3-1','3-2','3-3','3-4','3-5','3-6'],'세계사(3)');
  set('2026-06-30',2,['3-7','3-8','3-9','3-10'],'화학Ⅱ');
  set('2026-06-30',3,CL1,'공통영어1'); set('2026-06-30',3,CL2,'자습'); set('2026-06-30',3,CL3,'자습');
  set('2026-07-01',1,[...CL1,...CL2,...CL3],'자습');
  set('2026-07-01',2,CL1,'자습'); set('2026-07-01',2,['2-1','2-2','2-3','2-4','2-5','2-6'],'자습');
  set('2026-07-01',2,['2-7','2-8','2-9','2-10'],'지구과학'); set('2026-07-01',2,['3-1','3-2','3-3','3-4','3-5','3-6'],'자습');
  set('2026-07-01',2,['3-7','3-8','3-9','3-10'],'미적분');
  set('2026-07-01',3,CL1,'공통국어1'); set('2026-07-01',3,['2-1','2-2','2-3','2-4','2-5','2-6'],'현대사회와윤리');
  set('2026-07-01',3,['2-7','2-8','2-9','2-10'],'자습'); set('2026-07-01',3,['3-1','3-2','3-3','3-4','3-5','3-6'],'생활과윤리');
  set('2026-07-01',3,['3-7','3-8','3-9','3-10'],'자습');
  set('2026-07-02',1,CL1,'통합과학1'); set('2026-07-02',1,CL2,'자습'); set('2026-07-02',1,['3-1','3-2','3-3','3-4','3-5','3-6'],'자습');
  set('2026-07-02',1,['3-7','3-8'],'경제'); set('2026-07-02',1,['3-9','3-10'],'지구과학Ⅱ');
  set('2026-07-02',2,CL1,'자습'); set('2026-07-02',2,['2-1','2-2','2-3','2-4','2-5','2-6'],'자습');
  set('2026-07-02',2,['2-7','2-8','2-9','2-10'],'사회와문화'); set('2026-07-02',2,['3-1','3-2','3-3','3-4','3-5','3-6'],'자습');
  set('2026-07-02',2,['3-7','3-8','3-9','3-10'],'세계지리');
  set('2026-07-02',3,CL1,'기술가정/한문'); set('2026-07-02',3,['2-1','2-2','2-3','2-4','2-5','2-6'],'자습');
  set('2026-07-02',3,['2-7','2-8','2-9','2-10'],'생명과학'); set('2026-07-02',3,['3-1','3-2','3-3','3-4','3-5','3-6'],'자습');
  set('2026-07-02',3,['3-7','3-8','3-9','3-10'],'생명과학Ⅱ');
  set('2026-07-03',1,CL1,'한국사'); set('2026-07-03',1,CL2,'자습'); set('2026-07-03',1,['3-1','3-2','3-3','3-4','3-5','3-6'],'자습');
  set('2026-07-03',1,['3-7','3-8','3-9','3-10'],'화법과작문');
  set('2026-07-03',2,[...CL1,...CL2,...CL3],'자습');
  set('2026-07-03',3,CL1,'자습'); set('2026-07-03',3,['2-1','2-2','2-3','2-4','2-5','2-6'],'자습');
  set('2026-07-03',3,['2-7','2-8','2-9','2-10'],'대수'); set('2026-07-03',3,['3-1','3-2','3-3','3-4','3-5','3-6'],'자습');
  set('2026-07-03',3,['3-7','3-8','3-9','3-10'],'확률과통계');
  return s;
}

const DEF_TEACHERS = [
  // 기본 교사 데이터 없음 — 직접 입력
];

// ── 자동배정 알고리즘 ───────────────────────────────────────────────────
function runAutoAssign(teachers, schedule, parents, absences, examDates, periodTimes) {
  // 관리자 제외
  const active = teachers.filter(t => (t.type||'normal') !== 'admin' && !t.isAdmin);
  const counts = {};
  active.forEach(t => { counts[t.name] = {정:0,부:0,자습:0,예비:0}; });

  const usedParents = new Set();
  const results = {};
  const warnings = [];

  // 배려 교사는 부감독·자습감독만 가능
  const isCare = t => (t.type||'normal') === 'care';

  function pickOne(pool, role, cls, subject, busy, extra = new Set()) {
    const eligible = pool.filter(t => {
      if (busy.has(t.name)) return false;
      if (extra.has(t.name)) return false;
      if (t.homeroom && t.homeroom === cls) return false;
      if (subject && t.subjects && t.subjects.includes(subject)) return false;
      // 배려 교사는 정감독·예비감독 불가
      if (isCare(t) && (role === '정' || role === '예비')) return false;
      return true;
    });
    if (!eligible.length) return null;
    eligible.sort((a,b) => {
      const diff = (counts[a.name]?.[role]||0) - (counts[b.name]?.[role]||0);
      if (diff !== 0) return diff;
      const sa = Object.values(counts[a.name]||{}).reduce((s,v)=>s+v,0);
      const sb = Object.values(counts[b.name]||{}).reduce((s,v)=>s+v,0);
      return sa - sb;
    });
    return eligible[0].name;
  }

  function findParent(date, period) {
    for (const p of parents) {
      const key = `${date}_${period}_${p.id}`;
      if (usedParents.has(key)) continue;
      if (p.available?.some(a => a.date === date && String(a.period) === String(period))) return p;
    }
    return null;
  }

  for (const {date} of examDates) {
    const absent = new Set(absences[date] || []);
    const pool = active.filter(t => !absent.has(t.name));

    // 예비감독 2명 (일반 교사만, 배려 제외)
    const standby = [];
    const sbBusy = new Set();
    for (let i = 0; i < 2; i++) {
      const t = pickOne(pool, '예비', null, null, sbBusy);
      if (t) { standby.push(t); sbBusy.add(t); counts[t].예비++; }
      else warnings.push(`${date}: 예비감독 ${i+1}번 배정 불가`);
    }

    const dayResult = { date, standby, periods: [] };

    for (let period = 1; period <= (periodTimes?.length || 3); period++) {
      const busy = new Set([...standby]);
      const assignments = [];

      const exam = CLS.filter(c => { const s = schedule[`${date}_${period}_${c}`]; return s && s !== '자습'; });
      const jaseup = CLS.filter(c => schedule[`${date}_${period}_${c}`] === '자습');

      // 자습 먼저 배정 (교사 소진 방지)
      for (const cls of jaseup) {
        const 자 = pickOne(pool, '자습', cls, null, busy);
        if (자) { busy.add(자); counts[자].자습++; }
        else warnings.push(`${date} ${period}교시 ${cls}: 자습감독 배정 불가`);
        assignments.push({class:cls, subject:'자습', 자습감독:자, 정감독:null, 부감독:null, 부isParent:false});
      }

      // 시험반 배정
      for (const cls of exam) {
        const subject = schedule[`${date}_${period}_${cls}`];
        const 정 = pickOne(pool, '정', cls, subject, busy);
        if (정) { busy.add(정); counts[정].정++; }
        else warnings.push(`${date} ${period}교시 ${cls}(${subject}): 정감독 배정 불가`);

        let 부 = null, 부isParent = false;
        const par = findParent(date, period);
        if (par) {
          부 = par.name; 부isParent = true;
          usedParents.add(`${date}_${period}_${par.id}`);
        } else {
          부 = pickOne(pool, '부', cls, null, busy, 정 ? new Set([정]) : new Set());
          if (부) { busy.add(부); counts[부].부++; }
          else warnings.push(`${date} ${period}교시 ${cls}: 부감독 배정 불가`);
        }
        assignments.push({class:cls, subject, 정감독:정, 부감독:부, 부isParent, 자습감독:null});
      }

      assignments.sort((a,b) => CLS.indexOf(a.class) - CLS.indexOf(b.class));
      dayResult.periods.push({period, assignments});
    }
    results[date] = dayResult;
  }

  return {results, counts, warnings};
}

// ── 스타일 ────────────────────────────────────────────────────────────────
const S = {
  wrap: {fontFamily:"'Pretendard','Malgun Gothic',sans-serif",minHeight:'100vh',background:'#f1f5f9',color:'#1e293b'},
  header: {background:'linear-gradient(135deg,#1e3a5f,#2563eb)',color:'#fff',padding:'20px 28px'},
  headerTitle: {fontSize:'1.4rem',fontWeight:700,margin:0},
  headerSub: {fontSize:'0.85rem',opacity:0.8,marginTop:4},
  tabs: {display:'flex',gap:0,background:'#fff',borderBottom:'2px solid #e2e8f0',padding:'0 16px',flexWrap:'wrap'},
  tab: (active) => ({
    padding:'12px 18px',border:'none',background:'none',cursor:'pointer',
    fontSize:'0.85rem',fontWeight:600,color:active?'#2563eb':'#64748b',
    borderBottom:active?'2px solid #2563eb':'2px solid transparent',
    marginBottom:-2,transition:'all .15s',whiteSpace:'nowrap',
  }),
  body: {padding:'20px',maxWidth:1400,margin:'0 auto'},
  card: {background:'#fff',borderRadius:10,boxShadow:'0 1px 4px rgba(0,0,0,.08)',padding:'20px',marginBottom:16},
  cardTitle: {fontSize:'1rem',fontWeight:700,marginBottom:14,color:'#1e3a5f',borderBottom:'1px solid #e2e8f0',paddingBottom:8},
  btn: (color='#2563eb') => ({
    padding:'7px 14px',borderRadius:6,border:'none',background:color,color:'#fff',
    cursor:'pointer',fontSize:'0.82rem',fontWeight:600,
  }),
  btnSm: {padding:'4px 10px',borderRadius:5,border:'none',background:'#e2e8f0',color:'#334155',cursor:'pointer',fontSize:'0.78rem'},
  input: {padding:'6px 10px',borderRadius:6,border:'1px solid #cbd5e1',fontSize:'0.85rem',width:'100%',boxSizing:'border-box'},
  tbl: {width:'100%',borderCollapse:'collapse',fontSize:'0.82rem'},
  th: {background:'#f8fafc',padding:'8px 10px',textAlign:'left',borderBottom:'1px solid #e2e8f0',fontWeight:600,color:'#475569',whiteSpace:'nowrap'},
  td: {padding:'7px 10px',borderBottom:'1px solid #f1f5f9',verticalAlign:'middle'},
  warn: {background:'#fef3c7',border:'1px solid #fcd34d',borderRadius:8,padding:'12px',marginBottom:12,fontSize:'0.83rem',color:'#92400e'},
};

const ROLE_COLOR = {정감독:'#2563eb',부감독:'#7c3aed',자습감독:'#059669',예비:'#d97706'};

const TYPE_META = {
  normal: {label:'일반',bg:'#2563eb'},
  care:   {label:'배려',bg:'#0891b2'},
  admin:  {label:'관리자',bg:'#dc2626'},
};

// ── 교사 관리 탭 ──────────────────────────────────────────────────────────
function TeacherTab({teachers, setTeachers}) {
  const emptyForm = {name:'',type:'normal',homeroom:'',subjects:['','','','']};
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  function handleSubj(i, v) {
    const s = [...form.subjects]; s[i]=v; setForm({...form,subjects:s});
  }

  function save() {
    if (!form.name.trim()) return;
    const subjs = form.subjects.filter(Boolean);
    const data = {...form, subjects:subjs};
    if (editId != null) {
      setTeachers(prev => prev.map(t => t.id===editId ? {...data, id:editId} : t));
      setEditId(null);
    } else {
      setTeachers(prev => [...prev, {...data, id:Date.now()}]);
    }
    setForm(emptyForm);
  }

  function startEdit(t) {
    const subjs = [...(t.subjects||[]),'','','',''].slice(0,4);
    setForm({name:t.name, type:t.type||'normal', homeroom:t.homeroom||'', subjects:subjs});
    setEditId(t.id);
  }

  function del(id) { if(window.confirm('삭제할까요?')) setTeachers(prev=>prev.filter(t=>t.id!==id)); }

  const filtered = teachers.filter(t =>
    t.name.includes(search) && (filterType==='all' || (t.type||'normal')===filterType)
  );

  const typeCounts = {all:teachers.length};
  teachers.forEach(t => { const tp=t.type||'normal'; typeCounts[tp]=(typeCounts[tp]||0)+1; });

  return (
    <div>
      <div style={S.card}>
        <div style={S.cardTitle}>{editId!=null?'✏️ 교사 수정':'➕ 교사 추가'}</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:10}}>
          <div>
            <label style={{fontSize:'0.8rem',fontWeight:600,color:'#475569',display:'block',marginBottom:4}}>이름 *</label>
            <input style={S.input} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="예) 홍길동" />
          </div>
          <div>
            <label style={{fontSize:'0.8rem',fontWeight:600,color:'#475569',display:'block',marginBottom:4}}>담임학반</label>
            <select style={S.input} value={form.homeroom} onChange={e=>setForm({...form,homeroom:e.target.value})}>
              <option value="">비담임</option>
              {[...CL1,...CL2,...CL3].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{fontSize:'0.8rem',fontWeight:600,color:'#475569',display:'block',marginBottom:4}}>구분</label>
            <select style={S.input} value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
              <option value="normal">일반 — 모든 감독 배정 가능</option>
              <option value="care">배려 — 부감독·자습감독만 배정</option>
              <option value="admin">관리자 — 배정 제외</option>
            </select>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:10,marginBottom:12}}>
          {[0,1,2,3].map(i=>(
            <div key={i}>
              <label style={{fontSize:'0.8rem',fontWeight:600,color:'#475569',display:'block',marginBottom:4}}>담당 교과 {i+1}</label>
              <input style={S.input} value={form.subjects[i]} onChange={e=>handleSubj(i,e.target.value)} placeholder="예) 공통수학1" />
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:8}}>
          <button style={S.btn()} onClick={save}>{editId!=null?'수정 완료':'추가'}</button>
          {editId!=null && <button style={S.btn('#64748b')} onClick={()=>{setEditId(null);setForm(emptyForm);}}>취소</button>}
        </div>
      </div>

      <div style={S.card}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8,marginBottom:12}}>
          <div style={S.cardTitle}>👩‍🏫 교사 목록</div>
          <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
            {/* 구분 필터 */}
            {[['all','전체'],['normal','일반'],['care','배려'],['admin','관리자']].map(([v,l])=>(
              <button key={v} style={{...S.btnSm, background:filterType===v?'#2563eb':'#e2e8f0', color:filterType===v?'#fff':'#334155'}}
                onClick={()=>setFilterType(v)}>{l} ({typeCounts[v]||0})</button>
            ))}
            <input style={{...S.input,width:160}} value={search} onChange={e=>setSearch(e.target.value)} placeholder="이름 검색..." />
          </div>
        </div>
        {/* 안내 */}
        <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
          {Object.entries(TYPE_META).map(([k,v])=>(
            <span key={k} style={{display:'inline-flex',alignItems:'center',gap:6,fontSize:'0.78rem',color:'#64748b'}}>
              <span style={{display:'inline-block',width:10,height:10,borderRadius:3,background:v.bg}}/>
              <b>{v.label}</b>: {k==='normal'?'정·부·자습·예비 모두':k==='care'?'부감독·자습감독만':'배정 제외'}
            </span>
          ))}
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={S.tbl}>
            <thead>
              <tr>{['이름','담임학반','구분','담당 교과',''].map(h=><th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(t=>{
                const tm = TYPE_META[t.type||'normal']||TYPE_META.normal;
                return (
                  <tr key={t.id} style={{opacity:(t.type||'normal')==='admin'?0.55:1}}>
                    <td style={{...S.td,fontWeight:700}}>{t.name}</td>
                    <td style={S.td}>{t.homeroom||<span style={{color:'#94a3b8'}}>비담임</span>}</td>
                    <td style={S.td}>
                      <span style={{display:'inline-block',padding:'2px 10px',borderRadius:20,fontSize:'0.75rem',fontWeight:700,background:tm.bg,color:'#fff'}}>{tm.label}</span>
                    </td>
                    <td style={S.td}>{(t.subjects||[]).join(', ')||<span style={{color:'#94a3b8'}}>-</span>}</td>
                    <td style={S.td}>
                      <div style={{display:'flex',gap:6}}>
                        <button style={S.btnSm} onClick={()=>startEdit(t)}>수정</button>
                        <button style={{...S.btnSm,background:'#fee2e2',color:'#dc2626'}} onClick={()=>del(t.id)}>삭제</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── 시험 일정 탭 ──────────────────────────────────────────────────────────
function ScheduleTab({examDates, setExamDates, schedule, setSchedule, periodTimes, setPeriodTimes}) {
  const [showGrid, setShowGrid] = useState(false);
  const [gridDate, setGridDate] = useState(examDates[0]?.date||'');

  // 학년그룹
  const GRADE_GROUPS = [
    {label:'1학년 전체', classes:CL1},
    {label:'2학년 전체', classes:CL2},
    {label:'3학년 전체', classes:CL3},
    {label:'수교실1', classes:['수교실1']},
    {label:'수교실2', classes:['수교실2']},
  ];

  // 그룹 내 공통과목 반환 (혼합이면 '(혼합)')
  function getGroupSubject(date, period, classes) {
    const vals = [...new Set(classes.map(c => schedule[`${date}_${period}_${c}`]||''))];
    return vals.length === 1 ? vals[0] : '(혼합)';
  }

  // 그룹 전체에 과목 설정
  function setGroupSubject(date, period, classes, val) {
    if (val === '(혼합)') return;
    setSchedule(prev => {
      const next = {...prev};
      classes.forEach(c => { next[`${date}_${period}_${c}`] = val || undefined; });
      return next;
    });
  }

  function setCellVal(date, period, cls, val) {
    setSchedule(prev => ({...prev, [`${date}_${period}_${cls}`]: val||undefined}));
  }

  const subjectBg = v => v==='자습' ? '#f0fdf4' : v ? '#eff6ff' : '#f8fafc';
  const subjectBorder = v => v==='자습' ? '1px solid #86efac' : v ? '1px solid #93c5fd' : '1px solid #e2e8f0';

  return (
    <div>
      {/* 시험 날짜 설정 */}
      <div style={S.card}>
        <div style={S.cardTitle}>📅 시험 일자 설정</div>
        <div style={{overflowX:'auto'}}>
          <table style={S.tbl}>
            <thead><tr><th style={S.th}>날짜</th><th style={S.th}>요일</th><th style={S.th}></th></tr></thead>
            <tbody>
              {examDates.map((d,i)=>(
                <tr key={i}>
                  <td style={S.td}><input style={{...S.input,width:150}} value={d.date} onChange={e=>{const n=[...examDates];n[i]={...n[i],date:e.target.value};setExamDates(n);}}/></td>
                  <td style={S.td}><input style={{...S.input,width:60}} value={d.day} onChange={e=>{const n=[...examDates];n[i]={...n[i],day:e.target.value};setExamDates(n);}}/></td>
                  <td style={S.td}><button style={{...S.btnSm,background:'#fee2e2',color:'#dc2626'}} onClick={()=>setExamDates(p=>p.filter((_,j)=>j!==i))}>삭제</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button style={{...S.btn('#059669'),marginTop:10}} onClick={()=>setExamDates(p=>[...p,{date:'',day:''}])}>날짜 추가</button>
      </div>

      {/* 교시 시간 설정 */}
      <div style={S.card}>
        <div style={S.cardTitle}>⏰ 교시별 시간 설정</div>
        {periodTimes.map((pt,i)=>(
          <div key={i} style={{display:'flex',gap:8,marginBottom:8,alignItems:'center'}}>
            <span style={{minWidth:60,fontSize:'0.85rem',fontWeight:700,color:'#1e3a5f'}}>{i+1}교시</span>
            <div><label style={{fontSize:'0.75rem',color:'#64748b'}}>감독 입실</label>
              <input style={{...S.input,width:80}} value={pt.entry} onChange={e=>{const n=[...periodTimes];n[i]={...n[i],entry:e.target.value};setPeriodTimes(n);}}/></div>
            <div><label style={{fontSize:'0.75rem',color:'#64748b'}}>시험 시작</label>
              <input style={{...S.input,width:80}} value={pt.start} onChange={e=>{const n=[...periodTimes];n[i]={...n[i],start:e.target.value};setPeriodTimes(n);}}/></div>
            <span style={{padding:'0 4px',color:'#94a3b8'}}>~</span>
            <div><label style={{fontSize:'0.75rem',color:'#64748b'}}>종료</label>
              <input style={{...S.input,width:80}} value={pt.end} onChange={e=>{const n=[...periodTimes];n[i]={...n[i],end:e.target.value};setPeriodTimes(n);}}/></div>
            <button style={{...S.btnSm,background:'#fee2e2',color:'#dc2626',marginTop:16}} onClick={()=>setPeriodTimes(p=>p.filter((_,j)=>j!==i))}>삭제</button>
          </div>
        ))}
        <button style={{...S.btn('#059669'),marginTop:4}} onClick={()=>setPeriodTimes(p=>[...p,{entry:'',start:'',end:''}])}>교시 추가</button>
      </div>

      {/* ★ 교과 입력 — 날짜×교시×학년 매트릭스 */}
      <div style={S.card}>
        <div style={S.cardTitle}>📚 날짜·교시별 교과 입력</div>
        <div style={{fontSize:'0.8rem',color:'#64748b',marginBottom:12}}>
          각 날짜·교시의 학년별 시험 과목을 입력하세요. <b>자습</b>이라고 쓰면 자습감독만 배정됩니다.<br/>
          일부 반만 다른 과목인 경우 아래 <b>학급별 상세 편집</b>을 사용하세요.
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{...S.tbl, minWidth:700}}>
            <thead>
              <tr>
                <th style={{...S.th,minWidth:110}}>날짜</th>
                <th style={{...S.th,minWidth:60}}>교시</th>
                {GRADE_GROUPS.map(g=>(
                  <th key={g.label} style={{...S.th,minWidth:130}}>{g.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {examDates.map(d =>
                periodTimes.map((pt,pi)=>(
                  <tr key={`${d.date}_${pi}`}>
                    {pi===0 && <td style={{...S.td,fontWeight:700,verticalAlign:'middle',borderLeft:'3px solid #3b82f6'}} rowSpan={periodTimes.length}>
                      {d.date.slice(5)}({d.day})
                    </td>}
                    <td style={{...S.td,fontWeight:600,color:'#475569',whiteSpace:'nowrap'}}>{pi+1}교시<br/><span style={{fontSize:'0.72rem',fontWeight:400}}>{pt.start}~{pt.end}</span></td>
                    {GRADE_GROUPS.map(g=>{
                      const val = getGroupSubject(d.date, pi+1, g.classes);
                      const isSpecial = g.classes.length === 1;
                      return (
                        <td key={g.label} style={S.td}>
                          <input
                            style={{...S.input,
                              background: subjectBg(val==='(혼합)'?null:val),
                              border: val==='(혼합)' ? '1px solid #f59e0b' : subjectBorder(val),
                              fontSize:'0.8rem',
                            }}
                            value={val}
                            onChange={e => setGroupSubject(d.date, pi+1, g.classes, e.target.value)}
                            placeholder={isSpecial ? '없으면 비워둠' : '자습 또는 과목명'}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div style={{marginTop:8,fontSize:'0.75rem',color:'#94a3b8'}}>
          💡 파란배경=시험과목 / 초록배경=자습 / 노란테두리=반마다 다른 과목(혼합) — 혼합인 경우 아래에서 학급별 수정
        </div>
      </div>

      {/* 학급별 상세 편집 (접기/펼치기) */}
      <div style={S.card}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'}} onClick={()=>setShowGrid(v=>!v)}>
          <div style={S.cardTitle}>🔧 학급별 상세 편집 (일부 반만 다른 과목)</div>
          <span style={{fontSize:'1.2rem',color:'#64748b'}}>{showGrid?'▲':'▼'}</span>
        </div>
        {showGrid && (
          <>
            <div style={{marginBottom:10}}>
              <select style={{...S.input,width:200}} value={gridDate} onChange={e=>setGridDate(e.target.value)}>
                {examDates.map(d=><option key={d.date} value={d.date}>{d.date}({d.day})</option>)}
              </select>
            </div>
            <div style={{overflowX:'auto'}}>
              <table style={S.tbl}>
                <thead>
                  <tr>
                    <th style={{...S.th,width:80}}>학급</th>
                    {periodTimes.map((_,i)=><th key={i} style={S.th}>{i+1}교시</th>)}
                  </tr>
                </thead>
                <tbody>
                  {CLS.map(cls=>(
                    <tr key={cls}>
                      <td style={{...S.td,fontWeight:700,color:'#1e3a5f'}}>{cls}</td>
                      {periodTimes.map((_,i)=>{
                        const val=schedule[`${gridDate}_${i+1}_${cls}`]||'';
                        return (
                          <td key={i} style={S.td}>
                            <input style={{...S.input,background:subjectBg(val),border:subjectBorder(val)}}
                              value={val} onChange={e=>setCellVal(gridDate,i+1,cls,e.target.value)} placeholder="-"/>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── 학부모 탭 ──────────────────────────────────────────────────────────────
function ParentTab({parents, setParents, examDates, periodTimes}) {
  const emptyForm = {name:'',childClass:'',available:[]};
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  function toggleAvail(date, period) {
    const has = form.available.some(a=>a.date===date&&String(a.period)===String(period));
    setForm({...form, available: has
      ? form.available.filter(a=>!(a.date===date&&String(a.period)===String(period)))
      : [...form.available,{date,period}]
    });
  }

  function save() {
    if (!form.name.trim()) return;
    if (editId!=null) {
      setParents(prev=>prev.map(p=>p.id===editId?{...form,id:editId}:p));
      setEditId(null);
    } else {
      setParents(prev=>[...prev,{...form,id:Date.now()}]);
    }
    setForm(emptyForm);
  }

  return (
    <div>
      <div style={S.card}>
        <div style={S.cardTitle}>{editId!=null?'✏️ 학부모 수정':'➕ 학부모 추가'}</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
          <div>
            <label style={{fontSize:'0.8rem',fontWeight:600,color:'#475569',display:'block',marginBottom:4}}>학부모 이름</label>
            <input style={S.input} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="예) 홍길동" />
          </div>
          <div>
            <label style={{fontSize:'0.8rem',fontWeight:600,color:'#475569',display:'block',marginBottom:4}}>자녀 학반</label>
            <select style={S.input} value={form.childClass} onChange={e=>setForm({...form,childClass:e.target.value})}>
              <option value="">선택</option>
              {[...CL1,...CL2,...CL3].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={{marginBottom:12}}>
          <label style={{fontSize:'0.8rem',fontWeight:600,color:'#475569',display:'block',marginBottom:8}}>감독 가능 날짜/교시</label>
          <div style={{overflowX:'auto'}}>
            <table style={S.tbl}>
              <thead><tr><th style={S.th}>날짜</th>{periodTimes.map((_,i)=><th key={i} style={S.th}>{i+1}교시</th>)}</tr></thead>
              <tbody>
                {examDates.map(d=>(
                  <tr key={d.date}>
                    <td style={{...S.td,fontWeight:600}}>{d.date.slice(5)}({d.day})</td>
                    {periodTimes.map((_,i)=>{
                      const checked=form.available.some(a=>a.date===d.date&&String(a.period)===String(i+1));
                      return <td key={i} style={{...S.td,textAlign:'center'}}><input type="checkbox" checked={checked} onChange={()=>toggleAvail(d.date,i+1)}/></td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button style={S.btn()} onClick={save}>{editId!=null?'수정 완료':'추가'}</button>
          {editId!=null && <button style={S.btn('#64748b')} onClick={()=>{setEditId(null);setForm(emptyForm);}}>취소</button>}
        </div>
      </div>

      <div style={S.card}>
        <div style={S.cardTitle}>👨‍👩‍👧 학부모 목록 ({parents.length}명)</div>
        <table style={S.tbl}>
          <thead><tr><th style={S.th}>이름</th><th style={S.th}>자녀 학반</th><th style={S.th}>신청 현황</th><th style={S.th}></th></tr></thead>
          <tbody>
            {parents.map(p=>(
              <tr key={p.id}>
                <td style={{...S.td,fontWeight:700}}>{p.name}</td>
                <td style={S.td}>{p.childClass||'-'}</td>
                <td style={S.td}>
                  {(p.available||[]).map((a,i)=>(
                    <span key={i} style={{display:'inline-block',margin:'1px 3px',padding:'2px 7px',borderRadius:12,background:'#e0e7ff',color:'#3730a3',fontSize:'0.75rem'}}>
                      {a.date?.slice(5)} {a.period}교시
                    </span>
                  ))}
                </td>
                <td style={S.td}>
                  <div style={{display:'flex',gap:6}}>
                    <button style={S.btnSm} onClick={()=>{setForm({name:p.name,childClass:p.childClass||'',available:p.available||[]});setEditId(p.id);}}>수정</button>
                    <button style={{...S.btnSm,background:'#fee2e2',color:'#dc2626'}} onClick={()=>setParents(prev=>prev.filter(x=>x.id!==p.id))}>삭제</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── 불참 관리 탭 ──────────────────────────────────────────────────────────
function AbsenceTab({teachers, absences, setAbsences, examDates}) {
  const active = teachers.filter(t => (t.type||'normal') !== 'admin' && !t.isAdmin);
  function toggle(name, date) {
    setAbsences(prev => {
      const arr = prev[date] || [];
      return {...prev, [date]: arr.includes(name) ? arr.filter(n=>n!==name) : [...arr, name]};
    });
  }
  return (
    <div style={S.card}>
      <div style={S.cardTitle}>🚫 불참 교사 관리 (연가·병가·출장 등)</div>
      <div style={{fontSize:'0.82rem',color:'#64748b',marginBottom:12}}>체크한 날짜에 해당 교사는 배정에서 제외됩니다.</div>
      <div style={{overflowX:'auto'}}>
        <table style={S.tbl}>
          <thead>
            <tr>
              <th style={{...S.th,minWidth:90}}>교사명</th>
              <th style={{...S.th,minWidth:50}}>구분</th>
              {examDates.map(d=><th key={d.date} style={S.th}>{d.date.slice(5)}({d.day})</th>)}
            </tr>
          </thead>
          <tbody>
            {active.map(t=>{
              const tm = TYPE_META[t.type||'normal']||TYPE_META.normal;
              return (
                <tr key={t.id}>
                  <td style={{...S.td,fontWeight:600}}>{t.name}</td>
                  <td style={S.td}><span style={{display:'inline-block',padding:'1px 7px',borderRadius:12,fontSize:'0.72rem',fontWeight:700,background:tm.bg,color:'#fff'}}>{tm.label}</span></td>
                  {examDates.map(d=>{
                    const checked=(absences[d.date]||[]).includes(t.name);
                    return <td key={d.date} style={{...S.td,textAlign:'center'}}>
                      <input type="checkbox" checked={checked} onChange={()=>toggle(t.name,d.date)} style={{accentColor:'#dc2626',width:16,height:16,cursor:'pointer'}}/>
                    </td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── 결과 보기 탭 ──────────────────────────────────────────────────────────
function ResultTab({results, counts, warnings, examDates, periodTimes, teachers}) {
  const [viewDate, setViewDate] = useState(examDates[0]?.date||'');
  const active = teachers.filter(t => (t.type||'normal') !== 'admin' && !t.isAdmin);

  if (!results) return (
    <div style={{...S.card,textAlign:'center',padding:40,color:'#94a3b8'}}>
      ← 먼저 "⚙️ 자동 배정 실행" 버튼을 눌러주세요.
    </div>
  );

  const dayResult = results[viewDate];

  return (
    <div>
      {warnings?.length>0 && (
        <div style={S.warn}>⚠️ <b>배정 경고 {warnings.length}건</b><br/>{warnings.map((w,i)=><div key={i}>• {w}</div>)}</div>
      )}

      <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap',alignItems:'center'}} className="no-print">
        {examDates.map(d=>(
          <button key={d.date} style={S.tab(viewDate===d.date)} onClick={()=>setViewDate(d.date)}>
            {d.date.slice(5)}({d.day})
          </button>
        ))}
        <button style={{...S.btn('#64748b'),marginLeft:'auto'}} onClick={()=>window.print()}>🖨️ 인쇄</button>
      </div>

      {dayResult && (
        <>
          <div style={S.card}>
            <div style={S.cardTitle}>📋 {viewDate}({examDates.find(d=>d.date===viewDate)?.day}) 예비감독</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {dayResult.standby?.map((n,i)=>(
                <span key={i} style={{padding:'6px 18px',borderRadius:20,background:'#fef3c7',color:'#92400e',fontWeight:700,fontSize:'0.9rem'}}>
                  예비{i+1}: {n}
                </span>
              ))}
            </div>
          </div>

          {dayResult.periods?.map(p=>(
            <div key={p.period} style={S.card}>
              <div style={S.cardTitle}>{p.period}교시 ({periodTimes[p.period-1]?.start}~{periodTimes[p.period-1]?.end})</div>
              <div style={{overflowX:'auto'}}>
                <table style={S.tbl}>
                  <thead>
                    <tr>
                      <th style={S.th}>학급</th>
                      <th style={S.th}>시험과목</th>
                      <th style={{...S.th,color:ROLE_COLOR.정감독}}>정감독</th>
                      <th style={{...S.th,color:ROLE_COLOR.부감독}}>부감독</th>
                      <th style={{...S.th,color:ROLE_COLOR.자습감독}}>자습감독</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.assignments?.map((a,i)=>(
                      <tr key={i} style={{background:a.subject==='자습'?'#f0fdf4':'#fff'}}>
                        <td style={{...S.td,fontWeight:700,color:'#1e3a5f'}}>{a.class}</td>
                        <td style={S.td}>
                          {a.subject==='자습'
                            ? <span style={{color:'#059669'}}>자습</span>
                            : <span style={{color:'#2563eb',fontWeight:600}}>{a.subject}</span>}
                        </td>
                        <td style={S.td}>
                          {a.subject==='자습' ? <span style={{color:'#94a3b8'}}>-</span>
                            : a.정감독 ? <span style={{fontWeight:600,color:ROLE_COLOR.정감독}}>{a.정감독}</span>
                            : <span style={{color:'#dc2626'}}>미배정</span>}
                        </td>
                        <td style={S.td}>
                          {a.subject==='자습' ? <span style={{color:'#94a3b8'}}>-</span>
                            : a.부감독
                              ? <span style={{fontWeight:600,color:a.부isParent?'#7c3aed':ROLE_COLOR.부감독}}>
                                  {a.부감독}{a.부isParent?' (학부모)':''}
                                </span>
                              : <span style={{color:'#dc2626'}}>미배정</span>}
                        </td>
                        <td style={S.td}>
                          {a.자습감독 ? <span style={{fontWeight:600,color:ROLE_COLOR.자습감독}}>{a.자습감독}</span>
                            : a.subject==='자습' ? <span style={{color:'#dc2626'}}>미배정</span>
                            : <span style={{color:'#94a3b8'}}>-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </>
      )}

      <div style={S.card}>
        <div style={S.cardTitle}>📊 교사별 감독 횟수</div>
        <div style={{overflowX:'auto'}}>
          <table style={S.tbl}>
            <thead>
              <tr>
                <th style={S.th}>교사명</th>
                <th style={S.th}>구분</th>
                <th style={S.th}>담임</th>
                <th style={{...S.th,color:ROLE_COLOR.정감독}}>정감독</th>
                <th style={{...S.th,color:ROLE_COLOR.부감독}}>부감독</th>
                <th style={{...S.th,color:ROLE_COLOR.자습감독}}>자습감독</th>
                <th style={{...S.th,color:ROLE_COLOR.예비}}>예비감독</th>
                <th style={S.th}>합계</th>
              </tr>
            </thead>
            <tbody>
              {active.map(t=>{
                const c = counts?.[t.name]||{정:0,부:0,자습:0,예비:0};
                const total = c.정+c.부+c.자습+c.예비;
                const tm = TYPE_META[t.type||'normal']||TYPE_META.normal;
                return (
                  <tr key={t.id}>
                    <td style={{...S.td,fontWeight:700}}>{t.name}</td>
                    <td style={S.td}><span style={{padding:'1px 7px',borderRadius:12,fontSize:'0.72rem',fontWeight:700,background:tm.bg,color:'#fff'}}>{tm.label}</span></td>
                    <td style={S.td}>{t.homeroom||<span style={{color:'#94a3b8'}}>-</span>}</td>
                    <td style={{...S.td,textAlign:'center',color:ROLE_COLOR.정감독,fontWeight:600}}>{c.정}</td>
                    <td style={{...S.td,textAlign:'center',color:ROLE_COLOR.부감독,fontWeight:600}}>{c.부}</td>
                    <td style={{...S.td,textAlign:'center',color:ROLE_COLOR.자습감독,fontWeight:600}}>{c.자습}</td>
                    <td style={{...S.td,textAlign:'center',color:ROLE_COLOR.예비,fontWeight:600}}>{c.예비}</td>
                    <td style={{...S.td,textAlign:'center',fontWeight:700}}>{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── 메인 앱 ────────────────────────────────────────────────────────────────
export default function ExamSupervisorApp() {
  const saved = loadSaved();
  const [tab, setTab] = useState('teacher');
  const [teachers, setTeachers] = useState(saved?.teachers ?? []);
  const [examDates, setExamDates] = useState(saved?.examDates ?? []);
  const [schedule, setSchedule] = useState(saved?.schedule ?? {});
  const [periodTimes, setPeriodTimes] = useState(saved?.periodTimes ?? []);
  const [parents, setParents] = useState(saved?.parents ?? []);
  const [absences, setAbsences] = useState(saved?.absences ?? {});
  const [results, setResults] = useState(null);
  const [counts, setCounts] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [running, setRunning] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({teachers, examDates, schedule, periodTimes, parents, absences}));
    setSaveMsg('저장됨 ✓');
    setTimeout(() => setSaveMsg(''), 2000);
  }

  function handleReset() {
    if (!confirm('저장된 모든 데이터를 삭제하고 초기화하시겠습니까?')) return;
    localStorage.removeItem(STORAGE_KEY);
    setTeachers([]); setExamDates([]); setSchedule({}); setPeriodTimes([]);
    setParents([]); setAbsences({}); setResults(null); setCounts(null); setWarnings([]);
  }

  function handleAssign() {
    setRunning(true);
    setTimeout(() => {
      try {
        const res = runAutoAssign(teachers, schedule, parents, absences, examDates, periodTimes);
        setResults(res.results); setCounts(res.counts); setWarnings(res.warnings);
        setTab('result');
      } catch(e) { alert('배정 중 오류: '+e.message); }
      setRunning(false);
    }, 50);
  }

  const TABS = [
    {id:'teacher',label:'👩‍🏫 교사 관리'},
    {id:'schedule',label:'📅 시험 일정'},
    {id:'parent',label:'👨‍👩‍👧 학부모'},
    {id:'absence',label:'🚫 불참 관리'},
    {id:'result',label:'📊 배정 결과'},
  ];

  return (
    <div style={S.wrap}>
      <style>{`
        @media print { .no-print { display:none !important; } body { background:#fff; } }
        * { box-sizing:border-box; }
        input,select,button { font-family:inherit; }
      `}</style>
      <div style={S.header} className="no-print">
        <div style={S.headerTitle}>📋 정기시험 감독 자동 배정 시스템</div>
      </div>
      <div style={{...S.tabs,position:'sticky',top:0,zIndex:100}} className="no-print">
        {TABS.map(t=>(
          <button key={t.id} style={S.tab(tab===t.id)} onClick={()=>setTab(t.id)}>{t.label}</button>
        ))}
        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:6,padding:'0 8px'}}>
          <button style={{...S.btn('#2563eb')}} onClick={handleSave}>💾 저장</button>
          {saveMsg && <span style={{color:'#86efac',fontSize:'0.8rem',fontWeight:600}}>{saveMsg}</span>}
          <button style={{...S.btn('#dc2626')}} onClick={handleReset}>🗑️ 초기화</button>
          <button style={{...S.btn(running?'#94a3b8':'#16a34a'),opacity:running?0.7:1}} disabled={running} onClick={handleAssign}>
            {running?'⏳ 배정 중...':'⚙️ 자동 배정 실행'}
          </button>
        </div>
      </div>
      <div style={S.body}>
        {tab==='teacher' && <TeacherTab teachers={teachers} setTeachers={setTeachers}/>}
        {tab==='schedule' && <ScheduleTab examDates={examDates} setExamDates={setExamDates} schedule={schedule} setSchedule={setSchedule} periodTimes={periodTimes} setPeriodTimes={setPeriodTimes}/>}
        {tab==='parent' && <ParentTab parents={parents} setParents={setParents} examDates={examDates} periodTimes={periodTimes}/>}
        {tab==='absence' && <AbsenceTab teachers={teachers} absences={absences} setAbsences={setAbsences} examDates={examDates}/>}
        {tab==='result' && <ResultTab results={results} counts={counts} warnings={warnings} examDates={examDates} periodTimes={periodTimes} teachers={teachers}/>}
      </div>
    </div>
  );
}
