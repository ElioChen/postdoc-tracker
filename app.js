'use strict';

/* =====================================================================
   Constants
   ===================================================================== */
const STORAGE_KEY = 'postdoc-tracker-v2';

const STATUS = {
  contacted:    { label: '已联系',    color: '#3b82f6' },
  applied:      { label: '已网申',    color: '#8b5cf6' },
  interviewing: { label: '面试中',    color: '#10b981' },
  no_response:  { label: '未回复',    color: '#f59e0b' },
  rejected:     { label: '已拒绝',    color: '#ef4444' },
  accepted:     { label: '已录取 🎉', color: '#059669' },
};

const STATS_DEF = [
  { key: 'all',          label: '全部',    color: '#7c3aed' },
  { key: 'contacted',    label: '已联系',  color: '#3b82f6' },
  { key: 'applied',      label: '已网申',  color: '#8b5cf6' },
  { key: 'interviewing', label: '面试中',  color: '#10b981' },
  { key: 'no_response',  label: '未回复',  color: '#f59e0b' },
  { key: 'rejected',     label: '已拒绝',  color: '#ef4444' },
  { key: 'accepted',     label: '已录取',  color: '#059669' },
];

/* ---- University DB ---- */
// [short, full, cc, qs2025]  cc = ISO 3166-1 alpha-2 country code
const UNI_DB = [
  ["MIT","Massachusetts Institute of Technology","US",1],
  ["Cambridge","University of Cambridge","GB",5],
  ["Oxford","University of Oxford","GB",3],
  ["Harvard","Harvard University","US",4],
  ["Stanford","Stanford University","US",6],
  ["NUS","National University of Singapore","SG",8],
  ["ETH Zurich","ETH Zurich","CH",7],
  ["UCL","University College London","GB",9],
  ["Imperial","Imperial College London","GB",2],
  ["Caltech","California Institute of Technology","US",10],
  ["UC Berkeley","University of California Berkeley","US",12],
  ["Princeton","Princeton University","US",20],
  ["UChicago","University of Chicago","US",11],
  ["Penn","University of Pennsylvania","US",14],
  ["Yale","Yale University","US",16],
  ["Cornell","Cornell University","US",13],
  ["Columbia","Columbia University","US",15],
  ["Tsinghua","Tsinghua University","CN",20],
  ["Peking","Peking University","CN",17],
  ["Johns Hopkins","Johns Hopkins University","US",25],
  ["Toronto","University of Toronto","CA",25],
  ["Edinburgh","University of Edinburgh","GB",27],
  ["HKU","University of Hong Kong","HK",17],
  ["Duke","Duke University","US",27],
  ["NTU","Nanyang Technological University","SG",15],
  ["HKUST","HKUST","HK",47],
  ["Zhejiang","Zhejiang University","CN",44],
  ["Kyoto","Kyoto University","JP",46],
  ["McGill","McGill University","CA",46],
  ["UBC","University of British Columbia","CA",47],
  ["Tokyo","University of Tokyo","JP",28],
  ["Northwestern","Northwestern University","US",33],
  ["Melbourne","University of Melbourne","AU",13],
  ["ANU","Australian National University","AU",34],
  ["CUHK","Chinese University of Hong Kong","HK",36],
  ["EPFL","EPFL","CH",36],
  ["NYU","New York University","US",39],
  ["Monash","Monash University","AU",37],
  ["TU Munich","Technical University of Munich","DE",37],
  ["Michigan","University of Michigan","US",23],
  ["KU Leuven","KU Leuven","BE",63],
  ["UIUC","University of Illinois Urbana-Champaign","US",24],
  ["Seoul National","Seoul National University","KR",41],
  ["Queensland","University of Queensland","AU",40],
  ["Sydney","University of Sydney","AU",18],
  ["KAIST","KAIST","KR",56],
  ["Delft","Delft University of Technology","NL",47],
  ["Amsterdam","University of Amsterdam","NL",53],
  ["Carnegie Mellon","Carnegie Mellon University","US",52],
  ["Fudan","Fudan University","CN",50],
  ["SJTU","Shanghai Jiao Tong University","CN",51],
  ["Manchester","University of Manchester","GB",32],
  ["Washington","University of Washington","US",59],
  ["UCLA","University of California Los Angeles","US",29],
  ["Paris-Saclay","Université Paris-Saclay","FR",67],
  ["Bristol","University of Bristol","GB",55],
  ["Glasgow","University of Glasgow","GB",76],
  ["ENS Paris","École Normale Supérieure","FR",75],
  ["Vanderbilt","Vanderbilt University","US",186],
  ["Osaka","Osaka University","JP",80],
  ["Lund","Lund University","SE",97],
  ["Copenhagen","University of Copenhagen","DK",97],
  ["Groningen","University of Groningen","NL",89],
  ["KCL","King's College London","GB",40],
  ["Warwick","University of Warwick","GB",67],
  ["Durham","University of Durham","GB",92],
  ["Brown","Brown University","US",131],
  ["UT Austin","University of Texas at Austin","US",67],
  ["Southampton","University of Southampton","GB",81],
  ["Wisconsin","University of Wisconsin-Madison","US",81],
  ["Purdue","Purdue University","US",109],
  ["Maryland","University of Maryland","US",131],
  ["Pittsburgh","University of Pittsburgh","US",218],
  ["Ohio State","Ohio State University","US",171],
  ["Boston University","Boston University","US",115],
  ["Tohoku","Tohoku University","JP",76],
  ["LMU Munich","Ludwig Maximilian University of Munich","DE",54],
  ["UCSD","University of California San Diego","US",65],
  ["Heidelberg","Heidelberg University","DE",87],
  ["Zurich","University of Zurich","CH",91],
  ["Helsinki","University of Helsinki","FI",107],
  ["Aalto","Aalto University","FI",109],
  ["Utrecht","Utrecht University","NL",106],
  ["Wageningen","Wageningen University & Research","NL",122],
  ["Sheffield","University of Sheffield","GB",108],
  ["St Andrews","University of St Andrews","GB",100],
  ["Aarhus","Aarhus University","DK",150],
  ["UCSB","University of California Santa Barbara","US",154],
  ["USTC","University of Science and Technology of China","CN",93],
  ["Nanjing","Nanjing University","CN",133],
  ["Nottingham","University of Nottingham","GB",103],
  ["Birmingham","University of Birmingham","GB",84],
  ["Leeds","University of Leeds","GB",83],
  ["Liverpool","University of Liverpool","GB",173],
  ["Penn State","Pennsylvania State University","US",148],
  ["Minnesota","University of Minnesota","US",181],
  ["Stockholm","Stockholm University","SE",194],
  ["Karolinska","Karolinska Institute","SE",131],
  ["KTH","KTH Royal Institute of Technology","SE",92],
  ["Oslo","University of Oslo","NO",135],
  ["Leiden","Leiden University","NL",128],
  ["Vienna","University of Vienna","AT",197],
  ["Basel","University of Basel","CH",151],
  ["Bern","University of Bern","CH",130],
  ["Geneva","University of Geneva","CH",102],
  ["POSTECH","POSTECH","KR",162],
  ["Tokyo Tech","Tokyo Institute of Technology","JP",168],
  ["Hebrew","Hebrew University of Jerusalem","IL",143],
  ["Tel Aviv","Tel Aviv University","IL",217],
  ["Technion","Technion – Israel Institute of Technology","IL",209],
  ["Freiburg","University of Freiburg","DE",195],
  ["Gottingen","University of Göttingen","DE",244],
  ["Frankfurt","Goethe University Frankfurt","DE",254],
  ["Cologne","University of Cologne","DE",242],
  ["Bonn","University of Bonn","DE",206],
  ["Hamburg","University of Hamburg","DE",241],
  ["Sao Paulo","University of São Paulo","BR",103],
  ["IIT Bombay","Indian Institute of Technology Bombay","IN",118],
  ["IISc","Indian Institute of Science","IN",225],
  ["Auckland","University of Auckland","NZ",68],
  ["KAUST","KAUST","SA",186],
  ["UCI","University of California Irvine","US",185],
  ["Colorado","University of Colorado Boulder","US",163],
  ["Rice","Rice University","US",165],
  ["Emory","Emory University","US",262],
  ["Florida","University of Florida","US",264],
  ["Ghent","Ghent University","BE",84],
  ["VUB","Vrije Universiteit Brussel","BE",184],
  ["Radboud","Radboud University","NL",170],
  ["QMUL","Queen Mary University of London","GB",113],
  ["Exeter","University of Exeter","GB",157],
  ["Leicester","University of Leicester","GB",243],
  ["Chalmers","Chalmers University of Technology","SE",183],
  ["Wuhan","Wuhan University","CN",238],
  ["Sun Yat-sen","Sun Yat-sen University","CN",185],
  ["HUST","Huazhong University of Science and Technology","CN",275],
  ["Bologna","University of Bologna","IT",154],
  ["Milan","University of Milan","IT",262],
  ["Charles","Charles University","CZ",284],
  // Research institutes (no QS rank)
  ["Scripps Research","The Scripps Research Institute","US",null],
  ["UCSF","University of California San Francisco","US",null],
  ["Cold Spring Harbor","Cold Spring Harbor Laboratory","US",null],
  ["Salk Institute","Salk Institute for Biological Studies","US",null],
  ["Broad Institute","Broad Institute of MIT and Harvard","US",null],
  ["Rockefeller","Rockefeller University","US",null],
  ["Whitehead","Whitehead Institute for Biomedical Research","US",null],
  ["Baylor Medicine","Baylor College of Medicine","US",null],
  ["Charité","Charité – Universitätsmedizin Berlin","DE",null],
  ["DKFZ","German Cancer Research Center (DKFZ)","DE",null],
  ["MPI Biochemistry","Max Planck Institute of Biochemistry","DE",null],
  ["MPI Mol Genetics","Max Planck Institute for Molecular Genetics","DE",null],
  ["EMBL","European Molecular Biology Laboratory","DE",null],
  ["Pasteur","Institut Pasteur","FR",null],
  ["Weizmann","Weizmann Institute of Science","IL",null],
  ["Francis Crick","Francis Crick Institute","GB",null],
  ["Wellcome Sanger","Wellcome Sanger Institute","GB",null],
  ["LMB","MRC Laboratory of Molecular Biology","GB",null],
  ["HHMI Janelia","Janelia Research Campus (HHMI)","US",null],
  ["NIH","National Institutes of Health","US",null],
];

