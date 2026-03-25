import { updateHomeStats } from './main.js';

const KEY = 'hf_tasks';

export function loadTasks() {
  return JSON.parse(localStorage.getItem(KEY) || '[]');
}

export function saveTasks(tasks) {
  localStorage.setItem(KEY, JSON.stringify(tasks));
}

export function addTask({ title, due, priority }) {
  const tasks = loadTasks();
  tasks.push({
    id: Date.now().toString(),
    title,
    due: due || null,
    priority: priority || 'medium',
    done: false,
    createdAt: new Date().toISOString()
  });
  saveTasks(tasks);
}

export function toggleTask(id) {
  const tasks = loadTasks();
  const task  = tasks.find(t => t.id === id);
  if (!task) return;
  task.done = !task.done;
  saveTasks(tasks);
  renderTasks();
  updateHomeStats();
}

export function deleteTask(id) {
  saveTasks(loadTasks().filter(t => t.id !== id));
  renderTasks();
  updateHomeStats();
}

export function renderTasks() {
  const tasks = loadTasks();
  const list  = document.getElementById('tasksList');
  const empty = document.getElementById('tasksEmpty');
  const count = document.getElementById('tasksCount');

  count.textContent = tasks.length;
  list.querySelectorAll('.task-card').forEach(el => el.remove());

  if (tasks.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  // Sort: pending first, then by priority
  const order = { high: 0, medium: 1, low: 2 };
  const sorted = [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return (order[a.priority] || 1) - (order[b.priority] || 1);
  });

  sorted.forEach(task => {
    const card = document.createElement('div');
    card.className = `task-card${task.done ? ' done' : ''}`;

    const isOverdue = task.due && !task.done && new Date(task.due) < new Date();
    const dueStr    = task.due ? formatDue(task.due) : '';

    card.innerHTML = `
      <div class="task-check">
        ${task.done
          ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
               <polyline points="20 6 9 17 4 12"/>
             </svg>`
          : ''}
      </div>
      <div class="task-info">
        <div class="task-name">${escape(task.title)}</div>
        <div class="task-meta">
          <div class="priority-dot ${task.priority}"></div>
          ${dueStr ? `<span class="task-due${isOverdue ? ' overdue' : ''}">${dueStr}</span>` : ''}
        </div>
      </div>
      <button class="card-delete" title="Delete">✕</button>
    `;

    card.addEventListener('click', () => toggleTask(task.id));
    card.querySelector('.card-delete').addEventListener('click', e => {
      e.stopPropagation();
      deleteTask(task.id);
    });

    list.appendChild(card);
  });
}

function formatDue(dateStr) {
  const date  = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0,0,0,0);
  const diff = Math.round((date - today) / 86400000);
  if (diff === 0)  return 'Due today';
  if (diff === 1)  return 'Due tomorrow';
  if (diff === -1) return 'Due yesterday';
  if (diff < 0)   return `${Math.abs(diff)} days overdue`;
  return `Due in ${diff} days`;
}

function escape(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}