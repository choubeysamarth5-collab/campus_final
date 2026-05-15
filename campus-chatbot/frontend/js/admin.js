// =============================================
// admin.js – Admin Panel Logic
// =============================================

const API = 'http://localhost:5000/api';

// Switch between admin sections
function showSection(name) {
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`section-${name}`).classList.add('active');
  event.currentTarget.classList.add('active');

  // Load data when section is shown
  if (name === 'faqs') loadFAQs();
  if (name === 'logs') loadLogs();
  if (name === 'feedback') loadFeedback();
  if (name === 'dashboard') loadDashboard();
}

// Theme toggle
document.getElementById('themeToggle').addEventListener('click', () => {
  const current = document.body.dataset.theme;
  document.body.dataset.theme = current === 'dark' ? 'light' : 'dark';
  document.getElementById('themeToggle').querySelector('.theme-icon').textContent =
    current === 'dark' ? '🌙' : '☀️';
});

// ── LOAD DASHBOARD STATS ──
async function loadDashboard() {
  try {
    const res = await fetch(`${API}/stats`);
    const data = await res.json();
    document.getElementById('statFaqs').textContent = data.faqs || FAQ_DB.length;
    document.getElementById('statConvos').textContent = data.conversations || '—';
    document.getElementById('statFeedback').textContent = data.feedbackCount || '—';
    document.getElementById('statRating').textContent = data.avgRating ? `${data.avgRating}⭐` : '—';

    // Recent activity from logs
    const logsRes = await fetch(`${API}/logs?limit=5`);
    const logs = await logsRes.json();
    const container = document.getElementById('recentActivity');
    if (logs.length) {
      container.innerHTML = logs.map(l => `
        <div class="log-item">
          <div class="log-time">${new Date(l.timestamp).toLocaleString()} · ${l.lang?.toUpperCase() || 'EN'}</div>
          <div class="log-q">👤 ${l.userMessage}</div>
          <div class="log-a">🎓 ${l.botReply?.substring(0, 120)}…</div>
        </div>
      `).join('');
    } else {
      container.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem">No conversations yet. Start chatting!</p>';
    }
  } catch {
    // Show static data when backend is offline
    document.getElementById('statFaqs').textContent = FAQ_DB.length;
    document.getElementById('statConvos').textContent = 'Backend offline';
    document.getElementById('recentActivity').innerHTML =
      '<p style="color:var(--text-muted);font-size:0.85rem">Backend not running. Start the server to see live data.</p>';
  }
}

// ── LOAD FAQs ──
async function loadFAQs() {
  const tbody = document.getElementById('faqTableBody');
  try {
    const res = await fetch(`${API}/faqs`);
    const faqs = await res.json();
    renderFAQTable(faqs);
  } catch {
    // Fallback: show built-in FAQ_DB
    renderFAQTable(FAQ_DB.map((f, i) => ({ ...f, _id: `local-${i}` })));
  }
}

function renderFAQTable(faqs) {
  const tbody = document.getElementById('faqTableBody');
  if (!faqs.length) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-dim);padding:24px">No FAQs found.</td></tr>';
    return;
  }
  tbody.innerHTML = faqs.map(faq => `
    <tr>
      <td style="max-width:200px">${faq.answers?.en?.substring(0, 80) || 'N/A'}…</td>
      <td><span class="tag">${faq.category || '—'}</span></td>
      <td style="font-size:0.75rem;color:var(--text-muted)">${(faq.keywords || []).slice(0,4).join(', ')}</td>
      <td>
        <div class="action-btns">
          <button class="btn-sm danger" onclick="deleteFAQ('${faq._id}')">🗑 Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ── ADD FAQ ──
async function addFAQ() {
  const keywords = document.getElementById('faqKeywords').value.split(',').map(k => k.trim()).filter(Boolean);
  const category = document.getElementById('faqCategory').value;
  const en = document.getElementById('faqAnswerEn').value.trim();
  const hi = document.getElementById('faqAnswerHi').value.trim();
  const mr = document.getElementById('faqAnswerMr').value.trim();
  const msg = document.getElementById('addFaqMsg');

  if (!en || keywords.length === 0) {
    msg.textContent = '⚠️ Please fill in at least keywords and English answer.';
    msg.style.color = '#ef4444';
    return;
  }

  const payload = {
    keywords,
    category,
    intent: keywords[0].replace(/\s+/g, '_'),
    answers: { en, ...(hi && { hi }), ...(mr && { mr }) }
  };

  try {
    const res = await fetch(`${API}/faqs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      msg.textContent = '✅ FAQ added successfully!';
      msg.style.color = 'var(--accent)';
      // Clear form
      ['faqKeywords','faqAnswerEn','faqAnswerHi','faqAnswerMr'].forEach(id => document.getElementById(id).value = '');
    }
  } catch {
    msg.textContent = '⚠️ Backend offline. FAQ not saved to DB, but will work in local mode.';
    msg.style.color = '#fbbf24';
  }
}

// ── DELETE FAQ ──
async function deleteFAQ(id) {
  if (!confirm('Delete this FAQ?')) return;
  if (id.startsWith('local-')) {
    alert('Cannot delete built-in FAQs from local mode.');
    return;
  }
  try {
    await fetch(`${API}/faqs/${id}`, { method: 'DELETE' });
    loadFAQs();
  } catch {
    alert('Backend offline. Cannot delete.');
  }
}

// ── LOAD LOGS ──
async function loadLogs() {
  const container = document.getElementById('logsContainer');
  try {
    const res = await fetch(`${API}/logs`);
    const logs = await res.json();
    if (!logs.length) {
      container.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem">No logs yet.</p>';
      return;
    }
    container.innerHTML = logs.map(l => `
      <div class="log-item">
        <div class="log-time">${new Date(l.timestamp).toLocaleString()} · Lang: ${(l.lang || 'en').toUpperCase()}</div>
        <div class="log-q">👤 <strong>User:</strong> ${l.userMessage}</div>
        <div class="log-a">🎓 <strong>Bot:</strong> ${l.botReply?.substring(0, 200)}</div>
      </div>
    `).join('');
  } catch {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem">Start the backend server to view live chat logs.</p>';
  }
}

// ── LOAD FEEDBACK ──
async function loadFeedback() {
  const container = document.getElementById('feedbackContainer');
  try {
    const res = await fetch(`${API}/feedback`);
    const items = await res.json();
    if (!items.length) {
      container.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem">No feedback yet.</p>';
      return;
    }
    container.innerHTML = items.map(f => `
      <div class="log-item">
        <div class="log-time">${new Date(f.timestamp || f.createdAt).toLocaleString()}</div>
        <div class="log-q">Rating: ${'⭐'.repeat(f.rating || 0)} (${f.rating}/5)</div>
        ${f.comment ? `<div class="log-a">💬 ${f.comment}</div>` : ''}
      </div>
    `).join('');
  } catch {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem">Start the backend server to view feedback.</p>';
  }
}

// Load dashboard on start
loadDashboard();