const CC_NAME = {
  US:"United States",GB:"United Kingdom",DE:"Germany",FR:"France",
  CH:"Switzerland",NL:"Netherlands",SE:"Sweden",DK:"Denmark",NO:"Norway",
  FI:"Finland",BE:"Belgium",AT:"Austria",IT:"Italy",ES:"Spain",
  CA:"Canada",AU:"Australia",NZ:"New Zealand",JP:"Japan",CN:"China",
  KR:"South Korea",SG:"Singapore",HK:"Hong Kong",IL:"Israel",
  IN:"India",BR:"Brazil",SA:"Saudi Arabia",CZ:"Czech Republic",PL:"Poland",
};

/* ---- Job Boards (quick links) ---- */
const JOB_BOARDS = [
  { name:"Nature Careers",   emoji:"🧬", url:"https://www.nature.com/naturecareers/jobs/filter/postdoc" },
  { name:"Science AAAS",     emoji:"🔭", url:"https://jobs.sciencecareers.org/jobs/?q=postdoc" },
  { name:"AcademicJobsOnline",emoji:"🎓",url:"https://academicjobsonline.org/ajo/jobs" },
  { name:"EURAXESS",         emoji:"🇪🇺", url:"https://euraxess.ec.europa.eu/jobs" },
  { name:"jobs.ac.uk",       emoji:"🇬🇧", url:"https://www.jobs.ac.uk/search/?keywords=postdoc+chemistry+biology" },
  { name:"LinkedIn",         emoji:"💼", url:"https://www.linkedin.com/jobs/search/?keywords=postdoc+chemistry+biology" },
  { name:"ResearchGate",     emoji:"📚", url:"https://www.researchgate.net/jobs/search?q=postdoc" },
  { name:"Indeed",           emoji:"🔍", url:"https://www.indeed.com/jobs?q=postdoc+chemistry+biology" },
];

