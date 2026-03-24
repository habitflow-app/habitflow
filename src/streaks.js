import { loadHabits } from './habits.js';
import { loadTasks }  from './tasks.js';

export function updateStats() {
  const habits = loadHabits();
  const tasks  = loadTasks();

  const bestStreak    = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
  const totalTasksDone = tasks.filter(t => t.done).length;
  const total = habits.length + tasks.length;
  const done  = habits.filter(h => h.doneToday).length + totalTasksDone;
  const score = total > 0 ? Math.round((done / total) * 100) : 0;

  document.getElementById('bestStreak').textContent    = bestStreak;
  document.getElementById('totalHabits').textContent   = habits.length;
  document.getElementById('totalTasksDone').textContent = totalTasksDone;
  document.getElementById('todayScore').textContent    = `${score}%`;
}

export function renderWeekGrid() {
  const grid   = document.getElementById('weekGrid');
  const habits = loadHabits();
  const days   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const today  = new Date();
  const todayIdx = today.getDay();

  grid.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - todayIdx + i);
    const dateKey = d.toISOString().split('T')[0];
    const isToday = i === todayIdx;
    const anyDone = habits.some(h => h.lastDone === dateKey);

    const dayEl = document.createElement('div');
    dayEl.className = 'week-day';
    dayEl.innerHTML = `
      <span class="week-day-label">${days[i]}</span>
      <div class="week-day-dot${anyDone ? ' done' : ''}${isToday ? ' today' : ''}">${d.getDate()}</div>
    `;
    grid.appendChild(dayEl);
  }
}