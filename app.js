'use strict';

/* ============================================================
   TREINO LIVE — clean rebuild
   Static PWA, mobile-first, local persistence, no dependencies.
   ============================================================ */

const DB_KEY = 'treinoLiveCleanV1';
const DRAFT_KEY = 'treinoLiveCleanV1_draft';
const LEGACY_KEY = 'treinoLiveV4';
const APP_VERSION = 1;
const MUSCLE_GROUPS = [
  'Peito','Costas','Ombros','Bíceps','Tríceps','Quadríceps',
  'Posteriores','Glúteos','Panturrilhas','Abdômen','Outro'
];

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const icons = {
  back: '<svg viewBox="0 0 24 24" fill="none"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  more: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none"><path d="M3.5 10.5 12 3l8.5 7.5v9a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1v-9Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3.2" stroke="currentColor" stroke-width="1.8"/><path d="M3.6 19c.5-3.3 2.3-5.1 5.4-5.1s4.9 1.8 5.4 5.1M16.3 5.2a3 3 0 0 1 0 5.8M16.2 14c2.6.2 4.2 1.9 4.6 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  dumbbell: '<svg viewBox="0 0 24 24" fill="none"><path d="M7 7v10M17 7v10M4 9v6M20 9v6M7 12h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 19V9M11 19V5M18 19v-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/><path d="m20 20-3.2-3.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none"><path d="m4 20 4.2-1 10.6-10.6-3.2-3.2L5 15.8 4 20Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="m14.8 6 3.2 3.2" stroke="currentColor" stroke-width="1.7"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 16V4m0 0 4 4m-4-4-4 4M4 20h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 10v6M12 7h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none"><rect x="8" y="8" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="currentColor" stroke-width="1.7"/></svg>',
  history: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.6M4 4v4.6h4.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 8v4l2.7 1.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
};

let db = loadDatabase();
let live = loadDraft();
let state = {
  route: live ? 'workout' : 'home',
  studentId: null,
  historyStudentId: null,
  evolutionStudentId: null,
  evolutionPeriod: '90d',
  studentSearch: '',
  exerciseSearch: ''
};
let modalCloseHook = null;
let appTicker = null;
let restTicker = null;
let audioCtx = null;

/* ----------------------------- utilities ----------------------------- */

function uid(prefix = 'id') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[ch]));
}

