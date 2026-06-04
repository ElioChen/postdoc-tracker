'use strict';

/* ===== Config ===== */
const STORAGE_KEY = 'postdoc-tracker-v1';

const STATUS = {
  contacted:   { label: '已联系',  color: '#3b82f6' },
  applied:     { label: '已网申',  color: '#8b5cf6' },
  interviewing:{ label: '面试中',  color: '#10b981' },
  no_response: { label: '未回复',  color: '#f59e0b' },
  rejected:    { label: '已拒绝',  color: '#ef4444' },
  accepted:    { label: '已录取 🎉', color: '#059669' },
};

const STATS_DEFS = [
  { key: 'all',          label: '全部',     color: '#7c3aed' },
  { key: 'contacted',    label: '已联系',   color: '#3b82f6' },
  { key: 'applied',      label: '已网申',   color: '#8b5cf6' },
  { key: 'interviewing', label: '面试中',   color: '#10b981' },
  { key: 'no_response',  label: '未回复',   color: '#f59e0b' },
  { key: 'rejected',     label: '已拒绝',   color: '#ef4444' },
  { key: 'accepted',     label: '已录取',   color: '#059669' },
];

/* ===== State ===== */
const state = {
  apps: [],
  filter: 'all',
  search: '',
  sort: 'date-desc',
  deleteId: null,
  openDropId: null,
};

/* ===== Storage ===== */
function loadApps() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
function saveApps() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.apps)); }

/* ===== Utilities ===== */
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function waitDays(dateStr) {
  if (!dateStr) return 0;
  const d = new Date(dateStr + 'T00:00:00');
  const now = new Date(); now.setHours(0,0,0,0);
  return Math.max(0, Math.floor((now - d) / 86400000));
}

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function todayStr() { return new Date().toISOString().slice(0, 10); }

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ===== Filtered / Sorted List ===== */
function getList() {
  let list = [...state.apps];
  if (state.filter !== 'all') list = list.filter(a => a.status === state.filter);
  if (state.search.trim()) {
    const q = state.search.toLowerCase();
    list = list.filter(a =>
      [a.piName, a.university, a.department, a.researchArea]
        .some(f => (f || '').toLowerCase().includes(q))
    );
  }
  const sorters = {
    'date-desc':   (a,b) => (b.applicationDate||'').localeCompare(a.applicationDate||''),
    'date-asc':    (a,b) => (a.applicationDate||'').localeCompare(b.applicationDate||''),
    'wait-desc':   (a,b) => waitDays(b.applicationDate) - waitDays(a.applicationDate),
    'university':  (a,b) => (a.university||'').localeCompare(b.university||''),
    'hindex-desc': (a,b) => (b.hIndex||0) - (a.hIndex||0),
    'papers-desc': (a,b) => (b.topPapers||0) - (a.topPapers||0),
  };
  list.sort(sorters[state.sort] || sorters['date-desc']);
  return list;
}

/* ===== Render ===== */
function renderStats() {
  const counts = { all: state.apps.length };
  Object.keys(STATUS).forEach(k => { counts[k] = 0; });
  state.apps.forEach(a => { if (a.status in counts) counts[a.status]++; });

  document.getElementById('statsGrid').innerHTML = STATS_DEFS.map(s => `
    <div class="stat-card ${state.filter === s.key ? 'active' : ''}"
         style="--stat-color:${s.color}" data-filter="${s.key}">
      <div class="stat-count">${counts[s.key] ?? 0}</div>
      <div class="stat-label">${s.label}</div>
    </div>`).join('');

  document.querySelectorAll('.stat-card').forEach(c =>
    c.addEventListener('click', () => { state.filter = c.dataset.filter; render(); })
  );
}

function renderFilterTabs() {
  document.getElementById('filterTabs').innerHTML = STATS_DEFS.map(s => `
    <button class="filter-tab ${state.filter === s.key ? 'active' : ''}" data-filter="${s.key}">
      ${s.label}
    </button>`).join('');

  document.querySelectorAll('.filter-tab').forEach(t =>
    t.addEventListener('click', () => { state.filter = t.dataset.filter; render(); })
  );
}

