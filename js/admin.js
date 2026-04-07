// =============================================
// koudd.lab — Admin Panel Logic
// Emmanuel Pirela © 2024
// =============================================

'use strict';

let adminProjects = [];
let adminProducts = [];
let adminServices = [];
let editingItem   = null;
let editingStore  = null;

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ── Auth guard ──
function checkAuth() {
  if (!KouddDB.isLoggedIn()) {
    showLogin();
  } else {
    showDashboard();
  }
}

function showLogin() {
  document.getElementById('login-page').style.display   = 'flex';
  document.getElementById('dashboard-page').style.display = 'none';
}

function showDashboard() {
  document.getElementById('login-page').style.display    = 'none';
  document.getElementById('dashboard-page').style.display = 'grid';
  loadData();
}

// ── Login ──
function initLogin() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value;
    const err  = document.getElementById('login-error');

    if (KouddDB.login(user, pass)) {
      err.classList.remove('show');
      showDashboard();
    } else {
      err.textContent = '❌ Usuario o contraseña incorrectos.';
      err.classList.add('show');
      document.getElementById('login-pass').value = '';
      document.getElementById('login-pass').focus();
    }
  });

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    KouddDB.logout();
    showLogin();
  });
}

// ── Data ──
async function loadData() {
  adminProjects = await KouddDB.getProjects();
  adminProducts = await KouddDB.getProducts();
  adminServices = await KouddDB.getServices();
  updateStats();
  renderProjectsTable();
  renderProductsTable();
  renderServicesTable();
}

function updateStats() {
  document.getElementById('a-stat-projects').textContent = adminProjects.length;
  document.getElementById('a-stat-products').textContent = adminProducts.length;
  document.getElementById('a-stat-services').textContent = adminServices.length;
}

// ── Admin toast ──
function atoast(msg, type = 'info') {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `${type === 'success' ? '✓' : '●'} ${msg}`;
  document.getElementById('toast-container').appendChild(t);
  setTimeout(() => { t.classList.add('fade-out'); setTimeout(() => t.remove(), 400); }, 3000);
}