function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  return (parts.slice(0, 2).map(p => p[0]).join('') || '?').toUpperCase();
}

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
function round(n) { return Math.round(Number(n) || 0); }
function kgText(n) { return `${round(n).toLocaleString('pt-BR')} kg`; }
function fmtDate(isoOrDate) {
  if (!isoOrDate) return '—';
  const d = typeof isoOrDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(isoOrDate)
    ? new Date(`${isoOrDate}T12:00:00`)
    : new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return String(isoOrDate);
  return d.toLocaleDateString('pt-BR');
}
function localDateISO(ts = Date.now()) {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function fmtClock(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function parseDecimal(v) {
  const n = Number(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}
function parseInteger(v) {
  const n = parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}
function parseRest(v) {
  const raw = String(v || '').trim();
  if (!raw) return 0;
  if (raw.includes(':')) {
    const [m, s] = raw.split(':').map(Number);
    return Math.max(0, (m || 0) * 60 + (s || 0));
  }
  return Math.max(0, Number(raw) || 0);
}
function fmtRest(sec) {
  sec = Math.max(0, Number(sec) || 0);
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function daysAgo(ts) {
  if (!ts) return 'sem registro';
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 86400000);
  if (diff <= 0) return 'hoje';
  if (diff === 1) return 'ontem';
  if (diff < 7) return `há ${diff} dias`;
  if (diff < 30) return `há ${Math.floor(diff/7)} sem`;
  if (diff < 365) return `há ${Math.floor(diff/30)} meses`;
  return `há ${Math.floor(diff/365)} anos`;
}
function cutoffFromPeriod(period) {
  if (period === 'all') return null;
  const days = { '30d':30, '90d':90, '180d':180, '365d':365 }[period] || 90;
  return Date.now() - days * 86400000;
}
function toast(message) {
  const host = $('#toastHost');
  host.replaceChildren();
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  host.appendChild(el);
  setTimeout(() => { if (el.isConnected) el.remove(); }, 2300);
}
function chev() { return `<span class="chev">${icons.back.replace('M15 5l-7 7 7 7','M9 5l7 7-7 7')}</span>`; }
function studentById(id) { return db.students.find(s => s.id === id) || null; }
function exerciseById(id) { return db.exercises.find(e => e.id === id) || null; }
function programById(id) { return db.programs.find(p => p.id === id) || null; }
function programsForStudent(studentId) { return db.programs.filter(p => p.studentId === studentId); }
function participantForStudent(session, studentId) { return (session.participants || []).find(p => p.studentId === studentId) || null; }
function completedSets(exercise) { return (exercise.sets || []).filter(s => s.done !== false); }
function setVolume(set) { return parseDecimal(set.weight) * parseInteger(set.reps); }
function exerciseVolume(exercise) { return completedSets(exercise).reduce((sum, set) => sum + setVolume(set), 0); }
function participantVolume(participant) { return (participant.exercises || []).reduce((sum, ex) => sum + exerciseVolume(ex), 0); }
function participantSetCount(participant) { return (participant.exercises || []).reduce((sum, ex) => sum + completedSets(ex).length, 0); }
function sessionVolume(session) { return (session.participants || []).reduce((sum, p) => sum + participantVolume(p), 0); }
function sessionSetCount(session) { return (session.participants || []).reduce((sum, p) => sum + participantSetCount(p), 0); }
function sessionTimestamp(session) { return Number(session.endedAt || session.startedAt || session.createdAt || 0); }
function latestStudentSession(studentId) {
  return db.sessions
    .filter(s => participantForStudent(s, studentId))
    .sort((a,b) => sessionTimestamp(b)-sessionTimestamp(a))[0] || null;
}
function sessionsForStudent(studentId, period = 'all') {
  const cutoff = cutoffFromPeriod(period);
  return db.sessions
    .filter(s => participantForStudent(s, studentId) && (!cutoff || sessionTimestamp(s) >= cutoff))
    .sort((a,b) => sessionTimestamp(a)-sessionTimestamp(b));
}
function getLastExercisePerformance(studentId, exerciseId) {
  const sessions = db.sessions
    .filter(s => participantForStudent(s, studentId))
    .sort((a,b) => sessionTimestamp(b)-sessionTimestamp(a));
  for (const session of sessions) {
    const p = participantForStudent(session, studentId);
    const ex = (p.exercises || []).find(x => x.exerciseId === exerciseId);
    if (ex && completedSets(ex).length) return ex;
  }
  return null;
}
function bestLoad(exercise) {
  return completedSets(exercise).reduce((m,s) => Math.max(m, parseDecimal(s.weight)), 0);
}

/* ----------------------------- persistence ----------------------------- */

function blankDatabase() {
  return {
    version: APP_VERSION,
    trainer: { name: 'Gabriel' },
    students: [],
    exercises: [],
    programs: [],
    sessions: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

function normalizeGroups(groups) {
  const aliases = {
    'Ombro':'Ombros','Posterior':'Posteriores','Posterior de coxa':'Posteriores',
    'Glúteo':'Glúteos','Panturrilha':'Panturrilhas'
  };
  const arr = Array.isArray(groups) ? groups : (groups ? [groups] : []);
  const out = arr.map(v => aliases[String(v).trim()] || String(v).trim()).filter(Boolean);
  const valid = [...new Set(out.filter(g => MUSCLE_GROUPS.includes(g)))];
  return valid.length ? valid : ['Outro'];
}

function normalizeDatabase(raw) {
  const clean = blankDatabase();
  if (!raw || typeof raw !== 'object') return clean;
  clean.trainer = { name: String(raw.trainer?.name || 'Gabriel').trim() || 'Gabriel' };
  clean.students = Array.isArray(raw.students) ? raw.students.map(s => ({
    id: String(s.id || uid('student')),
    name: String(s.name || 'Aluno').trim(),
    goal: String(s.goal || ''),
    notes: String(s.notes || ''),
    createdAt: Number(s.createdAt || Date.now())
  })) : [];
  clean.exercises = Array.isArray(raw.exercises) ? raw.exercises.map(e => ({
    id: String(e.id || uid('exercise')),
    name: String(e.name || 'Exercício').trim(),
    muscleGroups: normalizeGroups(e.muscleGroups),
    createdAt: Number(e.createdAt || Date.now())
  })) : [];
  clean.programs = Array.isArray(raw.programs) ? raw.programs.map(p => ({
    id: String(p.id || uid('program')),
    studentId: String(p.studentId || ''),
    name: String(p.name || 'Treino').trim(),
    startDate: String(p.startDate || ''),
    endDate: String(p.endDate || ''),
    exercises: Array.isArray(p.exercises) ? p.exercises.map(pe => ({
      exerciseId: String(pe.exerciseId || ''),
      sets: clamp(parseInteger(pe.sets) || 3, 1, 50),
      restSec: clamp(parseInteger(pe.restSec ?? pe.rest) || 120, 0, 3600),
      targetReps: String(pe.targetReps || ''),
      note: String(pe.note || '')
    })) : [],
    createdAt: Number(p.createdAt || Date.now()),
    updatedAt: Number(p.updatedAt || Date.now())
  })).filter(p => clean.students.some(s => s.id === p.studentId)) : [];
  clean.sessions = Array.isArray(raw.sessions) ? raw.sessions.map(s => ({
    id: String(s.id || uid('session')),
    createdAt: Number(s.createdAt || s.startedAt || Date.now()),
    startedAt: Number(s.startedAt || s.createdAt || Date.now()),
    endedAt: Number(s.endedAt || s.startedAt || s.createdAt || Date.now()),
    durationSec: Math.max(0, Number(s.durationSec) || 0),
    participants: Array.isArray(s.participants) ? s.participants.map(p => ({
      studentId: String(p.studentId || ''),
      programId: String(p.programId || ''),
      programName: String(p.programName || 'Treino'),
      feedback: String(p.feedback || ''),
      exercises: Array.isArray(p.exercises) ? p.exercises.map(ex => ({
        exerciseId: String(ex.exerciseId || ''),
        name: String(ex.name || clean.exercises.find(item => item.id === String(ex.exerciseId || ''))?.name || 'Exercício'),
        muscleGroups: normalizeGroups(ex.muscleGroups),
        restSec: clamp(parseInteger(ex.restSec) || 0, 0, 3600),
        note: String(ex.note || ''),
        sets: Array.isArray(ex.sets) ? ex.sets.map(st => ({
          weight: parseDecimal(st.weight ?? st.kg),
          reps: parseInteger(st.reps),
          done: st.done !== false
        })) : []
      })) : []
    })).filter(p => clean.students.some(st => st.id === p.studentId)) : []
  })).filter(s => s.participants.length) : [];
  clean.version = APP_VERSION;
  clean.createdAt = Number(raw.createdAt || Date.now());
  clean.updatedAt = Number(raw.updatedAt || Date.now());
  return clean;
}

function legacyDateToTs(value) {
  const m = String(value || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return new Date(+m[3], +m[2]-1, +m[1], 12, 0, 0).getTime();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? Date.now() : d.getTime();
}

function migrateLegacy(legacy) {
  if (!legacy || !Array.isArray(legacy.students)) return null;
  const out = blankDatabase();
  const exerciseIdByName = new Map();
  const exerciseMeta = legacy.exerciseMeta && typeof legacy.exerciseMeta === 'object' ? legacy.exerciseMeta : {};
  const allNames = new Set(Array.isArray(legacy.library) ? legacy.library.map(String) : []);
  legacy.students.forEach(st => (st.workouts || []).forEach(w => (w.exercises || []).forEach(ex => allNames.add(String(ex.name || '')))));
  (legacy.records || []).forEach(r => allNames.add(String(r.exercise || '')));
  [...allNames].filter(Boolean).forEach(name => {
    const id = uid('exercise');
    exerciseIdByName.set(name, id);
    out.exercises.push({ id, name, muscleGroups: normalizeGroups(exerciseMeta[name]), createdAt: Date.now() });
  });
  out.students = legacy.students.map(st => ({
    id: String(st.id || uid('student')),
    name: String(st.name || 'Aluno'),
    goal: '', notes: '', createdAt: Date.now()
  }));
  legacy.students.forEach(st => {
    (st.workouts || []).forEach(w => {
      out.programs.push({
        id: String(w.id || uid('program')),
        studentId: String(st.id),
        name: String(w.name || 'Treino'),
        startDate: String(w.startDate || ''),
        endDate: String(w.endDate || ''),
        exercises: (w.exercises || []).map(ex => ({
          exerciseId: exerciseIdByName.get(String(ex.name)) || '',
          sets: clamp(parseInteger(ex.sets) || 3, 1, 50),
          restSec: clamp(parseInteger(ex.rest) || 120, 0, 3600),
          targetReps: '', note: String(ex.note || '')
        })).filter(ex => ex.exerciseId),
        createdAt: Date.now(), updatedAt: Date.now()
      });
    });
  });
  const grouped = new Map();
  (legacy.records || []).forEach(rec => {
    const key = `${rec.student}::${rec.workout}::${rec.date}`;
    if (!grouped.has(key)) grouped.set(key, { studentId:String(rec.student), programId:String(rec.workout || ''), date:rec.date, records:[] });
    grouped.get(key).records.push(rec);
  });
  grouped.forEach(g => {
    const ts = legacyDateToTs(g.date);
    const program = out.programs.find(p => p.id === g.programId);
    const participant = {
      studentId: g.studentId,
      programId: g.programId,
      programName: program?.name || 'Treino',
      feedback: '',
      exercises: g.records.map(rec => ({
        exerciseId: exerciseIdByName.get(String(rec.exercise)) || uid('exercise_missing'),
        name: String(rec.exercise || 'Exercício'),
        muscleGroups: normalizeGroups(exerciseMeta[rec.exercise]),
        restSec: 0,
        note: '',
        sets: (rec.sets || []).map(s => ({ weight:parseDecimal(s.kg), reps:parseInteger(s.reps), done:true }))
      }))
    };
    if (out.students.some(st => st.id === participant.studentId)) {
      out.sessions.push({
        id: uid('session'), createdAt:ts, startedAt:ts, endedAt:ts,
        durationSec:0, participants:[participant]
      });
    }
  });
  out.updatedAt = Date.now();
  return out;
}

function loadDatabase() {
  try {
    const saved = localStorage.getItem(DB_KEY);
    if (saved) return normalizeDatabase(JSON.parse(saved));
  } catch (err) { console.warn('Falha ao carregar banco novo', err); }
  try {
    const legacyRaw = localStorage.getItem(LEGACY_KEY);
    if (legacyRaw) {
      const migrated = migrateLegacy(JSON.parse(legacyRaw));
      if (migrated) {
        localStorage.setItem(DB_KEY, JSON.stringify(migrated));
        setTimeout(() => toast('Dados do app antigo migrados com sucesso.'), 600);
        return migrated;
      }
    }
  } catch (err) { console.warn('Falha ao migrar dados antigos', err); }
  return blankDatabase();
}

function persist() {
  db.updatedAt = Date.now();
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.participants) && parsed.participants.length) return parsed;
  } catch (err) { console.warn('Falha ao restaurar treino em andamento', err); }
  return null;
}

function persistDraft() {
  if (live) localStorage.setItem(DRAFT_KEY, JSON.stringify(live));
  else localStorage.removeItem(DRAFT_KEY);
}

/* ----------------------------- chrome/navigation ----------------------------- */

function setHeader({ eyebrow='TREINO LIVE', title='', back=null, action='more', actionFn=null }) {
  $('#topEyebrow').textContent = eyebrow;
  $('#topTitle').textContent = title;
  const backBtn = $('#backBtn');
  if (back) {
    backBtn.classList.remove('is-hidden');
    backBtn.innerHTML = icons.back;
    backBtn.onclick = back;
  } else {
    backBtn.classList.add('is-hidden');
    backBtn.onclick = null;
  }
  const actionBtn = $('#topActionBtn');
  if (!action) {
    actionBtn.classList.add('is-hidden');
    actionBtn.onclick = null;
  } else {
    actionBtn.classList.remove('is-hidden');
    actionBtn.innerHTML = icons[action] || icons.more;
    actionBtn.onclick = actionFn;
  }
}

function navigate(route, opts = {}) {
  state.route = route;
  Object.assign(state, opts);
  render();
  window.scrollTo(0,0);
}

function render() {
  const main = $('#main');
  const route = state.route;
  if (route === 'home') renderHome(main);
  else if (route === 'students') renderStudents(main);
  else if (route === 'student') renderStudentProfile(main, state.studentId);
  else if (route === 'student-history') renderStudentHistory(main, state.historyStudentId || state.studentId);
  else if (route === 'exercises') renderExercises(main);
  else if (route === 'evolution') renderEvolution(main);
  else if (route === 'evolution-detail') renderEvolutionDetail(main, state.evolutionStudentId);
  else if (route === 'workout') renderWorkout(main);
  else navigate('home');

  $$('.nav-item').forEach(btn => btn.classList.toggle('is-active', btn.dataset.route === route));
  if (!['home','students','exercises','evolution'].includes(route)) {
    $$('.nav-item').forEach(btn => btn.classList.remove('is-active'));
  }
  syncActiveWorkoutPill();
  syncRestTimer();
}

function syncActiveWorkoutPill() {
  const pill = $('#activeWorkoutPill');
  if (!live || state.route === 'workout') {
    pill.classList.add('is-hidden');
    return;
  }
  pill.classList.remove('is-hidden');
  const names = live.participants.map(p => studentById(p.studentId)?.name || 'Aluno');
  $('#activeWorkoutLabel').textContent = names.join(' + ');
  updateGlobalClocks();
}

function updateGlobalClocks() {
  if (live?.startedAt) {
    const elapsed = Math.max(0, (Date.now() - live.startedAt) / 1000);
    const pillClock = $('#activeWorkoutClock');
    if (pillClock) pillClock.textContent = fmtClock(elapsed);
    const liveClock = $('#liveDuration');
    if (liveClock) liveClock.textContent = fmtClock(elapsed);
  }
}

/* ----------------------------- modal ----------------------------- */

function openModal(html, { fullscreen=false, onClose=null } = {}) {
  const layer = $('#modalLayer');
  const modal = $('#modal');
  modalCloseHook = onClose;
  modal.className = `modal${fullscreen ? ' fullscreen' : ''}`;
  modal.innerHTML = fullscreen ? html : `<div class="modal-handle"></div>${html}`;
  layer.classList.remove('is-hidden');
  layer.setAttribute('aria-hidden','false');
}

function closeModal() {
  const layer = $('#modalLayer');
  layer.classList.add('is-hidden');
  layer.setAttribute('aria-hidden','true');
  $('#modal').innerHTML = '';
  if (modalCloseHook) {
    const fn = modalCloseHook;
    modalCloseHook = null;
    fn();
  }
}

function confirmModal(title, message, confirmLabel, onConfirm, danger=true) {
  openModal(`
    <h2>${esc(title)}</h2>
    <p class="modal-sub">${esc(message)}</p>
    <div class="modal-actions">
      <button class="btn btn-secondary" id="confirmCancel" type="button">Cancelar</button>
      <button class="btn ${danger?'btn-danger':'btn-primary'}" id="confirmOk" type="button">${esc(confirmLabel)}</button>
    </div>
  `);
  $('#confirmCancel').onclick = closeModal;
  $('#confirmOk').onclick = () => { closeModal(); onConfirm(); };
}

/* ----------------------------- home ----------------------------- */

function dashboardData() {
  const cutoff = Date.now() - 7*86400000;
  const sessions = db.sessions.filter(s => sessionTimestamp(s) >= cutoff);
  const volume = sessions.reduce((a,s) => a + sessionVolume(s), 0);
  const sets = sessions.reduce((a,s) => a + sessionSetCount(s), 0);
  const active = new Set(sessions.flatMap(s => s.participants.map(p => p.studentId))).size;
  return { sessions, volume, sets, active };
}

function renderHome(main) {
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  const dash = dashboardData();
  const latest = db.sessions.slice().sort((a,b)=>sessionTimestamp(b)-sessionTimestamp(a)).slice(0,5);
  const top = findTopImprovementAcrossStudents('90d');
  setHeader({ title:'Início', action:'more', actionFn:openSettingsMenu });
  main.innerHTML = `
    <section class="screen">
      <div class="hero">
        <h1>${greeting}, ${esc(db.trainer.name.split(' ')[0] || 'Professor')}</h1>
        <p>Seu painel rápido para acompanhar treinos, volume e evolução dos alunos.</p>
      </div>
      <div class="section" style="margin-top:5px">
        <div class="grid-2">
          <div class="metric-card"><div><small>Treinos · 7 dias</small><strong>${dash.sessions.length}</strong></div><p>${dash.active} aluno${dash.active===1?' ativo':'s ativos'}</p></div>
          <div class="metric-card"><div><small>Volume · 7 dias</small><strong>${kgText(dash.volume)}</strong></div><p>carga × repetições</p></div>
          <div class="metric-card"><div><small>Séries · 7 dias</small><strong>${dash.sets}</strong></div><p>séries concluídas</p></div>
          <div class="metric-card highlight"><div><small>Maior evolução</small><strong>${top ? esc(top.student.name.split(' ')[0]) : '—'}</strong></div><p>${top ? `${esc(top.exerciseName)} · +${round(top.deltaKg)} kg` : 'precisa de mais histórico'}</p></div>
        </div>
      </div>
      <div class="section">
        <div class="section-title"><h2>Ações rápidas</h2></div>
        <div class="quick-actions">
          <button class="quick-action" data-quick="student" type="button">${icons.users}<strong>Novo aluno</strong><small>Cadastrar e montar treinos</small></button>
          <button class="quick-action" data-quick="exercise" type="button">${icons.dumbbell}<strong>Novo exercício</strong><small>Adicionar à biblioteca</small></button>
        </div>
      </div>
      <div class="section">
        <div class="section-title"><h2>Últimos treinos</h2><span>${latest.length}</span></div>
        <div id="homeLatest">
          ${latest.length ? latest.map(sessionRowHtml).join('') : emptyHtml('Ainda não há treinos registrados.','Seu histórico aparecerá aqui depois da primeira sessão.')}
        </div>
      </div>
      <div class="section">
        <div class="section-title"><h2>Leitura rápida</h2><span>90 dias</span></div>
        ${homeInsightsHtml()}
      </div>
    </section>`;
  $('[data-quick="student"]')?.addEventListener('click', () => openStudentForm());
  $('[data-quick="exercise"]')?.addEventListener('click', () => openExerciseForm());
  $$('[data-session-student]', main).forEach(el => el.onclick = () => navigate('student', { studentId:el.dataset.sessionStudent }));
}

function sessionRowHtml(session) {
  const first = session.participants[0];
  const student = studentById(first?.studentId);
  const names = session.participants.map(p => studentById(p.studentId)?.name || 'Aluno').join(' + ');
  return `<button class="row-card" type="button" data-session-student="${esc(first?.studentId || '')}">
    <div class="avatar round">${esc(initials(names))}</div>
    <div class="row-main"><strong>${esc(names)}</strong><small>${esc(first?.programName || 'Treino')} · ${fmtDate(session.endedAt)} · ${sessionSetCount(session)} séries</small></div>
    <div class="row-side">${kgText(sessionVolume(session))}</div>
  </button>`;
}

function homeInsightsHtml() {
  const top = findTopImprovementAcrossStudents('90d');
  const reg = findTopRegressionAcrossStudents('90d');
  const inactive = db.students
    .map(st => ({ st, last:latestStudentSession(st.id) }))
    .filter(x => !x.last || Date.now()-sessionTimestamp(x.last) > 21*86400000)
    .slice(0,2);
  const rows = [];
  if (top) rows.push(`<div class="insight-row good"><span class="insight-dot"></span><div class="insight-copy"><strong>${esc(top.student.name)}</strong><small>${esc(top.exerciseName)} · maior carga subiu ${round(top.deltaKg)} kg</small></div><span class="insight-value">+${round(top.pct)}%</span></div>`);
  if (reg) rows.push(`<div class="insight-row warn"><span class="insight-dot"></span><div class="insight-copy"><strong>${esc(reg.student.name)}</strong><small>${esc(reg.exerciseName)} · queda na maior carga registrada</small></div><span class="insight-value">${round(reg.pct)}%</span></div>`);
  inactive.forEach(x => rows.push(`<div class="insight-row"><span class="insight-dot"></span><div class="insight-copy"><strong>${esc(x.st.name)}</strong><small>${x.last ? `último treino ${daysAgo(sessionTimestamp(x.last))}` : 'ainda sem sessão registrada'}</small></div><span class="insight-value">atenção</span></div>`));
  return rows.join('') || emptyHtml('Sem alertas por enquanto.','Conforme os treinos forem sendo registrados, o app destaca evolução e pontos de atenção.');
}

/* ----------------------------- students ----------------------------- */

function renderStudents(main) {
  setHeader({ title:'Alunos', action:'plus', actionFn:() => openStudentForm() });
  const q = state.studentSearch.trim().toLowerCase();
  const students = db.students.slice().sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).filter(s => s.name.toLowerCase().includes(q));
  main.innerHTML = `
    <section class="screen">
      <div class="hero"><h1>Seus alunos</h1><p>Treinos, histórico, volume, observações e evolução em um só lugar.</p></div>
      <div class="toolbar">
        <div class="search-field">${icons.search}<input id="studentSearch" placeholder="Buscar aluno" value="${esc(state.studentSearch)}"></div>
        <button class="btn btn-primary" id="studentAdd" type="button">+ Aluno</button>
      </div>
      <div class="section" style="margin-top:0">
        <div class="section-title"><h2>Todos</h2><span>${db.students.length} aluno${db.students.length===1?'':'s'}</span></div>
        <div id="studentList">
          ${students.length ? students.map(studentRowHtml).join('') : emptyHtml(q?'Nenhum resultado.':'Nenhum aluno cadastrado.', q?'Tente outro nome.':'Cadastre seu primeiro aluno para começar.')}
        </div>
      </div>
    </section>`;
  $('#studentSearch').oninput = e => { state.studentSearch = e.target.value; renderStudents(main); requestAnimationFrame(()=>{$('#studentSearch')?.focus(); const el=$('#studentSearch'); if(el)el.setSelectionRange(el.value.length,el.value.length);}); };
  $('#studentAdd').onclick = () => openStudentForm();
  $$('[data-student-id]', main).forEach(el => el.onclick = () => navigate('student', { studentId:el.dataset.studentId }));
}

function studentRowHtml(student) {
  const programs = programsForStudent(student.id).length;
  const last = latestStudentSession(student.id);
  return `<button class="row-card" type="button" data-student-id="${esc(student.id)}">
    <div class="avatar round">${esc(initials(student.name))}</div>
    <div class="row-main"><strong>${esc(student.name)}</strong><small>${programs} treino${programs===1?'':'s'} · ${last ? `última sessão ${daysAgo(sessionTimestamp(last))}` : 'sem sessões'}</small></div>
    ${chev()}
  </button>`;
}

function openStudentForm(studentId = null) {
  const existing = studentId ? studentById(studentId) : null;
  openModal(`
    <h2>${existing?'Editar aluno':'Novo aluno'}</h2>
    <p class="modal-sub">${existing?'Atualize os dados usados no acompanhamento.':'Cadastre o aluno e depois monte um ou mais treinos.'}</p>
    <div class="form-row"><label class="form-label">Nome</label><input id="studentName" class="form-input" value="${esc(existing?.name || '')}" placeholder="Ex.: João Souza"></div>
    <div class="form-row"><label class="form-label">Objetivo</label><input id="studentGoal" class="form-input" value="${esc(existing?.goal || '')}" placeholder="Ex.: hipertrofia, força, emagrecimento"></div>
    <div class="form-row"><label class="form-label">Observações</label><textarea id="studentNotes" class="form-textarea" placeholder="Restrições, preferências, informações importantes...">${esc(existing?.notes || '')}</textarea></div>
    <div class="modal-actions"><button class="btn btn-secondary" id="studentCancel">Cancelar</button><button class="btn btn-primary" id="studentSave">${existing?'Salvar':'Criar aluno'}</button></div>
  `);
  $('#studentCancel').onclick = closeModal;
  $('#studentSave').onclick = () => {
    const name = $('#studentName').value.trim();
    if (!name) return toast('Digite o nome do aluno.');
    if (existing) {
      existing.name = name;
      existing.goal = $('#studentGoal').value.trim();
      existing.notes = $('#studentNotes').value.trim();
    } else {
      const st = { id:uid('student'), name, goal:$('#studentGoal').value.trim(), notes:$('#studentNotes').value.trim(), createdAt:Date.now() };
      db.students.push(st);
      state.studentId = st.id;
    }
    persist(); closeModal();
    if (existing || state.route === 'student') navigate('student', { studentId:existing?.id || state.studentId });
    else navigate('student', { studentId:state.studentId });
    toast(existing ? 'Aluno atualizado.' : 'Aluno criado.');
  };
  setTimeout(() => $('#studentName')?.focus(), 120);
}

function renderStudentProfile(main, studentId) {
  const st = studentById(studentId);
  if (!st) return navigate('students');
  const programs = programsForStudent(st.id);
  const sessions = sessionsForStudent(st.id, 'all').slice().reverse().slice(0,3);
  const totalSessions = sessionsForStudent(st.id,'all').length;
  setHeader({ eyebrow:'ALUNO', title:st.name, back:()=>navigate('students'), action:'more', actionFn:()=>openStudentActions(st.id) });
  main.innerHTML = `
    <section class="screen">
      <div class="profile-head">
        <div class="avatar">${esc(initials(st.name))}</div>
        <div class="row-main"><strong>${esc(st.name)}</strong><small>${esc(st.goal || 'Objetivo não informado')} · ${totalSessions} sessão${totalSessions===1?'':'ões'}</small></div>
      </div>
      ${st.notes ? `<div class="profile-note"><small>Observações</small><p>${esc(st.notes)}</p></div>` : ''}
      <div class="profile-actions">
        <button class="btn btn-secondary" id="pairWorkoutBtn" type="button">Treino em dupla</button>
        <button class="btn btn-primary" id="newProgramBtn" type="button">+ Criar treino</button>
      </div>
      <div class="section" style="margin-top:0">
        <div class="section-title"><h2>Treinos</h2><span>${programs.length}</span></div>
        <div id="programList">${programs.length ? programs.map(programCardHtml).join('') : emptyHtml('Nenhum treino montado.','Crie o primeiro treino deste aluno.')}</div>
      </div>
      <div class="section">
        <div class="section-title"><h2>Histórico recente</h2><button class="btn btn-ghost btn-sm" id="fullHistoryBtn" type="button">Ver tudo</button></div>
        ${sessions.length ? sessions.map(s => historySessionHtml(s, st.id, false)).join('') : emptyHtml('Sem histórico ainda.','Conclua um treino para começar a acompanhar a evolução.')}
      </div>
    </section>`;
  $('#newProgramBtn').onclick = () => openProgramBuilder(st.id);
  $('#pairWorkoutBtn').onclick = () => openPairSetup(st.id);
  $('#fullHistoryBtn').onclick = () => navigate('student-history', { historyStudentId:st.id });
  $$('[data-program-start]', main).forEach(btn => btn.onclick = () => prepareWorkout([{studentId:st.id, programId:btn.dataset.programStart}]));
  $$('[data-program-edit]', main).forEach(btn => btn.onclick = () => openProgramActions(btn.dataset.programEdit));
}

function programCardHtml(program) {
  const exercises = program.exercises.map(pe => exerciseById(pe.exerciseId)).filter(Boolean);
  const sets = program.exercises.reduce((sum,pe)=>sum+pe.sets,0);
  return `<div class="workout-card">
    <div class="workout-card-head"><strong>${esc(program.name)}</strong><button type="button" data-program-edit="${esc(program.id)}" aria-label="Ações">⋯</button></div>
    <div class="workout-meta">${exercises.length} exercício${exercises.length===1?'':'s'} · ${sets} séries</div>
    <div class="workout-exercises-preview">${exercises.slice(0,4).map((ex,i)=>`<div><span>${String(i+1).padStart(2,'0')}</span>${esc(ex.name)}</div>`).join('')}${exercises.length>4?`<div><span>+</span>mais ${exercises.length-4}</div>`:''}</div>
    <div class="workout-actions"><button class="btn btn-secondary btn-sm" type="button" data-program-edit="${esc(program.id)}">Editar</button><button class="btn btn-primary btn-sm" type="button" data-program-start="${esc(program.id)}">Iniciar treino</button></div>
  </div>`;
}

function openStudentActions(studentId) {
  const st = studentById(studentId); if (!st) return;
  openModal(`
    <h2>${esc(st.name)}</h2><p class="modal-sub">Ações do aluno</p>
    <div class="action-list">
      <button class="action-item" data-action="edit"><span class="action-icon">${icons.edit}</span><div class="row-main"><strong>Editar aluno</strong></div>${chev()}</button>
      <button class="action-item" data-action="evo"><span class="action-icon">${icons.chart}</span><div class="row-main"><strong>Ver evolução</strong></div>${chev()}</button>
      <button class="action-item" data-action="history"><span class="action-icon">${icons.history}</span><div class="row-main"><strong>Histórico completo</strong></div>${chev()}</button>
      <button class="action-item danger" data-action="delete"><span class="action-icon">${icons.trash}</span><div class="row-main"><strong>Excluir aluno</strong><small>Treinos e histórico deste aluno serão removidos</small></div></button>
    </div>`);
  $$('[data-action]', $('#modal')).forEach(btn => btn.onclick = () => {
    const action = btn.dataset.action; closeModal();
    if (action === 'edit') setTimeout(()=>openStudentForm(st.id),80);
    if (action === 'evo') navigate('evolution-detail',{evolutionStudentId:st.id});
    if (action === 'history') navigate('student-history',{historyStudentId:st.id});
    if (action === 'delete') setTimeout(()=>confirmDeleteStudent(st.id),80);
  });
}

function confirmDeleteStudent(studentId) {
  const st = studentById(studentId); if (!st) return;
  confirmModal(`Excluir ${st.name}?`, 'O aluno, os treinos e o histórico dele serão apagados deste aparelho.', 'Excluir aluno', () => {
    db.students = db.students.filter(s=>s.id!==studentId);
    db.programs = db.programs.filter(p=>p.studentId!==studentId);
    db.sessions = db.sessions.map(s => ({...s, participants:s.participants.filter(p=>p.studentId!==studentId)})).filter(s=>s.participants.length);
    persist(); navigate('students'); toast('Aluno excluído.');
  });
}

function renderStudentHistory(main, studentId) {
  const st = studentById(studentId); if (!st) return navigate('students');
  const sessions = sessionsForStudent(st.id,'all').slice().reverse();
  setHeader({ eyebrow:'HISTÓRICO', title:st.name, back:()=>navigate('student',{studentId:st.id}), action:null });
  const totalVol = sessions.reduce((a,s)=>a+participantVolume(participantForStudent(s,st.id)),0);
  const totalSets = sessions.reduce((a,s)=>a+participantSetCount(participantForStudent(s,st.id)),0);
  main.innerHTML = `
    <section class="screen">
      <div class="hero"><h1>Histórico</h1><p>${sessions.length} sessões · ${kgText(totalVol)} · ${totalSets} séries concluídas.</p></div>
      <div class="section" style="margin-top:4px">${sessions.length ? sessions.map(s=>historySessionHtml(s,st.id,true)).join('') : emptyHtml('Sem histórico.','Os treinos concluídos aparecem aqui.')}</div>
    </section>`;
}

function historySessionHtml(session, studentId, expanded=true) {
  const p = participantForStudent(session, studentId); if (!p) return '';
  const vol = participantVolume(p), sets = participantSetCount(p);
  return `<div class="history-session">
    <div class="history-session-head"><div><strong>${esc(p.programName || 'Treino')}</strong><small>${fmtDate(session.endedAt)} · ${fmtClock(session.durationSec || 0)} · ${sets} séries</small></div><span>${kgText(vol)}</span></div>
    ${expanded ? (p.exercises || []).map(ex => `<div class="history-exercise"><strong>${esc(ex.name)}</strong><div>${completedSets(ex).map((s,i)=>`S${i+1}: ${parseDecimal(s.weight)} kg × ${parseInteger(s.reps)}`).join(' · ') || 'Sem séries concluídas'}</div></div>`).join('') : ''}
    ${p.feedback ? `<div class="feedback-box"><b>Parecer do treinador:</b> ${esc(p.feedback)}</div>` : ''}
  </div>`;
}

/* ----------------------------- exercises ----------------------------- */

function renderExercises(main) {
  setHeader({ title:'Exercícios', action:'plus', actionFn:()=>openExerciseForm() });
  const q = state.exerciseSearch.trim().toLowerCase();
  const exercises = db.exercises.slice().sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).filter(e=>e.name.toLowerCase().includes(q));
  main.innerHTML = `
    <section class="screen">
      <div class="hero"><h1>Biblioteca</h1><p>Cadastre exercícios e seus grupamentos musculares para usar em qualquer aluno.</p></div>
      <div class="toolbar"><div class="search-field">${icons.search}<input id="exerciseSearch" placeholder="Buscar exercício" value="${esc(state.exerciseSearch)}"></div><button class="btn btn-primary" id="exerciseAdd">+ Novo</button></div>
      <div class="section" style="margin-top:0"><div class="card" style="padding:2px 14px">${exercises.length?exercises.map(exerciseRowHtml).join(''):emptyHtml(q?'Nenhum resultado.':'Biblioteca vazia.',q?'Tente outro termo.':'Cadastre o primeiro exercício.')}</div></div>
    </section>`;
  $('#exerciseSearch').oninput = e => { state.exerciseSearch=e.target.value; renderExercises(main); requestAnimationFrame(()=>{$('#exerciseSearch')?.focus(); const el=$('#exerciseSearch');if(el)el.setSelectionRange(el.value.length,el.value.length);}); };
  $('#exerciseAdd').onclick = () => openExerciseForm();
  $$('[data-exercise-edit]', main).forEach(btn => btn.onclick = ()=>openExerciseForm(btn.dataset.exerciseEdit));
}

function exerciseRowHtml(ex) {
  return `<div class="exercise-list-card"><div class="exercise-symbol">${icons.dumbbell}</div><div class="row-main"><strong>${esc(ex.name)}</strong><small>${esc(ex.muscleGroups.join(' · '))}</small></div><button class="btn btn-secondary btn-sm" type="button" data-exercise-edit="${esc(ex.id)}">Editar</button></div>`;
}

function groupButtonsHtml(selected=[]) {
  const set = new Set(selected);
  return MUSCLE_GROUPS.map(g=>`<button class="group-button ${set.has(g)?'is-selected':''}" type="button" data-group="${esc(g)}">${esc(g)}</button>`).join('');
}

function openExerciseForm(exerciseId = null, pickerCallback = null, pickerCancelCallback = null) {
  const existing = exerciseId ? exerciseById(exerciseId) : null;
  openModal(`
    <h2>${existing?'Editar exercício':'Novo exercício'}</h2>
    <p class="modal-sub">Escolha um ou mais grupamentos musculares.</p>
    <div class="form-row"><label class="form-label">Nome</label><input id="exerciseName" class="form-input" value="${esc(existing?.name || '')}" placeholder="Ex.: Supino inclinado"></div>
    <div class="form-row"><label class="form-label">Grupamentos</label><div id="groupGrid" class="group-grid">${groupButtonsHtml(existing?.muscleGroups || [])}</div></div>
    <div class="modal-actions">${existing?'<button class="btn btn-danger" id="exerciseDelete">Excluir</button>':''}<button class="btn btn-secondary" id="exerciseCancel">Cancelar</button><button class="btn btn-primary" id="exerciseSave">Salvar</button></div>`);
  $$('[data-group]', $('#groupGrid')).forEach(btn => btn.onclick = ()=>btn.classList.toggle('is-selected'));
  $('#exerciseCancel').onclick = () => { closeModal(); if (pickerCancelCallback) setTimeout(pickerCancelCallback, 0); };
  if ($('#exerciseDelete')) $('#exerciseDelete').onclick = () => confirmDeleteExercise(existing.id);
  $('#exerciseSave').onclick = () => {
    const name = $('#exerciseName').value.trim();
    const groups = $$('[data-group].is-selected', $('#groupGrid')).map(b=>b.dataset.group);
    if (!name) return toast('Digite o nome do exercício.');
    if (!groups.length) return toast('Selecione pelo menos um grupamento.');
    const duplicate = db.exercises.some(e=>e.id!==existing?.id && e.name.toLowerCase()===name.toLowerCase());
    if (duplicate) return toast('Já existe um exercício com esse nome.');
    let saved;
    if (existing) { existing.name=name; existing.muscleGroups=groups; saved=existing; }
    else { saved={id:uid('exercise'),name,muscleGroups:groups,createdAt:Date.now()}; db.exercises.push(saved); }
    db.sessions.forEach(s=>s.participants.forEach(p=>p.exercises.forEach(ex=>{if(ex.exerciseId===saved.id){ex.name=saved.name;ex.muscleGroups=saved.muscleGroups.slice();}})));
    persist(); closeModal();
    if (pickerCallback) pickerCallback(saved.id); else render();
    toast(existing?'Exercício atualizado.':'Exercício criado.');
  };
}

function confirmDeleteExercise(exerciseId) {
  const ex=exerciseById(exerciseId);if(!ex)return;
  const inPrograms = db.programs.some(p=>p.exercises.some(pe=>pe.exerciseId===exerciseId));
  if (inPrograms) return toast('Remova este exercício dos treinos antes de excluí-lo.');
  confirmModal(`Excluir ${ex.name}?`, 'O histórico já registrado continuará preservado.', 'Excluir exercício', ()=>{
    db.exercises=db.exercises.filter(e=>e.id!==exerciseId);persist();closeModal();render();toast('Exercício excluído.');
  });
}

/* ----------------------------- program builder ----------------------------- */

function openProgramBuilder(studentId, programId=null) {
  const student=studentById(studentId); if(!student)return;
  const existing=programId?programById(programId):null;
  const draft={
    id:existing?.id||null, studentId,
    name:existing?.name||'', startDate:existing?.startDate||'', endDate:existing?.endDate||'',
    exercises:(existing?.exercises||[]).map(pe=>({...pe}))
  };
  const renderBuilder = () => {
    openModal(`
      <div class="builder-head"><button class="icon-btn" id="builderClose">${icons.back}</button><h2>${existing?'Editar treino':'Criar treino'}</h2></div>
      <div class="builder-body">
        <div class="form-row"><label class="form-label">Nome do treino</label><input id="programName" class="form-input" value="${esc(draft.name)}" placeholder="Ex.: Treino A — Peito e tríceps"></div>
        <div class="form-grid"><div class="form-row"><label class="form-label">Início opcional</label><input id="programStart" type="date" class="form-input" value="${esc(draft.startDate)}"></div><div class="form-row"><label class="form-label">Término opcional</label><input id="programEnd" type="date" class="form-input" value="${esc(draft.endDate)}"></div></div>
        <div class="section-title" style="margin-top:7px"><h2>Exercícios</h2><span>${draft.exercises.length}</span></div>
        <div id="builderExercises">${draft.exercises.map((pe,i)=>builderExerciseHtml(pe,i)).join('')}</div>
        <button class="add-dashed" id="builderAddExercise" type="button">+ Adicionar exercício</button>
      </div>
      <div class="builder-foot"><div class="modal-actions" style="margin-top:0"><button class="btn btn-secondary" id="builderCancel">Cancelar</button><button class="btn btn-primary" id="builderSave">${existing?'Salvar alterações':'Criar treino'}</button></div></div>
    `,{fullscreen:true,onClose:()=>{}});
    const syncFields=()=>{draft.name=$('#programName')?.value||draft.name;draft.startDate=$('#programStart')?.value||'';draft.endDate=$('#programEnd')?.value||'';};
    $('#builderClose').onclick=closeModal; $('#builderCancel').onclick=closeModal;
    $('#programName').oninput=e=>draft.name=e.target.value; $('#programStart').onchange=e=>draft.startDate=e.target.value; $('#programEnd').onchange=e=>draft.endDate=e.target.value;
    $('#builderAddExercise').onclick=()=>{syncFields();openExercisePicker(exId=>{draft.exercises.push({exerciseId:exId,sets:3,restSec:120,targetReps:'',note:''});renderBuilder();}, renderBuilder);};
    $$('[data-builder-remove]').forEach(btn=>btn.onclick=()=>{syncFields();draft.exercises.splice(+btn.dataset.builderRemove,1);renderBuilder();});
    $$('[data-builder-minus]').forEach(btn=>btn.onclick=()=>{syncFields();const pe=draft.exercises[+btn.dataset.builderMinus];pe.sets=Math.max(1,pe.sets-1);renderBuilder();});
    $$('[data-builder-plus]').forEach(btn=>btn.onclick=()=>{syncFields();draft.exercises[+btn.dataset.builderPlus].sets=Math.min(50,peNumber(draft.exercises[+btn.dataset.builderPlus].sets)+1);renderBuilder();});
    $$('[data-builder-rest]').forEach(inp=>inp.onchange=()=>{draft.exercises[+inp.dataset.builderRest].restSec=clamp(parseRest(inp.value),0,3600);});
    $$('[data-builder-reps]').forEach(inp=>inp.oninput=()=>{draft.exercises[+inp.dataset.builderReps].targetReps=inp.value;});
    $$('[data-builder-exercise]').forEach(btn=>btn.onclick=()=>{syncFields();const idx=+btn.dataset.builderExercise;openExercisePicker(exId=>{draft.exercises[idx].exerciseId=exId;renderBuilder();}, renderBuilder);});
    $('#builderSave').onclick=()=>{
      syncFields();
      const name=draft.name.trim()||'Novo treino';
      if(!draft.exercises.length)return toast('Adicione pelo menos um exercício.');
      if(draft.exercises.some(pe=>!exerciseById(pe.exerciseId)))return toast('Há um exercício inválido no treino.');
      if(existing){existing.name=name;existing.startDate=draft.startDate;existing.endDate=draft.endDate;existing.exercises=draft.exercises.map(pe=>({...pe}));existing.updatedAt=Date.now();}
      else db.programs.push({id:uid('program'),studentId,name,startDate:draft.startDate,endDate:draft.endDate,exercises:draft.exercises.map(pe=>({...pe})),createdAt:Date.now(),updatedAt:Date.now()});
      persist();closeModal();navigate('student',{studentId});toast(existing?'Treino atualizado.':'Treino criado.');
    };
  };
  renderBuilder();
}

function peNumber(n){return Math.max(1,parseInteger(n)||1);}
function builderExerciseHtml(pe,index){
  const ex=exerciseById(pe.exerciseId);
  return `<div class="builder-exercise">
    <div class="builder-exercise-head"><button class="builder-exercise-name" type="button" data-builder-exercise="${index}">${esc(ex?.name||'Selecionar exercício')}</button><button class="builder-remove" type="button" data-builder-remove="${index}">×</button></div>
    ${ex?`<div class="tag-list" style="margin-top:7px">${ex.muscleGroups.map(g=>`<span class="tag">${esc(g)}</span>`).join('')}</div>`:''}
    <div class="builder-controls">
      <div><span class="control-label">Séries</span><div class="stepper"><button type="button" data-builder-minus="${index}">−</button><span>${pe.sets}</span><button type="button" data-builder-plus="${index}">+</button></div></div>
      <div><span class="control-label">Descanso</span><input class="builder-rest" data-builder-rest="${index}" value="${fmtRest(pe.restSec)}"></div>
    </div>
    <div style="margin-top:9px"><span class="control-label">Faixa de repetições (opcional)</span><input class="form-input" data-builder-reps="${index}" value="${esc(pe.targetReps||'')}" placeholder="Ex.: 8–12"></div>
  </div>`;
}

function openExercisePicker(onPick, onCancel = null) {
  const picker=()=>{
    const list=db.exercises.slice().sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
    openModal(`<h2>Selecionar exercício</h2><div class="toolbar" style="margin:12px 0"><div class="search-field">${icons.search}<input id="pickerSearch" placeholder="Buscar exercício"></div></div><div id="pickerList" class="choice-list"></div><div class="modal-actions"><button class="btn btn-secondary" id="pickerNew">+ Criar novo</button><button class="btn btn-secondary" id="pickerCancel">Cancelar</button></div>`);
    const renderList=()=>{
      const q=$('#pickerSearch').value.toLowerCase();
      const arr=list.filter(e=>e.name.toLowerCase().includes(q));
      $('#pickerList').innerHTML=arr.map(e=>`<button class="choice" type="button" data-picker-id="${esc(e.id)}"><div class="row-main"><strong>${esc(e.name)}</strong><small>${esc(e.muscleGroups.join(' · '))}</small></div>${chev()}</button>`).join('')||emptyHtml('Nenhum exercício encontrado.','Crie um novo exercício para continuar.');
      $$('[data-picker-id]', $('#pickerList')).forEach(btn=>btn.onclick=()=>{const id=btn.dataset.pickerId;closeModal();onPick(id);});
    };
    renderList();$('#pickerSearch').oninput=renderList;
    $('#pickerCancel').onclick=()=>{closeModal(); if(onCancel)setTimeout(onCancel,0);};
    $('#pickerNew').onclick=()=>{closeModal();setTimeout(()=>openExerciseForm(null,id=>{onPick(id);}, ()=>{ if(onCancel)onCancel(); }),60);};
  };
  picker();
}

function openProgramActions(programId){
  const p=programById(programId);if(!p)return;
  openModal(`<h2>${esc(p.name)}</h2><p class="modal-sub">Ações do treino</p><div class="action-list"><button class="action-item" data-pa="edit"><span class="action-icon">${icons.edit}</span><div class="row-main"><strong>Editar treino</strong></div>${chev()}</button><button class="action-item danger" data-pa="delete"><span class="action-icon">${icons.trash}</span><div class="row-main"><strong>Apagar treino</strong></div></button></div>`);
  $$('[data-pa]').forEach(btn=>btn.onclick=()=>{const a=btn.dataset.pa;closeModal();if(a==='edit')setTimeout(()=>openProgramBuilder(p.studentId,p.id),60);if(a==='delete')setTimeout(()=>confirmDeleteProgram(p.id),60);});
}
function confirmDeleteProgram(programId){const p=programById(programId);if(!p)return;confirmModal(`Apagar ${p.name}?`,'O histórico já concluído será mantido, mas este treino deixará de aparecer no perfil.','Apagar treino',()=>{db.programs=db.programs.filter(x=>x.id!==p.id);persist();navigate('student',{studentId:p.studentId});toast('Treino apagado.');});}

/* ----------------------------- pair setup ----------------------------- */

function openPairSetup(firstStudentId){
  const first=studentById(firstStudentId);if(!first)return;
  const firstPrograms=programsForStudent(first.id);
  const others=db.students.filter(s=>s.id!==first.id && programsForStudent(s.id).length);
  if(!firstPrograms.length)return toast('Crie um treino para este aluno primeiro.');
  if(!others.length)return toast('Cadastre outro aluno com treino montado para usar a dupla.');
  openModal(`<h2>Treino em dupla</h2><p class="modal-sub">Escolha o treino de cada aluno. Você controla os dois na mesma sessão.</p><div class="form-row"><label class="form-label">Treino de ${esc(first.name)}</label><select id="pairFirstProgram" class="form-select">${firstPrograms.map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('')}</select></div><div class="form-row"><label class="form-label">Segundo aluno</label><select id="pairStudent" class="form-select">${others.map(s=>`<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('')}</select></div><div class="form-row"><label class="form-label">Treino do segundo aluno</label><select id="pairSecondProgram" class="form-select"></select></div><div class="modal-actions"><button class="btn btn-secondary" id="pairCancel">Cancelar</button><button class="btn btn-primary" id="pairReady">Preparar dupla</button></div>`);
  const fill=()=>{const sid=$('#pairStudent').value;$('#pairSecondProgram').innerHTML=programsForStudent(sid).map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');};
  fill();$('#pairStudent').onchange=fill;$('#pairCancel').onclick=closeModal;
  $('#pairReady').onclick=()=>{const sid=$('#pairStudent').value,p1=$('#pairFirstProgram').value,p2=$('#pairSecondProgram').value;closeModal();prepareWorkout([{studentId:first.id,programId:p1},{studentId:sid,programId:p2}]);};
}

/* ----------------------------- live workout ----------------------------- */

function prepareWorkout(entries){
  const participants=[];
  for(const entry of entries){
    const st=studentById(entry.studentId), program=programById(entry.programId);
    if(!st||!program)return toast('Não foi possível preparar o treino.');
    participants.push({
      studentId:st.id, programId:program.id, programName:program.name, feedback:'',
      exercises:program.exercises.map(pe=>{
        const ex=exerciseById(pe.exerciseId); if(!ex)return null;
        const prev=getLastExercisePerformance(st.id,ex.id);
        const prevSets=prev?completedSets(prev):[];
        return {
          exerciseId:ex.id,name:ex.name,muscleGroups:ex.muscleGroups.slice(),restSec:pe.restSec,note:pe.note||'',
          targetReps:pe.targetReps||'',
          sets:Array.from({length:pe.sets},(_,i)=>({
            weight:prevSets[i]?.weight ?? prevSets[prevSets.length-1]?.weight ?? '',
            reps:prevSets[i]?.reps ?? prevSets[prevSets.length-1]?.reps ?? '',
            done:false,
            previous:prevSets[i]?{weight:prevSets[i].weight,reps:prevSets[i].reps}:null
          }))
        };
      }).filter(Boolean)
    });
  }
  live={id:uid('draft'),createdAt:Date.now(),startedAt:null,restEndAt:null,restDuration:0,participants};
  persistDraft();navigate('workout');
}

function renderWorkout(main){
  if(!live){navigate('home');return;}
  if(!live.startedAt)renderWorkoutPreview(main);else renderActiveWorkout(main);
}

function renderWorkoutPreview(main){
  const label=live.participants.length>1?'Treino em dupla':'Treino pronto';
  setHeader({eyebrow:'TREINO PRONTO',title:label,back:()=>{confirmModal('Cancelar preparação?','O treino ainda não começou.','Cancelar treino',()=>{live=null;persistDraft();navigate('home');});},action:null});
  main.innerHTML=`<section class="screen"><div class="preview-wrap"><div class="preview-title"><small>${live.participants.length>1?'DUPLA':'SESSÃO'}</small><h1>Vamos começar?</h1><p>Confira os exercícios. Ao iniciar, o cronômetro e o controle de séries ficam ativos.</p></div>${live.participants.map(previewPersonHtml).join('')}<button id="beginWorkoutBtn" class="btn btn-primary btn-block" style="margin-top:18px">Iniciar treino</button></div></section>`;
  $('#beginWorkoutBtn').onclick=()=>{unlockAudio();live.startedAt=Date.now();persistDraft();render();};
}
function previewPersonHtml(p){const st=studentById(p.studentId);return `<div class="preview-person"><div class="preview-person-head"><div class="avatar round">${esc(initials(st?.name))}</div><div class="row-main"><strong>${esc(st?.name||'Aluno')}</strong><small>${esc(p.programName)}</small></div></div>${p.exercises.map((ex,i)=>`<div class="preview-ex-row"><span>${String(i+1).padStart(2,'0')}</span><strong>${esc(ex.name)}</strong><small>${ex.sets.length} séries</small></div>`).join('')}</div>`;}

function renderActiveWorkout(main){
  const title=live.participants.length>1?'Treino em dupla':live.participants[0].programName;
  setHeader({eyebrow:'TREINO AO VIVO',title,back:()=>navigate('home'),action:'more',actionFn:openLiveMenu});
  const totalSets=live.participants.reduce((a,p)=>a+p.exercises.reduce((x,e)=>x+e.sets.length,0),0);
  const done=live.participants.reduce((a,p)=>a+p.exercises.reduce((x,e)=>x+e.sets.filter(s=>s.done).length,0),0);
  const vol=live.participants.reduce((a,p)=>a+p.exercises.reduce((x,e)=>x+e.sets.filter(s=>s.done).reduce((z,s)=>z+setVolume(s),0),0),0);
  main.innerHTML=`<section class="screen"><div class="live-header"><div class="live-stat-grid"><div class="live-stat"><small>Duração</small><strong class="accent" id="liveDuration">${fmtClock((Date.now()-live.startedAt)/1000)}</strong></div><div class="live-stat"><small>Volume</small><strong id="liveVolume">${kgText(vol)}</strong></div><div class="live-stat"><small>Séries</small><strong id="liveSets">${done} / ${totalSets}</strong></div></div></div>${live.participants.map((p,pi)=>liveParticipantHtml(p,pi)).join('')}<div class="live-finish"><button class="btn btn-secondary" id="liveLeave">Sair da tela</button><button class="btn btn-primary" id="liveFinish">Concluir treino</button></div></section>`;
  bindLiveHandlers();
  $('#liveLeave').onclick=()=>navigate('home');
  $('#liveFinish').onclick=openFinishWorkout;
  updateGlobalClocks();
}

function liveParticipantHtml(p,pi){
  const st=studentById(p.studentId);const pvol=p.exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).reduce((x,s)=>x+setVolume(s),0),0);
  return `<div class="live-person-head"><div class="avatar round">${esc(initials(st?.name))}</div><span>${esc(st?.name||'Aluno')} · ${esc(p.programName)} · ${kgText(pvol)}</span></div>${p.exercises.map((ex,ei)=>liveExerciseHtml(p,pi,ex,ei)).join('')}`;
}

function liveExerciseHtml(participant,pi,ex,ei){
  return `<div class="live-exercise-card" data-live-exercise="${pi}:${ei}"><div class="live-exercise-head"><div class="row-main"><strong>${esc(ex.name)}</strong><small>${ex.sets.length} séries · descanso ${fmtRest(ex.restSec)}${ex.targetReps?` · alvo ${esc(ex.targetReps)} reps`:''}</small></div><button class="live-more" type="button" data-live-more="${pi}:${ei}">⋯</button></div><input class="live-note" data-live-note="${pi}:${ei}" value="${esc(ex.note||'')}" placeholder="Observação deste exercício"><div class="set-head"><span>Série</span><span>Anterior</span><span>KG</span><span>Reps</span><span></span></div>${ex.sets.map((set,si)=>liveSetHtml(pi,ei,set,si)).join('')}<div class="live-exercise-footer"><button class="btn btn-secondary btn-sm" data-remove-set="${pi}:${ei}" type="button">− Série</button><button class="btn btn-secondary btn-sm" data-add-set="${pi}:${ei}" type="button">+ Série</button></div></div>`;
}
function liveSetHtml(pi,ei,set,si){const prev=set.previous?`${parseDecimal(set.previous.weight)} × ${parseInteger(set.previous.reps)}`:'—';return `<div class="set-row ${set.done?'is-done':''}" data-set-row="${pi}:${ei}:${si}"><div class="set-index">${si+1}</div><div class="set-prev">${esc(prev)}</div><input class="set-input" inputmode="decimal" data-set-weight="${pi}:${ei}:${si}" value="${esc(set.weight)}" placeholder="kg"><input class="set-input" inputmode="numeric" data-set-reps="${pi}:${ei}:${si}" value="${esc(set.reps)}" placeholder="reps"><button class="set-check" data-set-check="${pi}:${ei}:${si}" type="button">${set.done?icons.check:''}</button></div>`;}

function parsePath(path){return String(path).split(':').map(Number);}
function liveExerciseAt(path){const [pi,ei]=parsePath(path);return live?.participants?.[pi]?.exercises?.[ei]||null;}
function liveSetAt(path){const [pi,ei,si]=parsePath(path);return live?.participants?.[pi]?.exercises?.[ei]?.sets?.[si]||null;}

function bindLiveHandlers(){
  $$('[data-set-weight]').forEach(inp=>inp.oninput=()=>{const s=liveSetAt(inp.dataset.setWeight);if(s){s.weight=inp.value;persistDraft();updateLiveStatsDOM();}});
  $$('[data-set-reps]').forEach(inp=>inp.oninput=()=>{const s=liveSetAt(inp.dataset.setReps);if(s){s.reps=inp.value;persistDraft();updateLiveStatsDOM();}});
  $$('[data-set-check]').forEach(btn=>btn.onclick=()=>{const set=liveSetAt(btn.dataset.setCheck);if(!set)return;const [pi,ei]=parsePath(btn.dataset.setCheck);if(!set.done && parseInteger(set.reps)<=0)return toast('Informe as repetições antes de concluir a série.');set.done=!set.done;if(set.done){unlockAudio();const ex=live.participants[pi].exercises[ei];if(ex.restSec>0)startRest(ex.restSec);}persistDraft();renderActiveWorkout($('#main'));});
  $$('[data-live-note]').forEach(inp=>inp.oninput=()=>{const ex=liveExerciseAt(inp.dataset.liveNote);if(ex){ex.note=inp.value;persistDraft();}});
  $$('[data-add-set]').forEach(btn=>btn.onclick=()=>{const ex=liveExerciseAt(btn.dataset.addSet);if(!ex)return;const last=ex.sets[ex.sets.length-1]||{};ex.sets.push({weight:last.weight||'',reps:last.reps||'',done:false,previous:null});persistDraft();renderActiveWorkout($('#main'));});
  $$('[data-remove-set]').forEach(btn=>btn.onclick=()=>{const ex=liveExerciseAt(btn.dataset.removeSet);if(!ex)return;if(ex.sets.length<=1)return toast('O exercício precisa ter pelo menos 1 série.');ex.sets.pop();persistDraft();renderActiveWorkout($('#main'));});
  $$('[data-live-more]').forEach(btn=>btn.onclick=()=>openLiveExerciseSettings(btn.dataset.liveMore));
}

function updateLiveStatsDOM(){
  if(!live)return;
  const total=live.participants.reduce((a,p)=>a+p.exercises.reduce((x,e)=>x+e.sets.length,0),0);
  const done=live.participants.reduce((a,p)=>a+p.exercises.reduce((x,e)=>x+e.sets.filter(s=>s.done).length,0),0);
  const vol=live.participants.reduce((a,p)=>a+p.exercises.reduce((x,e)=>x+e.sets.filter(s=>s.done).reduce((z,s)=>z+setVolume(s),0),0),0);
  if($('#liveVolume'))$('#liveVolume').textContent=kgText(vol);if($('#liveSets'))$('#liveSets').textContent=`${done} / ${total}`;
}

function openLiveExerciseSettings(path){
  const ex=liveExerciseAt(path);if(!ex)return;
  openModal(`<h2>${esc(ex.name)}</h2><p class="modal-sub">Ajustes válidos apenas para esta sessão.</p><div class="form-row"><label class="form-label">Descanso</label><input id="liveRestEdit" class="form-input" value="${fmtRest(ex.restSec)}"></div><div class="form-row"><label class="form-label">Número de séries</label><input id="liveSetsEdit" type="number" min="1" max="50" class="form-input" value="${ex.sets.length}"></div><div class="modal-actions"><button class="btn btn-secondary" id="liveEditCancel">Cancelar</button><button class="btn btn-primary" id="liveEditSave">Aplicar</button></div>`);
  $('#liveEditCancel').onclick=closeModal;$('#liveEditSave').onclick=()=>{ex.restSec=clamp(parseRest($('#liveRestEdit').value),0,3600);const n=clamp(parseInteger($('#liveSetsEdit').value)||1,1,50);while(ex.sets.length<n){const last=ex.sets[ex.sets.length-1]||{};ex.sets.push({weight:last.weight||'',reps:last.reps||'',done:false,previous:null});}while(ex.sets.length>n)ex.sets.pop();persistDraft();closeModal();renderActiveWorkout($('#main'));};
}

function openLiveMenu(){
  openModal(`<h2>Treino em andamento</h2><div class="action-list"><button class="action-item" data-live-menu="home"><span class="action-icon">${icons.home}</span><div class="row-main"><strong>Voltar ao início</strong><small>O cronômetro continua rodando</small></div>${chev()}</button><button class="action-item danger" data-live-menu="discard"><span class="action-icon">${icons.trash}</span><div class="row-main"><strong>Descartar treino</strong><small>As séries desta sessão serão perdidas</small></div></button></div>`);
  $$('[data-live-menu]').forEach(btn=>btn.onclick=()=>{const a=btn.dataset.liveMenu;closeModal();if(a==='home')navigate('home');if(a==='discard')setTimeout(discardLiveWorkout,60);});
}
function discardLiveWorkout(){confirmModal('Descartar treino?','Todas as séries preenchidas nesta sessão serão perdidas.','Descartar',()=>{stopRest();live=null;persistDraft();navigate('home');toast('Treino descartado.');});}

function openFinishWorkout(){
  if(!live)return;
  const completed=live.participants.reduce((a,p)=>a+p.exercises.reduce((x,e)=>x+e.sets.filter(s=>s.done).length,0),0);
  if(!completed)return toast('Marque pelo menos uma série como concluída.');
  openModal(`<h2>Concluir treino</h2><p class="modal-sub">Revise o resumo e registre um parecer para cada aluno. O parecer fica salvo no histórico.</p>${live.participants.map((p,i)=>{const st=studentById(p.studentId);const vol=p.exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).reduce((x,s)=>x+setVolume(s),0),0);const sets=p.exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).length,0);return `<div class="card" style="margin-bottom:10px"><strong style="font-size:13px">${esc(st?.name||'Aluno')}</strong><div class="workout-meta">${sets} séries · ${kgText(vol)}</div><div class="form-row" style="margin-top:11px;margin-bottom:0"><label class="form-label">Parecer / observação</label><textarea class="form-textarea" data-feedback="${i}" placeholder="Ex.: evoluiu bem no supino, manter carga e trabalhar amplitude no agachamento...">${esc(p.feedback||'')}</textarea></div></div>`;}).join('')}<div class="modal-actions"><button class="btn btn-secondary" id="finishCancel">Voltar</button><button class="btn btn-primary" id="finishSave">Salvar treino</button></div>`);
  $('#finishCancel').onclick=closeModal;$('#finishSave').onclick=()=>{$$('[data-feedback]').forEach(t=>live.participants[+t.dataset.feedback].feedback=t.value.trim());saveFinishedWorkout();};
}

function saveFinishedWorkout(){
  if(!live)return;
  const endedAt=Date.now();
  const participants=live.participants.map(p=>({
    studentId:p.studentId,programId:p.programId,programName:p.programName,feedback:p.feedback||'',
    exercises:p.exercises.map(ex=>({exerciseId:ex.exerciseId,name:ex.name,muscleGroups:ex.muscleGroups.slice(),restSec:ex.restSec,note:ex.note||'',sets:ex.sets.filter(s=>s.done).map(s=>({weight:parseDecimal(s.weight),reps:parseInteger(s.reps),done:true}))})).filter(ex=>ex.sets.length)
  })).filter(p=>p.exercises.length);
  db.sessions.push({id:uid('session'),createdAt:live.createdAt||live.startedAt,startedAt:live.startedAt||endedAt,endedAt,durationSec:Math.max(0,Math.round((endedAt-(live.startedAt||endedAt))/1000)),participants});
  persist();const first=participants[0]?.studentId;stopRest();live=null;persistDraft();closeModal();if(first)navigate('student',{studentId:first});else navigate('home');toast('Treino salvo com sucesso.');
}

/* ----------------------------- rest timer ----------------------------- */

function unlockAudio(){
  try{if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();}catch(e){}
}
function beep(){
  try{unlockAudio();if(!audioCtx)return;const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.frequency.value=880;gain.gain.setValueAtTime(.0001,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(.12,audioCtx.currentTime+.02);gain.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+.35);osc.connect(gain).connect(audioCtx.destination);osc.start();osc.stop(audioCtx.currentTime+.38);}catch(e){}
  try{navigator.vibrate?.([120,80,120]);}catch(e){}
}
function startRest(seconds){if(!live)return;live.restDuration=Math.max(0,Number(seconds)||0);live.restEndAt=Date.now()+live.restDuration*1000;persistDraft();syncRestTimer();}
function stopRest(){if(restTicker){clearInterval(restTicker);restTicker=null;}if(live){live.restEndAt=null;live.restDuration=0;persistDraft();}$('#restTimer')?.classList.add('is-hidden');}
function adjustRest(delta){if(!live?.restEndAt)return;const left=Math.max(0,Math.ceil((live.restEndAt-Date.now())/1000)+delta);if(!left)return stopRest();live.restEndAt=Date.now()+left*1000;live.restDuration=left;persistDraft();syncRestTimer();}
function syncRestTimer(){
  const bar=$('#restTimer');if(!live?.restEndAt||live.restEndAt<=Date.now()){if(live?.restEndAt&&live.restEndAt<=Date.now()){live.restEndAt=null;live.restDuration=0;persistDraft();beep();toast('Descanso finalizado.');}bar.classList.add('is-hidden');if(restTicker){clearInterval(restTicker);restTicker=null;}return;}
  bar.classList.remove('is-hidden');
  const tick=()=>{if(!live?.restEndAt)return stopRest();const left=Math.max(0,Math.ceil((live.restEndAt-Date.now())/1000));$('#restTimerValue').textContent=fmtClock(left);if(left<=0){live.restEndAt=null;live.restDuration=0;persistDraft();bar.classList.add('is-hidden');if(restTicker){clearInterval(restTicker);restTicker=null;}beep();toast('Descanso finalizado.');}};
  tick();if(restTicker)clearInterval(restTicker);restTicker=setInterval(tick,250);
}

/* ----------------------------- evolution ----------------------------- */

function renderEvolution(main){
  setHeader({title:'Evolução',action:null});
  const students=db.students.slice().sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
  main.innerHTML=`<section class="screen"><div class="hero"><h1>Evolução</h1><p>Veja quem está evoluindo, volume acumulado, séries, grupamentos e pontos de atenção.</p></div><div class="section" style="margin-top:4px"><div class="section-title"><h2>Alunos</h2><span>${students.length}</span></div>${students.length?students.map(evolutionStudentCardHtml).join(''):emptyHtml('Nenhum aluno cadastrado.','Cadastre alunos e registre treinos para gerar análises.')}</div></section>`;
  $$('[data-evo-student]',main).forEach(btn=>btn.onclick=()=>navigate('evolution-detail',{evolutionStudentId:btn.dataset.evoStudent}));
}
function evolutionStudentCardHtml(st){const sessions=sessionsForStudent(st.id,'90d');const vol=sessions.reduce((a,s)=>a+participantVolume(participantForStudent(s,st.id)),0);const top=exerciseChanges(st.id,'90d').filter(x=>x.deltaKg>0).sort((a,b)=>b.pct-a.pct)[0];return `<button class="row-card" type="button" data-evo-student="${esc(st.id)}"><div class="avatar round">${esc(initials(st.name))}</div><div class="row-main"><strong>${esc(st.name)}</strong><small>${sessions.length} treinos · ${kgText(vol)}${top?` · ${esc(top.exerciseName)} +${round(top.deltaKg)} kg`:''}</small></div>${chev()}</button>`;}

function renderEvolutionDetail(main,studentId){
  const st=studentById(studentId);if(!st)return navigate('evolution');
  setHeader({eyebrow:'EVOLUÇÃO',title:st.name,back:()=>navigate('evolution'),action:null});
  const period=state.evolutionPeriod;const sessions=sessionsForStudent(st.id,period);const participants=sessions.map(s=>({session:s,p:participantForStudent(s,st.id)}));
  const totalVol=participants.reduce((a,x)=>a+participantVolume(x.p),0),sets=participants.reduce((a,x)=>a+participantSetCount(x.p),0),avg=sessions.length?totalVol/sessions.length:0,best=participants.reduce((m,x)=>Math.max(m,participantVolume(x.p)),0);
  const changes=exerciseChanges(st.id,period);const gains=changes.filter(x=>x.deltaKg>0).sort((a,b)=>b.pct-a.pct);const downs=changes.filter(x=>x.deltaKg<0).sort((a,b)=>a.pct-b.pct);
  const muscles=muscleDistribution(st.id,period);const report=buildCoachReport(st,period,sessions,gains,downs,muscles,totalVol,sets);
  main.innerHTML=`<section class="screen"><div class="hero"><h1>${esc(st.name)}</h1><p>Análise baseada nos registros de carga, repetições, volume e frequência.</p></div><div class="evo-filter-row">${[['30d','30 dias'],['90d','3 meses'],['180d','6 meses'],['365d','1 ano'],['all','Tudo']].map(([v,l])=>`<button class="period-btn ${period===v?'is-active':''}" data-period="${v}">${l}</button>`).join('')}</div><div class="section" style="margin-top:0"><div class="grid-2"><div class="metric-card"><div><small>Treinos</small><strong>${sessions.length}</strong></div><p>no período</p></div><div class="metric-card"><div><small>Volume total</small><strong>${kgText(totalVol)}</strong></div><p>carga × repetições</p></div><div class="metric-card"><div><small>Séries</small><strong>${sets}</strong></div><p>concluídas</p></div><div class="metric-card highlight"><div><small>Melhor sessão</small><strong>${kgText(best)}</strong></div><p>média ${kgText(avg)}</p></div></div></div>${volumeChartHtml(participants)}<div class="chart-card"><div class="chart-card-head"><div><strong>Volume por grupamento</strong><small>O volume de exercícios multiarticulares é dividido entre os grupamentos associados.</small></div></div>${muscles.length?muscles.map(muscleRowHtml).join(''):emptyHtml('Sem dados de grupamentos.','Registre treinos para preencher esta análise.')}</div><div class="chart-card"><div class="chart-card-head"><div><strong>Onde mais evoluiu</strong><small>Comparação da maior carga entre o primeiro e o último registro do período.</small></div></div><div class="change-list">${gains.length?gains.slice(0,6).map(changeRowHtml).join(''):emptyHtml('Sem evolução de carga comparável.','São necessários ao menos dois registros do mesmo exercício.')}</div></div><div class="chart-card"><div class="chart-card-head"><div><strong>Pontos de atenção</strong><small>Exercícios em que a maior carga caiu no período selecionado.</small></div></div><div class="change-list">${downs.length?downs.slice(0,6).map(x=>changeRowHtml(x,true)).join(''):emptyHtml('Nenhuma regressão de carga detectada.','Isso não substitui sua avaliação técnica do aluno.')}</div></div><div class="coach-report"><small>Parecer automático</small><h3>Resumo para compartilhar com o aluno</h3><p id="coachReportText">${esc(report)}</p><button class="btn btn-secondary btn-sm" id="copyReport" type="button">${icons.copy} Copiar parecer</button></div><div class="section"><div class="section-title"><h2>Últimos pareceres</h2></div>${latestFeedbackHtml(st.id)}</div></section>`;
  $$('[data-period]',main).forEach(btn=>btn.onclick=()=>{state.evolutionPeriod=btn.dataset.period;renderEvolutionDetail(main,st.id);});
  $('#copyReport').onclick=async()=>{try{await navigator.clipboard.writeText(report);toast('Parecer copiado.');}catch(e){fallbackCopy(report);}};
}

function volumeChartHtml(participants){
  if(!participants.length)return `<div class="chart-card">${emptyHtml('Sem sessões neste período.','Escolha outro período ou registre um treino.')}</div>`;
  const points=participants.map(x=>({date:fmtDate(x.session.endedAt),value:participantVolume(x.p)}));
  const max=Math.max(...points.map(p=>p.value),1),min=Math.min(...points.map(p=>p.value),0),range=Math.max(max-min,1);const W=400,H=170,L=12,R=388,T=18,B=136;
  const coords=points.map((p,i)=>({x:points.length===1?(L+R)/2:L+(R-L)*i/(points.length-1),y:B-((p.value-min)/range)*(B-T)}));
  const line=coords.map((p,i)=>`${i?'L':'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');const dots=coords.map((p,i)=>`<circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--surface)" stroke="var(--blue)" stroke-width="2"/><text class="chart-label" x="${p.x}" y="160" text-anchor="middle">${esc(points[i].date.slice(0,5))}</text>`).join('');
  return `<div class="chart-card"><div class="chart-card-head"><div><strong>Evolução do volume</strong><small>Volume total de cada sessão</small></div><div class="chart-value">${kgText(points[points.length-1].value)}</div></div><div class="spark-chart"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><path d="${line}" fill="none" stroke="var(--blue)" stroke-width="2.5" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/>${dots}</svg></div></div>`;
}

