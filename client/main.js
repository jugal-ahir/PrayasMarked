const API_BASE = '/api/animals';
const AUTH_BASE = '/api/auth';

const SPECIES_DATA = {
  Dog: ['Labrador', 'German Shepherd', 'Golden Retriever', 'Bulldog', 'Beagle', 'Poodle', 'Rottweiler', 'Other'],
  Cat: ['Persian', 'Siamese', 'Maine Coon', 'Bengal', 'Ragdoll', 'Sphynx', 'Other'],
  Bird: ['Eagle', 'Kite', 'Parrot', 'Pigeon', 'Sparrow', 'Crow', 'Owl', 'Other'],
  Turtle: ['Red-Eared Slider', 'Box Turtle', 'Tortoise', 'Sea Turtle', 'Other'],
  Rabbit: ['Dutch', 'Lionhead', 'Angora', 'Rex', 'Other'],
  Other: ['Other']
};

let socket = null;

let authToken = null;
let currentUser = null;
let currentMarkOutId = null; // Track which animal is being marked out
let currentMoveId = null; // Track which animal is being moved
let currentEditId = null; // Track which animal is being edited
let currentRemarkId = null; // Track which animal is being remarked

function $(selector) {
  return document.querySelector(selector);
}

function createElement(tag, className) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  return el;
}

function formatDateTime(dt) {
  if (!dt) return '-';
  const d = new Date(dt);
  return `${d.toLocaleDateString()} • ${d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })}`;
}

function getSpeciesIcon(species) {
  const map = {
    Dog: '🐶',
    Cat: '🐱',
    Bird: '🕊️',
    Turtle: '🐢',
    Rabbit: '🐰'
  };
  return map[species] || '🐾';
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('visible');
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.classList.add('hidden'), 200);
  }, 2200);
}

function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

function playIntroAnimation() {
  const overlay = $('#intro-overlay');
  if (!overlay) return;

  overlay.classList.remove('hidden');

  setTimeout(() => {
    overlay.classList.add('hidden');
  }, 2000);
}

async function fetchJSON(url, options) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const res = await fetch(url, {
    headers,
    ...options
  });
  if (!res.ok) {
    let msg = 'Request failed';
    try {
      const data = await res.json();
      msg = data.message || msg;
    } catch (e) {
      // ignore
    }
    throw new Error(msg);
  }
  return res.json();
}