/* ---- RSS sources for job ads ---- */
const RSS_SOURCES = [
  { id:"euraxess", name:"EURAXESS",   color:"#003087",
    url:"https://euraxess.ec.europa.eu/jobs/rss" },
  { id:"jobsacuk", name:"jobs.ac.uk", color:"#c0392b",
    url:"https://www.jobs.ac.uk/search/?keywords=postdoc+chemistry+biology&rss=1" },
  { id:"nature",   name:"Nature Careers", color:"#e87722",
    url:"https://www.nature.com/naturecareers/jobs/filter/postdoc.rss" },
];

/* =====================================================================
   State
   ===================================================================== */
const st = {
  apps: [], filter:'all', search:'', sort:'date-desc',
  deleteId: null, openDropId: null, activeTab: 'tracker',
  jobs: [], jobSrc: 'all', jobSearch: '',
};

/* =====================================================================
   Storage
   ===================================================================== */
function loadApps() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function saveApps() { localStorage.setItem(STORAGE_KEY, JSON.stringify(st.apps)); }

/* =====================================================================
   Utilities
   ===================================================================== */
function genId()  { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
function todayStr(){ return new Date().toISOString().slice(0,10); }
function esc(s)   { return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function flag(cc) {
  if (!cc) return '';
  return [...cc.toUpperCase()].map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('');
}

function waitDays(d) {
  if (!d) return 0;
  const now = new Date(); now.setHours(0,0,0,0);
  const s   = new Date(d+'T00:00:00');
  return Math.max(0, Math.floor((now-s)/86400000));
}

function daysUntil(d) {
  if (!d) return null;
  const now = new Date(); now.setHours(0,0,0,0);
  return Math.floor((new Date(d+'T00:00:00') - now) / 86400000);
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d+'T00:00:00').toLocaleDateString('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit'});
}

function fmtJobDate(s) {
  if (!s) return '';
  const d = new Date(s);
  return isNaN(d) ? s : d.toLocaleDateString('zh-CN',{month:'2-digit',day:'2-digit'});
}

function qsBadgeClass(qs) {
  if (!qs) return '';
  if (qs <= 10)  return 't10';
  if (qs <= 50)  return 't50';
  if (qs <= 100) return 't100';
  return 't200';
}

function debounce(fn, ms) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

function stripHtml(h) {
  const d = document.createElement('div'); d.innerHTML = h; return d.textContent || '';
}

/* =====================================================================
   Tracker – Rendering
   ===================================================================== */
function renderStats() {
  const cnt = { all: st.apps.length };
  Object.keys(STATUS).forEach(k => { cnt[k] = 0; });
  st.apps.forEach(a => { if (a.status in cnt) cnt[a.status]++; });

  document.getElementById('statsGrid').innerHTML = STATS_DEF.map(s => `
    <div class="stat-card ${st.filter===s.key?'active':''}" style="--sc:${s.color}" data-f="${s.key}">
      <div class="stat-count">${cnt[s.key]??0}</div>
      <div class="stat-label">${s.label}</div>
    </div>`).join('');

  document.querySelectorAll('.stat-card').forEach(c =>
    c.addEventListener('click', () => { st.filter = c.dataset.f; render(); })
  );
}