function muscleDistribution(studentId,period){
  const map=new Map();
  sessionsForStudent(studentId,period).forEach(session=>{const p=participantForStudent(session,studentId);(p.exercises||[]).forEach(ex=>{const groups=normalizeGroups(ex.muscleGroups);const v=exerciseVolume(ex),sets=completedSets(ex).length;const divisor=Math.max(groups.length,1);groups.forEach(g=>{if(!map.has(g))map.set(g,{group:g,volume:0,sets:0});const row=map.get(g);row.volume+=v/divisor;row.sets+=sets/divisor;});});});
  return [...map.values()].sort((a,b)=>b.volume-a.volume);
}
function muscleRowHtml(row,_,arr){const max=Math.max(...arr.map(x=>x.volume),1);return `<div class="progress-row"><div class="progress-row-head"><div><strong>${esc(row.group)}</strong><small>${round(row.sets)} séries equivalentes</small></div><b>${kgText(row.volume)}</b></div><div class="progress-track"><span style="width:${clamp((row.volume/max)*100,3,100)}%"></span></div></div>`;}

function exerciseChanges(studentId,period){
  const sessions=sessionsForStudent(studentId,period);const byEx=new Map();
  sessions.forEach(session=>{const p=participantForStudent(session,studentId);(p.exercises||[]).forEach(ex=>{if(!completedSets(ex).length)return;if(!byEx.has(ex.exerciseId))byEx.set(ex.exerciseId,[]);byEx.get(ex.exerciseId).push({ts:sessionTimestamp(session),name:ex.name,best:bestLoad(ex),volume:exerciseVolume(ex)});});});
  const out=[];byEx.forEach((rows,exerciseId)=>{rows.sort((a,b)=>a.ts-b.ts);if(rows.length<2)return;const first=rows[0],last=rows[rows.length-1];if(first.best<=0||last.best<=0)return;const delta=last.best-first.best;out.push({exerciseId,exerciseName:last.name,firstKg:first.best,lastKg:last.best,deltaKg:delta,pct:first.best?delta/first.best*100:0,firstVolume:first.volume,lastVolume:last.volume,records:rows.length});});return out;
}
function changeRowHtml(x,down=false){return `<div class="change-row"><div class="row-main"><strong>${esc(x.exerciseName)}</strong><small>${x.firstKg} kg → ${x.lastKg} kg · ${x.records} registros</small></div><span class="change-badge ${down?'down':''}">${x.deltaKg>0?'+':''}${round(x.deltaKg)} kg · ${x.pct>0?'+':''}${round(x.pct)}%</span></div>`;}
function findTopImprovementAcrossStudents(period){const arr=[];db.students.forEach(st=>exerciseChanges(st.id,period).filter(x=>x.deltaKg>0).forEach(x=>arr.push({...x,student:st})));return arr.sort((a,b)=>b.pct-a.pct)[0]||null;}
function findTopRegressionAcrossStudents(period){const arr=[];db.students.forEach(st=>exerciseChanges(st.id,period).filter(x=>x.deltaKg<0).forEach(x=>arr.push({...x,student:st})));return arr.sort((a,b)=>a.pct-b.pct)[0]||null;}

