import './style.css';
import { renderHabits, addHabit } from './habits.js';
import { renderTasks, addTask } from './tasks.js';
import { updateStats, renderWeekGrid } from './streaks.js';
import { initAI } from './ai.js';

let currentAddType = 'habit';

document.addEventListener('DOMContentLoaded', () => {
  initUser();
  initNav();
  initFAB();
  initModal();
  renderHabits();
  renderTasks();
  updateHomeStats();
  setTodayDate();
  initAI();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
});

// ── USER ──────────────────────────────────────────────
function initUser() {
  const name = localStorage.getItem('hf_name');
  if (!name) openNameModal();
  else setWelcome(name);

  document.getElementById('nameSave').addEventListener('click', () => {
    const val = document.getElementById('nameInput').value.trim();
    if (!val) return;
    localStorage.setItem('hf_name', val);
    setWelcome(val);
    document.getElementById('nameModal').classList.remove('open');
  });

  document.getElementById('nameInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('nameSave').click();
  });

  document.getElementById('avatarBtn').addEventListener('click', () => {
    document.getElementById('nameInput').value = localStorage.getItem('hf_name') || '';
    openNameModal();
  });
}

function openNameModal() {
  document.getElementById('nameModal').classList.add('open');
  setTimeout(() => document.getElementById('nameInput').focus(), 300);
}

function setWelcome(name) {
  document.getElementById('welcomeText').textContent = `Welcome, ${name}`;
}

// ── DATE ──────────────────────────────────────────────
function setTodayDate() {
  document.getElementById('todayDate').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric'
  });
}

// ── NAV ───────────────────────────────────────────────
function initNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchScreen(btn.dataset.screen));
  });
}

function switchScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`screen-${name}`).classList.add('active');
  document.querySelector(`.nav-btn[data-screen="${name}"]`).classList.add('active');
  if (name === 'charts') {
    updateStats();
    renderWeekGrid();
  }
}

// ── FAB ───────────────────────────────────────────────
function initFAB() {
  document.getElementById('fabBtn').addEventListener('click', openAddModal);
}

// ── MODAL ─────────────────────────────────────────────
function initModal() {
  document.getElementById('modalClose').addEventListener('click', closeAddModal);

  document.getElementById('addModal').addEventListener('click', e => {
    if (e.target === document.getElementById('addModal')) closeAddModal();
  });

  document.querySelectorAll('.modal-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentAddType = tab.dataset.type;
      document.getElementById('habitExtras').style.display = currentAddType === 'habit' ? 'block' : 'none';
      document.getElementById('taskExtras').style.display = currentAddType === 'task' ? 'flex' : 'none';
    });
  });

  document.getElementById('modalSubmit').addEventListener('click', handleSubmit);
  document.getElementById('itemTitle').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleSubmit();
  });
}

function openAddModal() {
  document.getElementById('addModal').classList.add('open');
  document.getElementById('itemTitle').value = '';
  setTimeout(() => document.getElementById('itemTitle').focus(), 300);
}

function closeAddModal() {
  document.getElementById('addModal').classList.remove('open');
}

function handleSubmit() {
  const title = document.getElementById('itemTitle').value.trim();
  if (!title) return;

  if (currentAddType === 'habit') {
    addHabit({
      title,
      color: document.getElementById('habitColor').value
    });
    renderHabits();
  } else {
    addTask({
      title,
      due: document.getElementById('taskDue').value,
      priority: document.getElementById('taskPriority').value
    });
    renderTasks();
  }

  updateHomeStats();
  closeAddModal();
}

// ── HOME STATS ────────────────────────────────────────
export function updateHomeStats() {
  const habits = JSON.parse(localStorage.getItem('hf_habits') || '[]');
  const tasks  = JSON.parse(localStorage.getItem('hf_tasks')  || '[]');
  const done   = habits.filter(h => h.doneToday).length + tasks.filter(t => t.done).length;
  const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
  document.getElementById('doneCount').textContent   = `${done} done`;
  document.getElementById('streakCount').textContent = `🔥 ${maxStreak} streak`;
}

export function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}