function renderFilterTabs() {
  document.getElementById('filterTabs').innerHTML = STATS_DEF.map(s => `
    <button class="filter-tab ${st.filter===s.key?'active':''}" data-f="${s.key}">${s.label}</button>`).join('');
  document.querySelectorAll('.filter-tab').forEach(t =>
    t.addEventListener('click', () => { st.filter = t.dataset.f; render(); })
  );
}

function getList() {
  let list = [...st.apps];
  if (st.filter !== 'all') list = list.filter(a => a.status === st.filter);
  if (st.search.trim()) {
    const q = st.search.toLowerCase();
    list = list.filter(a =>
      [a.piName,a.university,a.department,a.researchArea,a.country,a.piTitle]
        .some(f => (f||'').toLowerCase().includes(q))
    );
  }
  const sorters = {
    'date-desc':    (a,b) => (b.applicationDate||'').localeCompare(a.applicationDate||''),
    'date-asc':     (a,b) => (a.applicationDate||'').localeCompare(b.applicationDate||''),
    'wait-desc':    (a,b) => waitDays(b.applicationDate) - waitDays(a.applicationDate),
    'deadline-asc': (a,b) => {
      const da = a.deadline ? daysUntil(a.deadline) : 9999;
      const db = b.deadline ? daysUntil(b.deadline) : 9999;
      return da - db;
    },
    'university':   (a,b) => (a.university||'').localeCompare(b.university||''),
    'qs-asc':       (a,b) => (a.qsRank||9999) - (b.qsRank||9999),
    'hindex-desc':  (a,b) => (b.hIndex||0) - (a.hIndex||0),
    'papers-desc':  (a,b) => (b.topPapers||0) - (a.topPapers||0),
  };
  list.sort(sorters[st.sort] || sorters['date-desc']);
  return list;
}

function renderTable() {
  const list   = getList();
  const table  = document.getElementById('appTable');
  const empty  = document.getElementById('emptyState');
  const tbody  = document.getElementById('tableBody');

  if (!list.length) { table.style.display='none'; empty.style.display='flex'; return; }
  table.style.display=''; empty.style.display='none';

  tbody.innerHTML = list.map(app => {
    const days    = waitDays(app.applicationDate);
    const wCls    = days > 60 ? 'alert' : days > 30 ? 'warn' : '';
    const hCls    = (app.hIndex||0) >= 60 ? 'hi' : (app.hIndex||0) >= 30 ? 'mid' : '';
    const pCls    = (app.topPapers||0) >= 10 ? 'hi' : (app.topPapers||0) >= 5  ? 'mid' : '';
    const sConf   = STATUS[app.status] || STATUS.contacted;
    const qsCls   = qsBadgeClass(app.qsRank);
    const countryFlag = flag(app.countryCode);
    const dlDays  = app.deadline ? daysUntil(app.deadline) : null;
    const dlCls   = dlDays !== null ? (dlDays <= 7 ? 'hot' : dlDays <= 30 ? 'soon' : '') : '';

    return `<tr data-id="${app.id}"${app.notes?` title="${esc(app.notes)}"`:''}>
      <td>
        <div class="pi-cell">
          <span class="pi-name">${esc(app.piName)}</span>
          <div class="pi-uni-row">
            ${countryFlag ? `<span class="pi-flag">${countryFlag}</span>` : ''}
            <span class="pi-university">${esc(app.university)}</span>
            ${app.qsRank ? `<span class="qs-badge ${qsCls}">QS #${app.qsRank}</span>` : ''}
          </div>
          <div class="pi-meta">
            ${app.piTitle ? `<span class="pi-title-tag">${esc(app.piTitle)}</span>` : ''}
            ${app.researchArea ? `<span class="pi-area">${esc(app.researchArea)}</span>` : ''}
          </div>
        </div>
      </td>
      <td>
        <div class="links-cell">
          ${app.labWebsite  ? `<a href="${esc(app.labWebsite)}"  target="_blank" rel="noopener" class="tlink">🔬 课题组主页</a>` : '<span class="text-muted" style="font-size:12px">—</span>'}
          ${app.scholarUrl  ? `<a href="${esc(app.scholarUrl)}"  target="_blank" rel="noopener" class="tlink">📊 Google Scholar</a>` : ''}
          ${app.portalUrl   ? `<a href="${esc(app.portalUrl)}"   target="_blank" rel="noopener" class="tlink">🔗 申请系统</a>` : ''}
        </div>
      </td>
      <td>
        <div class="metrics-cell">
          ${app.hIndex != null     ? `<span class="nbadge ${hCls}">h&thinsp;=&thinsp;${app.hIndex}<span class="nbadge-label">H指数</span></span>` : '<span class="text-muted" style="font-size:12px">—</span>'}
          ${app.topPapers != null  ? `<span class="nbadge ${pCls}">${app.topPapers}&thinsp;篇<span class="nbadge-label">一区</span></span>` : ''}
        </div>
      </td>
      <td>
        <div class="date-cell">
          <div class="date-row">
            <span class="date-label">申请</span>
            <span class="date-val">${fmtDate(app.applicationDate)}</span>
          </div>
          ${app.deadline ? `<div class="date-row">
            <span class="date-label">截止</span>
            <span class="date-val">${fmtDate(app.deadline)}</span>
            ${dlCls ? `<span class="dl-badge ${dlCls}">${dlDays<=0?'已过期':dlDays+'天后'}</span>` : ''}
          </div>` : ''}
        </div>
      </td>
      <td><span class="wait-val ${wCls}">${days} 天</span></td>
      <td>
        <div class="status-wrap">
          <span class="sbadge ${app.status}" data-dtog="${app.id}">
            <span class="sbadge-dot" style="background:${sConf.color}"></span>
            ${sConf.label}
          </span>
          <div class="sdrop ${st.openDropId===app.id?'open':''}" id="sdrop-${app.id}">
            ${Object.entries(STATUS).map(([k,v])=>`
              <div class="sopt" data-ss="${app.id}" data-sv="${k}">
                <span class="sopt-dot" style="background:${v.color}"></span>${v.label}
              </div>`).join('')}
          </div>
        </div>
      </td>
      <td>
        <div class="actions-cell">
          <button class="icon-btn" data-edit="${app.id}" title="编辑">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="icon-btn del" data-del="${app.id}" title="删除">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => openModal(b.dataset.edit)));
  tbody.querySelectorAll('[data-del]').forEach(b  => b.addEventListener('click', () => confirmDelete(b.dataset.del)));
  tbody.querySelectorAll('[data-dtog]').forEach(badge => badge.addEventListener('click', e => {
    e.stopPropagation();
    st.openDropId = st.openDropId === badge.dataset.dtog ? null : badge.dataset.dtog;
    renderTable();
  }));
  tbody.querySelectorAll('[data-ss]').forEach(opt => opt.addEventListener('click', e => {
    e.stopPropagation();
    const app = st.apps.find(a => a.id === opt.dataset.ss);
    if (app) { app.status = opt.dataset.sv; app.updatedAt = new Date().toISOString(); saveApps(); }
    st.openDropId = null; render();
    showToast(`状态已更新为「${STATUS[app?.status]?.label}」`, 'success');
  }));
}