function renderAnimalCard(animal, { showMarkOut = false, showDelete = false } = {}) {
  const card = createElement('div', 'animal-card');

  const avatar = createElement('div', 'animal-avatar');
  avatar.textContent = getSpeciesIcon(animal.species);

  const info = createElement('div', 'animal-info');
  const main = createElement('div', 'animal-main');
  const sub = animal.subspecies ? ` (${animal.subspecies})` : '';
  main.textContent = `${animal.species}${sub} · ${animal.destination}`;

  if (animal.remark) {
    const remarkTag = createElement('div', 'badge');
    remarkTag.style.background = 'var(--bg-soft)';
    remarkTag.style.color = 'var(--text-soft)';
    remarkTag.style.fontSize = '0.75rem';
    remarkTag.style.marginTop = '0.2rem';
    remarkTag.style.border = '1px solid var(--border)';
    remarkTag.textContent = `Remark: ${animal.remark}${animal.isTreated ? ' (Treated)' : ' (Not Treated)'}`;
    main.appendChild(remarkTag);
  }

  if (animal.markOutType) {
    const outSpan = document.createElement('span');
    outSpan.textContent = ` · ${animal.markOutType}`;
    if (animal.markOutType === 'Other' && animal.markOutReason) {
      outSpan.textContent += ` (${animal.markOutReason})`;
    }
    main.appendChild(outSpan);
  }

  const meta = createElement('div', 'animal-meta');
  const inOutText =
    animal.status === 'IN'
      ? `IN: ${formatDateTime(animal.inAt)}`
      : `OUT: ${formatDateTime(animal.outAt)}`;

  meta.innerHTML = `
    <span>${inOutText}</span>
    <span> · By: ${animal.status === 'OUT' && animal.outBy ? animal.outBy : animal.inBy}</span>
  `;

  info.appendChild(main);
  info.appendChild(meta);
  card.appendChild(info);

  const right = createElement('div');
  right.style.display = 'flex';
  right.style.flexDirection = 'column';
  right.style.alignItems = 'flex-end';
  right.style.gap = '0.25rem';

  const idPill = createElement('div', 'animal-id');
  idPill.textContent = animal.jobId;

  // Show Incharge Person
  if (animal.inchargePerson) {
    const incharge = createElement('div', 'incharge-pill');
    incharge.textContent = `Incharge: ${animal.inchargePerson}`;
    incharge.style.fontSize = '0.75rem';
    incharge.style.color = '#ef4444'; // Red color
    incharge.style.fontWeight = '500';
    incharge.style.marginTop = '0.2rem';
    right.appendChild(incharge);
  }

  const badge = createElement('div', 'badge ' + (animal.status === 'IN' ? 'badge-in' : 'badge-out'));
  badge.textContent = animal.status;

  right.appendChild(idPill);
  right.appendChild(badge);

  if (showMarkOut && animal.status === 'IN') {
    const btnGroup = createElement('div', 'animal-actions');

    const moveBtn = createElement('button', 'btn-ghost btn-move');
    moveBtn.textContent = '📍 Move';
    moveBtn.title = 'Change Destination';
    moveBtn.onclick = () => handleChangeDestination(animal.jobId);
    btnGroup.appendChild(moveBtn);

    const editBtn = createElement('button', 'btn-ghost');
    editBtn.textContent = '✏️ Edit';
    editBtn.title = 'Edit Details';
    editBtn.onclick = () => handleEdit(animal);
    btnGroup.appendChild(editBtn);

    const historyBtn = createElement('button', 'btn-ghost');
    historyBtn.textContent = '📜 History';
    historyBtn.title = 'View record';
    historyBtn.onclick = () => {
      handleViewHistory(animal.jobId);
      const hnav = document.querySelector('[data-view="history"]');
      if (hnav) hnav.click();
    };
    btnGroup.appendChild(historyBtn);

    const remarkBtn = createElement('button', 'btn-ghost');
    remarkBtn.textContent = '💬 Remark';
    remarkBtn.title = 'Add health note';
    remarkBtn.onclick = () => handleRemark(animal);
    btnGroup.appendChild(remarkBtn);

    const outBtn = createElement('button', 'btn-ghost');
    outBtn.textContent = '🚪 OUT';
    outBtn.onclick = () => handleMarkOut(animal.jobId);
    btnGroup.appendChild(outBtn);

    const qrBtn = createElement('button', 'btn-ghost');
    qrBtn.textContent = '🎫 QR';
    qrBtn.onclick = () => handleShowQR(animal.jobId);
    btnGroup.appendChild(qrBtn);

    right.appendChild(btnGroup);
  }

  if (showDelete && currentUser && currentUser.role === 'admin') {
    const del = createElement('button', 'btn-ghost btn-danger');
    del.textContent = 'Delete';
    del.style.marginTop = '0.2rem';
    del.onclick = () => handleDelete(animal.jobId);
    right.appendChild(del);
  }

  card.appendChild(avatar);
  card.appendChild(info);
  card.appendChild(right);

  return card;
}

async function loadInAnimals() {
  const container = $('#in-list');
  const q = $('#search-in-list') ? $('#search-in-list').value.trim() : '';
  container.innerHTML = '';
  try {
    const url = q ? `${API_BASE}/in?q=${encodeURIComponent(q)}` : `${API_BASE}/in`;
    const animals = await fetchJSON(url);
    if (!animals.length) {
      container.classList.add('empty-state');
      container.innerHTML = '<p>No animals currently marked IN.</p>';
    } else {
      container.classList.remove('empty-state');
      animals.forEach((a) => container.appendChild(renderAnimalCard(a, { showMarkOut: true })));
    }
    $('#stat-in-count').textContent = animals.length.toString();
  } catch (e) {
    container.classList.add('empty-state');
    container.innerHTML = `<p>${e.message}</p>`;
  }
}

async function loadOutAnimals() {
  const container = $('#out-list');
  const q = $('#search-out-list') ? $('#search-out-list').value.trim() : '';
  container.innerHTML = '';
  try {
    const url = q ? `${API_BASE}/out?q=${encodeURIComponent(q)}` : `${API_BASE}/out`;
    const animals = await fetchJSON(url);
    if (!animals.length) {
      container.classList.add('empty-state');
      container.innerHTML = '<p>No recent OUT entries.</p>';
    } else {
      container.classList.remove('empty-state');
      animals.forEach((a) => container.appendChild(renderAnimalCard(a)));
    }
    const today = new Date().toDateString();
    const todayOut = animals.filter((a) => a.outAt && new Date(a.outAt).toDateString() === today);
    $('#stat-out-count').textContent = todayOut.length.toString();
  } catch (e) {
    container.classList.add('empty-state');
    container.innerHTML = `<p>${e.message}</p>`;
  }
}

