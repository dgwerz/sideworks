// =============================================
// DinoLand Café — Sidework Board
// =============================================

// ── State ──
let state = {
  people: [],       // [{ id, name }]
  assignments: {},  // { personId: { sidework, silverwareAmount? } }
};

// ── Sidework Config ──
const SIDEWORKS = [
  { value: 'Section 1',   label: 'Section 1',   color: 'color-s1',  badge: 'badge-s1',  icon: '①' },
  { value: 'Section 2',   label: 'Section 2',   color: 'color-s2',  badge: 'badge-s2',  icon: '②' },
  { value: 'Section 3',   label: 'Section 3',   color: 'color-s3',  badge: 'badge-s3',  icon: '③' },
  { value: 'Section 4',   label: 'Section 4',   color: 'color-s4',  badge: 'badge-s4',  icon: '④' },
  { value: 'Silverware',  label: 'Silverware',  color: 'color-sw',  badge: 'badge-sw',  icon: '🍴' },
  { value: 'No Sidework', label: 'No Sidework', color: 'color-no',  badge: 'badge-no',  icon: '✓'  },
  { value: 'Salad Bar',   label: 'Salad Bar',   color: 'color-sb',  badge: 'badge-sb',  icon: '🥗' },
  { value: 'Waitstation', label: 'Waitstation', color: 'color-ws',  badge: 'badge-ws',  icon: '🍽️' },
];

function getSideworkMeta(value) {
  return SIDEWORKS.find(s => s.value === value) || null;
}

// ── Persistence ──
function saveState() {
  try {
    localStorage.setItem('dinoland_sidework', JSON.stringify(state));
  } catch(e) { /* storage not available */ }
}

function loadState() {
  try {
    const raw = localStorage.getItem('dinoland_sidework');
    if (raw) state = JSON.parse(raw);
  } catch(e) { /* fresh start */ }
}

// ── Clock ──
function updateClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  const dateStr = now.toLocaleDateString('en-US', {
    timeZone: 'America/New_York',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  document.getElementById('clock').textContent = timeStr;
  document.getElementById('date-display').textContent = dateStr + ' · Myrtle Beach, SC';
}

// ── Tab Switching ──
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${tab}`).classList.add('active');
    });
  });
}

// ── Board Render ──
function renderBoard() {
  const grid = document.getElementById('board-grid');

  if (state.people.length === 0) {
    grid.innerHTML = `
      <div class="empty-board">
        <span class="dino-icon">🦕</span>
        <p>No servers added yet. Go to <strong>Admin</strong> to add people.</p>
      </div>`;
    return;
  }

  grid.innerHTML = state.people.map(person => {
    const asgn = state.assignments[person.id];
    if (!asgn) {
      return `
        <div class="assignment-card">
          <div class="card-tape color-no"></div>
          <div class="card-body">
            <div class="card-name">${escHtml(person.name)}</div>
            <div class="card-unassigned">Not assigned yet</div>
          </div>
        </div>`;
    }

    const meta = getSideworkMeta(asgn.sidework);
    let badgeText = asgn.sidework;
    if (asgn.sidework === 'Silverware' && asgn.silverwareAmount) {
      badgeText = `Silverware ×${asgn.silverwareAmount}`;
    }

    return `
      <div class="assignment-card">
        <div class="card-tape ${meta ? meta.color : ''}"></div>
        <div class="card-body">
          <div class="card-name">${escHtml(person.name)}</div>
          <div class="card-sidework">Sidework</div>
          <div class="card-badge ${meta ? meta.badge : ''}">${meta ? meta.icon + ' ' : ''}${escHtml(badgeText)}</div>
        </div>
      </div>`;
  }).join('');
}

// ── Admin: People ──
function renderPeopleList() {
  const list = document.getElementById('people-list');
  if (state.people.length === 0) {
    list.innerHTML = `<li style="color:var(--text-dim);font-size:0.8rem;padding:6px 0;">No servers added.</li>`;
    return;
  }
  list.innerHTML = state.people.map(p => `
    <li class="person-item">
      <span>${escHtml(p.name)}</span>
      <button class="btn-remove btn-sm" onclick="removePerson('${p.id}')">✕</button>
    </li>`).join('');
}

function renderAssignPersonSelect() {
  const sel = document.getElementById('assign-person');
  if (state.people.length === 0) {
    sel.innerHTML = `<option value="">— Add people first —</option>`;
    return;
  }
  sel.innerHTML = state.people.map(p =>
    `<option value="${p.id}">${escHtml(p.name)}</option>`
  ).join('');
}

function addPerson() {
  const input = document.getElementById('new-person-name');
  const name = input.value.trim();
  if (!name) return;

  const duplicate = state.people.find(p => p.name.toLowerCase() === name.toLowerCase());
  if (duplicate) { flash(input, 'Already exists'); return; }

  const person = { id: uid(), name };
  state.people.push(person);
  input.value = '';
  saveState();
  renderAll();
}

function removePerson(id) {
  if (!confirm('Remove this person and their assignment?')) return;
  state.people = state.people.filter(p => p.id !== id);
  delete state.assignments[id];
  saveState();
  renderAll();
}

// ── Admin: Assign ──
document.getElementById('assign-sidework').addEventListener('change', function() {
  const silverGroup = document.getElementById('silverware-amount-group');
  silverGroup.style.display = this.value === 'Silverware' ? 'block' : 'none';
});

function assignSidework() {
  const personId = document.getElementById('assign-person').value;
  const sidework = document.getElementById('assign-sidework').value;
  const silverAmt = parseInt(document.getElementById('silverware-amount').value) || 1;

  if (!personId) return;

  state.assignments[personId] = { sidework };
  if (sidework === 'Silverware') state.assignments[personId].silverwareAmount = silverAmt;
  saveState();
  renderAll();
}

// ── Admin: Assignments Table ──
function renderAssignmentsTable() {
  const tbody = document.getElementById('assignments-body');
  if (state.people.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="color:var(--text-dim);text-align:center;padding:20px;">No people added.</td></tr>`;
    return;
  }

  tbody.innerHTML = state.people.map(person => {
    const asgn = state.assignments[person.id];
    let sideworkDisplay = '—';
    if (asgn) {
      sideworkDisplay = asgn.sidework;
      if (asgn.sidework === 'Silverware' && asgn.silverwareAmount) {
        sideworkDisplay = `Silverware ×${asgn.silverwareAmount}`;
      }
    }

    return `
      <tr>
        <td>${escHtml(person.name)}</td>
        <td>${escHtml(sideworkDisplay)}</td>
        <td class="td-actions">
          <button class="btn-sm btn-secondary" onclick="openEditModal('${person.id}')">Edit</button>
          <button class="btn-sm btn-remove" onclick="removeAssignment('${person.id}')">Clear</button>
        </td>
      </tr>`;
  }).join('');
}