function render() { renderStats(); renderFilterTabs(); renderTable(); }

/* =====================================================================
   Header Actions (tab-aware)
   ===================================================================== */
function renderHeaderActions() {
  const el = document.getElementById('hActions');
  if (st.activeTab === 'tracker') {
    el.innerHTML = `
      <button class="btn btn-ghost" id="exportBtn">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        导出 CSV
      </button>
      <button class="btn btn-primary" id="addBtn">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        添加申请
      </button>`;
    document.getElementById('addBtn').addEventListener('click', () => openModal());
    document.getElementById('exportBtn').addEventListener('click', exportCSV);
  } else {
    el.innerHTML = `
      <button class="btn btn-ghost" id="refreshJobsBtn">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-6"/></svg>
        刷新岗位
      </button>`;
    document.getElementById('refreshJobsBtn').addEventListener('click', () => {
      st.jobs = []; renderJobGrid(); fetchAllJobs();
    });
  }
}

/* =====================================================================
   Tab Switching
   ===================================================================== */
function switchTab(tab) {
  st.activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.getElementById('tab-tracker').style.display = tab === 'tracker' ? '' : 'none';
  document.getElementById('tab-jobs').style.display    = tab === 'jobs'    ? '' : 'none';
  renderHeaderActions();
  if (tab === 'jobs' && st.jobs.length === 0) fetchAllJobs();
}

/* =====================================================================
   Modal – Open / Close
   ===================================================================== */
function openModal(id) {
  const ov = document.getElementById('overlay');
  document.getElementById('appForm').reset();
  document.getElementById('editId').value = '';
  document.getElementById('flagPreview').textContent = '';
  document.getElementById('country').value = '';
  document.getElementById('countryCode').value = '';
  closePIDrop(); closeUniDrop();

  if (id) {
    const app = st.apps.find(a => a.id === id);
    if (!app) return;
    document.getElementById('modalTitle').textContent = '编辑申请';
    const F = (fid, v) => { const el = document.getElementById(fid); if (el) el.value = v ?? ''; };
    F('editId', app.id);
    F('piName', app.piName); F('piTitle', app.piTitle);
    F('scholarUrl', app.scholarUrl); F('hIndex', app.hIndex ?? '');
    F('researchArea', app.researchArea); F('topPapers', app.topPapers ?? '');
    F('university', app.university); F('department', app.department);
    F('country', app.country); F('qsRank', app.qsRank ?? '');
    F('labWebsite', app.labWebsite); F('fundingSource', app.fundingSource);
    F('contactEmail', app.contactEmail); F('contactMethod', app.contactMethod);
    F('applicationDate', app.applicationDate); F('deadline', app.deadline);
    F('portalUrl', app.portalUrl); F('status', app.status);
    F('interviewDate', app.interviewDate); F('followupDate', app.followupDate);
    F('notes', app.notes);
    document.getElementById('countryCode').value = app.countryCode || '';
    document.getElementById('flagPreview').textContent = flag(app.countryCode);
  } else {
    document.getElementById('modalTitle').textContent = '添加申请';
    document.getElementById('applicationDate').value  = todayStr();
    document.getElementById('status').value           = 'contacted';
  }
  ov.classList.add('show');
}

function closeModal() { document.getElementById('overlay').classList.remove('show'); }

/* =====================================================================
   Delete
   ===================================================================== */