async function handleMarkIn(evt) {
  evt.preventDefault();
  const jobId = $('#job-id').value.trim();
  const species = $('#species').value;

  const subSelect = $('#subspecies');
  const subOther = $('#subspecies-other');
  let subspecies = subSelect.value;
  if (subspecies === 'Other') {
    subspecies = subOther.value.trim();
    if (!subspecies) {
      showToast('Please specify the other subspecies/type.');
      return;
    }
  }

  const destination = $('#destination').value;
  const inchargePerson = $('#incharge-person').value.trim();
  const inAt = $('#in-datetime').value;

  if (!jobId || !species || !destination || !inAt || !inchargePerson) {
    showToast('Please fill all required fields to mark IN.');
    return;
  }

  try {
    const payload = { jobId, species, subspecies, destination, inchargePerson, inAt };
    const animal = await fetchJSON(`${API_BASE}/in`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    showToast(`Animal marked IN with ID ${animal.jobId}`);
    $('#mark-in-form').reset();
    loadInAnimals();

    loadLogs(); // keep logs in sync for admins
    loadAnalytics();
  } catch (e) {
    showToast(e.message);
  }
}

// Open modal instead of direct API call
function handleMarkOut(jobId) {
  // Confirm basic intent first (optional, can skip if modal is enough)
  // if (!confirm('Are you sure you want to mark this animal as OUT?')) return;

  currentMarkOutId = jobId;
  const modal = $('#mark-out-modal');
  modal.classList.remove('hidden');

  // Reset fields
  $('#mark-out-type').value = 'Release';
  $('#mark-out-reason').style.display = 'none';
  $('#mark-out-reason').value = '';
}

async function handleConfirmMarkOut() {
  if (!currentMarkOutId) return;

  const type = $('#mark-out-type').value;
  const reasonInput = $('#mark-out-reason');
  let reason = '';

  if (type === 'Other') {
    reason = reasonInput.value.trim();
    if (!reason) {
      showToast('Please specify the reason.');
      return;
    }
  }

  const now = new Date();
  const outAt = now.toISOString();

  try {
    const res = await fetchJSON(`${API_BASE}/out/${encodeURIComponent(currentMarkOutId)}`, {
      method: 'POST',
      body: JSON.stringify({
        outAt,
        markOutType: type,
        markOutReason: reason
      })
    });

    showToast(`Animal ${res.jobId} marked OUT (${type})`);

    // Close modal
    $('#mark-out-modal').classList.add('hidden');
    currentMarkOutId = null;

    loadOutAnimals();
    loadInAnimals(); // refresh list
    loadLogs();
    loadAnalytics();
  } catch (err) {
    showToast(err.message || 'Error marking OUT');
  }
}
function handleChangeDestination(jobId) {
  currentMoveId = jobId;
  $('#change-dest-modal').classList.remove('hidden');
  $('#new-destination').value = 'Treatment Center'; // default reset
}

async function handleConfirmChangeDest() {
  if (!currentMoveId) return;

  const destination = $('#new-destination').value;
  try {
    await fetchJSON(`${API_BASE}/${encodeURIComponent(currentMoveId)}`, {
      method: 'PUT',
      body: JSON.stringify({ destination })
    });

    showToast(`Animal moved to ${destination}`);
    $('#change-dest-modal').classList.add('hidden');
    currentMoveId = null;

    loadInAnimals();
    loadAnalytics();
  } catch (err) {
    showToast(err.message || 'Error moving animal');
  }
}



function handleEdit(animal) {
  currentEditId = animal.jobId; // Store original ID to identify record
  const modal = $('#edit-animal-modal');
  modal.classList.remove('hidden');

  // Populate fields
  $('#edit-job-id').value = animal.jobId;
  $('#edit-species').value = animal.species;

  // Trigger species change to populate subspecies
  $('#edit-species').dispatchEvent(new Event('change'));

  // Set subspecies after options are populated
  const subSelect = $('#edit-subspecies');
  if (animal.subspecies) {
    // Check if it's a standard option
    const options = Array.from(subSelect.options).map(o => o.value);
    if (options.includes(animal.subspecies)) {
      subSelect.value = animal.subspecies;
      $('#edit-subspecies').dispatchEvent(new Event('change')); // hide other input
    } else {
      // Must be custom/other
      subSelect.value = 'Other';
      $('#edit-subspecies').dispatchEvent(new Event('change')); // show other input
      $('#edit-subspecies-other').value = animal.subspecies;
    }
  }

  $('#edit-destination').value = animal.destination;
  $('#edit-incharge').value = animal.inchargePerson || '';
}

async function handleConfirmEdit() {
  if (!currentEditId) return;

  const jobId = $('#edit-job-id').value.trim();
  const species = $('#edit-species').value;

  const subSelect = $('#edit-subspecies');
  const subOther = $('#edit-subspecies-other');
  let subspecies = subSelect.value;
  if (subspecies === 'Other') {
    subspecies = subOther.value.trim();
    if (!subspecies) {
      showToast('Please specify the subspecies/type.');
      return;
    }
  }

  const destination = $('#edit-destination').value;
  const inchargePerson = $('#edit-incharge').value.trim();

  if (!jobId || !species || !destination || !inchargePerson) {
    showToast('Please fill all required fields.');
    return;
  }

  try {
    const res = await fetchJSON(`${API_BASE}/${encodeURIComponent(currentEditId)}`, {
      method: 'PUT',
      body: JSON.stringify({
        jobId,
        species,
        subspecies,
        destination,
        inchargePerson
      })
    });

    showToast(`Animal details updated.`);
    $('#edit-animal-modal').classList.add('hidden');
    currentEditId = null;

    loadInAnimals();
    loadAnalytics();
  } catch (err) {
    showToast(err.message || 'Error updating animal');
  }
}

function handleRemark(animal) {
  currentRemarkId = animal.jobId;
  const modal = $('#remark-modal');
  modal.classList.remove('hidden');

  $('#remark-type').value = animal.remark || '';
  $('#remark-treated').checked = !!animal.isTreated;
}

async function handleConfirmRemark() {
  if (!currentRemarkId) return;

  const remark = $('#remark-type').value;
  const isTreated = $('#remark-treated').checked;

  try {
    const res = await fetchJSON(`${API_BASE}/${encodeURIComponent(currentRemarkId)}`, {
      method: 'PUT',
      body: JSON.stringify({ remark, isTreated })
    });

    showToast('Remark updated.');
    $('#remark-modal').classList.add('hidden');
    currentRemarkId = null;

    loadInAnimals();
    loadAnalytics();
  } catch (err) {
    showToast(err.message || 'Error updating remark');
  }
}

async function handleConfirmExport() {
  const start = $('#export-start-date').value;
  const end = $('#export-end-date').value;

  if (!start || !end) {
    showToast('Please select both start and end dates.');
    return;
  }

  const url = `${API_BASE}/export?startDate=${start}&endDate=${end}`;

  // Use a hidden anchor to trigger download
  const a = document.createElement('a');
  a.href = url;
  // Add token if needed, but since it's a GET request, if we use fetch it's easier to handle headers.
  // However, simple window.location or anchor won't pass Authorization header.
  // We can fetch the blob and then download.

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Export failed');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    a.href = downloadUrl;
    a.download = `animal_tracking_export_${start}_to_${end}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    a.remove();

    showToast('Export successful!');
    $('#export-modal').classList.add('hidden');
  } catch (err) {
    showToast(err.message || 'Error exporting CSV');
  }
}

async function loadLogs() {
  const params = new URLSearchParams();
  const q = $('#global-search').value.trim();
  const animalId = $('#search-id').value.trim();
  const species = $('#search-species').value.trim();
  const user = $('#search-user').value.trim();
  const status = $('#filter-status').value;
  const destination = $('#filter-destination').value;
  const fromDate = $('#from-date').value;
  const toDate = $('#to-date').value;

  if (q) {
    params.append('q', q);
  }
  if (animalId) params.append('animalId', animalId);
  if (species) params.append('species', species);
  if (user) params.append('user', user);
  if (status) params.append('status', status);
  if (destination) params.append('destination', destination);
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);

  const inContainer = $('#logs-in-list');
  const outContainer = $('#logs-out-list');
  inContainer.innerHTML = '';
  outContainer.innerHTML = '';

  try {
    const logs = await fetchJSON(`${API_BASE}/logs?${params.toString()}`);
    const inLogs = logs.filter((l) => l.status === 'IN');
    const outLogs = logs.filter((l) => l.status === 'OUT');

    if (!inLogs.length) {
      inContainer.classList.add('empty-state');
      inContainer.innerHTML = '<p>No matching IN entries.</p>';
    } else {
      inContainer.classList.remove('empty-state');
      inLogs.forEach((a) => inContainer.appendChild(renderAnimalCard(a, { showDelete: true })));
    }

    if (!outLogs.length) {
      outContainer.classList.add('empty-state');
      outContainer.innerHTML = '<p>No matching OUT entries.</p>';
    } else {
      outContainer.classList.remove('empty-state');
      outLogs.forEach((a) => outContainer.appendChild(renderAnimalCard(a, { showDelete: true })));
    }
  } catch (e) {
    inContainer.classList.add('empty-state');
    outContainer.classList.add('empty-state');
    inContainer.innerHTML = `<p>${e.message}</p>`;
    outContainer.innerHTML = `<p>${e.message}</p>`;
  }
}

async function loadAnalytics() {
  const container = $('#admin-analytics');

  // Always show analytics for authenticated users
  if (!currentUser) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';

  try {
    const stats = await fetchJSON(`${API_BASE}/stats`);
    const {
      total,
      totalIn,
      totalOut,
      todayIn,
      todayOut,
      treatmentIn,
      rehabIn
    } = stats;

    $('#an-total').textContent = total.toString();
    $('#an-in').textContent = totalIn.toString();
    $('#an-out').textContent = totalOut.toString();
    $('#an-today').textContent = (todayIn + todayOut).toString();
    $('#an-total-sub').textContent = 'All-time records';
    $('#an-in-sub').textContent = `${totalIn} currently IN`;
    $('#an-out-sub').textContent = `${totalOut} completed journeys`;
    $('#an-today-sub').textContent = `${todayIn} IN · ${todayOut} OUT today`;
    $('#an-treatment').textContent = treatmentIn.toString();
    $('#an-rehab').textContent = rehabIn.toString();

    const maxVal = Math.max(totalIn, totalOut, todayIn + todayOut, 1);
    const bars = $('#analytics-bars');
    bars.innerHTML = '';

    const configs = [
      { label: 'IN vs OUT (overall)', value: totalIn, color: 'var(--accent)' },
      { label: 'OUT completion rate', value: totalOut, color: '#22c55e' },
      { label: 'Today activity', value: todayIn + todayOut, color: '#f97316' }
    ];

    configs.forEach((cfg) => {
      const row = createElement('div', 'bar-row');
      const label = createElement('div', 'bar-label');
      label.textContent = cfg.label;
      const track = createElement('div', 'bar-track');
      const fill = createElement('div', 'bar-fill');
      fill.style.background = cfg.color;
      const scale = cfg.value / maxVal;
      // Slight delay so transition plays
      requestAnimationFrame(() => {
        fill.style.transform = `scaleX(${scale})`;
      });
      track.appendChild(fill);
      row.appendChild(label);
      row.appendChild(track);
      bars.appendChild(row);
    });
  } catch (e) {
    // Hide analytics if logs fail (e.g. not admin or server error)
    container.style.display = 'none';
  }
}

function setupNav() {
  document.querySelectorAll('.nav-link').forEach((btn) => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      document.querySelectorAll('.nav-link').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
      document.querySelector(`#${view}-view`).classList.add('active');
      window.localStorage.setItem('pc_current_view', view);

      if (view === 'logs') {
        loadLogs();
      }
      if (view === 'dashboard') {
        loadInAnimals();
        loadOutAnimals();
        loadAnalytics();
      }
      if (view === 'mark-in') {
        loadInAnimals();
      }
      if (view === 'marked-out') {
        loadOutAnimals();
      }
      if (view === 'history') {
        loadHistoryAnimals();
      }
    });
  });
}