function renderTable() {
  const list = getList();
  const tbody = document.getElementById('tableBody');
  const table = document.getElementById('appTable');
  const empty = document.getElementById('emptyState');

  if (list.length === 0) {
    table.style.display = 'none';
    empty.style.display = 'flex';
    return;
  }
  table.style.display = '';
  empty.style.display = 'none';

  tbody.innerHTML = list.map(app => {
    const days   = waitDays(app.applicationDate);
    const wCls   = days > 60 ? 'alert' : days > 30 ? 'warn' : '';
    const hCls   = (app.hIndex  ||0) >= 60 ? 'hi' : (app.hIndex  ||0) >= 30 ? 'mid' : '';
    const pCls   = (app.topPapers||0) >= 10 ? 'hi' : (app.topPapers||0) >= 5  ? 'mid' : '';
    const sConf  = STATUS[app.status] || STATUS.contacted;
    const notesTip = app.notes ? ` title="${esc(app.notes)}"` : '';

    return `<tr data-id="${app.id}"${notesTip}>
      <td>
        <div class="pi-cell">
          <span class="pi-name">${esc(app.piName)}</span>
          <span class="pi-university">${esc(app.university)}</span>
          ${(app.department || app.researchArea) ? `<div class="pi-meta">
            ${app.department ? `<span class="pi-dept">${esc(app.department)}</span>` : ''}
            ${app.researchArea ? `<span class="pi-area">${esc(app.researchArea)}</span>` : ''}
          </div>` : ''}
        </div>
      </td>
      <td>
        <div class="links-cell">
          ${app.labWebsite
            ? `<a href="${esc(app.labWebsite)}" target="_blank" rel="noopener" class="tlink"><span class="tlink-icon">🔬</span>课题组主页</a>`
            : '<span class="text-muted" style="font-size:12px">—</span>'}
          ${app.scholarUrl
            ? `<a href="${esc(app.scholarUrl)}" target="_blank" rel="noopener" class="tlink"><span class="tlink-icon">📊</span>Google Scholar</a>`
            : ''}
        </div>
      </td>
      <td>
        ${app.hIndex != null && app.hIndex !== ''
          ? `<span class="nbadge ${hCls}">h = ${app.hIndex}</span>`
          : '<span class="text-muted" style="font-size:12px">—</span>'}
      </td>
      <td>
        ${app.topPapers != null && app.topPapers !== ''
          ? `<span class="nbadge ${pCls}">${app.topPapers} 篇</span>`
          : '<span class="text-muted" style="font-size:12px">—</span>'}
      </td>
      <td><span class="date-val">${fmtDate(app.applicationDate)}</span></td>
      <td><span class="wait-val ${wCls}">${days} 天</span></td>
      <td>
        <div class="status-wrap">
          <span class="sbadge ${app.status}" data-drop-toggle="${app.id}">
            <span class="sbadge-dot" style="background:${sConf.color}"></span>
            ${sConf.label}
          </span>
          <div class="sdrop ${state.openDropId === app.id ? 'open' : ''}" id="sdrop-${app.id}">
            ${Object.entries(STATUS).map(([k,v]) => `
              <div class="sopt" data-set-status="${app.id}" data-val="${k}">
                <span class="sopt-dot" style="background:${v.color}"></span>${v.label}
              </div>`).join('')}
          </div>
        </div>
      </td>
      <td>
        <div class="actions-cell">
          <button class="icon-btn" data-edit="${app.id}" title="编辑">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="icon-btn del" data-del="${app.id}" title="删除">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('[data-edit]').forEach(b =>
    b.addEventListener('click', () => openModal(b.dataset.edit))
  );
  tbody.querySelectorAll('[data-del]').forEach(b =>
    b.addEventListener('click', () => confirmDelete(b.dataset.del))
  );
  tbody.querySelectorAll('[data-drop-toggle]').forEach(badge =>
    badge.addEventListener('click', e => {
      e.stopPropagation();
      const id = badge.dataset.dropToggle;
      state.openDropId = state.openDropId === id ? null : id;
      renderTable();
    })
  );
  tbody.querySelectorAll('[data-set-status]').forEach(opt =>
    opt.addEventListener('click', e => {
      e.stopPropagation();
      const app = state.apps.find(a => a.id === opt.dataset.setStatus);
      if (app) {
        app.status = opt.dataset.val;
        app.updatedAt = new Date().toISOString();
        saveApps();
        state.openDropId = null;
        render();
        showToast(`状态已更新为「${STATUS[app.status]?.label}」`, 'success');
      }
    })
  );
}

function render() {
  renderStats();
  renderFilterTabs();
  renderTable();
}

/* ===== Modal ===== */
function openModal(id) {
  const overlay = document.getElementById('overlay');
  document.getElementById('appForm').reset();
  document.getElementById('editId').value = '';

  if (id) {
    const app = state.apps.find(a => a.id === id);
    if (!app) return;
    document.getElementById('modalTitle').textContent = '编辑申请';
    document.getElementById('editId').value        = app.id;
    document.getElementById('piName').value        = app.piName        || '';
    document.getElementById('university').value    = app.university    || '';
    document.getElementById('department').value    = app.department    || '';
    document.getElementById('researchArea').value  = app.researchArea  || '';
    document.getElementById('labWebsite').value    = app.labWebsite    || '';
    document.getElementById('scholarUrl').value    = app.scholarUrl    || '';
    document.getElementById('hIndex').value        = app.hIndex        != null ? app.hIndex        : '';
    document.getElementById('topPapers').value     = app.topPapers     != null ? app.topPapers     : '';
    document.getElementById('contactEmail').value  = app.contactEmail  || '';
    document.getElementById('applicationDate').value = app.applicationDate || '';
    document.getElementById('status').value        = app.status        || 'contacted';
    document.getElementById('notes').value         = app.notes         || '';
  } else {
    document.getElementById('modalTitle').textContent = '添加申请';
    document.getElementById('applicationDate').value  = todayStr();
    document.getElementById('status').value           = 'contacted';
  }

  overlay.classList.add('show');
}

function closeModal() {
  document.getElementById('overlay').classList.remove('show');
}

/* ===== Delete ===== */
function confirmDelete(id) {
  const app = state.apps.find(a => a.id === id);
  if (!app) return;
  state.deleteId = id;
  document.getElementById('deleteMsg').textContent =
    `确定要删除「${app.piName}（${app.university}）」的申请记录吗？此操作无法撤销。`;
  document.getElementById('deleteOverlay').classList.add('show');
}

function closeDeleteModal() {
  document.getElementById('deleteOverlay').classList.remove('show');
  state.deleteId = null;
}

/* ===== Form Submit ===== */
function handleSubmit(e) {
  e.preventDefault();
  const piName = document.getElementById('piName').value.trim();
  const university = document.getElementById('university').value.trim();
  const appDate = document.getElementById('applicationDate').value;
  if (!piName || !university || !appDate) {
    showToast('请填写必填字段（导师姓名、学校、申请日期）', 'error'); return;
  }

  const hVal = document.getElementById('hIndex').value;
  const pVal = document.getElementById('topPapers').value;

  const data = {
    piName,
    university,
    department:      document.getElementById('department').value.trim(),
    researchArea:    document.getElementById('researchArea').value.trim(),
    labWebsite:      document.getElementById('labWebsite').value.trim(),
    scholarUrl:      document.getElementById('scholarUrl').value.trim(),
    hIndex:          hVal !== '' ? parseInt(hVal) : null,
    topPapers:       pVal !== '' ? parseInt(pVal) : null,
    contactEmail:    document.getElementById('contactEmail').value.trim(),
    applicationDate: appDate,
    status:          document.getElementById('status').value,
    notes:           document.getElementById('notes').value.trim(),
  };

  const editId = document.getElementById('editId').value;
  if (editId) {
    const idx = state.apps.findIndex(a => a.id === editId);
    if (idx !== -1) {
      state.apps[idx] = { ...state.apps[idx], ...data, updatedAt: new Date().toISOString() };
      showToast('申请记录已更新', 'success');
    }
  } else {
    state.apps.push({ id: genId(), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    showToast('已添加新申请记录', 'success');
  }

  saveApps();
  closeModal();
  render();
}

/* ===== CSV Export ===== */
function exportCSV() {
  if (state.apps.length === 0) { showToast('暂无数据可导出', 'error'); return; }
  const headers = ['导师姓名','学校','院系','研究方向','课题组主页','Google Scholar','H指数','近5年一区论文','联系邮箱','申请日期','等待天数','状态','备注'];
  const rows = state.apps.map(a => [
    a.piName, a.university, a.department, a.researchArea, a.labWebsite, a.scholarUrl,
    a.hIndex ?? '', a.topPapers ?? '', a.contactEmail, a.applicationDate,
    waitDays(a.applicationDate), STATUS[a.status]?.label || a.status, a.notes,
  ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`));
  const csv = '﻿' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = `博士后申请记录_${todayStr()}.csv`;
  link.click(); URL.revokeObjectURL(url);
  showToast('CSV 文件已导出', 'success');
}