function buildCoachReport(st,period,sessions,gains,downs,muscles,totalVol,sets){
  const label={'30d':'nos últimos 30 dias','90d':'nos últimos 3 meses','180d':'nos últimos 6 meses','365d':'no último ano','all':'em todo o histórico'}[period]||'no período';
  if(!sessions.length)return `${st.name} ainda não possui sessões suficientes ${label} para gerar um parecer de evolução.`;
  const parts=[`${st.name} realizou ${sessions.length} treino${sessions.length===1?'':'s'} ${label}, com ${sets} séries concluídas e volume acumulado de ${kgText(totalVol)}.`];
  if(gains[0])parts.push(`A maior evolução de carga apareceu em ${gains[0].exerciseName}, passando de ${gains[0].firstKg} kg para ${gains[0].lastKg} kg (+${round(gains[0].deltaKg)} kg, ${round(gains[0].pct)}%).`);
  if(muscles[0])parts.push(`O grupamento com maior volume registrado foi ${muscles[0].group}, com aproximadamente ${kgText(muscles[0].volume)}.`);
  if(downs[0])parts.push(`Como ponto de atenção, ${downs[0].exerciseName} apresentou redução de ${Math.abs(round(downs[0].deltaKg))} kg na maior carga registrada; vale revisar fadiga, técnica, amplitude e contexto da sessão antes de interpretar como regressão.`);else parts.push('Não houve queda de carga comparável relevante nos exercícios com histórico suficiente.');
  parts.push('A leitura deve ser combinada com sua avaliação técnica, qualidade de execução, dor, percepção de esforço e objetivo do aluno.');
  return parts.join(' ');
}
function latestFeedbackHtml(studentId){const rows=sessionsForStudent(studentId,'all').slice().reverse().map(s=>({s,p:participantForStudent(s,studentId)})).filter(x=>x.p.feedback).slice(0,5);return rows.length?rows.map(x=>`<div class="history-session"><div class="history-session-head"><div><strong>${fmtDate(x.s.endedAt)}</strong><small>${esc(x.p.programName)}</small></div></div><div class="feedback-box">${esc(x.p.feedback)}</div></div>`).join(''):emptyHtml('Nenhum parecer salvo.','Ao concluir um treino, escreva uma observação para manter o histórico qualitativo do aluno.');}
function fallbackCopy(text){const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();toast('Parecer copiado.');}