function setupAuthUI() {
  const storedToken = window.localStorage.getItem('pc_token');
  const storedUser = window.localStorage.getItem('pc_user');
  if (storedToken && storedUser) {
    authToken = storedToken;
    currentUser = JSON.parse(storedUser);
    showAppForUser();
  } else {
    showAuth();
  }
}

function showAuth() {
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
  document.querySelector('#auth-view').classList.add('active');
  $('#main-nav').style.display = 'none';
  $('#user-panel').style.display = 'none';
}

function showAppForUser() {
  if (!currentUser) return showAuth();
  $('#user-name-display').textContent = currentUser.name;
  $('#user-role-display').textContent = currentUser.role.toUpperCase();
  $('#user-role-display').className = 'badge ' + (currentUser.role === 'admin' ? 'badge-in' : 'badge-out');

  $('#main-nav').style.display = 'flex';
  $('#user-panel').style.display = 'flex';

  // Show logs tab only for admins
  const logsNav = $('#logs-nav');
  const registerNav = $('#register-nav');
  const isAdmin = currentUser.role === 'admin';

  logsNav.style.display = isAdmin ? 'inline-flex' : 'none';
  registerNav.style.display = isAdmin ? 'inline-flex' : 'none';

  // Navigation persistence
  const savedView = window.localStorage.getItem('pc_current_view') || 'dashboard';
  const targetBtn = document.querySelector(`.nav-link[data-view="${savedView}"]`);
  if (targetBtn) {
    targetBtn.click();
  } else {
    $('[data-view="dashboard"]').click();
  }

  setupSocket();
  if (currentUser.role === 'admin') {
    loadLogs();
  }

  // Setup listeners for Mark IN form
  setupSpeciesListeners('species', 'subspecies', 'subspecies-other');

  // Setup listeners for Edit form
  setupSpeciesListeners('edit-species', 'edit-subspecies', 'edit-subspecies-other');
}