/* ===== Toast ===== */
function showToast(msg, type = 'default') {
  const wrap = document.getElementById('toastContainer');
  const el   = document.createElement('div');
  el.className = `toast ${type}`;
  const icons = { success: '✓', error: '✕', default: 'ℹ' };
  el.innerHTML = `<span>${icons[type] || 'ℹ'}</span>${esc(msg)}`;
  wrap.appendChild(el);
  setTimeout(() => {
    el.style.animation = 'toastOut 0.25s ease forwards';
    setTimeout(() => el.remove(), 250);
  }, 2600);
}

/* ===== Init ===== */
document.addEventListener('DOMContentLoaded', () => {
  state.apps = loadApps();
  render();

  /* header buttons */
  document.getElementById('addBtn').addEventListener('click', () => openModal());
  document.getElementById('exportBtn').addEventListener('click', exportCSV);
  document.getElementById('emptyAddBtn').addEventListener('click', () => openModal());

  /* modal close */
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  document.getElementById('overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('overlay')) closeModal();
  });

  /* form submit */
  document.getElementById('appForm').addEventListener('submit', handleSubmit);

  /* delete modal */
  document.getElementById('deleteCancelBtn').addEventListener('click', closeDeleteModal);
  document.getElementById('deleteOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('deleteOverlay')) closeDeleteModal();
  });
  document.getElementById('deleteConfirmBtn').addEventListener('click', () => {
    const app = state.apps.find(a => a.id === state.deleteId);
    state.apps = state.apps.filter(a => a.id !== state.deleteId);
    saveApps();
    closeDeleteModal();
    render();
    showToast(`已删除「${app?.piName}」`, 'success');
  });

  /* search & sort */
  document.getElementById('searchInput').addEventListener('input', e => {
    state.search = e.target.value; render();
  });
  document.getElementById('sortSelect').addEventListener('change', e => {
    state.sort = e.target.value; render();
  });

  /* close status dropdown on outside click */
  document.addEventListener('click', () => {
    if (state.openDropId) { state.openDropId = null; renderTable(); }
  });
});