function confirmDelete(id) {
  const app = st.apps.find(a => a.id === id);
  if (!app) return;
  st.deleteId = id;
  document.getElementById('deleteMsg').textContent =
    `确定要删除「${app.piName}（${app.university}）」的申请记录吗？此操作无法撤销。`;
  document.getElementById('deleteOverlay').classList.add('show');
}
function closeDeleteModal() {
  document.getElementById('deleteOverlay').classList.remove('show');
  st.deleteId = null;
}

/* =====================================================================
   Form Submit
   ===================================================================== */
function handleSubmit(e) {
  e.preventDefault();
  const g = id => document.getElementById(id);
  const v = id => g(id)?.value?.trim() ?? '';
  const n = id => { const x = v(id); return x === '' ? null : parseFloat(x); };

  if (!v('piName') || !v('university') || !v('applicationDate')) {
    showToast('请填写必填字段（导师姓名、学校、申请日期）', 'error'); return;
  }

  const data = {
    piName: v('piName'), piTitle: v('piTitle'),
    scholarUrl: v('scholarUrl'), hIndex: n('hIndex'),
    researchArea: v('researchArea'), topPapers: n('topPapers'),
    university: v('university'), department: v('department'),
    country: v('country'), countryCode: v('countryCode'), qsRank: n('qsRank'),
    labWebsite: v('labWebsite'), fundingSource: v('fundingSource'),
    contactEmail: v('contactEmail'), contactMethod: v('contactMethod'),
    applicationDate: v('applicationDate'), deadline: v('deadline'),
    portalUrl: v('portalUrl'), status: v('status'),
    interviewDate: v('interviewDate'), followupDate: v('followupDate'),
    notes: v('notes'),
  };

  const editId = v('editId');
  if (editId) {
    const i = st.apps.findIndex(a => a.id === editId);
    if (i !== -1) { st.apps[i] = { ...st.apps[i], ...data, updatedAt: new Date().toISOString() }; showToast('申请记录已更新', 'success'); }
  } else {
    st.apps.push({ id: genId(), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    showToast('已添加新申请记录', 'success');
  }
  saveApps(); closeModal(); render();
}

/* =====================================================================
   Autocomplete: PI Name (OpenAlex API)
   ===================================================================== */
let piAcIdx = -1;

async function fetchPIAC(query) {
  const drop = document.getElementById('piDrop');
  if (query.length < 2) { closePIDrop(); return; }
  drop.innerHTML = `<div class="ac-loading-item"><div class="spinner" style="width:14px;height:14px;border-width:2px"></div>搜索中…</div>`;
  drop.classList.add('open');
  piAcIdx = -1;
  try {
    const res  = await fetch(`https://api.openalex.org/authors?search=${encodeURIComponent(query)}&per-page=6&select=id,display_name,last_known_institutions,summary_stats,works_count`);
    const data = await res.json();
    const items = data.results || [];
    if (!items.length) { drop.innerHTML = `<div class="ac-empty">未找到匹配导师</div>`; return; }
    drop.innerHTML = items.map((a, i) => {
      const inst = a.last_known_institutions?.[0]?.display_name || '';
      const hIdx = a.summary_stats?.h_index;
      const wCnt = a.works_count;
      return `<div class="ac-item" data-i="${i}">
        <div class="ac-main">📖 <strong>${esc(a.display_name)}</strong></div>
        <div class="ac-sub">
          ${inst ? `<span>${esc(inst)}</span>` : ''}
          ${hIdx != null ? `<span class="ac-tag">h=${hIdx}</span>` : ''}
          ${wCnt != null ? `<span class="ac-tag">${wCnt} 篇论文</span>` : ''}
        </div>
      </div>`;
    }).join('');
    drop._data = items;
    drop.querySelectorAll('.ac-item').forEach((el, i) => {
      el.addEventListener('mousedown', e => { e.preventDefault(); selectPI(items[i]); });
    });
  } catch {
    drop.innerHTML = `<div class="ac-empty">网络错误，请手动填写</div>`;
  }
}
const debouncedPIFetch = debounce(fetchPIAC, 350);

function selectPI(a) {
  document.getElementById('piName').value    = a.display_name;
  const hIdx = a.summary_stats?.h_index;
  if (hIdx != null) document.getElementById('hIndex').value = hIdx;
  const inst = a.last_known_institutions?.[0]?.display_name;
  if (inst && !document.getElementById('university').value) {
    document.getElementById('university').value = inst;
    handleUniInput({ target: { value: inst } }, true);
  }
  const q = encodeURIComponent(a.display_name);
  document.getElementById('scholarUrl').value = `https://scholar.google.com/scholar?q=${q}`;
  closePIDrop();
  showToast(`已自动填充「${a.display_name}」的数据`, 'success');
}

function closePIDrop() {
  const d = document.getElementById('piDrop'); d.classList.remove('open'); d.innerHTML = '';
}

/* =====================================================================
   Autocomplete: University (embedded DB)
   ===================================================================== */
let uniAcIdx = -1;

function searchUniDB(query) {
  const q = query.toLowerCase();
  return UNI_DB.filter(u =>
    u[0].toLowerCase().includes(q) || u[1].toLowerCase().includes(q)
  ).slice(0, 8);
}

function handleUniInput(e, silent = false) {
  const query = e.target.value;
  const drop  = document.getElementById('uniDrop');
  if (query.length < 2) { closeUniDrop(); return; }
  const results = searchUniDB(query);
  if (!results.length) { closeUniDrop(); return; }
  uniAcIdx = -1;
  drop.innerHTML = results.map((u, i) => {
    const cc  = u[2]; const qs = u[3];
    return `<div class="ac-item" data-i="${i}">
      <div class="ac-main">${flag(cc)}&nbsp;<strong>${esc(u[1])}</strong></div>
      <div class="ac-sub">
        <span>${CC_NAME[cc] || cc}</span>
        ${qs ? `<span class="ac-tag">QS #${qs}</span>` : '<span class="ac-tag">研究所</span>'}
      </div>
    </div>`;
  }).join('');
  drop._data = results;
  if (!silent) drop.classList.add('open');
  drop.querySelectorAll('.ac-item').forEach((el, i) => {
    el.addEventListener('mousedown', ev => { ev.preventDefault(); selectUni(results[i]); });
  });
}

function selectUni(u) {
  document.getElementById('university').value   = u[1];
  document.getElementById('country').value      = CC_NAME[u[2]] || u[2];
  document.getElementById('countryCode').value  = u[2];
  document.getElementById('flagPreview').textContent = flag(u[2]);
  if (u[3]) document.getElementById('qsRank').value = u[3];
  closeUniDrop();
}

function closeUniDrop() {
  const d = document.getElementById('uniDrop'); d.classList.remove('open'); d.innerHTML = '';
}

/* Keyboard nav helper */
function handleACKeydown(e, dropId, closeFn) {
  const drop  = document.getElementById(dropId);
  const items = drop.querySelectorAll('.ac-item');
  if (!items.length || !drop.classList.contains('open')) return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    piAcIdx = Math.min(piAcIdx + 1, items.length - 1);
    items.forEach((el,i) => el.classList.toggle('focused', i === piAcIdx));
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    piAcIdx = Math.max(piAcIdx - 1, 0);
    items.forEach((el,i) => el.classList.toggle('focused', i === piAcIdx));
  } else if (e.key === 'Enter') {
    if (piAcIdx >= 0) { e.preventDefault(); items[piAcIdx].dispatchEvent(new MouseEvent('mousedown')); }
  } else if (e.key === 'Escape') {
    closeFn();
  }
}

/* =====================================================================
   CSV Export
   ===================================================================== */
function exportCSV() {
  if (!st.apps.length) { showToast('暂无数据可导出', 'error'); return; }
  const H = ['导师姓名','职称','学校','院系','国家','QS排名','H指数','近5年一区论文','研究方向',
             '课题组主页','Google Scholar','经费来源','联系邮箱','联系方式','申请日期','截止日期',
             '等待天数','状态','面试日期','备注'];
  const rows = st.apps.map(a => [
    a.piName, a.piTitle, a.university, a.department, a.country, a.qsRank??'',
    a.hIndex??'', a.topPapers??'', a.researchArea, a.labWebsite, a.scholarUrl,
    a.fundingSource, a.contactEmail, a.contactMethod, a.applicationDate, a.deadline,
    waitDays(a.applicationDate), STATUS[a.status]?.label||a.status, a.interviewDate, a.notes,
  ].map(v => `"${String(v??'').replace(/"/g,'""')}"`));
  const csv  = '﻿' + [H.join(','), ...rows.map(r=>r.join(','))].join('\r\n');
  const url  = URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
  const link = document.createElement('a');
  link.href = url; link.download = `博士后申请记录_${todayStr()}.csv`;
  link.click(); URL.revokeObjectURL(url);
  showToast('CSV 文件已导出', 'success');
}

/* =====================================================================
   Jobs Tab
   ===================================================================== */
function renderJobBoards() {
  document.getElementById('jobBoards').innerHTML = JOB_BOARDS.map(b =>
    `<a href="${b.url}" target="_blank" rel="noopener" class="job-board-btn">
      <span class="job-board-emoji">${b.emoji}</span>${esc(b.name)}
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
    </a>`).join('');
}

function renderJobSourceFilters() {
  const all = [{ id:'all', name:'全部' }, ...RSS_SOURCES];
  document.getElementById('jobSourceFilters').innerHTML = all.map(s =>
    `<button class="job-src-btn ${st.jobSrc===s.id?'active':''}" data-src="${s.id}">${s.name}</button>`
  ).join('');
  document.querySelectorAll('.job-src-btn').forEach(b =>
    b.addEventListener('click', () => { st.jobSrc = b.dataset.src; renderJobGrid(); })
  );
}

async function fetchRSS(src) {
  const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(src.url)}&count=20`;
  const res = await fetch(api, { signal: AbortSignal.timeout(8000) });
  const data = await res.json();
  if (data.status !== 'ok') throw new Error(data.message || 'RSS error');
  return (data.items || []).map(item => ({
    srcId:   src.id,
    srcName: src.name,
    title:   stripHtml(item.title || ''),
    org:     stripHtml(item.author || data.feed?.title || ''),
    desc:    stripHtml(item.description || item.content || '').slice(0, 200),
    link:    item.link,
    date:    item.pubDate,
  }));
}

async function fetchAllJobs() {
  document.getElementById('jobGrid').innerHTML = `<div class="job-loading" id="jobLoading"><div class="spinner"></div><p>正在从多个来源加载最新岗位...</p></div>`;
  const results = await Promise.allSettled(RSS_SOURCES.map(fetchRSS));
  const jobs = results.flatMap((r, i) => r.status === 'fulfilled' ? r.value : (console.warn(RSS_SOURCES[i].name, r.reason), []));
  st.jobs = jobs;
  if (jobs.length) {
    document.getElementById('jobLastUpdated').textContent = `已加载 ${jobs.length} 条 · ${new Date().toLocaleTimeString('zh-CN')}`;
  }
  renderJobGrid();
}

function renderJobGrid() {
  const grid = document.getElementById('jobGrid');
  let jobs = [...st.jobs];

  if (st.jobSrc !== 'all') jobs = jobs.filter(j => j.srcId === st.jobSrc);

  const kw = document.getElementById('jobSearchInput')?.value?.toLowerCase()?.trim();
  if (kw) jobs = jobs.filter(j =>
    (j.title||'').toLowerCase().includes(kw) ||
    (j.org||'').toLowerCase().includes(kw) ||
    (j.desc||'').toLowerCase().includes(kw)
  );

  if (!jobs.length && st.jobs.length === 0) return; // still loading

  if (!jobs.length) {
    grid.innerHTML = `<div class="job-empty">没有匹配的岗位，请尝试其他关键词</div>`; return;
  }

  grid.innerHTML = jobs.map(j => `
    <div class="job-card">
      <div class="job-card-top">
        <a href="${esc(j.link)}" target="_blank" rel="noopener" class="job-title" style="text-decoration:none;color:inherit">${esc(j.title)}</a>
        <span class="job-src-tag">${esc(j.srcName)}</span>
      </div>
      ${j.org ? `<div class="job-org">🏛 ${esc(j.org)}</div>` : ''}
      ${j.desc ? `<div class="job-desc">${esc(j.desc)}</div>` : ''}
      <div class="job-footer">
        <span class="job-date">${fmtJobDate(j.date)}</span>
        <a href="${esc(j.link)}" target="_blank" rel="noopener" class="job-link">
          查看详情
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
        </a>
      </div>
    </div>`).join('');

  if (jobs.length === 0 && st.jobs.length > 0) {
    grid.innerHTML = `<div class="job-error">
      <div class="job-error-title">⚠️ 无法加载在线岗位</div>
      <div class="job-error-sub">请点击上方快捷链接直接访问招聘平台</div>
    </div>`;
  }
}

/* =====================================================================
   Toast
   ===================================================================== */
function showToast(msg, type = 'default') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${{success:'✓',error:'✕',default:'ℹ'}[type]||'ℹ'}</span>${esc(msg)}`;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(() => { el.style.animation = 'toastOut .25s ease forwards'; setTimeout(()=>el.remove(),250); }, 2700);
}

/* =====================================================================
   Init
   ===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  st.apps = loadApps();
  render();
  renderHeaderActions();
  renderJobBoards();
  renderJobSourceFilters();

  /* Tab nav */
  document.querySelectorAll('.tab-btn').forEach(b =>
    b.addEventListener('click', () => switchTab(b.dataset.tab))
  );

  /* Empty state add button */
  document.getElementById('emptyAddBtn').addEventListener('click', () => openModal());

  /* Modal close */
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  document.getElementById('overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('overlay')) closeModal();
  });

  /* Form */
  document.getElementById('appForm').addEventListener('submit', handleSubmit);

  /* Delete modal */
  document.getElementById('deleteCancelBtn').addEventListener('click', closeDeleteModal);
  document.getElementById('deleteOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('deleteOverlay')) closeDeleteModal();
  });
  document.getElementById('deleteConfirmBtn').addEventListener('click', () => {
    const app = st.apps.find(a => a.id === st.deleteId);
    st.apps = st.apps.filter(a => a.id !== st.deleteId);
    saveApps(); closeDeleteModal(); render();
    showToast(`已删除「${app?.piName}」`, 'success');
  });

  /* Tracker search / sort */
  document.getElementById('searchInput').addEventListener('input', e => { st.search = e.target.value; render(); });
  document.getElementById('sortSelect').addEventListener('change', e => { st.sort = e.target.value; render(); });

  /* PI autocomplete */
  const piInput = document.getElementById('piName');
  piInput.addEventListener('input', e => debouncedPIFetch(e.target.value));
  piInput.addEventListener('keydown', e => handleACKeydown(e, 'piDrop', closePIDrop));
  piInput.addEventListener('blur', () => setTimeout(closePIDrop, 200));

  /* University autocomplete */
  const uniInput = document.getElementById('university');
  uniInput.addEventListener('input', handleUniInput);
  uniInput.addEventListener('keydown', e => handleACKeydown(e, 'uniDrop', closeUniDrop));
  uniInput.addEventListener('blur', () => setTimeout(closeUniDrop, 200));

  /* Jobs keyword filter */
  document.addEventListener('input', e => {
    if (e.target.id === 'jobSearchInput') { st.jobSearch = e.target.value; renderJobGrid(); }
  });

  /* Close status dropdown on outside click */
  document.addEventListener('click', () => {
    if (st.openDropId) { st.openDropId = null; renderTable(); }
  });
});
