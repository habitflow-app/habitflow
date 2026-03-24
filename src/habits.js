import { updateHomeStats, getTodayKey } from './main.js';

const KEY = 'hf_habits';

export function loadHabits() {
  return JSON.parse(localStorage.getItem(KEY) || '[]');
}

export function saveHabits(habits) {
  localStorage.setItem(KEY, JSON.stringify(habits));
}

export function addHabit({ title, color }) {
  const habits = loadHabits();
  habits.push({
    id: Date.now().toString(),
    title,
    color,
    streak: 0,
    doneToday: false,
    lastDone: null,
    createdAt: new Date().toISOString()
  });
  saveHabits(habits);
}

export function toggleHabit(id) {
  const habits = loadHabits();
  const today = getTodayKey();
  const habit = habits.find(h => h.id === id);
  if (!habit) return;

  if (!habit.doneToday) {
    habit.doneToday = true;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = yesterday.toISOString().split('T')[0];
    if (habit.lastDone === yKey) {
      habit.streak = (habit.streak || 0) + 1;
    } else if (habit.lastDone !== today) {
      habit.streak = 1;
    }
    habit.lastDone = today;
  } else {
    habit.doneToday = false;
    habit.streak = Math.max(0, (habit.streak || 1) - 1);
  }

  saveHabits(habits);
  renderHabits();
  updateHomeStats();
}

export function deleteHabit(id) {
  saveHabits(loadHabits().filter(h => h.id !== id));
  renderHabits();
  updateHomeStats();
}

export function renderHabits() {
  const habits = loadHabits();
  const list   = document.getElementById('habitsList');
  const empty  = document.getElementById('habitsEmpty');
  const count  = document.getElementById('habitsCount');

  count.textContent = habits.length;
  list.querySelectorAll('.habit-card').forEach(el => el.remove());

  if (habits.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  habits.forEach(habit => {
    const card = document.createElement('div');
    card.className = `habit-card${habit.doneToday ? ' done' : ''}`;
    card.style.setProperty('--habit-color', habit.color);

    card.innerHTML = `
      <div class="habit-check">
        ${habit.doneToday
          ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
               <polyline points="20 6 9 17 4 12"/>
             </svg>`
          : ''}
      </div>
      <div class="habit-info">
        <div class="habit-name">${escape(habit.title)}</div>
        <div class="habit-streak">🔥 ${habit.streak || 0} day streak</div>
      </div>
      <button class="card-delete" title="Delete">✕</button>
    `;

    card.addEventListener('click', () => toggleHabit(habit.id));
    card.querySelector('.card-delete').addEventListener('click', e => {
      e.stopPropagation();
      deleteHabit(habit.id);
    });

    list.appendChild(card);
  });
}

function escape(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}