function removeAssignment(personId) {
  delete state.assignments[personId];
  saveState();
  renderAll();
}

// ── Admin: Danger Zone ──
function clearAllAssignments() {
  if (!confirm('Clear all sidework assignments? People will remain.')) return;
  state.assignments = {};
  saveState();
  renderAll();
}

function clearEverything() {
  if (!confirm('This will remove ALL people and assignments. Are you sure?')) return;
  state = { people: [], assignments: {} };
  saveState();
  renderAll();
}

// ── Edit Modal ──
let editingPersonId = null;

function openEditModal(personId) {
  editingPersonId = personId;
  const person = state.people.find(p => p.id === personId);
  const asgn = state.assignments[personId];

  document.getElementById('edit-modal-person').textContent = person.name;

  const sel = document.getElementById('edit-sidework-select');
  sel.value = asgn ? asgn.sidework : 'Section 1';

  const editSilverGroup = document.getElementById('edit-silverware-group');
  editSilverGroup.style.display = sel.value === 'Silverware' ? 'block' : 'none';

  if (asgn && asgn.silverwareAmount) {
    document.getElementById('edit-silverware-amount').value = asgn.silverwareAmount;
  }

  document.getElementById('edit-modal').classList.remove('hidden');
}

document.getElementById('edit-sidework-select').addEventListener('change', function() {
  document.getElementById('edit-silverware-group').style.display =
    this.value === 'Silverware' ? 'block' : 'none';
});

function saveEdit() {
  if (!editingPersonId) return;
  const sidework = document.getElementById('edit-sidework-select').value;
  const silverAmt = parseInt(document.getElementById('edit-silverware-amount').value) || 1;

  state.assignments[editingPersonId] = { sidework };
  if (sidework === 'Silverware') state.assignments[editingPersonId].silverwareAmount = silverAmt;
  saveState();
  renderAll();
  closeModal();
}

function closeModal() {
  document.getElementById('edit-modal').classList.add('hidden');
  editingPersonId = null;
}

// Close modal on backdrop click
document.getElementById('edit-modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ── Render All ──
function renderAll() {
  renderBoard();
  renderPeopleList();
  renderAssignPersonSelect();
  renderAssignmentsTable();
}

// ── Utils ──
function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function flash(el, msg) {
  el.placeholder = msg;
  el.style.borderColor = 'var(--red)';
  setTimeout(() => {
    el.placeholder = 'Server name';
    el.style.borderColor = '';
  }, 1500);
}

// ── Keyboard: Enter to add person ──
document.getElementById('new-person-name').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') addPerson();
});

// ── Init ──
loadState();
updateClock();
setInterval(updateClock, 1000);
initTabs();
renderAll();
