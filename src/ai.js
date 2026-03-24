import { loadHabits } from './habits.js';
import { loadTasks }  from './tasks.js';

export function initAI() {
  document.getElementById('aiSend').addEventListener('click', sendMessage);
  document.getElementById('aiInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage();
  });
}

async function sendMessage() {
  const input = document.getElementById('aiInput');
  const msg   = input.value.trim();
  if (!msg) return;

  input.value = '';
  appendBubble(msg, 'user');

  const loading = appendBubble('Thinking...', 'ai loading');

  try {
    const reply = await askClaude(msg);
    loading.remove();
    appendBubble(reply, 'ai');
  } catch (err) {
    loading.remove();
    appendBubble('Sorry, something went wrong. Try again!', 'ai');
  }
}

function appendBubble(text, cls) {
  const messages = document.getElementById('aiMessages');
  const bubble   = document.createElement('div');
  bubble.className = `ai-bubble ${cls}`;
  bubble.textContent = text;
  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
  return bubble;
}

async function askClaude(userMessage) {
  const habits = loadHabits();
  const tasks  = loadTasks();

  const system = `
You are a friendly habit coach inside the HabitFlow app.
User's habits: ${JSON.stringify(habits.map(h => ({ name: h.title, streak: h.streak, doneToday: h.doneToday })))}
User's tasks: ${JSON.stringify(tasks.map(t => ({ name: t.title, done: t.done, priority: t.priority })))}
Keep responses short, friendly, and actionable. Max 3 sentences.
  `.trim();

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system,
      messages: [{ role: 'user', content: userMessage }]
    })
  });

  const data = await res.json();
  return data.content?.[0]?.text || 'No response received.';
}