// ── Table renders ──
function renderProjectsTable() {
  const tbody = document.getElementById('projects-tbody');
  if (!tbody) return;

  if (!adminProjects.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--white-60);padding:2rem">
      Sin proyectos todavía. ¡Agrega uno!
    </td></tr>`;
    return;
  }

  tbody.innerHTML = adminProjects.map(p => `
    <tr>
      <td>
        ${p.image
          ? `<img src="${p.image}" class="td-thumbnail" alt="${p.title}">`
          : `<div class="td-thumbnail" style="display:flex;align-items:center;justify-content:center;font-size:1.2rem">🖥️</div>`}
      </td>
      <td><strong>${p.title}</strong></td>
      <td><span class="badge badge-orange">${p.category}</span></td>
      <td><span class="badge badge-white">${p.date || '-'}</span></td>
      <td>
        <div class="td-actions">
          <button class="td-btn edit" onclick="editProject(${p.id})">Editar</button>
          <button class="td-btn delete" onclick="deleteProject(${p.id})">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderProductsTable() {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;

  if (!adminProducts.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--white-60);padding:2rem">Sin productos todavía.</td></tr>`;
    return;
  }

  tbody.innerHTML = adminProducts.map(p => `
    <tr>
      <td>
        ${p.image
          ? `<img src="${p.image}" class="td-thumbnail" alt="${p.name}">`
          : `<div class="td-thumbnail" style="display:flex;align-items:center;justify-content:center;font-size:1.2rem">${p.emoji || '🛒'}</div>`}
      </td>
      <td><strong>${p.name}</strong></td>
      <td><span style="color:var(--orange);font-weight:700">$${p.price} ${p.currency}</span></td>
      <td>
        <span class="badge ${p.available ? 'badge-green' : 'badge-white'}">
          ${p.available ? '●  Disponible' : 'No disponible'}
        </span>
      </td>
      <td>
        <div class="td-actions">
          <button class="td-btn edit" onclick="editProduct(${p.id})">Editar</button>
          <button class="td-btn delete" onclick="deleteProduct(${p.id})">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderServicesTable() {
  const tbody = document.getElementById('services-tbody');
  if (!tbody) return;

  tbody.innerHTML = adminServices.map(s => `
    <tr>
      <td style="font-size:1.5rem">${s.icon}</td>
      <td><strong>${s.name}</strong></td>
      <td style="max-width:300px;color:var(--white-60);font-size:.85rem">${s.desc}</td>
      <td>
        <div class="td-actions">
          <button class="td-btn edit" onclick="editService(${s.id})">Editar</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ── Project CRUD ──
function openProjectModal(project = null) {
  editingItem  = project;
  editingStore = 'project';

  const modal  = document.getElementById('item-modal');
  const title  = document.getElementById('modal-title');
  const body   = document.getElementById('modal-form-body');

  title.textContent = project ? 'Editar Proyecto' : 'Nuevo Proyecto';

  body.innerHTML = `
    <div class="form-group">
      <label class="form-label">Título *</label>
      <input type="text" id="f-title" class="form-input" value="${project?.title || ''}" placeholder="Nombre del proyecto" required>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Categoría</label>
        <select id="f-category" class="form-input form-select">
          <option value="web"      ${project?.category==='web'      ? 'selected':''}>Web</option>
          <option value="sistemas" ${project?.category==='sistemas' ? 'selected':''}>Sistemas</option>
          <option value="especial" ${project?.category==='especial' ? 'selected':''}>Especial</option>
          <option value="diseno"   ${project?.category==='diseno'   ? 'selected':''}>Diseño</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Fecha</label>
        <input type="date" id="f-date" class="form-input" value="${project?.date || ''}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Descripción</label>
      <textarea id="f-desc" class="form-textarea" placeholder="Describe el proyecto...">${project?.description || ''}</textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Tecnologías (separadas por coma)</label>
      <input type="text" id="f-tech" class="form-input" value="${(project?.tech || []).join(', ')}" placeholder="HTML, CSS, JavaScript">
    </div>
    <div class="form-group">
      <label class="form-label">URL del proyecto</label>
      <input type="url" id="f-url" class="form-input" value="${project?.url || ''}" placeholder="https://...">
    </div>
    <div class="form-group">
      <label class="form-label">Imagen</label>
      <div class="upload-area" id="upload-area" role="button" tabindex="0" aria-label="Subir imagen">
        <div style="font-size:2rem;margin-bottom:.5rem">📁</div>
        <p>Clic o arrastra una imagen aquí</p>
        <p style="font-size:.75rem;color:var(--white-30)">PNG, JPG, WEBP — máx 2MB</p>
        <input type="file" id="f-image" accept="image/*" style="display:none">
      </div>
      ${project?.image ? `<img id="upload-preview" src="${project.image}" style="width:100%;max-height:160px;object-fit:cover;border-radius:var(--r-md);margin-top:.75rem">` : `<img id="upload-preview" style="display:none">`}
    </div>
  `;

  setupUpload();
  openModal('item-modal');
}

function openProductModal(product = null) {
  editingItem  = product;
  editingStore = 'product';

  const modal = document.getElementById('item-modal');
  const title = document.getElementById('modal-title');
  const body  = document.getElementById('modal-form-body');

  title.textContent = product ? 'Editar Producto' : 'Nuevo Producto';

  body.innerHTML = `
    <div class="form-group">
      <label class="form-label">Nombre del producto *</label>
      <input type="text" id="f-title" class="form-input" value="${product?.name || ''}" placeholder="Nombre del producto" required>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Precio (USD)</label>
        <input type="number" id="f-price" class="form-input" value="${product?.price || ''}" placeholder="0.00" min="0" step="0.01">
      </div>
      <div class="form-group">
        <label class="form-label">Categoría</label>
        <select id="f-category" class="form-input form-select">
          <option value="web"       ${product?.category==='web'       ? 'selected':''}>Web</option>
          <option value="sistemas"  ${product?.category==='sistemas'  ? 'selected':''}>Sistemas</option>
          <option value="especial"  ${product?.category==='especial'  ? 'selected':''}>Especial</option>
          <option value="plantilla" ${product?.category==='plantilla' ? 'selected':''}>Plantilla</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Emoji representativo</label>
      <input type="text" id="f-emoji" class="form-input" value="${product?.emoji || '🛒'}" maxlength="4" placeholder="🛒">
    </div>
    <div class="form-group">
      <label class="form-label">Descripción</label>
      <textarea id="f-desc" class="form-textarea" placeholder="Describe el producto...">${product?.description || ''}</textarea>
    </div>
    <div class="form-group">
      <label class="form-label" style="display:flex;align-items:center;gap:.5rem;cursor:pointer">
        <input type="checkbox" id="f-available" ${product?.available !== false ? 'checked' : ''} style="width:16px;height:16px;accent-color:var(--orange)">
        Disponible para compra
      </label>
    </div>
    <div class="form-group">
      <label class="form-label">Imagen</label>
      <div class="upload-area" id="upload-area" role="button" tabindex="0">
        <div style="font-size:2rem;margin-bottom:.5rem">📁</div>
        <p>Clic o arrastra una imagen</p>
        <input type="file" id="f-image" accept="image/*" style="display:none">
      </div>
      ${product?.image ? `<img id="upload-preview" src="${product.image}" style="width:100%;max-height:160px;object-fit:cover;border-radius:var(--r-md);margin-top:.75rem">` : `<img id="upload-preview" style="display:none">`}
    </div>
  `;

  setupUpload();
  openModal('item-modal');
}

function openServiceModal(service = null) {
  editingItem  = service;
  editingStore = 'service';

  const title = document.getElementById('modal-title');
  const body  = document.getElementById('modal-form-body');

  title.textContent = 'Editar Servicio';

  body.innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Nombre *</label>
        <input type="text" id="f-title" class="form-input" value="${service?.name || ''}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Emoji/Ícono</label>
        <input type="text" id="f-emoji" class="form-input" value="${service?.icon || '🔧'}" maxlength="4">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Descripción</label>
      <textarea id="f-desc" class="form-textarea">${service?.desc || ''}</textarea>
    </div>
  `;

  openModal('item-modal');
}

function setupUpload() {
  const area    = document.getElementById('upload-area');
  const input   = document.getElementById('f-image');
  const preview = document.getElementById('upload-preview');

  if (!area || !input) return;

  area.addEventListener('click', () => input.click());
  area.addEventListener('keydown', e => { if (e.key === 'Enter') input.click(); });

  area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('drag-over'); });
  area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
  area.addEventListener('drop', e => {
    e.preventDefault();
    area.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file, preview);
  });

  input.addEventListener('change', () => {
    if (input.files[0]) handleImageFile(input.files[0], preview);
  });
}

function handleImageFile(file, preview) {
  if (file.size > 2 * 1024 * 1024) {
    atoast('La imagen no debe superar 2MB.', 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    preview.src   = e.target.result;
    preview.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

// ── Save handler ──
async function saveItem() {
  const title   = document.getElementById('f-title')?.value.trim();
  const desc    = document.getElementById('f-desc')?.value.trim();
  const preview = document.getElementById('upload-preview');
  const image   = preview?.style.display !== 'none' ? preview?.src : (editingItem?.image || null);

  if (!title) { atoast('El nombre es obligatorio.', 'error'); return; }

  if (editingStore === 'project') {
    const techStr = document.getElementById('f-tech')?.value || '';
    const item = {
      ...(editingItem || {}),
      title,
      description: desc,
      category:    document.getElementById('f-category')?.value || 'web',
      date:        document.getElementById('f-date')?.value || '',
      tech:        techStr.split(',').map(t => t.trim()).filter(Boolean),
      url:         document.getElementById('f-url')?.value || '',
      image,
    };
    await KouddDB.saveProject(item);
    adminProjects = await KouddDB.getProjects();
    renderProjectsTable();

  } else if (editingStore === 'product') {
    const item = {
      ...(editingItem || {}),
      name:        title,
      description: desc,
      category:    document.getElementById('f-category')?.value || 'web',
      price:       parseFloat(document.getElementById('f-price')?.value || '0').toFixed(2),
      currency:    'USD',
      emoji:       document.getElementById('f-emoji')?.value || '🛒',
      available:   document.getElementById('f-available')?.checked ?? true,
      image,
    };
    await KouddDB.saveProduct(item);
    adminProducts = await KouddDB.getProducts();
    renderProductsTable();

  } else if (editingStore === 'service') {
    const item = {
      ...(editingItem || {}),
      name: title,
      desc,
      icon: document.getElementById('f-emoji')?.value || '🔧',
    };
    await KouddDB.saveService(item);
    adminServices = await KouddDB.getServices();
    renderServicesTable();
  }

  atoast('¡Guardado correctamente!', 'success');
  updateStats();
  closeModal('item-modal');
}

// ── Delete ──
async function deleteProject(id) {
  if (!confirm('¿Eliminar este proyecto?')) return;
  await KouddDB.deleteProject(id);
  adminProjects = await KouddDB.getProjects();
  renderProjectsTable();
  updateStats();
  atoast('Proyecto eliminado.', 'info');
}

async function deleteProduct(id) {
  if (!confirm('¿Eliminar este producto?')) return;
  await KouddDB.deleteProduct(id);
  adminProducts = await KouddDB.getProducts();
  renderProductsTable();
  updateStats();
  atoast('Producto eliminado.', 'info');
}

// ── Edit shortcuts ──
function editProject(id) {
  const p = adminProjects.find(x => x.id === id);
  if (p) openProjectModal(p);
}

function editProduct(id) {
  const p = adminProducts.find(x => x.id === id);
  if (p) openProductModal(p);
}

function editService(id) {
  const s = adminServices.find(x => x.id === id);
  if (s) openServiceModal(s);
}

// Expose to global scope for inline handlers
window.editProject  = editProject;
window.editProduct  = editProduct;
window.editService  = editService;
window.deleteProject = deleteProject;
window.deleteProduct = deleteProduct;

// ── Modal ──
function openModal(id) {
  document.getElementById(id)?.classList.add('open');
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
  editingItem  = null;
  editingStore = null;
}

// ── Sidebar navigation ──
function initSidebar() {
  $$('.sidebar-link[data-panel]').forEach(link => {
    link.addEventListener('click', () => {
      $$('.sidebar-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const panel = link.dataset.panel;
      $$('.admin-panel').forEach(p => p.classList.remove('active'));
      document.getElementById(`panel-${panel}`)?.classList.add('active');

      const titles = {
        dashboard: 'Dashboard',
        projects:  'Proyectos',
        products:  'Tienda / Productos',
        services:  'Servicios',
        settings:  'Configuración',
      };
      document.getElementById('topbar-title').textContent = titles[panel] || 'Admin';
    });
  });
}

// ── Password change ──
function initSettings() {
  const form = document.getElementById('pass-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const oldP = document.getElementById('s-old-pass').value;
    const newP = document.getElementById('s-new-pass').value;
    const conf = document.getElementById('s-conf-pass').value;

    if (newP !== conf) {
      atoast('Las contraseñas nuevas no coinciden.', 'error');
      return;
    }
    if (newP.length < 6) {
      atoast('La contraseña debe tener al menos 6 caracteres.', 'error');
      return;
    }

    // Store new hash in localStorage
    const currentHash = localStorage.getItem('koudd_pass') || btoa('E33186351');
    if (btoa(oldP) !== currentHash) {
      atoast('Contraseña actual incorrecta.', 'error');
      return;
    }
    localStorage.setItem('koudd_pass', btoa(newP));
    atoast('¡Contraseña actualizada!', 'success');
    form.reset();
  });
}

// ── Modal global listeners ──
function initModals() {
  $$('.admin-modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  document.getElementById('modal-save-btn')?.addEventListener('click', saveItem);
  document.getElementById('modal-cancel-btn')?.addEventListener('click', () => closeModal('item-modal'));

  document.getElementById('btn-add-project')?.addEventListener('click', () => openProjectModal());
  document.getElementById('btn-add-product')?.addEventListener('click', () => openProductModal());
}

// ── Init ──
async function initAdmin() {
  await KouddDB.init();
  checkAuth();
  initLogin();
  initSidebar();
  initModals();
  initSettings();

  // Ripples
  $$('.btn').forEach(b => {
    b.addEventListener('click', (e) => {
      const r    = document.createElement('span');
      r.className = 'ripple-effect';
      const rect  = b.getBoundingClientRect();
      const size  = Math.max(rect.width, rect.height);
      r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
      b.appendChild(r);
      setTimeout(() => r.remove(), 700);
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}