// Helper to setup species logic for a pair of inputs
function setupSpeciesListeners(speciesId, subId, otherId) {
  const speciesEl = $(`#${speciesId}`);
  const subEl = $(`#${subId}`);
  const otherEl = $(`#${otherId}`);

  if (!speciesEl || !subEl || !otherEl) return;

  speciesEl.addEventListener('change', (e) => {
    const sp = e.target.value;

    subEl.innerHTML = '<option value="">Select type</option>';
    subEl.disabled = !sp;
    otherEl.style.display = 'none';

    if (sp && SPECIES_DATA[sp]) {
      SPECIES_DATA[sp].forEach(opt => {
        const o = document.createElement('option');
        o.value = opt;
        o.textContent = opt;
        subEl.appendChild(o);
      });
    } else if (sp === 'Other') {
      const o = document.createElement('option');
      o.value = 'Other';
      o.textContent = 'Other';
      subEl.appendChild(o);
    }
  });

  subEl.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'Other') {
      otherEl.style.display = 'block';
    } else {
      otherEl.style.display = 'none';
    }
  });
}


async function handleLogin(evt) {
  evt.preventDefault();
  const email = $('#login-email').value.trim();
  const password = $('#login-password').value;
  if (!email || !password) {
    showToast('Please enter email and password.');
    return;
  }
  try {
    const data = await fetchJSON(`${AUTH_BASE}/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    authToken = data.token;
    currentUser = data.user;
    window.localStorage.setItem('pc_token', authToken);
    window.localStorage.setItem('pc_user', JSON.stringify(currentUser));
    showToast(`Welcome back, ${currentUser.name}`);
    showAppForUser();
  } catch (e) {
    showToast(e.message);
  }
}

async function handleRegisterUser(evt) {
  evt.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') {
    showToast('Only admins can register new users.');
    return;
  }
  const name = $('#register-name').value.trim();
  const email = $('#register-email').value.trim();
  const password = $('#register-password').value;
  if (!name || !email || !password) {
    showToast('Please fill all fields to register a user.');
    return;
  }
  try {
    await fetchJSON(`${AUTH_BASE}/signup`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    showToast(`User ${name} registered.`);
    $('#register-form').reset();
    toggleRegisterModal(false);
  } catch (e) {
    showToast(e.message);
  }
}

async function handleDelete(animalId) {
  if (!currentUser || currentUser.role !== 'admin') {
    showToast('Only admins can delete entries.');
    return;
  }
  const confirmed = window.confirm(`Delete animal entry ${animalId}? This cannot be undone.`);
  if (!confirmed) return;
  try {
    await fetchJSON(`${API_BASE}/${encodeURIComponent(animalId)}`, {
      method: 'DELETE'
    });
    showToast(`Entry ${animalId} deleted.`);
    await Promise.all([loadInAnimals(), loadOutAnimals(), loadLogs()]);
    loadAnalytics();
  } catch (e) {
    showToast(e.message);
  }
}

function toggleRegisterModal(show) {
  const modal = $('#register-modal');
  if (show) {
    modal.classList.remove('hidden');
  } else {
    modal.classList.add('hidden');
  }
}

function handleLogout() {
  authToken = null;
  currentUser = null;
  window.localStorage.removeItem('pc_token');
  window.localStorage.removeItem('pc_user');
  showToast('Logged out.');
  showAuth();
}

function setupSocket() {
  if (socket) return;
  socket = io();

  socket.on('animal_update', (data) => {
    console.log('Real-time update received:', data);
    // Refresh only if on dashboard or logs
    const activeView = document.querySelector('.view.active').id;
    if (activeView === 'dashboard-view' || activeView === 'active-view') {
      loadInAnimals();
      loadOutAnimals();
      loadAnalytics();
    } else if (activeView === 'logs-view' && currentUser && currentUser.role === 'admin') {
      loadLogs();
    } else if (activeView === 'history-view') {
      loadHistoryAnimals();
    }
  });

  socket.on('history_update', (data) => {
    const historyJobId = $('#history-job-id').value.trim();
    if (historyJobId === data.jobId) {
      handleViewHistory();
    }
  });
}

function handleShowQR(jobId) {
  const canvas = $('#qr-canvas');
  const modal = $('#qr-modal');
  $('#qr-display-id').textContent = jobId;

  QRCode.toCanvas(canvas, jobId, {
    width: 250,
    margin: 2,
    color: {
      dark: '#0f172a',
      light: '#ffffff'
    }
  }, function (error) {
    if (error) {
      console.error(error);
      showToast('Error generating QR code');
      return;
    }
    modal.classList.remove('hidden');
  });
}

async function handleViewHistory(passedId = null) {
  const jobId = passedId || $('#history-sidebar-search').value.trim() || ($('#history-job-id') ? $('#history-job-id').value.trim() : '');
  if (!jobId && !passedId) {
    showToast('Please select an animal or enter a Job ID');
    return;
  }

  // Update sidebar active state
  document.querySelectorAll('.mini-animal-card').forEach(c => {
    c.classList.toggle('active', c.dataset.id === jobId);
  });

  const container = $('#timeline-container');
  container.innerHTML = '<div class="empty-state"><p>🔍 Searching records for ' + jobId + '...</p></div>';
  container.classList.remove('empty-state');
  container.classList.remove('has-items');

  try {
    const history = await fetchJSON(`/api/medical/${encodeURIComponent(jobId)}`);
    container.innerHTML = '';
    container.classList.add('has-items');

    if (history.length === 0) {
      container.classList.add('empty-state');
      container.classList.remove('has-items');
      container.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">📋</div>
            <h3>Timeline Empty</h3>
            <p>Animal <strong>${jobId}</strong> is registered but has no journey logs yet.</p>
          `;
      return;
    }

    history.forEach(record => {
      const item = createElement('div', 'timeline-item');
      item.innerHTML = `
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <div class="timeline-date">${new Date(record.date).toLocaleString()}</div>
                    <div class="timeline-event">${record.event}</div>
                    <div class="timeline-desc">${record.description}</div>
                    <div class="timeline-by">By: ${record.performedBy}</div>
                </div>
            `;
      container.appendChild(item);
    });
  } catch (e) {
    container.classList.add('empty-state');
    container.classList.remove('has-items');
    container.innerHTML = `<h3>Error: ${e.message}</h3>`;
  }
}