/* ----------------------------- settings/backup ----------------------------- */

function openSettingsMenu(){
  openModal(`<h2>Treino Live</h2><p class="modal-sub">Dados, backup e instalação no iPhone.</p><div class="action-list"><button class="action-item" data-settings="trainer"><span class="action-icon">${icons.edit}</span><div class="row-main"><strong>Nome do treinador</strong><small>${esc(db.trainer.name)}</small></div>${chev()}</button><button class="action-item" data-settings="export"><span class="action-icon">${icons.download}</span><div class="row-main"><strong>Exportar backup</strong><small>Salvar alunos, treinos e histórico em JSON</small></div>${chev()}</button><button class="action-item" data-settings="import"><span class="action-icon">${icons.upload}</span><div class="row-main"><strong>Importar backup</strong><small>Restaurar um arquivo exportado pelo app</small></div>${chev()}</button><button class="action-item" data-settings="install"><span class="action-icon">${icons.info}</span><div class="row-main"><strong>Instalar no iPhone</strong><small>Usar como aplicativo pela Tela de Início</small></div>${chev()}</button><button class="action-item danger" data-settings="reset"><span class="action-icon">${icons.trash}</span><div class="row-main"><strong>Apagar todos os dados</strong><small>Esta ação não pode ser desfeita</small></div></button></div>`);
  $$('[data-settings]').forEach(btn=>btn.onclick=()=>{const a=btn.dataset.settings;closeModal();if(a==='trainer')setTimeout(openTrainerName,60);if(a==='export')exportBackup();if(a==='import')$('#backupImportInput').click();if(a==='install')setTimeout(openInstallHelp,60);if(a==='reset')setTimeout(confirmReset,60);});
}
function openTrainerName(){openModal(`<h2>Nome do treinador</h2><div class="form-row"><label class="form-label">Nome</label><input id="trainerName" class="form-input" value="${esc(db.trainer.name)}"></div><div class="modal-actions"><button class="btn btn-secondary" id="trainerCancel">Cancelar</button><button class="btn btn-primary" id="trainerSave">Salvar</button></div>`);$('#trainerCancel').onclick=closeModal;$('#trainerSave').onclick=()=>{db.trainer.name=$('#trainerName').value.trim()||'Treinador';persist();closeModal();render();toast('Nome atualizado.');};}
function exportBackup(){const blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`treino-live-backup-${localDateISO()}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Backup exportado.');}
function importBackupFile(file){const reader=new FileReader();reader.onload=()=>{try{const parsed=JSON.parse(reader.result);const valid=parsed&&typeof parsed==='object'&&Array.isArray(parsed.students)&&((Array.isArray(parsed.exercises)&&Array.isArray(parsed.programs)&&Array.isArray(parsed.sessions))||(Array.isArray(parsed.library)||Array.isArray(parsed.records)));if(!valid)throw new Error('inválido');const normalized=normalizeDatabase(parsed);confirmModal('Restaurar backup?','Os dados atuais deste aparelho serão substituídos pelo arquivo selecionado.','Restaurar',()=>{db=normalized;persist();live=null;persistDraft();navigate('home');toast('Backup restaurado.');},false);}catch(e){toast('Arquivo de backup inválido.');}};reader.readAsText(file);}
function openInstallHelp(){openModal(`<h2>Instalar no iPhone</h2><p class="modal-sub">Depois de publicar no Vercel e abrir o site no Safari:</p><div class="card"><strong style="font-size:13px">1.</strong><p class="muted" style="font-size:12px;line-height:1.5">Toque no botão <b>Compartilhar</b> do Safari.</p><div class="divider"></div><strong style="font-size:13px">2.</strong><p class="muted" style="font-size:12px;line-height:1.5">Escolha <b>Adicionar à Tela de Início</b>.</p><div class="divider"></div><strong style="font-size:13px">3.</strong><p class="muted" style="font-size:12px;line-height:1.5">Abra pelo ícone criado. O app passa a ocupar a tela como um aplicativo.</p></div><div class="modal-actions"><button class="btn btn-primary" id="installOk">Entendi</button></div>`);$('#installOk').onclick=closeModal;}
function confirmReset(){confirmModal('Apagar todos os dados?','Alunos, treinos, exercícios, histórico e treino em andamento serão removidos deste aparelho. Exporte um backup antes se quiser preservar os dados.','Apagar tudo',()=>{db=blankDatabase();persist();live=null;persistDraft();navigate('home');toast('Dados apagados.');});}

/* ----------------------------- boot ----------------------------- */

function emptyHtml(title,subtitle='') { return `<div class="empty"><div class="empty-icon">${icons.dumbbell}</div><strong>${esc(title)}</strong>${subtitle?`<div>${esc(subtitle)}</div>`:''}</div>`; }

function boot(){
  $$('[data-icon]').forEach(el=>{el.innerHTML=icons[el.dataset.icon]||'';});
  $$('.nav-item').forEach(btn=>btn.onclick=()=>navigate(btn.dataset.route));
  $('#activeWorkoutPill').onclick=()=>navigate('workout');
  $('#modalBackdrop').onclick=closeModal;
  $('#restMinus').onclick=()=>adjustRest(-15);$('#restPlus').onclick=()=>adjustRest(15);$('#restSkip').onclick=stopRest;
  $('#backupImportInput').onchange=e=>{const file=e.target.files?.[0];if(file)importBackupFile(file);e.target.value='';};
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){updateGlobalClocks();syncRestTimer();}});
  appTicker=setInterval(()=>{updateGlobalClocks();if(live?.restEndAt&&live.restEndAt<=Date.now())syncRestTimer();},1000);
  render();
  if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
}

document.addEventListener('DOMContentLoaded',boot);
