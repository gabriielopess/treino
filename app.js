
'use strict';

/* ============================================================
   TREINO — clean rebuild
   Static PWA, mobile-first, local persistence, no dependencies.
   ============================================================ */

const DB_KEY = 'treinoLiveCleanV1';
const DRAFT_KEY = 'treinoLiveCleanV1_draft';
const LEGACY_KEY = 'treinoLiveV4';
const APP_VERSION = 1;
const MUSCLE_GROUPS = [
  'Peito','Costas','Ombros','Bíceps','Tríceps','Quadríceps',
  'Posteriores','Glúteos','Panturrilhas','Adutores','Abdômen','Outro'
];
const REST_OPTIONS = Array.from({length:9}, (_,i) => 60 + i*15);

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const icons = {
  back: '<svg viewBox="0 0 24 24" fill="none"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  more: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  minus: '<svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  sliders: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 7h7M15 7h5M4 17h3M11 17h9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="13" cy="7" r="2" stroke="currentColor" stroke-width="1.8"/><circle cx="9" cy="17" r="2" stroke="currentColor" stroke-width="1.8"/></svg>',
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
  history: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.6M4 4v4.6h4.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 8v4l2.7 1.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none"><path d="M20.2 15.4A8.5 8.5 0 0 1 8.6 3.8a8.5 8.5 0 1 0 11.6 11.6Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  trend: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 17 9 12l4 3 7-8M15 7h5v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

let db = loadDatabase();
let live = loadDraft();
let state = {
  route: live ? 'workout' : 'home',
  studentId: null,
  historyStudentId: null,
  evolutionStudentId: null,
  evolutionPeriod: '90d',
  evolutionProgramId: null,
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

function avatarHtml(student, extraClass='round') {
  const cls = `avatar ${extraClass || ''}`.trim();
  if (student?.photoDataUrl) return `<div class="${cls}"><img src="${esc(student.photoDataUrl)}" alt=""></div>`;
  return `<div class="${cls}">${esc(initials(student?.name || 'Aluno'))}</div>`;
}

function squareImageDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve('');
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler a imagem.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Imagem inválida.'));
      img.onload = () => {
        const side = Math.min(img.naturalWidth || img.width, img.naturalHeight || img.height);
        const sx = Math.max(0, ((img.naturalWidth || img.width) - side) / 2);
        const sy = Math.max(0, ((img.naturalHeight || img.height) - side) / 2);
        const canvas = document.createElement('canvas');
        canvas.width = side; canvas.height = side;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, sx, sy, side, side, 0, 0, side, side);
        const mime = /^image\/(png|webp|jpeg)$/.test(file.type) ? file.type : 'image/jpeg';
        resolve(canvas.toDataURL(mime, .94));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
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


const THEME_KEY = 'treinoLiveThemeV2';
function currentTheme() { return document.documentElement.dataset.theme || 'dark'; }
function applyTheme(theme, persistChoice = true) {
  const next = theme === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  document.body?.setAttribute('data-theme', next);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', next === 'light' ? '#F5F6F8' : '#0B0D10');
  if (persistChoice) localStorage.setItem(THEME_KEY, next);
  syncThemeToggle();
}
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved === 'light' ? 'light' : 'dark', false);
}
function toggleTheme() { applyTheme(currentTheme() === 'dark' ? 'light' : 'dark'); }
function syncThemeToggle() {
  const btn = $('#themeToggle'); if (!btn) return;
  const light = currentTheme() === 'light';
  btn.innerHTML = light ? icons.moon : icons.sun;
  btn.setAttribute('aria-label', light ? 'Ativar modo escuro' : 'Ativar modo claro');
  btn.title = light ? 'Modo escuro' : 'Modo claro';
}
function compactNumber(n) {
  n = Number(n) || 0;
  if (n >= 1_000_000) return `${(n/1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace('.',',')} mi`;
  if (n >= 1000) return `${(n/1000).toFixed(n >= 10_000 ? 0 : 1).replace('.',',')} mil`;
  return String(round(n));
}
function dateShort(ts) {
  const d = new Date(ts); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
}
function weekdayShort(ts) {
  return new Date(ts).toLocaleDateString('pt-BR',{weekday:'short'}).replace('.','').slice(0,3);
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
  clean.appliedImports = Array.isArray(raw.appliedImports) ? raw.appliedImports.map(String) : [];
  clean.trainer = { name: String(raw.trainer?.name || 'Gabriel').trim() || 'Gabriel' };
  clean.students = Array.isArray(raw.students) ? raw.students.map(s => ({
    id: String(s.id || uid('student')),
    name: String(s.name || 'Aluno').trim(),
    goal: String(s.goal || ''),
    modality: String(s.modality || 'Presencial'),
    paired: s.paired === true,
    notes: String(s.notes || ''),
    photoDataUrl: String(s.photoDataUrl || ''),
    defaultRestSec: clamp(parseInteger(s.defaultRestSec) || 120, 60, 180),
    defaultSets: clamp(parseInteger(s.defaultSets) || 3, 1, 50),
    defaultTargetReps: String(s.defaultTargetReps || '8–12'),
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
      note: String(pe.note || ''),
      referenceWeight: pe.referenceWeight==null || pe.referenceWeight==='' ? null : Math.max(0,parseDecimal(pe.referenceWeight))
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
        targetReps: String(ex.targetReps || ''),
        adjustmentSummary: String(ex.adjustmentSummary || ''),
        sourceExerciseId: String(ex.sourceExerciseId || ex.exerciseId || ''),
        programIndex: Number.isInteger(ex.programIndex)?ex.programIndex:null,
        prescribedSets: parseInteger(ex.prescribedSets)||null,
        sets: Array.isArray(ex.sets) ? ex.sets.map(st => ({
          weight: parseDecimal(st.weight ?? st.kg),
          reps: parseInteger(st.reps),
          rpe: st.rpe==null || st.rpe==='' ? null : clamp(parseDecimal(st.rpe),1,10),
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
    goal: '', notes: '', photoDataUrl:'', defaultRestSec:120, defaultSets:3, defaultTargetReps:'8–12', createdAt: Date.now()
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

function setHeader({ eyebrow='TREINO', title='', back=null, action='more', actionFn=null }) {
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
  const themeBtn = $('#themeToggle');
  if (themeBtn) themeBtn.classList.toggle('is-hidden', state.route !== 'home');
  syncThemeToggle();
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
  const latest = db.sessions.slice().sort((a,b)=>sessionTimestamp(b)-sessionTimestamp(a)).slice(0,4);
  const top = findTopImprovementAcrossStudents('90d');
  setHeader({ title:'Início', action:'more', actionFn:openSettingsMenu });
  main.innerHTML = `
    <section class="screen">
      <div class="hero home-hero">
        <div><span class="hero-kicker">PERSONAL TRAINER</span><h1>${greeting}, ${esc(db.trainer.name.split(' ')[0] || 'Professor')}</h1></div>
        <p>Controle a sessão, acompanhe as últimas cargas e enxergue a evolução sem perder tempo durante o treino.</p>
      </div>
      <div class="home-start-wrap">
        <button class="home-start-card" id="homeQuickStart" type="button">
          <span class="home-start-icon">${icons.dumbbell}</span>
          <span class="home-start-copy"><small>PRÓXIMA SESSÃO</small><strong>Iniciar treino</strong><em>Escolha o aluno e a ficha</em></span>
          <span class="home-start-arrow">${chev()}</span>
        </button>
      </div>
      <div class="section home-metrics" style="margin-top:18px">
        <div class="grid-2">
          <div class="metric-card"><div><small>Alunos</small><strong>${db.students.length}</strong></div><p>cadastrados no app</p></div>
          <div class="metric-card"><div><small>Treinos · 7 dias</small><strong>${dash.sessions.length}</strong></div><p>${dash.active} aluno${dash.active===1?' ativo':'s ativos'}</p></div>
          <div class="metric-card"><div><small>Séries · 7 dias</small><strong>${dash.sets}</strong></div><p>séries concluídas</p></div>
          <div class="metric-card highlight"><div><small>Maior evolução</small><strong>${top ? esc(top.student.name.split(' ')[0]) : '—'}</strong></div><p>${top ? `${esc(top.exerciseName)} · +${round(top.deltaKg)} kg` : 'precisa de mais histórico'}</p></div>
        </div>
      </div>
      <div class="section home-recent-section">
        <div class="section-title"><h2>Últimos treinos</h2><span>${latest.length}</span></div>
        <div id="homeLatest">
          ${latest.length ? latest.map(recentSessionCardHtml).join('') : emptyHtml('Ainda não há treinos registrados.','Seu histórico aparecerá aqui depois da primeira sessão.')}
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
        <div class="section-title"><h2>Leitura rápida</h2><span>90 dias</span></div>
        ${homeInsightsHtml()}
      </div>
    </section>`;
  $('#homeQuickStart')?.addEventListener('click', openQuickStart);
  $('[data-quick="student"]')?.addEventListener('click', () => openStudentForm());
  $('[data-quick="exercise"]')?.addEventListener('click', () => openExerciseForm());
  $$('[data-session-student]', main).forEach(el => el.onclick = () => navigate('student', { studentId:el.dataset.sessionStudent }));
}

function openQuickStart(){
  if(live)return navigate('workout');
  const eligible=db.students
    .map(st=>({st,programs:programsForStudent(st.id)}))
    .filter(x=>x.programs.length)
    .sort((a,b)=>a.st.name.localeCompare(b.st.name,'pt-BR'));
  if(!eligible.length){
    if(!db.students.length)return openStudentForm();
    return toast('Crie uma ficha de treino para um aluno antes de iniciar.');
  }
  openModal(`<h2>Iniciar treino</h2><p class="modal-sub">Escolha o aluno. Na próxima etapa você seleciona a ficha.</p><div class="choice-list quick-start-list">${eligible.map(({st,programs})=>`<button class="choice quick-start-student" type="button" data-quick-start-student="${esc(st.id)}">${avatarHtml(st)}<div class="row-main"><strong>${esc(st.name)}</strong><small>${programs.length} ficha${programs.length===1?'':'s'} disponível${programs.length===1?'':'eis'}</small></div>${chev()}</button>`).join('')}</div><div class="modal-actions"><button class="btn btn-secondary" id="quickStartCancel" type="button">Cancelar</button></div>`);
  $('#quickStartCancel').onclick=closeModal;
  $$('[data-quick-start-student]',$('#modal')).forEach(btn=>btn.onclick=()=>{
    const st=studentById(btn.dataset.quickStartStudent);if(!st)return;
    const programs=programsForStudent(st.id);
    openModal(`<h2>${esc(st.name)}</h2><p class="modal-sub">Qual treino será realizado agora?</p><div class="choice-list">${programs.map(p=>`<button class="choice" type="button" data-quick-start-program="${esc(p.id)}"><div class="row-main"><strong>${esc(p.name)}</strong><small>${p.exercises.length} exercícios · ${p.exercises.reduce((n,e)=>n+e.sets,0)} séries</small></div>${chev()}</button>`).join('')}</div><div class="modal-actions"><button class="btn btn-secondary" id="quickStartBack" type="button">Voltar</button></div>`);
    $('#quickStartBack').onclick=openQuickStart;
    $$('[data-quick-start-program]',$('#modal')).forEach(pbtn=>pbtn.onclick=()=>{closeModal();prepareWorkout([{studentId:st.id,programId:pbtn.dataset.quickStartProgram}]);});
  });
}

function recentSessionCardHtml(session) {
  const first = session.participants[0];
  const names = session.participants.map(p => studentById(p.studentId)?.name || 'Aluno').join(' + ');
  const programs = session.participants.map(p => p.programName || 'Treino').join(' + ');
  return `<button class="recent-session-card" type="button" data-session-student="${esc(first?.studentId || '')}">
    <div class="recent-session-top">
      ${session.participants.length===1?avatarHtml(studentById(first?.studentId)):`<div class="avatar round">${esc(initials(names))}</div>`}
      <div class="row-main"><strong>${esc(names)}</strong><small>${esc(programs)} · ${fmtDate(session.endedAt)}</small></div>
      ${chev()}
    </div>
    <div class="recent-session-stats">
      <div><small>Volume</small><strong>${kgText(sessionVolume(session))}</strong></div>
      <div><small>Séries</small><strong>${sessionSetCount(session)}</strong></div>
      <div><small>Duração</small><strong>${fmtClock(session.durationSec || 0)}</strong></div>
    </div>
  </button>`;
}

function sessionRowHtml(session) {
  const first = session.participants[0];
  const student = studentById(first?.studentId);
  const names = session.participants.map(p => studentById(p.studentId)?.name || 'Aluno').join(' + ');
  return `<button class="row-card" type="button" data-session-student="${esc(first?.studentId || '')}">
    ${session.participants.length===1?avatarHtml(student):`<div class="avatar round">${esc(initials(names))}</div>`}
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
    ${avatarHtml(student)}
    <div class="row-main"><strong>${esc(student.name)}</strong><small>${esc(student.modality||'Presencial')}${student.paired?' · Dupla':''} · ${programs} treino${programs===1?'':'s'} · ${last ? `última sessão ${daysAgo(sessionTimestamp(last))}` : 'sem sessões'}</small></div>
    ${chev()}
  </button>`;
}

function openStudentForm(studentId = null) {
  const existing = studentId ? studentById(studentId) : null;
  let photoDataUrl = existing?.photoDataUrl || '';
  openModal(`
    <h2>${existing?'Editar aluno':'Novo aluno'}</h2>
    
    <div class="form-row">
      <label class="form-label">Foto do aluno</label>
      <div class="student-photo-pick">
        <div id="studentPhotoPreview">${photoDataUrl?`<div class="avatar round"><img src="${esc(photoDataUrl)}" alt=""></div>`:`<div class="avatar round">${esc(initials(existing?.name || 'Aluno'))}</div>`}</div>
        <div class="student-photo-actions">
          <button class="btn btn-secondary btn-sm" id="studentPhotoChoose" type="button">${photoDataUrl?'Trocar foto':'Adicionar foto'}</button>
          ${photoDataUrl?'<button class="btn btn-ghost btn-sm" id="studentPhotoRemove" type="button">Remover</button>':''}
        </div>
      </div>
      <input id="studentPhotoFile" class="is-hidden" type="file" accept="image/*">
      
    </div>
    <div class="form-row"><label class="form-label">Nome</label><input id="studentName" class="form-input" value="${esc(existing?.name || '')}"></div>
    <div class="form-row"><label class="form-label" for="studentModality">Modalidade</label><select id="studentModality" class="form-select">${['Presencial','Online','Ficha de Treinamento'].map(m=>`<option ${m===(existing?.modality||'Presencial')?'selected':''}>${m}</option>`).join('')}</select></div>
    <div class="form-row"><label class="form-label" for="studentPaired">Dupla</label><select id="studentPaired" class="form-select"><option value="no">Não</option><option value="yes" ${existing?.paired?'selected':''}>Sim</option></select></div>
    <div class="form-row"><label class="form-label">Objetivo</label><input id="studentGoal" class="form-input" value="${esc(existing?.goal || '')}"></div>
    <div class="form-row"><label class="form-label">Observações</label><textarea id="studentNotes" class="form-textarea">${esc(existing?.notes || '')}</textarea></div>
    <div class="modal-actions"><button class="btn btn-secondary" id="studentCancel">Cancelar</button><button class="btn btn-primary" id="studentSave">${existing?'Salvar':'Criar aluno'}</button></div>
  `);
  const refreshPhotoPreview = () => {
    const name = $('#studentName')?.value.trim() || existing?.name || 'Aluno';
    $('#studentPhotoPreview').innerHTML = photoDataUrl
      ? `<div class="avatar round"><img src="${esc(photoDataUrl)}" alt=""></div>`
      : `<div class="avatar round">${esc(initials(name))}</div>`;
  };
  $('#studentCancel').onclick = closeModal;
  $('#studentPhotoChoose').onclick = () => $('#studentPhotoFile').click();
  $('#studentPhotoFile').onchange = async e => {
    const file = e.target.files?.[0]; e.target.value='';
    if (!file) return;
    try {
      photoDataUrl = await squareImageDataUrl(file);
      refreshPhotoPreview();
      toast('Foto pronta para salvar.');
    } catch (err) { toast('Não foi possível usar esta imagem.'); }
  };
  if ($('#studentPhotoRemove')) $('#studentPhotoRemove').onclick = () => { photoDataUrl=''; refreshPhotoPreview(); $('#studentPhotoRemove').classList.add('is-hidden'); };
  $('#studentName').oninput = () => { if (!photoDataUrl) refreshPhotoPreview(); };
  $('#studentSave').onclick = () => {
    const name = $('#studentName').value.trim();
    if (!name) return toast('Digite o nome do aluno.');
    if (existing) {
      existing.name = name;
      existing.modality = $('#studentModality').value;existing.paired = $('#studentPaired').value==='yes';
      existing.goal = $('#studentGoal').value.trim();
      existing.notes = $('#studentNotes').value.trim();
      existing.photoDataUrl = photoDataUrl;
    } else {
      const st = { id:uid('student'), name, modality:$('#studentModality').value,paired:$('#studentPaired').value==='yes', goal:$('#studentGoal').value.trim(), notes:$('#studentNotes').value.trim(), photoDataUrl, defaultRestSec:120, defaultSets:3, defaultTargetReps:'8–12', createdAt:Date.now() };
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
        ${avatarHtml(st)}
        <div class="row-main"><strong>${esc(st.name)}</strong><small>${esc(st.modality||'Presencial')}${st.paired?' · Dupla':''}${st.goal?` · ${esc(st.goal)}`:''} · ${totalSessions} ${totalSessions===1?'sessão':'sessões'}</small></div>
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
  $$('[data-program-view]', main).forEach(btn => btn.onclick = () => openProgramView(btn.dataset.programView));
}

function programCardHtml(program) {
  const items = program.exercises.map(pe => ({pe, ex:exerciseById(pe.exerciseId)})).filter(x=>x.ex);
  const sets = program.exercises.reduce((sum,pe)=>sum+pe.sets,0);
  const dateBits = [];
  if (program.startDate) dateBits.push(`início ${fmtDate(program.startDate)}`);
  if (program.endDate) dateBits.push(`término ${fmtDate(program.endDate)}`);
  return `<div class="workout-card">
    <div class="workout-summary-toggle"><div><strong>${esc(program.name)}</strong><div class="workout-meta">${items.length} exercícios · ${sets} séries</div>${dateBits.length?`<div class="workout-date">${dateBits.join(' · ')}</div>`:''}</div></div>
    <div class="workout-actions"><button class="btn btn-secondary btn-sm" type="button" data-program-view="${esc(program.id)}">${eyeIcon()} Ver treino</button><button class="btn btn-secondary btn-sm" type="button" data-program-edit="${esc(program.id)}">Editar</button><button class="btn btn-primary btn-sm" type="button" data-program-start="${esc(program.id)}">Iniciar treino</button></div>
  </div>`;
}


function eyeIcon(){return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';}
function lastProgramExercise(studentId,programId,pe,index){
  for(const session of sessionsForStudent(studentId).slice().reverse()){
    const p=participantForStudent(session,studentId);
    if(p.programId!==programId)continue;
    const found=p.exercises.find(ex=>ex.sourceExerciseId===pe.exerciseId && ex.programIndex===index)
      || p.exercises.find(ex=>ex.exerciseId===pe.exerciseId);
    if(found)return found;
  }
  return null;
}
function previousExerciseHtml(previous,pe){
  if(!previous)return '';
  const changes=previous.adjustmentSummary?[previous.adjustmentSummary]:[];
  if(previous.exerciseId!==pe.exerciseId)changes.push(`Exercício: ${previous.name}`);
  const count=previous.prescribedSets??previous.sets.length;
  if(count!==pe.sets)changes.push(`${count} séries`);
  if(previous.targetReps && previous.targetReps!==pe.targetReps)changes.push(`${previous.targetReps} reps`);
  if(previous.restSec!==pe.restSec)changes.push(`Descanso ${fmtRest(previous.restSec)}`);
  return `${changes.length?`<div class="previous-note"><small>Última execução · ajustes</small><div>${esc(changes.join(' · '))}</div></div>`:''}${previous.note?`<div class="previous-note"><small>Observação anterior</small><div>${esc(previous.note)}</div></div>`:''}`;
}
function openProgramView(programId){
  const p=programById(programId);if(!p)return;
  const st=studentById(p.studentId);
  openModal(`<div class="builder-head"><button class="icon-btn" id="viewClose" aria-label="Voltar">${icons.back}</button><h2>${esc(p.name)}</h2></div><div class="builder-body"><p class="modal-sub">${esc(st?.name||'')} · ${p.exercises.length} exercícios</p>${p.exercises.map((pe,i)=>{
    const ex=exerciseById(pe.exerciseId),prev=getLastExercisePerformance(p.studentId,pe.exerciseId);
    return `<div class="view-exercise"><small>${String(i+1).padStart(2,'0')}</small><h3>${esc(ex?.name||'Exercício indisponível')}</h3><p>${pe.sets} séries · ${esc(pe.targetReps||'—')} reps · ${fmtRest(pe.restSec)} descanso</p>${pe.referenceWeight!=null?`<p><strong>Carga de referência: ${parseDecimal(pe.referenceWeight)} kg</strong></p>`:''}${pe.note?`<div class="previous-note">${esc(pe.note)}</div>`:''}${previousExerciseHtml(lastProgramExercise(p.studentId,p.id,pe,i),pe)}<div class="view-loads"><small>Anterior</small>${prev?completedSets(prev).map((set,j)=>`<span>S${j+1} · <b>${parseDecimal(set.weight)} kg × ${parseInteger(set.reps)}</b></span>`).join(''):'<span>Sem registro</span>'}</div></div>`;
  }).join('')}</div><div class="builder-foot"><button class="btn btn-primary btn-block" id="viewCopy">Copiar para outro aluno</button></div>`,{fullscreen:true});
  $('#viewClose').onclick=closeModal;
  $('#viewCopy').onclick=()=>openProgramCopy(programId);
}
function openProgramCopy(programId){
  const p=programById(programId);if(!p)return;
  const students=db.students.filter(st=>st.id!==p.studentId).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
  openModal(`<h2>Copiar treino</h2><p class="modal-sub">${esc(p.name)}</p>${students.length?`<div class="form-row"><label class="form-label" for="copyStudent">Aluno</label><select id="copyStudent" class="form-select"><option value="">Selecionar aluno</option>${students.map(st=>`<option value="${esc(st.id)}">${esc(st.name)}</option>`).join('')}</select></div><div class="form-row"><label class="form-label" for="copyName">Nome do treino</label><input id="copyName" class="form-input" value="${esc(p.name)}"></div>`:emptyHtml('Nenhum outro aluno cadastrado.')}<div class="modal-actions"><button class="btn btn-secondary" id="copyCancel">Voltar</button>${students.length?'<button class="btn btn-primary" id="copySave">Copiar treino</button>':''}</div>`);
  $('#copyCancel').onclick=()=>openProgramView(programId);
  if($('#copySave'))$('#copySave').onclick=()=>{
    const target=studentById($('#copyStudent').value);if(!target||target.id===p.studentId)return toast('Selecione o aluno.');
    const name=$('#copyName').value.trim();if(!name)return toast('Informe o nome do treino.');
    const copy={...JSON.parse(JSON.stringify(p)),id:uid('program'),studentId:target.id,name,createdAt:Date.now(),updatedAt:Date.now()};
    db.programs.push(copy);persist();closeModal();navigate('student',{studentId:target.id});toast('Treino copiado.');
  };
}

function openStudentActions(studentId) {
  const st = studentById(studentId); if (!st) return;
  openModal(`
    <h2>${esc(st.name)}</h2><p class="modal-sub">Ações do aluno</p>
    <div class="action-list">
      <button class="action-item" data-action="edit"><span class="action-icon">${icons.edit}</span><div class="row-main"><strong>Editar aluno</strong></div>${chev()}</button>
      <button class="action-item" data-action="evo"><span class="action-icon">${icons.chart}</span><div class="row-main"><strong>Ver evolução</strong></div>${chev()}</button>
      <button class="action-item" data-action="history"><span class="action-icon">${icons.history}</span><div class="row-main"><strong>Histórico completo</strong></div>${chev()}</button>
      <button class="action-item student-print-action" data-action="pdf"><span class="action-icon">${icons.download}</span><div class="row-main"><strong>Imprimir / gerar PDF</strong><small>Escolha um ou mais treinos deste aluno</small></div>${chev()}</button>
      <button class="action-item danger" data-action="delete"><span class="action-icon">${icons.trash}</span><div class="row-main"><strong>Excluir aluno</strong><small>Treinos e histórico deste aluno serão removidos</small></div></button>
    </div>`);
  $$('[data-action]', $('#modal')).forEach(btn => btn.onclick = () => {
    const action = btn.dataset.action; closeModal();
    if (action === 'edit') setTimeout(()=>openStudentForm(st.id),80);
    if (action === 'evo') navigate('evolution-detail',{evolutionStudentId:st.id});
    if (action === 'history') navigate('student-history',{historyStudentId:st.id});
    if (action === 'pdf') setTimeout(()=>openStudentPrintSelector(st.id),80);
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
  $$('[data-history-delete]',main).forEach(btn=>btn.onclick=e=>{e.preventDefault();e.stopPropagation();confirmDeleteHistorySession(btn.dataset.historyDelete,btn.dataset.historyStudent);});
}

function historySessionHtml(session, studentId, expanded=true) {
  const p = participantForStudent(session, studentId); if (!p) return '';
  const vol = participantVolume(p), sets = participantSetCount(p);
  return `<div class="history-session">
    <div class="history-session-head">
      <div><strong>${esc(p.programName || 'Treino')}</strong><small>${fmtDate(session.endedAt)} · ${fmtClock(session.durationSec || 0)} · ${sets} séries</small></div>
      <div class="history-session-side"><span>${kgText(vol)}</span>${expanded?`<button class="history-delete-btn" type="button" data-history-delete="${esc(session.id)}" data-history-student="${esc(studentId)}" aria-label="Apagar este treino do histórico">${icons.trash}</button>`:''}</div>
    </div>
    ${expanded ? (p.exercises || []).map(ex => `<button class="history-exercise" type="button" data-ex-history data-ex-history-student="${esc(studentId)}" data-ex-history-id="${esc(ex.exerciseId)}"><div><strong>${esc(ex.name)}</strong><small>${completedSets(ex).map((s,i)=>`S${i+1}: ${parseDecimal(s.weight)} kg × ${parseInteger(s.reps)}${s.rpe?` · RPE ${s.rpe}`:''}`).join(' · ') || 'Sem séries concluídas'}</small></div>${icons.history}</button>`).join('') : ''}
    ${p.feedback ? `<div class="feedback-box"><b>Observação do treinador:</b> ${esc(p.feedback)}</div>` : ''}
  </div>`;
}

/* ----------------------------- exercises ----------------------------- */

function renderExercises(main) {
  setHeader({ title:'Exercícios', action:'plus', actionFn:()=>openExerciseForm() });
  const q = state.exerciseSearch.trim().toLowerCase();
  const exercises = db.exercises.slice().sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).filter(e=>e.name.toLowerCase().includes(q));
  main.innerHTML = `
    <section class="screen">
      <div class="hero"><h1>Biblioteca</h1></div>
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
    
    <div class="form-row"><label class="form-label">Nome</label><input id="exerciseName" class="form-input" value="${esc(existing?.name || '')}"></div>
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
    defaultRestSec:clamp(parseInteger(student.defaultRestSec)||120,60,180),
    defaultSets:clamp(parseInteger(student.defaultSets)||3,1,50),
    defaultTargetReps:String(student.defaultTargetReps||'8–12'),
    exercises:(existing?.exercises||[]).map(pe=>({...pe,targetReps:String(pe.targetReps||student.defaultTargetReps||'8–12')}))
  };
  const renderBuilder = () => {
    openModal(`
      <div class="builder-head"><button class="icon-btn" id="builderClose">${icons.back}</button><h2>${existing?'Editar treino':'Criar treino'}</h2></div>
      <div class="builder-body">
        <button class="builder-quick-create" id="builderQuickCreate" type="button">${icons.plus}<div><strong>Criar exercício</strong></div>${chev()}</button>
        <div class="form-row"><label class="form-label">Nome do treino</label><input id="programName" class="form-input" value="${esc(draft.name)}"></div>
        <div class="form-row">
          <label class="form-label">Padrões para os exercícios</label>
          <div class="builder-default-grid">
            <div><span class="control-label">Séries</span><div class="stepper"><button type="button" id="defaultSetsMinus">−</button><span>${draft.defaultSets}</span><button type="button" id="defaultSetsPlus">+</button></div></div>
            <div><span class="control-label">Faixa de repetições</span><input id="builderDefaultReps" class="form-input" value="${esc(draft.defaultTargetReps)}"></div>
            <div><span class="control-label">Descanso</span><button class="select-pill compact" id="builderDefaultRest" type="button"><span>Intervalo</span><strong>${fmtRest(draft.defaultRestSec)}</strong>${chev()}</button></div>
          </div>
          ${draft.exercises.length?'<button class="btn btn-ghost btn-sm builder-apply-all" id="applyBuilderDefaults" type="button">Aplicar séries, repetições e descanso a todos</button>':''}
          
        </div>
        <div class="form-grid"><div class="form-row"><label class="form-label">Início opcional</label><input id="programStart" type="date" class="form-input" value="${esc(draft.startDate)}"></div><div class="form-row"><label class="form-label">Término opcional</label><input id="programEnd" type="date" class="form-input" value="${esc(draft.endDate)}"></div></div>
        <div class="section-title builder-section-title"><h2>Exercícios</h2><span>${draft.exercises.length}</span></div>
        <div id="builderExercises">${draft.exercises.map((pe,i)=>builderExerciseHtml(pe,i,draft.exercises.length)).join('')}</div>
        <button class="add-dashed" id="builderAddExercise" type="button">+ Adicionar exercício da biblioteca</button>
      </div>
      <div class="builder-foot"><div class="modal-actions" style="margin-top:0"><button class="btn btn-secondary" id="builderCancel">Cancelar</button><button class="btn btn-primary" id="builderSave">${existing?'Salvar alterações':'Criar treino'}</button></div></div>
    `,{fullscreen:true,onClose:()=>{}});
    const syncFields=()=>{draft.name=$('#programName')?.value||draft.name;draft.startDate=$('#programStart')?.value||'';draft.endDate=$('#programEnd')?.value||'';draft.defaultTargetReps=$('#builderDefaultReps')?.value||draft.defaultTargetReps;};
    const addPickedExercise=(exId)=>{draft.exercises.push({exerciseId:exId,sets:draft.defaultSets,restSec:draft.defaultRestSec,targetReps:draft.defaultTargetReps,note:''});renderBuilder();};
    $('#builderClose').onclick=closeModal; $('#builderCancel').onclick=closeModal;
    $('#programName').oninput=e=>draft.name=e.target.value; $('#programStart').onchange=e=>draft.startDate=e.target.value; $('#programEnd').onchange=e=>draft.endDate=e.target.value;
    $('#builderQuickCreate').onclick=()=>{syncFields();openExerciseForm(null,id=>addPickedExercise(id),renderBuilder);};
    $('#builderAddExercise').onclick=()=>{syncFields();openExercisePicker(addPickedExercise, renderBuilder);};
    $('#builderDefaultReps').oninput=e=>draft.defaultTargetReps=e.target.value;
    $('#defaultSetsMinus').onclick=()=>{syncFields();draft.defaultSets=Math.max(1,draft.defaultSets-1);renderBuilder();};
    $('#defaultSetsPlus').onclick=()=>{syncFields();draft.defaultSets=Math.min(50,draft.defaultSets+1);renderBuilder();};
    $('#builderDefaultRest').onclick=()=>{syncFields();openRestPicker(draft.defaultRestSec,sec=>{draft.defaultRestSec=sec;student.defaultRestSec=sec;persist();renderBuilder();},renderBuilder,'Descanso padrão');};
    if($('#applyBuilderDefaults'))$('#applyBuilderDefaults').onclick=()=>{syncFields();if(!String(draft.defaultTargetReps).trim())return toast('Defina a faixa de repetições padrão.');draft.exercises.forEach(pe=>{pe.sets=draft.defaultSets;pe.restSec=draft.defaultRestSec;pe.targetReps=draft.defaultTargetReps.trim();});renderBuilder();toast('Padrões aplicados a todos os exercícios.');};
    $$('[data-builder-remove]').forEach(btn=>btn.onclick=()=>{syncFields();draft.exercises.splice(+btn.dataset.builderRemove,1);renderBuilder();});
    $$('[data-builder-up]').forEach(btn=>btn.onclick=()=>{syncFields();const i=+btn.dataset.builderUp;if(i<=0)return;[draft.exercises[i-1],draft.exercises[i]]=[draft.exercises[i],draft.exercises[i-1]];renderBuilder();});
    $$('[data-builder-down]').forEach(btn=>btn.onclick=()=>{syncFields();const i=+btn.dataset.builderDown;if(i>=draft.exercises.length-1)return;[draft.exercises[i+1],draft.exercises[i]]=[draft.exercises[i],draft.exercises[i+1]];renderBuilder();});
    $$('[data-builder-minus]').forEach(btn=>btn.onclick=()=>{syncFields();const pe=draft.exercises[+btn.dataset.builderMinus];pe.sets=Math.max(1,pe.sets-1);renderBuilder();});
    $$('[data-builder-plus]').forEach(btn=>btn.onclick=()=>{syncFields();draft.exercises[+btn.dataset.builderPlus].sets=Math.min(50,peNumber(draft.exercises[+btn.dataset.builderPlus].sets)+1);renderBuilder();});
    $$('[data-builder-rest]').forEach(btn=>btn.onclick=()=>{syncFields();const i=+btn.dataset.builderRest;openRestPicker(draft.exercises[i].restSec,sec=>{draft.exercises[i].restSec=sec;renderBuilder();},renderBuilder,'Descanso do exercício');});
    $$('[data-builder-weight]').forEach(inp=>inp.oninput=()=>{draft.exercises[+inp.dataset.builderWeight].referenceWeight=inp.value.trim()===''?null:Math.max(0,parseDecimal(inp.value));});
    $$('[data-builder-reps]').forEach(inp=>inp.oninput=()=>{draft.exercises[+inp.dataset.builderReps].targetReps=inp.value;});
    $$('[data-builder-exercise]').forEach(btn=>btn.onclick=()=>{syncFields();const idx=+btn.dataset.builderExercise;openExercisePicker(exId=>{draft.exercises[idx].exerciseId=exId;renderBuilder();}, renderBuilder);});
    $('#builderSave').onclick=()=>{
      syncFields();
      const name=draft.name.trim()||'Novo treino';
      if(!draft.exercises.length)return toast('Adicione pelo menos um exercício.');
      if(draft.exercises.some(pe=>!exerciseById(pe.exerciseId)))return toast('Há um exercício inválido no treino.');
      if(draft.exercises.some(pe=>!String(pe.targetReps||'').trim()))return toast('Informe a faixa de repetições de todos os exercícios.');
      student.defaultRestSec=draft.defaultRestSec;
      student.defaultSets=draft.defaultSets;
      student.defaultTargetReps=String(draft.defaultTargetReps||'8–12').trim()||'8–12';
      if(existing){existing.name=name;existing.startDate=draft.startDate;existing.endDate=draft.endDate;existing.exercises=draft.exercises.map(pe=>({...pe,targetReps:String(pe.targetReps).trim()}));existing.updatedAt=Date.now();}
      else db.programs.push({id:uid('program'),studentId,name,startDate:draft.startDate,endDate:draft.endDate,exercises:draft.exercises.map(pe=>({...pe,targetReps:String(pe.targetReps).trim()})),createdAt:Date.now(),updatedAt:Date.now()});
      persist();closeModal();navigate('student',{studentId});toast(existing?'Treino atualizado.':'Treino criado.');
    };
  };
  renderBuilder();
}

function peNumber(n){return Math.max(1,parseInteger(n)||1);}
function builderExerciseHtml(pe,index,total=1){
  const ex=exerciseById(pe.exerciseId);
  return `<div class="builder-exercise">
    <div class="builder-exercise-head">
      <div class="builder-order-controls">
        <button type="button" data-builder-up="${index}" ${index===0?'disabled':''} aria-label="Mover exercício para cima">↑</button>
        <button type="button" data-builder-down="${index}" ${index===total-1?'disabled':''} aria-label="Mover exercício para baixo">↓</button>
      </div>
      <button class="builder-exercise-name" type="button" data-builder-exercise="${index}">${esc(ex?.name||'Selecionar exercício')}</button>
      <button class="builder-remove" type="button" data-builder-remove="${index}" aria-label="Remover exercício">×</button>
    </div>
    ${ex?`<div class="tag-list builder-tags">${ex.muscleGroups.map(g=>`<span class="tag">${esc(g)}</span>`).join('')}</div>`:''}
    <div class="builder-controls">
      <div><span class="control-label">Séries</span><div class="stepper"><button type="button" data-builder-minus="${index}">−</button><span>${pe.sets}</span><button type="button" data-builder-plus="${index}">+</button></div></div>
      <div><span class="control-label">Descanso</span><button class="select-pill compact" type="button" data-builder-rest="${index}"><span>Intervalo</span><strong>${fmtRest(pe.restSec)}</strong>${chev()}</button></div>
    </div>
    <div class="builder-reps-field"><span class="control-label">Carga de referência (kg)</span><input class="form-input" inputmode="decimal" aria-label="Carga de referência em kg" data-builder-weight="${index}" value="${esc(pe.referenceWeight??'')}"></div>
    <div class="builder-reps-field"><span class="control-label">Faixa de repetições</span><input class="form-input" data-builder-reps="${index}" value="${esc(pe.targetReps||'')}"></div>
  </div>`;
}

function openExercisePicker(onPick, onCancel = null) {
  let activeGroup='all';
  const picker=()=>{
    const list=db.exercises.slice().sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
    openModal(`<h2>Selecionar exercício</h2>
      <button class="picker-create-top" id="pickerNew" type="button">${icons.plus}<div><strong>Criar exercício</strong><small>Adicionar rapidamente à biblioteca</small></div>${chev()}</button>
      <div class="picker-filter-row" id="pickerGroups">
        <button class="filter-chip ${activeGroup==='all'?'is-active':''}" type="button" data-picker-group="all">Todos</button>
        ${MUSCLE_GROUPS.map(g=>`<button class="filter-chip ${activeGroup===g?'is-active':''}" type="button" data-picker-group="${esc(g)}">${esc(g)}</button>`).join('')}
      </div>
      <div class="toolbar picker-toolbar"><div class="search-field">${icons.search}<input id="pickerSearch" placeholder="Buscar exercício"></div></div>
      <div id="pickerList" class="choice-list"></div>
      <div class="modal-actions"><button class="btn btn-secondary" id="pickerCancel">Cancelar</button></div>`);
    const renderList=()=>{
      const q=($('#pickerSearch')?.value||'').toLowerCase();
      const arr=list.filter(e=>e.name.toLowerCase().includes(q) && (activeGroup==='all'||e.muscleGroups.includes(activeGroup)));
      $('#pickerList').innerHTML=arr.map(e=>`<button class="choice" type="button" data-picker-id="${esc(e.id)}"><div class="row-main"><strong>${esc(e.name)}</strong><small>${esc(e.muscleGroups.join(' · '))}</small></div>${chev()}</button>`).join('')||emptyHtml('Nenhum exercício encontrado.','Troque o filtro ou crie um novo exercício.');
      $$('[data-picker-id]', $('#pickerList')).forEach(btn=>btn.onclick=()=>{const id=btn.dataset.pickerId;closeModal();onPick(id);});
    };
    renderList();
    $('#pickerSearch').oninput=renderList;
    $$('[data-picker-group]', $('#pickerGroups')).forEach(btn=>btn.onclick=()=>{activeGroup=btn.dataset.pickerGroup;$$('[data-picker-group]', $('#pickerGroups')).forEach(x=>x.classList.toggle('is-active',x===btn));renderList();});
    $('#pickerCancel').onclick=()=>{closeModal(); if(onCancel)setTimeout(onCancel,0);};
    $('#pickerNew').onclick=()=>{closeModal();setTimeout(()=>openExerciseForm(null,id=>onPick(id),()=>{if(onCancel)onCancel();}),60);};
  };
  picker();
}

function openProgramActions(programId){
  const p=programById(programId);if(!p)return;
  openModal(`<h2>${esc(p.name)}</h2><p class="modal-sub">Ações do treino</p><div class="action-list">
    <button class="action-item" data-pa="edit"><span class="action-icon">${icons.edit}</span><div class="row-main"><strong>Editar treino</strong></div>${chev()}</button>
    <button class="action-item danger" data-pa="delete"><span class="action-icon">${icons.trash}</span><div class="row-main"><strong>Apagar treino</strong></div></button>
  </div>`);
  $$('[data-pa]').forEach(btn=>btn.onclick=()=>{const a=btn.dataset.pa;closeModal();if(a==='edit')setTimeout(()=>openProgramBuilder(p.studentId,p.id),60);if(a==='delete')setTimeout(()=>confirmDeleteProgram(p.id),60);});
}
function confirmDeleteProgram(programId){const p=programById(programId);if(!p)return;confirmModal(`Apagar ${p.name}?`,'O histórico já concluído será mantido, mas este treino deixará de aparecer no perfil.','Apagar treino',()=>{db.programs=db.programs.filter(x=>x.id!==p.id);persist();navigate('student',{studentId:p.studentId});toast('Treino apagado.');});}


function openRestPicker(selected,onPick,onCancel=null,title='Selecionar descanso'){
  const current=clamp(parseInteger(selected)||120,60,180);
  openModal(`<h2>${esc(title)}</h2><div class="rest-choice-grid">${REST_OPTIONS.map(sec=>`<button class="rest-choice ${sec===current?'is-selected':''}" type="button" data-rest-choice="${sec}"><small>DESCANSO</small><strong>${fmtRest(sec)}</strong></button>`).join('')}</div><div class="modal-actions"><button class="btn btn-secondary" id="restChoiceCancel">Cancelar</button></div>`);
  $$('[data-rest-choice]').forEach(btn=>btn.onclick=()=>{const sec=+btn.dataset.restChoice;closeModal();onPick(sec);});
  $('#restChoiceCancel').onclick=()=>{closeModal();if(onCancel)setTimeout(onCancel,0);};
}

function openEvolutionProgramPicker(studentId){
  const st=studentById(studentId);if(!st)return;
  const programs=programsForStudent(studentId);
  openModal(`<h2>Evolução do volume</h2><div class="choice-list">${programs.map(p=>`<button class="choice" type="button" data-evo-program="${esc(p.id)}"><div class="row-main"><strong>${esc(p.name)}</strong><small>${p.exercises.length} exercício${p.exercises.length===1?'':'s'}</small></div>${chev()}</button>`).join('')||emptyHtml('Nenhum treino cadastrado.','Crie uma ficha para este aluno primeiro.')}</div><div class="modal-actions"><button class="btn btn-secondary" id="evoProgramCancel">Cancelar</button></div>`);
  $$('[data-evo-program]').forEach(btn=>btn.onclick=()=>{state.evolutionProgramId=btn.dataset.evoProgram;closeModal();renderEvolutionDetail($('#main'),studentId);});
  $('#evoProgramCancel').onclick=closeModal;
}

function confirmDeleteHistorySession(sessionId,studentId){
  const session=db.sessions.find(s=>s.id===sessionId),st=studentById(studentId);if(!session||!st)return;
  confirmModal('Apagar este treino do histórico?',`O registro de ${st.name} será removido. Em treino em dupla, o histórico do outro aluno será preservado.`,'Apagar registro',()=>{
    const target=db.sessions.find(s=>s.id===sessionId);if(!target)return;
    target.participants=(target.participants||[]).filter(p=>p.studentId!==studentId);
    if(!target.participants.length)db.sessions=db.sessions.filter(s=>s.id!==sessionId);
    persist();renderStudentHistory($('#main'),studentId);toast('Treino removido do histórico.');
  });
}

function openStudentPrintSelector(studentId){
  const st=studentById(studentId);if(!st)return;
  const programs=programsForStudent(studentId);
  if(!programs.length)return toast('Este aluno ainda não possui treinos para imprimir.');
  const selected=new Set(programs.map(p=>p.id));
  const renderSelection=()=>{
    openModal(`<h2>Imprimir treinos</h2><p class="modal-sub">Selecione quais fichas de ${esc(st.name)} deseja incluir. Cada treino será organizado em sua própria folha A4.</p>
      <div class="print-select-toolbar"><span id="printSelectedCount">${selected.size} de ${programs.length} selecionado${selected.size===1?'':'s'}</span><button class="btn btn-ghost btn-sm" id="printToggleAll" type="button">${selected.size===programs.length?'Desmarcar todos':'Selecionar todos'}</button></div>
      <div class="print-select-list">${programs.map(p=>{const active=selected.has(p.id);const dateBits=[];if(p.startDate)dateBits.push(`Início ${fmtDate(p.startDate)}`);if(p.endDate)dateBits.push(`Término ${fmtDate(p.endDate)}`);return `<button class="print-select-item ${active?'is-selected':''}" type="button" data-print-program="${esc(p.id)}" aria-pressed="${active?'true':'false'}"><span class="print-select-check">${icons.check}</span><span class="print-select-copy"><strong>${esc(p.name)}</strong><small>${p.exercises.length} exercício${p.exercises.length===1?'':'s'}${dateBits.length?` · ${dateBits.join(' · ')}`:''}</small></span></button>`;}).join('')}</div>
      <div class="modal-actions"><button class="btn btn-secondary" id="printCancel" type="button">Cancelar</button><button class="btn btn-primary print-generate-btn" id="printGenerate" type="button">Gerar PDF / Imprimir</button></div>`);
    const sync=()=>{
      const count=$('#printSelectedCount');if(count)count.textContent=`${selected.size} de ${programs.length} selecionado${selected.size===1?'':'s'}`;
      const allBtn=$('#printToggleAll');if(allBtn)allBtn.textContent=selected.size===programs.length?'Desmarcar todos':'Selecionar todos';
      $$('[data-print-program]',$('#modal')).forEach(btn=>{const on=selected.has(btn.dataset.printProgram);btn.classList.toggle('is-selected',on);btn.setAttribute('aria-pressed',on?'true':'false');});
      const gen=$('#printGenerate');if(gen)gen.disabled=selected.size===0;
    };
    $$('[data-print-program]',$('#modal')).forEach(btn=>btn.onclick=()=>{const id=btn.dataset.printProgram;if(selected.has(id))selected.delete(id);else selected.add(id);sync();});
    $('#printToggleAll').onclick=()=>{if(selected.size===programs.length)selected.clear();else programs.forEach(p=>selected.add(p.id));sync();};
    $('#printCancel').onclick=closeModal;
    $('#printGenerate').onclick=()=>{if(!selected.size)return toast('Selecione pelo menos um treino.');const ids=programs.filter(p=>selected.has(p.id)).map(p=>p.id);closeModal();setTimeout(()=>generateStudentProgramsPDF(studentId,ids),80);};
    sync();
  };
  renderSelection();
}

function programPrintPageHtml(program,st){
  const rows=program.exercises.map((pe,i)=>{
    const ex=exerciseById(pe.exerciseId);if(!ex)return '';
    const entries=exerciseHistoryEntries(st.id,ex.id);
    const latest=entries[entries.length-1]||null;
    const sets=latest?completedSets(latest.exercise):[];
    const loads=sets.length?sets.map((s,si)=>`<span><b>S${si+1}</b> ${parseDecimal(s.weight)} kg × ${parseInteger(s.reps)}</span>`).join(''):'<span class="print-muted">Sem carga anterior</span>';
    return `<div class="print-exercise"><div class="print-index">${String(i+1).padStart(2,'0')}</div><div><strong>${esc(ex.name)}</strong><small>${esc(ex.muscleGroups.join(' · '))}</small><div class="print-prescription"><span><b>${pe.sets}</b> séries</span><span><b>${esc(pe.targetReps||'—')}</b> reps</span><span><b>${fmtRest(pe.restSec)}</b> descanso</span></div><div class="print-last"><small>ÚLTIMA EXECUÇÃO${latest?` · ${fmtDate(latest.session.endedAt)}`:''}</small>${loads}</div></div></div>`;
  }).join('');
  const useTwoCols=program.exercises.length>7;
  const compact=program.exercises.length>14;
  const dateBits=[];if(program.startDate)dateBits.push(`Início ${fmtDate(program.startDate)}`);if(program.endDate)dateBits.push(`Término ${fmtDate(program.endDate)}`);
  return `<section class="print-program-page${compact?' compact':''}"><h1>${esc(program.name)}</h1><div class="print-student">${esc(st.name)}</div>${dateBits.length?`<div class="print-meta">${dateBits.join(' · ')}</div>`:''}<div class="print-rule"></div><div class="print-exercises-grid ${useTwoCols?'two-col':''}">${rows}</div></section>`;
}

function generateStudentProgramsPDF(studentId,programIds){
  const st=studentById(studentId);if(!st)return;
  const ids=new Set(Array.isArray(programIds)?programIds:[]);
  const programs=programsForStudent(studentId).filter(p=>ids.has(p.id));
  if(!programs.length)return toast('Selecione pelo menos um treino para imprimir.');
  const area=$('#printArea');
  area.className='print-area';
  area.innerHTML=programs.map(p=>programPrintPageHtml(p,st)).join('');
  setTimeout(()=>window.print(),80);
}

function generateProgramPDF(programId){
  const program=programById(programId);if(!program)return;
  generateStudentProgramsPDF(program.studentId,[program.id]);
}



/* ----------------------------- pair setup ----------------------------- */

function openPairSetup(firstStudentId){
  const first=studentById(firstStudentId);if(!first)return;
  const firstPrograms=programsForStudent(first.id);
  const others=db.students.filter(s=>s.id!==first.id && programsForStudent(s.id).length);
  if(!firstPrograms.length)return toast('Crie um treino para este aluno primeiro.');
  if(!others.length)return toast('Cadastre outro aluno com treino montado para usar a dupla.');
  openModal(`<h2>Treino em dupla</h2><div class="form-row"><label class="form-label">Treino de ${esc(first.name)}</label><select id="pairFirstProgram" class="form-select">${firstPrograms.map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('')}</select></div><div class="form-row"><label class="form-label">Segundo aluno</label><select id="pairStudent" class="form-select">${others.map(s=>`<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('')}</select></div><div class="form-row"><label class="form-label">Treino do segundo aluno</label><select id="pairSecondProgram" class="form-select"></select></div><div class="modal-actions"><button class="btn btn-secondary" id="pairCancel">Cancelar</button><button class="btn btn-primary" id="pairReady">Preparar dupla</button></div>`);
  const fill=()=>{const sid=$('#pairStudent').value;$('#pairSecondProgram').innerHTML=programsForStudent(sid).map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');};
  fill();$('#pairStudent').onchange=fill;$('#pairCancel').onclick=closeModal;
  $('#pairReady').onclick=()=>{const sid=$('#pairStudent').value,p1=$('#pairFirstProgram').value,p2=$('#pairSecondProgram').value;closeModal();prepareWorkout([{studentId:first.id,programId:p1},{studentId:sid,programId:p2}]);};
}

/* ----------------------------- live workout ----------------------------- */

function prepareWorkout(entries){
  if(live)return confirmModal('Treino em andamento','Há uma sessão aberta. Deseja voltar para ela?','Voltar ao treino',()=>navigate('workout'),false);
  const participants=[];
  for(const entry of entries){
    const st=studentById(entry.studentId), program=programById(entry.programId);
    if(!st||!program)return toast('Não foi possível preparar o treino.');
    participants.push({
      studentId:st.id, programId:program.id, programName:program.name, feedback:'',
      exercises:program.exercises.map((pe,index)=>{
        const ex=exerciseById(pe.exerciseId); if(!ex)return null;
        const prev=getLastExercisePerformance(st.id,ex.id);
        const prevSets=prev?completedSets(prev):[];
        return {
          exerciseId:ex.id,name:ex.name,muscleGroups:ex.muscleGroups.slice(),restSec:pe.restSec,note:pe.note||'',
          targetReps:pe.targetReps||'', referenceWeight:pe.referenceWeight??null, sourceExerciseId:pe.exerciseId, programIndex:index,
          previousDetails:previousExerciseHtml(lastProgramExercise(st.id,program.id,pe,index),pe),
          sets:Array.from({length:pe.sets},(_,i)=>{
            const base=prevSets[i]||prevSets[prevSets.length-1]||null;
            return {
              weight:!base&&pe.referenceWeight!=null?String(pe.referenceWeight):'', reps:'', rpe:'', done:false,
              previous:base?{weight:base.weight,reps:base.reps,rpe:base.rpe??null}:null
            };
          })
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
  main.innerHTML=`<section class="screen"><div class="preview-wrap"><div class="preview-title"><small>${live.participants.length>1?'DUPLA':'SESSÃO'}</small><h1>Vamos começar?</h1></div>${live.participants.map(previewPersonHtml).join('')}<button id="beginWorkoutBtn" class="btn btn-primary btn-block" style="margin-top:18px">Iniciar treino</button></div></section>`;
  $('#beginWorkoutBtn').onclick=()=>{unlockAudio();live.startedAt=Date.now();persistDraft();render();};
}
function previewPersonHtml(p){const st=studentById(p.studentId);return `<div class="preview-person"><div class="preview-person-head">${avatarHtml(st)}<div class="row-main"><strong>${esc(st?.name||'Aluno')}</strong><small>${esc(p.programName)}</small></div></div>${p.exercises.map((ex,i)=>`<div class="preview-ex-row"><span>${String(i+1).padStart(2,'0')}</span><strong>${esc(ex.name)}</strong><small>${ex.sets.length} séries</small></div>`).join('')}</div>`;}

function renderActiveWorkout(main){
  const title=live.participants.length>1?'Treino em dupla':live.participants[0].programName;
  setHeader({eyebrow:'TREINO',title,back:()=>navigate('home'),action:'more',actionFn:openLiveMenu});
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
  return `<div class="live-person-head">${avatarHtml(st)}<span>${esc(st?.name||'Aluno')} · ${esc(p.programName)} · ${kgText(pvol)}</span></div>${p.exercises.map((ex,ei)=>liveExerciseHtml(p,pi,ex,ei)).join('')}`;
}

function liveExerciseHtml(participant,pi,ex,ei){
  return `<div class="live-exercise-card" data-live-exercise="${pi}:${ei}">
    <div class="live-exercise-head"><button class="live-exercise-history" type="button" data-ex-history data-ex-history-student="${esc(participant.studentId)}" data-ex-history-id="${esc(ex.exerciseId)}"><div class="row-main"><strong>${esc(ex.name)}</strong><small>${ex.sets.length} séries · descanso ${fmtRest(ex.restSec)}</small></div><span class="history-mini">${icons.history}</span></button><button class="live-more" type="button" data-live-more="${pi}:${ei}" aria-label="Ações do exercício" title="Ações do exercício">⋯</button></div>
    ${ex.referenceWeight!=null?`<div class="workout-meta">Referência da ficha · ${parseDecimal(ex.referenceWeight)} kg</div>`:''}
    ${ex.previousDetails||''}
    <input class="live-note" data-live-note="${pi}:${ei}" value="${esc(ex.note||'')}" placeholder="Observação" aria-label="Observação do exercício">
    <div class="set-head"><span>Série</span><span>Anterior</span><span>Carga</span><span>Reps</span><span>RPE</span><span></span></div>
    ${ex.sets.map((set,si)=>liveSetHtml(pi,ei,set,si,ex)).join('')}
  </div>`;
}
function liveSetHtml(pi,ei,set,si,ex){
  const prev=set.previous?`${parseDecimal(set.previous.weight)} kg × ${parseInteger(set.previous.reps)}`:'—';
  const weightHint=set.previous&&parseDecimal(set.previous.weight)>0?String(parseDecimal(set.previous.weight)):'kg';
  const repsHint=String(ex?.targetReps||'').trim() || (set.previous&&parseInteger(set.previous.reps)>0?String(parseInteger(set.previous.reps)):'reps');
  return `<div class="set-row ${set.done?'is-done':''}" data-set-row="${pi}:${ei}:${si}">
    <div class="set-index">${si+1}</div>
    <div class="set-prev" title="${set.previous?`${parseDecimal(set.previous.weight)} kg × ${parseInteger(set.previous.reps)}`:'Sem sessão anterior'}">${esc(prev)}</div>
    <input class="set-input" inputmode="decimal" data-set-weight="${pi}:${ei}:${si}" value="${esc(set.weight)}" placeholder="${esc(weightHint)}">
    <input class="set-input" inputmode="numeric" data-set-reps="${pi}:${ei}:${si}" value="${esc(set.reps)}" placeholder="${esc(repsHint)}">
    <input class="set-input set-rpe" inputmode="decimal" data-set-rpe="${pi}:${ei}:${si}" value="${esc(set.rpe??'')}" placeholder="—" aria-label="RPE da série">
    <button class="set-check" data-set-check="${pi}:${ei}:${si}" type="button">${set.done?icons.check:''}</button>
  </div>`;
}

function parsePath(path){return String(path).split(':').map(Number);}
function liveExerciseAt(path){const [pi,ei]=parsePath(path);return live?.participants?.[pi]?.exercises?.[ei]||null;}
function liveSetAt(path){const [pi,ei,si]=parsePath(path);return live?.participants?.[pi]?.exercises?.[ei]?.sets?.[si]||null;}

function bindLiveHandlers(){
  $$('[data-set-weight]').forEach(inp=>inp.oninput=()=>{const s=liveSetAt(inp.dataset.setWeight);if(s){s.weight=inp.value;persistDraft();updateLiveStatsDOM();}});
  $$('[data-set-reps]').forEach(inp=>inp.oninput=()=>{const s=liveSetAt(inp.dataset.setReps);if(s){s.reps=inp.value;persistDraft();updateLiveStatsDOM();}});
  $$('[data-set-rpe]').forEach(inp=>inp.oninput=()=>{const s=liveSetAt(inp.dataset.setRpe);if(s){const raw=inp.value.trim();s.rpe=raw===''?'':clamp(parseDecimal(raw),1,10);persistDraft();}});
  $$('[data-set-check]').forEach(btn=>btn.onclick=()=>{
    const set=liveSetAt(btn.dataset.setCheck);if(!set)return;
    const [pi,ei]=parsePath(btn.dataset.setCheck);
    if(!set.done){
      if(parseDecimal(set.weight)<=0 && parseDecimal(set.previous?.weight)>0)set.weight=parseDecimal(set.previous.weight);
      if(parseInteger(set.reps)<=0 && parseInteger(set.previous?.reps)>0)set.reps=parseInteger(set.previous.reps);
      if(parseInteger(set.reps)<=0)return toast('Informe as repetições antes de concluir a série.');
    }
    set.done=!set.done;
    if(set.done){unlockAudio();const ex=live.participants[pi].exercises[ei];if(ex.restSec>0)startRest(ex.restSec);}
    persistDraft();renderActiveWorkout($('#main'));
  });
  $$('[data-live-note]').forEach(inp=>inp.oninput=()=>{const ex=liveExerciseAt(inp.dataset.liveNote);if(ex){ex.note=inp.value;persistDraft();}});
  $$('[data-live-more]').forEach(btn=>btn.onclick=()=>openLiveExerciseSettings(btn.dataset.liveMore));
}

function updateLiveStatsDOM(){
  if(!live)return;
  const total=live.participants.reduce((a,p)=>a+p.exercises.reduce((x,e)=>x+e.sets.length,0),0);
  const done=live.participants.reduce((a,p)=>a+p.exercises.reduce((x,e)=>x+e.sets.filter(s=>s.done).length,0),0);
  const vol=live.participants.reduce((a,p)=>a+p.exercises.reduce((x,e)=>x+e.sets.filter(s=>s.done).reduce((z,s)=>z+setVolume(s),0),0),0);
  if($('#liveVolume'))$('#liveVolume').textContent=kgText(vol);if($('#liveSets'))$('#liveSets').textContent=`${done} / ${total}`;
}

function syncLiveExerciseToProgram(path,{exerciseId=null,sets=null,restSec=null,targetReps=null}={}){
  const [pi,ei]=parsePath(path), participant=live?.participants?.[pi];
  const program=participant?programById(participant.programId):null;
  const pe=program?.exercises?.[ei]; if(!pe)return false;
  if(exerciseId)pe.exerciseId=exerciseId;
  if(sets!=null)pe.sets=clamp(parseInteger(sets)||1,1,50);
  if(restSec!=null)pe.restSec=clamp(parseInteger(restSec),0,3600);
  if(targetReps!=null)pe.targetReps=String(targetReps).trim();
  program.updatedAt=Date.now();persist();return true;
}

function askPersistLiveChanges(path,changes,message='Salvar estes ajustes também na ficha original?'){
  openModal(`<h2>Atualizar a ficha?</h2><p class="modal-sub">${esc(message)}</p><div class="modal-actions"><button class="btn btn-secondary" id="keepOriginalProgram">Manter ficha original</button><button class="btn btn-primary" id="saveProgramChange">Salvar na ficha</button></div>`);
  $('#keepOriginalProgram').onclick=()=>{closeModal();renderActiveWorkout($('#main'));toast('Mudança mantida só nesta sessão.');};
  $('#saveProgramChange').onclick=()=>{
    if(!liveExerciseAt(path))return closeModal();
    syncLiveExerciseToProgram(path,changes||{});
    closeModal();renderActiveWorkout($('#main'));toast('Ficha do treino atualizada.');
  };
}

function addLiveExerciseSet(path){
  const ex=liveExerciseAt(path);if(!ex)return;
  const last=ex.sets[ex.sets.length-1]||{};
  ex.adjustmentSummary=`Séries ajustadas para ${ex.sets.length+1}`;
  ex.sets.push({weight:'',reps:'',rpe:'',done:false,previous:last.previous||null});
  persistDraft();renderActiveWorkout($('#main'));toast('Série adicionada nesta sessão.');
}

function removeLiveExerciseSet(path){
  const ex=liveExerciseAt(path);if(!ex)return;
  if(ex.sets.length<=1)return toast('O exercício precisa ter pelo menos 1 série.');
  const last=ex.sets[ex.sets.length-1];
  if(last?.done){
    return confirmModal('Remover última série?','A última série já foi concluída. Ela será removida desta sessão.','Remover série',()=>{
      ex.sets.pop();ex.adjustmentSummary=`Séries ajustadas para ${ex.sets.length}`;persistDraft();renderActiveWorkout($('#main'));toast('Série removida desta sessão.');
    });
  }
  ex.sets.pop();ex.adjustmentSummary=`Séries ajustadas para ${ex.sets.length}`;persistDraft();renderActiveWorkout($('#main'));toast('Série removida desta sessão.');
}

function replaceLiveExercise(path,newExerciseId){
  const ex=liveExerciseAt(path), next=exerciseById(newExerciseId);if(!ex||!next)return;
  const doneCount=ex.sets.filter(s=>s.done).length;
  const apply=()=>{
    const [pi]=parsePath(path), participant=live.participants[pi], st=studentById(participant.studentId);
    const prev=getLastExercisePerformance(st.id,next.id),prevSets=prev?completedSets(prev):[];
    const count=ex.sets.length;
    ex.adjustmentSummary=`${ex.name} → ${next.name}`;
    ex.exerciseId=next.id;ex.name=next.name;ex.muscleGroups=next.muscleGroups.slice();
    ex.sets=Array.from({length:count},(_,i)=>{const base=prevSets[i]||prevSets[prevSets.length-1]||null;return{weight:'',reps:'',rpe:'',done:false,previous:base?{weight:base.weight,reps:base.reps,rpe:base.rpe??null}:null};});
    persistDraft();
    askPersistLiveChanges(path,{exerciseId:next.id},`Você trocou para “${next.name}”. Deseja salvar essa troca também na ficha ${participant.programName}?`);
  };
  if(doneCount){
    confirmModal('Trocar exercício?',`Já existem ${doneCount} série${doneCount===1?' concluída':'s concluídas'} neste exercício. Para evitar registrar dados no exercício errado, a troca vai limpar as séries atuais.`,`Trocar e limpar`,()=>apply(),false);
  } else apply();
}

function openLiveExerciseAdjustments(path){
  const ex=liveExerciseAt(path);if(!ex)return;
  openModal(`<h2>Ajustar exercício</h2><p class="modal-sub">${esc(ex.name)} · altere a prescrição desta sessão.</p>
    <div class="form-row"><label class="form-label">Faixa de repetições</label><input id="liveRepsEdit" class="form-input" value="${esc(ex.targetReps||'')}"></div>
    <div class="form-row"><label class="form-label">Descanso</label><input id="liveRestEdit" class="form-input" value="${fmtRest(ex.restSec)}"></div>
    <div class="modal-actions"><button class="btn btn-secondary" id="liveEditCancel">Cancelar</button><button class="btn btn-primary" id="liveEditSave">Aplicar ajustes</button></div>`);
  $('#liveEditCancel').onclick=()=>{closeModal();setTimeout(()=>openLiveExerciseSettings(path),60);};
  $('#liveEditSave').onclick=()=>{
    const nextReps=$('#liveRepsEdit').value.trim();
    if(!nextReps)return toast('Informe a faixa de repetições.');
    ex.targetReps=nextReps;
    ex.restSec=clamp(parseRest($('#liveRestEdit').value),0,3600);
    ex.adjustmentSummary=`${ex.targetReps} reps · descanso ${fmtRest(ex.restSec)}`;
    persistDraft();closeModal();
    setTimeout(()=>askPersistLiveChanges(path,{targetReps:ex.targetReps,restSec:ex.restSec}),60);
  };
}

function openLiveExerciseSettings(path){
  const ex=liveExerciseAt(path);if(!ex)return;
  openModal(`<h2>${esc(ex.name)}</h2><div class="action-list">
    <button class="action-item" type="button" data-live-ex-action="replace"><span class="action-icon">${icons.edit}</span><div class="row-main"><strong>Trocar exercício</strong><small>Substituir este exercício por outro da biblioteca</small></div>${chev()}</button>
    <button class="action-item" type="button" data-live-ex-action="adjust"><span class="action-icon">${icons.sliders}</span><div class="row-main"><strong>Repetições e descanso</strong><small>${esc(ex.targetReps||'—')} reps · ${fmtRest(ex.restSec)} de descanso</small></div>${chev()}</button>
    <button class="action-item" type="button" data-live-ex-action="add-set"><span class="action-icon">${icons.plus}</span><div class="row-main"><strong>Adicionar série</strong><small>Passar de ${ex.sets.length} para ${ex.sets.length+1} séries nesta sessão</small></div></button>
    <button class="action-item" type="button" data-live-ex-action="remove-set"><span class="action-icon">${icons.minus}</span><div class="row-main"><strong>Remover série</strong><small>${ex.sets.length>1?`Remover a última das ${ex.sets.length} séries`:'O exercício precisa manter pelo menos 1 série'}</small></div></button>
  </div>`);
  $$('[data-live-ex-action]',$('#modal')).forEach(btn=>btn.onclick=()=>{
    const action=btn.dataset.liveExAction;
    if(action==='replace'){
      closeModal();setTimeout(()=>openExercisePicker(id=>replaceLiveExercise(path,id),()=>renderActiveWorkout($('#main'))),60);
      return;
    }
    if(action==='adjust'){
      closeModal();setTimeout(()=>openLiveExerciseAdjustments(path),60);
      return;
    }
    if(action==='add-set'){
      closeModal();addLiveExerciseSet(path);return;
    }
    if(action==='remove-set'){
      closeModal();setTimeout(()=>removeLiveExerciseSet(path),40);
    }
  });
}

function openLiveMenu(){
  openModal(`<h2>Treino em andamento</h2><div class="action-list"><button class="action-item" data-live-menu="home"><span class="action-icon">${icons.home}</span><div class="row-main"><strong>Voltar ao início</strong><small>O cronômetro continua rodando</small></div>${chev()}</button><button class="action-item danger" data-live-menu="discard"><span class="action-icon">${icons.trash}</span><div class="row-main"><strong>Descartar treino</strong><small>As séries desta sessão serão perdidas</small></div></button></div>`);
  $$('[data-live-menu]').forEach(btn=>btn.onclick=()=>{const a=btn.dataset.liveMenu;closeModal();if(a==='home')navigate('home');if(a==='discard')setTimeout(discardLiveWorkout,60);});
}
function discardLiveWorkout(){confirmModal('Descartar treino?','Todas as séries preenchidas nesta sessão serão perdidas.','Descartar',()=>{stopRest();live=null;persistDraft();navigate('home');toast('Treino descartado.');});}

function liveMuscleSummaryHtml(participant){
  const map=new Map();
  (participant.exercises||[]).forEach(ex=>{
    const done=ex.sets.filter(s=>s.done); if(!done.length)return;
    const groups=normalizeGroups(ex.muscleGroups);
    const volume=done.reduce((sum,set)=>sum+setVolume(set),0);
    const divisor=Math.max(groups.length,1);
    groups.forEach(group=>map.set(group,(map.get(group)||0)+volume/divisor));
  });
  const rows=[...map.entries()].sort((a,b)=>b[1]-a[1]);
  if(!rows.length)return '';
  const max=Math.max(...rows.map(([,v])=>v),1);
  return `<div class="finish-muscles"><small>VOLUME POR GRUPAMENTO</small>${rows.slice(0,6).map(([group,value])=>`<div class="finish-muscle-row"><span>${esc(group)}</span><div><i style="width:${clamp(value/max*100,5,100)}%"></i></div><b>${kgText(value)}</b></div>`).join('')}</div>`;
}

function openFinishWorkout(){
  if(!live)return;
  const completed=live.participants.reduce((a,p)=>a+p.exercises.reduce((x,e)=>x+e.sets.filter(s=>s.done).length,0),0);
  if(!completed)return toast('Marque pelo menos uma série como concluída.');
  openModal(`<h2>Resumo do treino</h2><p class="modal-sub">Confira o volume, a distribuição por grupamento e registre uma observação final.</p>${live.participants.map((p,i)=>{const st=studentById(p.studentId);const vol=p.exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).reduce((x,s)=>x+setVolume(s),0),0);const sets=p.exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).length,0);const rpes=p.exercises.flatMap(e=>e.sets.filter(s=>s.done&&s.rpe).map(s=>Number(s.rpe))).filter(Boolean);const avgRpe=rpes.length?(rpes.reduce((a,b)=>a+b,0)/rpes.length).toFixed(1).replace('.',','):'—';return `<div class="finish-card"><div class="finish-card-head"><div><strong>${esc(st?.name||'Aluno')}</strong><small>${esc(p.programName||'Treino')}</small></div><span>${fmtClock((Date.now()-live.startedAt)/1000)}</span></div><div class="finish-stats"><div><small>SÉRIES</small><strong>${sets}</strong></div><div><small>VOLUME</small><strong>${kgText(vol)}</strong></div><div><small>RPE MÉDIO</small><strong>${avgRpe}</strong></div></div>${liveMuscleSummaryHtml(p)}<div class="form-row finish-note"><label class="form-label">Parecer / observação</label><textarea class="form-textarea" data-feedback="${i}" placeholder="O que vale lembrar para a próxima sessão?">${esc(p.feedback||'')}</textarea></div></div>`;}).join('')}<div class="modal-actions"><button class="btn btn-secondary" id="finishCancel">Voltar</button><button class="btn btn-primary" id="finishSave">Salvar treino</button></div>`);
  $('#finishCancel').onclick=closeModal;$('#finishSave').onclick=()=>{$$('[data-feedback]').forEach(t=>live.participants[+t.dataset.feedback].feedback=t.value.trim());saveFinishedWorkout();};
}

function saveFinishedWorkout(){
  if(!live)return;
  const endedAt=Date.now();
  const participants=live.participants.map(p=>({
    studentId:p.studentId,programId:p.programId,programName:p.programName,feedback:p.feedback||'',
    exercises:p.exercises.map(ex=>({exerciseId:ex.exerciseId,name:ex.name,muscleGroups:ex.muscleGroups.slice(),restSec:ex.restSec,note:ex.note||'',adjustmentSummary:ex.adjustmentSummary||'',targetReps:ex.targetReps||'',sourceExerciseId:ex.sourceExerciseId||ex.exerciseId,programIndex:ex.programIndex??null,prescribedSets:ex.sets.length,sets:ex.sets.filter(s=>s.done).map(s=>({weight:parseDecimal(s.weight),reps:parseInteger(s.reps),rpe:s.rpe===''||s.rpe==null?null:clamp(parseDecimal(s.rpe),1,10),done:true}))})).filter(ex=>ex.sets.length)
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
  const bar=$('#restTimer');
  if(!live?.restEndAt||live.restEndAt<=Date.now()){
    if(live?.restEndAt&&live.restEndAt<=Date.now()){live.restEndAt=null;live.restDuration=0;persistDraft();beep();toast('Descanso finalizado.');}
    bar.classList.add('is-hidden');bar.classList.remove('on-workout');
    if(restTicker){clearInterval(restTicker);restTicker=null;}
    return;
  }
  bar.classList.remove('is-hidden');
  bar.classList.toggle('on-workout',state.route==='workout');
  const tick=()=>{if(!live?.restEndAt)return stopRest();const left=Math.max(0,Math.ceil((live.restEndAt-Date.now())/1000));$('#restTimerValue').textContent=fmtClock(left);if(left<=0){live.restEndAt=null;live.restDuration=0;persistDraft();bar.classList.add('is-hidden');bar.classList.remove('on-workout');if(restTicker){clearInterval(restTicker);restTicker=null;}beep();toast('Descanso finalizado.');}};
  tick();if(restTicker)clearInterval(restTicker);restTicker=setInterval(tick,250);
}

/* ----------------------------- exercise history ----------------------------- */
function exerciseHistoryEntries(studentId, exerciseId) {
  const rows=[];
  sessionsForStudent(studentId,'all').forEach(session=>{
    const p=participantForStudent(session,studentId); if(!p)return;
    (p.exercises||[]).filter(ex=>ex.exerciseId===exerciseId&&completedSets(ex).length).forEach(ex=>rows.push({session,exercise:ex,best:bestLoad(ex),volume:exerciseVolume(ex)}));
  });
  return rows.sort((a,b)=>sessionTimestamp(a.session)-sessionTimestamp(b.session));
}
function exerciseLoadChartHtml(entries) {
  if(!entries.length)return emptyHtml('Sem execuções registradas.','Conclua séries deste exercício para formar o histórico.');
  const points=entries.slice(-16).map(x=>({date:dateShort(x.session.endedAt),value:x.best}));
  const max=Math.max(...points.map(p=>p.value),1),min=Math.max(0,Math.min(...points.map(p=>p.value))-5),range=Math.max(max-min,1);
  const spacing=76,W=Math.max(360,58+(points.length-1)*spacing+40),H=215,L=52,R=W-24,T=24,B=162;
  const coords=points.map((p,i)=>({x:points.length===1?(L+R)/2:L+i*spacing,y:B-((p.value-min)/range)*(B-T)}));
  const line=coords.map((p,i)=>`${i?'L':'M'} ${p.x} ${p.y}`).join(' ');
  const grid=[0,.5,1].map(fr=>{const y=B-fr*(B-T),val=min+range*fr;return `<line x1="${L}" x2="${R}" y1="${y}" y2="${y}" class="chart-grid-line"/><text x="${L-8}" y="${y+3}" text-anchor="end" class="chart-y-label">${round(val)}</text>`;}).join('');
  const dots=coords.map((p,i)=>`<g class="chart-point"><circle cx="${p.x}" cy="${p.y}" r="5"/><text x="${p.x}" y="${Math.max(14,p.y-12)}" text-anchor="middle" class="point-value">${points[i].value}kg</text><text x="${p.x}" y="${B+27}" text-anchor="middle" class="chart-x-label">${points[i].date}</text></g>`).join('');
  return `<div class="history-chart-wrap"><div class="chart-scroll"><svg class="detail-line-chart" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${grid}<path d="${line}" class="chart-line"/>${dots}</svg></div>${entries.length>16?`<div class="chart-footnote">Gráfico com as 16 execuções mais recentes de ${entries.length}.</div>`:''}</div>`;
}
function openExerciseHistory(studentId, exerciseId) {
  const st=studentById(studentId),exercise=exerciseById(exerciseId); if(!st||!exercise)return toast('Histórico deste exercício não encontrado.');
  const entries=exerciseHistoryEntries(studentId,exerciseId);const recent=entries.slice().reverse().slice(0,12);
  const latest=entries[entries.length-1],first=entries[0];const delta=latest&&first?latest.best-first.best:0;
  openModal(`<div class="history-modal-head"><button class="icon-btn" id="exerciseHistoryClose" type="button" aria-label="Fechar">${icons.close}</button><div><small>HISTÓRICO DO EXERCÍCIO</small><strong>${esc(exercise.name)}</strong><span>${esc(st.name)}</span></div></div><div class="exercise-history-content"><div class="history-summary-grid"><div><small>Execuções</small><strong>${entries.length}</strong></div><div><small>Última carga</small><strong>${latest?`${latest.best} kg`:'—'}</strong></div><div><small>Variação</small><strong class="${delta>0?'text-good':delta<0?'text-warn':''}">${entries.length>1?`${delta>0?'+':''}${round(delta)} kg`:'—'}</strong></div></div><div class="chart-card history-chart-card"><div class="chart-card-head"><div><strong>Evolução da maior carga</strong><small>Últimas execuções deste exercício</small></div></div>${exerciseLoadChartHtml(entries)}</div><div class="section history-execution-section"><div class="section-title"><h2>Últimas execuções</h2><span>${recent.length}${entries.length>recent.length?` de ${entries.length}`:''}</span></div>${recent.length?recent.map((row,i)=>`<div class="execution-card"><div class="execution-card-head"><div><strong>${fmtDate(row.session.endedAt)}</strong><small>${esc(participantForStudent(row.session,studentId)?.programName||'Treino')}</small></div><div><b>${row.best} kg</b><small>melhor carga</small></div></div><div class="execution-sets">${completedSets(row.exercise).map((set,si)=>`<span><b>S${si+1}</b>${parseDecimal(set.weight)} kg × ${parseInteger(set.reps)}${set.rpe?` · RPE ${set.rpe}`:''}</span>`).join('')}</div><div class="execution-footer"><span>${completedSets(row.exercise).length} séries</span><span>${kgText(row.volume)} de volume</span></div></div>`).join(''):emptyHtml('Sem execuções registradas.','Este exercício ainda não possui séries concluídas no histórico do aluno.')}</div></div>`,{fullscreen:true});
  $('#exerciseHistoryClose').onclick=closeModal;
  requestAnimationFrame(()=>{const scroll=$('.history-chart-card .chart-scroll');if(scroll)scroll.scrollLeft=scroll.scrollWidth;});
}

/* ----------------------------- evolution ----------------------------- */

function renderEvolution(main){
  setHeader({title:'Evolução',action:null});
  const students=db.students.slice().sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
  main.innerHTML=`<section class="screen"><div class="hero"><h1>Evolução</h1></div><div class="section" style="margin-top:4px"><div class="section-title"><h2>Alunos</h2><span>${students.length}</span></div>${students.length?students.map(evolutionStudentCardHtml).join(''):emptyHtml('Nenhum aluno cadastrado.','Cadastre alunos e registre treinos para gerar análises.')}</div></section>`;
  $$('[data-evo-student]',main).forEach(btn=>btn.onclick=()=>navigate('evolution-detail',{evolutionStudentId:btn.dataset.evoStudent,evolutionProgramId:null}));
}
function evolutionStudentCardHtml(st){const sessions=sessionsForStudent(st.id,'90d');const vol=sessions.reduce((a,s)=>a+participantVolume(participantForStudent(s,st.id)),0);const top=exerciseChanges(st.id,'90d').filter(x=>x.deltaKg>0).sort((a,b)=>b.pct-a.pct)[0];return `<button class="row-card" type="button" data-evo-student="${esc(st.id)}">${avatarHtml(st)}<div class="row-main"><strong>${esc(st.name)}</strong><small>${sessions.length} treinos · ${kgText(vol)}${top?` · ${esc(top.exerciseName)} +${round(top.deltaKg)} kg`:''}</small></div>${chev()}</button>`;}

function renderEvolutionDetail(main,studentId){
  const st=studentById(studentId);if(!st)return navigate('evolution');
  setHeader({eyebrow:'EVOLUÇÃO',title:st.name,back:()=>navigate('evolution'),action:null});
  const period=state.evolutionPeriod;
  const sessions=sessionsForStudent(st.id,period);
  const participants=sessions.map(s=>({session:s,p:participantForStudent(s,st.id)}));
  const sets=participants.reduce((a,x)=>a+participantSetCount(x.p),0);
  const uniqueExercises=new Set(participants.flatMap(x=>(x.p.exercises||[]).map(ex=>ex.exerciseId))).size;
  const changes=exerciseChanges(st.id,period);
  const gains=changes.filter(x=>x.deltaKg>0).sort((a,b)=>b.pct-a.pct);
  const downs=changes.filter(x=>x.deltaKg<0).sort((a,b)=>a.pct-b.pct);
  const muscles=muscleDistribution(st.id,period);
  const comparable=changes.slice().sort((a,b)=>Math.abs(b.pct)-Math.abs(a.pct));
  const programs=programsForStudent(st.id);
  if(state.evolutionProgramId && !programs.some(p=>p.id===state.evolutionProgramId))state.evolutionProgramId=null;
  const selectedProgram=state.evolutionProgramId?programById(state.evolutionProgramId):null;
  const programParticipants=selectedProgram?participants.filter(x=>x.p.programId===selectedProgram.id):[];
  const topGain=gains[0]||null;
  main.innerHTML=`<section class="screen">
    <div class="hero"><span class="hero-kicker">EVOLUÇÃO INDIVIDUAL</span><h1>${esc(st.name)}</h1><p>Cargas, séries, grupamentos e evolução por exercício. O volume é comparado apenas dentro da mesma ficha.</p></div>
    <div class="evo-filter-row">${[['30d','30 dias'],['90d','3 meses'],['180d','6 meses'],['365d','1 ano'],['all','Tudo']].map(([v,l])=>`<button class="period-btn ${period===v?'is-active':''}" data-period="${v}">${l}</button>`).join('')}</div>
    <div class="section evolution-summary" style="margin-top:0"><div class="grid-2">
      <div class="metric-card"><div><small>Treinos</small><strong>${sessions.length}</strong></div><p>no período</p></div>
      <div class="metric-card"><div><small>Séries</small><strong>${sets}</strong></div><p>concluídas</p></div>
      <div class="metric-card"><div><small>Exercícios</small><strong>${uniqueExercises}</strong></div><p>com registro</p></div>
      <div class="metric-card highlight"><div><small>Maior evolução</small><strong>${topGain?`+${round(topGain.deltaKg)} kg`:'—'}</strong></div><p>${topGain?esc(topGain.exerciseName):'precisa de mais histórico'}</p></div>
    </div></div>
    ${volumeChartHtml(programParticipants,selectedProgram,programs.length)}
    <div class="chart-card"><div class="chart-card-head"><div><strong>Volume por grupamento</strong><small>Distribuição aproximada do trabalho registrado.</small></div></div>${muscles.length?muscles.map(muscleRowHtml).join(''):emptyHtml('Sem dados de grupamentos.','Registre treinos para preencher esta análise.')}</div>
    <div class="chart-card"><div class="chart-card-head"><div><strong>Evolução por exercício</strong></div><span class="chart-hint">${comparable.length} comparáveis</span></div><div class="change-list">${comparable.length?comparable.slice(0,10).map(x=>changeRowHtml(x,x.deltaKg<0,st.id)).join(''):emptyHtml('Sem comparação suficiente.','São necessários ao menos dois registros do mesmo exercício.')}</div></div>
    <div class="chart-card"><div class="chart-card-head"><div><strong>Destaques</strong><small>Maiores altas e pontos que merecem acompanhamento.</small></div></div>${gains[0]?`<div class="trend-highlight good"><span>${icons.trend}</span><div><small>MAIOR EVOLUÇÃO</small><strong>${esc(gains[0].exerciseName)}</strong><p>${gains[0].firstKg} kg → ${gains[0].lastKg} kg · +${round(gains[0].pct)}%</p></div></div>`:''}${downs[0]?`<div class="trend-highlight warn"><span>${icons.chart}</span><div><small>PONTO DE ATENÇÃO</small><strong>${esc(downs[0].exerciseName)}</strong><p>${downs[0].firstKg} kg → ${downs[0].lastKg} kg · ${round(downs[0].pct)}%</p></div></div>`:''}${!gains[0]&&!downs[0]?emptyHtml('Ainda sem destaques.','Continue registrando as cargas para comparar os exercícios.'):''}</div>
  </section>`;
  $$('[data-period]',main).forEach(btn=>btn.onclick=()=>{state.evolutionPeriod=btn.dataset.period;renderEvolutionDetail(main,st.id);});
  $('#evoProgramSelect')?.addEventListener('click',()=>openEvolutionProgramPicker(st.id));
  requestAnimationFrame(()=>{const scroll=main.querySelector('.program-volume-card .chart-scroll');if(scroll&&scroll.scrollWidth>scroll.clientWidth)scroll.scrollLeft=scroll.scrollWidth;});
}

function volumeChartHtml(participants,selectedProgram,programCount=0){
  if(!selectedProgram){
    return `<div class="chart-card program-volume-card">
      <div class="chart-card-head"><div><strong>Evolução do volume</strong><small>Compare apenas execuções da mesma ficha de treino.</small></div></div>
      <button class="evo-program-select" id="evoProgramSelect" type="button"><div><small>TREINO ANALISADO</small><strong>${programCount?'Selecionar um treino':'Nenhum treino cadastrado'}</strong></div>${programCount?chev():''}</button>
      ${programCount?'<div class="chart-select-help">Escolha, por exemplo, “Treino de pernas” ou “Treino superior”. O gráfico só compara sessões dessa mesma ficha.</div>':emptyHtml('Crie uma ficha de treino primeiro.','O volume aparecerá aqui depois que o aluno tiver um treino cadastrado.')}
    </div>`;
  }
  const all=participants.map(x=>({date:dateShort(x.session.endedAt),value:participantVolume(x.p),ts:sessionTimestamp(x.session)}));
  const select=`<button class="evo-program-select" id="evoProgramSelect" type="button"><div><small>TREINO ANALISADO</small><strong>${esc(selectedProgram.name)}</strong></div>${chev()}</button>`;
  if(!all.length)return `<div class="chart-card program-volume-card"><div class="chart-card-head"><div><strong>Evolução do volume</strong><small>Volume por execução da ficha selecionada.</small></div></div>${select}${emptyHtml('Sem execuções desta ficha no período.','Troque o período ou registre este treino novamente.')}</div>`;
  const points=all.slice(-24);
  const max=Math.max(...points.map(p=>p.value),1);
  const spacing=76,W=Math.max(360,58+(points.length-1)*spacing+38),H=218,L=52,R=W-22,T=24,B=166;
  const coords=points.map((p,i)=>({x:points.length===1?(L+R)/2:L+i*spacing,y:B-(p.value/max)*(B-T)}));
  const line=coords.map((p,i)=>`${i?'L':'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const grid=[0,.5,1].map(fr=>{const y=B-fr*(B-T);return `<line x1="${L}" x2="${R}" y1="${y}" y2="${y}" class="chart-grid-line"/><text x="${L-8}" y="${y+3}" text-anchor="end" class="chart-y-label">${compactNumber(max*fr)}</text>`;}).join('');
  const dots=coords.map((p,i)=>`<g class="chart-point"><circle cx="${p.x}" cy="${p.y}" r="5"/><text x="${p.x}" y="${Math.max(14,p.y-12)}" text-anchor="middle" class="point-value">${compactNumber(points[i].value)}</text><text x="${p.x}" y="${B+27}" text-anchor="middle" class="chart-x-label">${esc(points[i].date)}</text></g>`).join('');
  const hint=all.length>24?`Mostrando as 24 execuções mais recentes de ${all.length}.`:points.length>4?'Arraste para os lados para navegar.':'Cada ponto representa uma execução desta ficha.';
  return `<div class="chart-card program-volume-card"><div class="chart-card-head"><div><strong>Evolução do volume</strong><small>Comparação exclusiva de ${esc(selectedProgram.name)}.</small></div><div class="chart-value">${compactNumber(points[points.length-1].value)} kg</div></div>${select}<div class="chart-scroll"><svg class="detail-line-chart" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolução do volume da ficha ${esc(selectedProgram.name)}">${grid}<path d="${line}" class="chart-line"/>${dots}</svg></div><div class="chart-footnote">${hint}</div></div>`;
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
function changeRowHtml(x,down=false,studentId=''){return `<button class="change-row" type="button" ${studentId?`data-ex-history data-ex-history-student="${esc(studentId)}" data-ex-history-id="${esc(x.exerciseId)}"`:''}><div class="row-main"><strong>${esc(x.exerciseName)}</strong><small>${x.firstKg} kg → ${x.lastKg} kg · ${x.records} registros</small></div><span class="change-badge ${down?'down':''}">${x.deltaKg>0?'+':''}${round(x.deltaKg)} kg · ${x.pct>0?'+':''}${round(x.pct)}%</span>${studentId?`<span class="change-history-icon">${icons.history}</span>`:''}</button>`;}
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
  const light=currentTheme()==='light';
  openModal(`<h2>Treino</h2><p class="modal-sub">Preferências, dados, backup e instalação no iPhone.</p><div class="action-list"><button class="action-item" data-settings="theme"><span class="action-icon">${light?icons.moon:icons.sun}</span><div class="row-main"><strong>${light?'Ativar modo escuro':'Ativar modo claro'}</strong><small>O tema fica salvo neste aparelho</small></div>${chev()}</button><button class="action-item" data-settings="trainer"><span class="action-icon">${icons.edit}</span><div class="row-main"><strong>Nome do treinador</strong><small>${esc(db.trainer.name)}</small></div>${chev()}</button><button class="action-item" data-settings="export"><span class="action-icon">${icons.download}</span><div class="row-main"><strong>Exportar backup</strong><small>Salvar alunos, treinos e histórico em JSON</small></div>${chev()}</button><button class="action-item" data-settings="import"><span class="action-icon">${icons.upload}</span><div class="row-main"><strong>Importar backup</strong><small>Restaurar um arquivo exportado pelo app</small></div>${chev()}</button><button class="action-item" data-settings="install"><span class="action-icon">${icons.info}</span><div class="row-main"><strong>Instalar no iPhone</strong><small>Usar como aplicativo pela Tela de Início</small></div>${chev()}</button><button class="action-item danger" data-settings="reset"><span class="action-icon">${icons.trash}</span><div class="row-main"><strong>Apagar todos os dados</strong><small>Esta ação não pode ser desfeita</small></div></button></div>`);
  $$('[data-settings]').forEach(btn=>btn.onclick=()=>{const a=btn.dataset.settings;closeModal();if(a==='theme'){toggleTheme();render();}if(a==='trainer')setTimeout(openTrainerName,60);if(a==='export')exportBackup();if(a==='import')$('#backupImportInput').click();if(a==='install')setTimeout(openInstallHelp,60);if(a==='reset')setTimeout(confirmReset,60);});
}
function openTrainerName(){openModal(`<h2>Nome do treinador</h2><div class="form-row"><label class="form-label">Nome</label><input id="trainerName" class="form-input" value="${esc(db.trainer.name)}"></div><div class="modal-actions"><button class="btn btn-secondary" id="trainerCancel">Cancelar</button><button class="btn btn-primary" id="trainerSave">Salvar</button></div>`);$('#trainerCancel').onclick=closeModal;$('#trainerSave').onclick=()=>{db.trainer.name=$('#trainerName').value.trim()||'Treinador';persist();closeModal();render();toast('Nome atualizado.');};}
function exportBackup(){const blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`treino-backup-${localDateISO()}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Backup exportado.');}
function importBackupFile(file){const reader=new FileReader();reader.onload=()=>{try{const parsed=JSON.parse(reader.result);const valid=parsed&&typeof parsed==='object'&&Array.isArray(parsed.students)&&((Array.isArray(parsed.exercises)&&Array.isArray(parsed.programs)&&Array.isArray(parsed.sessions))||(Array.isArray(parsed.library)||Array.isArray(parsed.records)));if(!valid)throw new Error('inválido');const normalized=normalizeDatabase(parsed);confirmModal('Restaurar backup?','Os dados atuais deste aparelho serão substituídos pelo arquivo selecionado.','Restaurar',()=>{db=normalized;persist();live=null;persistDraft();navigate('home');toast('Backup restaurado.');},false);}catch(e){toast('Arquivo de backup inválido.');}};reader.readAsText(file);}
function openInstallHelp(){openModal(`<h2>Instalar no iPhone</h2><p class="modal-sub">Depois de publicar no Vercel e abrir o site no Safari:</p><div class="card"><strong style="font-size:13px">1.</strong><p class="muted" style="font-size:12px;line-height:1.5">Toque no botão <b>Compartilhar</b> do Safari.</p><div class="divider"></div><strong style="font-size:13px">2.</strong><p class="muted" style="font-size:12px;line-height:1.5">Escolha <b>Adicionar à Tela de Início</b>.</p><div class="divider"></div><strong style="font-size:13px">3.</strong><p class="muted" style="font-size:12px;line-height:1.5">Abra pelo ícone criado. O app passa a ocupar a tela como um aplicativo.</p></div><div class="modal-actions"><button class="btn btn-primary" id="installOk">Entendi</button></div>`);$('#installOk').onclick=closeModal;}
function confirmReset(){confirmModal('Apagar todos os dados?','Alunos, treinos, exercícios, histórico e treino em andamento serão removidos deste aparelho. Exporte um backup antes se quiser preservar os dados.','Apagar tudo',()=>{db=blankDatabase();persist();live=null;persistDraft();navigate('home');toast('Dados apagados.');});}

/* ----------------------------- boot ----------------------------- */

function emptyHtml(title,subtitle='') { return `<div class="empty"><div class="empty-icon">${icons.dumbbell}</div><strong>${esc(title)}</strong>${subtitle?`<div>${esc(subtitle)}</div>`:''}</div>`; }


function boot(){
  initTheme();
  $$('[data-icon]').forEach(el=>{el.innerHTML=icons[el.dataset.icon]||'';});
  $$('.nav-item').forEach(btn=>btn.onclick=()=>navigate(btn.dataset.route));
  $('#themeToggle').onclick=()=>{toggleTheme();render();};
  $('#activeWorkoutPill').onclick=()=>navigate('workout');
  $('#modalBackdrop').onclick=closeModal;
  $('#restMinus').onclick=e=>{e.stopPropagation();adjustRest(-15);};$('#restPlus').onclick=e=>{e.stopPropagation();adjustRest(15);};$('#restSkip').onclick=e=>{e.stopPropagation();stopRest();};
  $('#restTimer').onclick=e=>{if(e.target.closest('.rest-timer-actions'))return;if(live)navigate('workout');};
  $('#backupImportInput').onchange=e=>{const file=e.target.files?.[0];if(file)importBackupFile(file);e.target.value='';};
  document.addEventListener('click',e=>{
    const target=e.target.closest?.('[data-ex-history]'); if(!target)return;
    e.preventDefault();e.stopPropagation();
    openExerciseHistory(target.dataset.exHistoryStudent,target.dataset.exHistoryId);
  });
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){updateGlobalClocks();syncRestTimer();}});
  appTicker=setInterval(()=>{updateGlobalClocks();if(live?.restEndAt&&live.restEndAt<=Date.now())syncRestTimer();},1000);
  render();
  if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
}

document.addEventListener('DOMContentLoaded',boot);