async function loadHistoryAnimals() {
  const sidebarList = $('#history-animal-list');
  const search = $('#history-sidebar-search').value.toLowerCase();

  try {
    const animals = await fetchJSON(`${API_BASE}${search ? '?search=' + encodeURIComponent(search) : ''}`);
    sidebarList.innerHTML = '';

    if (animals.length === 0) {
      sidebarList.innerHTML = '<p class="helper-text" style="text-align: center; padding: 1rem;">No animals found.</p>';
      return;
    }

    animals.forEach(animal => {
      const card = createElement('div', 'mini-animal-card');
      card.dataset.id = animal.jobId;
      card.innerHTML = `
        <div class="mini-avatar">${getSpeciesIcon(animal.species)}</div>
        <div class="mini-info">
          <h4>${animal.jobId}</h4>
          <p>${animal.species} • ${animal.status}</p>
        </div>
      `;
      card.onclick = () => handleViewHistory(animal.jobId);
      sidebarList.appendChild(card);
    });
  } catch (e) {
    sidebarList.innerHTML = `<p class="helper-text">Error: ${e.message}</p>`;
  }
}

function setupEvents() {
  // Auth
  $('#login-form').addEventListener('submit', handleLogin);
  $('#logout-btn').addEventListener('click', handleLogout);
  $('#register-nav').addEventListener('click', () => toggleRegisterModal(true));
  $('#close-register').addEventListener('click', () => toggleRegisterModal(false));
  $('#register-form').addEventListener('submit', handleRegisterUser);

  // App actions
  $('#mark-in-form').addEventListener('submit', handleMarkIn);
  $('#refresh-in').addEventListener('click', loadInAnimals);
  $('#refresh-out').addEventListener('click', loadOutAnimals);
  $('#apply-filters').addEventListener('click', loadLogs);
  $('#clear-filters').addEventListener('click', () => {
    $('#search-id').value = '';
    $('#search-species').value = '';
    $('#search-user').value = '';
    $('#filter-status').value = '';
    $('#filter-destination').value = '';
    $('#from-date').value = '';
    $('#to-date').value = '';
    loadLogs();
  });

  // Auto-apply logs filters with debounce
  const debouncedLoadLogs = debounce(loadLogs, 300);
  const quickInputs = ['#global-search', '#search-id', '#search-species', '#search-user'];
  quickInputs.forEach((sel) => {
    const el = $(sel);
    if (el) {
      el.addEventListener('input', debouncedLoadLogs);
    }
  });

  ['#filter-status', '#filter-destination', '#from-date', '#to-date'].forEach((sel) => {
    const el = $(sel);
    if (el) {
      el.addEventListener('change', debouncedLoadLogs);
    }
  });

  const inSearch = $('#search-in-list');
  if (inSearch) {
    inSearch.addEventListener('input', debounce(() => {
      loadInAnimals();
    }, 300));
  }

  const outSearch = $('#search-out-list');
  if (outSearch) {
    outSearch.addEventListener('input', debounce(() => {
      loadOutAnimals();
    }, 300));
  }

  const inDt = $('#in-datetime');
  if (inDt && !inDt.value) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    inDt.value = now.toISOString().slice(0, 16);
  }



  // Mark Out Modal Event Listeners
  const markOutType = $('#mark-out-type');
  if (markOutType) {
    markOutType.addEventListener('change', (e) => {
      const val = e.target.value;
      const reason = $('#mark-out-reason');
      reason.style.display = val === 'Other' ? 'block' : 'none';
      if (val === 'Other') reason.focus();
    });
  }

  const cancelMarkOut = $('#cancel-mark-out');
  if (cancelMarkOut) {
    cancelMarkOut.addEventListener('click', () => {
      $('#mark-out-modal').classList.add('hidden');
      currentMarkOutId = null;
    });
  }

  const confirmMarkOut = $('#confirm-mark-out');
  if (confirmMarkOut) {
    confirmMarkOut.addEventListener('click', handleConfirmMarkOut);
  }

  // Change Destination Modal Listeners
  const cancelMove = $('#cancel-change-dest');
  if (cancelMove) {
    cancelMove.addEventListener('click', () => {
      $('#change-dest-modal').classList.add('hidden');
      currentMoveId = null;
    });
  }

  const confirmMove = $('#confirm-change-dest');
  if (confirmMove) {
    confirmMove.addEventListener('click', handleConfirmChangeDest);
  }

  // Edit Modal Listeners
  const cancelEdit = $('#cancel-edit');
  if (cancelEdit) {
    cancelEdit.addEventListener('click', () => {
      $('#edit-animal-modal').classList.add('hidden');
      currentEditId = null;
    });
  }

  const confirmEdit = $('#confirm-edit');
  if (confirmEdit) {
    confirmEdit.addEventListener('click', handleConfirmEdit);
  }

  // Export Modal
  const openExport = $('#open-export-modal');
  if (openExport) {
    openExport.addEventListener('click', () => {
      $('#export-modal').classList.remove('hidden');
      // Default to today
      const today = new Date().toISOString().split('T')[0];
      $('#export-start-date').value = today;
      $('#export-end-date').value = today;
    });
  }

  const cancelExport = $('#cancel-export');
  if (cancelExport) {
    cancelExport.addEventListener('click', () => {
      $('#export-modal').classList.add('hidden');
    });
  }

  const confirmExport = $('#confirm-export');
  if (confirmExport) {
    confirmExport.addEventListener('click', handleConfirmExport);
  }

  // Remark Modal
  const cancelRemark = $('#cancel-remark');
  if (cancelRemark) {
    cancelRemark.addEventListener('click', () => {
      $('#remark-modal').classList.add('hidden');
      currentRemarkId = null;
    });
  }

  const confirmRemark = $('#confirm-remark');
  if (confirmRemark) {
    confirmRemark.addEventListener('click', handleConfirmRemark);
  }

  // History Sidebar Search
  const sidebarSearch = $('#history-sidebar-search');
  if (sidebarSearch) {
    sidebarSearch.addEventListener('input', debounce(() => {
      loadHistoryAnimals();
    }, 300));
  }

  const clearHistorySearch = $('#clear-history-search');
  if (clearHistorySearch) {
    clearHistorySearch.addEventListener('click', () => {
      $('#history-sidebar-search').value = '';
      loadHistoryAnimals();
      resetHistoryView();
    });
  }

  function resetHistoryView() {
    const container = $('#timeline-container');
    container.classList.remove('has-items');
    container.innerHTML = `
    <div class="history-empty">
      <div class="icon">🔍</div>
      <h3>No Animal Selected</h3>
      <p>Select an animal from the list on the left to view its full history.</p>
    </div>
  `;
    document.querySelectorAll('.mini-animal-card').forEach(c => c.classList.remove('active'));
  }

  // QR Modal
  $('#close-qr').addEventListener('click', () => $('#qr-modal').classList.add('hidden'));
  $('#download-qr').addEventListener('click', () => {
    const canvas = $('#qr-canvas');
    const link = document.createElement('a');
    link.download = `QR_${$('#qr-display-id').textContent}.png`;
    link.href = canvas.toDataURL();
    link.click();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  playIntroAnimation();
  setupNav();
  setupEvents();
  setupAuthUI();
});


