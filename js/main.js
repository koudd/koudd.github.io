// =============================================
// koudd.lab — Main Application Logic
// Emmanuel Pirela © 2024
// =============================================

'use strict';

// ── State ──
let projects  = [];
let products  = [];
let services  = [];
let currentFilter = 'all';
let particleSys   = null;

// ── DOM Helpers ──
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls)  e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}

// ── Toast ──
function toast(msg, type = 'info', duration = 3000) {
  const icons = { success: '✓', error: '✕', info: '●' };
  const t = el('div', `toast ${type}`, `<span>${icons[type] || '●'}</span> ${msg}`);
  const container = document.getElementById('toast-container');
  if (!container) return;
  container.appendChild(t);
  setTimeout(() => {
    t.classList.add('fade-out');
    setTimeout(() => t.remove(), 400);
  }, duration);
}

// ── Rippe effect ──
function addRipple(e) {
  const btn  = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const r = el('span', 'ripple-effect');
  const size = Math.max(rect.width, rect.height);
  r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px`;
  btn.appendChild(r);
  setTimeout(() => r.remove(), 700);
}

function initRipples() {
  $$('.btn').forEach(b => b.addEventListener('click', addRipple));
}

// ── Navbar ──
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  });

  // Smooth scroll nav links
  $$('.nav-link, .footer-link[data-section]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = link.dataset.section ? link.dataset.section : link.getAttribute('href');
      if (target && target.startsWith('#')) {
        e.preventDefault();
        const sec = document.querySelector(target);
        if (sec) sec.scrollIntoView({ behavior: 'smooth' });
        closeMobileMenu();
      }
    });
  });

  // Active state on scroll
  const sections = $$('section[id]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        $$('.nav-link').forEach(l => l.classList.remove('active'));
        const active = $$(`.nav-link[href="#${entry.target.id}"]`);
        active.forEach(l => l.classList.add('active'));
      }
    });
  }, { rootMargin: '-50% 0px -50% 0px' });

  sections.forEach(s => observer.observe(s));

  // Hamburger
  const ham = document.getElementById('hamburger');
  const mob = document.getElementById('mobile-menu');
  if (ham && mob) {
    ham.addEventListener('click', () => {
      ham.classList.toggle('open');
      mob.classList.toggle('open');
    });
  }
}

function closeMobileMenu() {
  const ham = document.getElementById('hamburger');
  const mob = document.getElementById('mobile-menu');
  if (ham) ham.classList.remove('open');
  if (mob) mob.classList.remove('open');
}

// ── Cursor glow ──
function initCursor() {
  const glow = document.getElementById('cursor-glow');
  if (!glow || window.matchMedia('(pointer: coarse)').matches) return;
  document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });
}

// ── Scroll Reveal ──
function initScrollReveal() {
  const opts = { threshold: 0.1, rootMargin: '0px 0px -60px 0px' };
  const obs  = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, opts);

  $$('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => obs.observe(el));
}

// ── Counter animation ──
function animateCounter(el, target, duration = 1500) {
  const start = performance.now();
  const update = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(ease * target) + (el.dataset.suffix || '');
    if (p < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

function initCounters() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.count || '0');
        animateCounter(entry.target, target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  $$('[data-count]').forEach(el => obs.observe(el));
}

// ── Typewriter ──
function initTypewriter() {
  const el = document.getElementById('typewriter-text');
  if (!el) return;

  const phrases = [
    'Innovación | Código | Tecnología',
    'Desarrollo Web & Sistemas',
    'Soporte Técnico Profesional',
    'Redes & Videovigilancia',
  ];

  let pi = 0, ci = 0, deleting = false;

  function tick() {
    const phrase = phrases[pi % phrases.length];
    if (!deleting) {
      el.textContent = phrase.slice(0, ++ci);
      if (ci >= phrase.length) {
        deleting = true;
        setTimeout(tick, 2000);
        return;
      }
      setTimeout(tick, 55);
    } else {
      el.textContent = phrase.slice(0, --ci);
      if (ci === 0) {
        deleting = false;
        pi++;
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, 28);
    }
  }
  tick();
}

// ── Projects ──
function renderProjects(filter = 'all') {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  const filtered = filter === 'all'
    ? projects
    : projects.filter(p => p.category === filter);

  if (!filtered.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:4rem 0;color:var(--white-60);">
      <div style="font-size:3rem;margin-bottom:1rem;">📂</div>
      <p>No hay proyectos en esta categoría todavía.</p>
    </div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="project-card reveal delay-${Math.min(filtered.indexOf(p) + 1, 7)}"
         data-id="${p.id}" role="button" tabindex="0" aria-label="Ver proyecto ${p.title}">
      <div style="overflow:hidden;border-radius:var(--r-lg) var(--r-lg) 0 0">
        ${p.image
          ? `<img class="project-card-img" src="${p.image}" alt="${p.title}" loading="lazy">`
          : `<div class="project-card-img-placeholder">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                 <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>
               </svg>
             </div>`
        }
        <div class="project-card-overlay">
          <div class="skills-cloud">
            ${(p.tech || []).map(t => `<span class="badge badge-orange">${t}</span>`).join('')}
          </div>
          <div style="display:flex;gap:.75rem;margin-top:.75rem;flex-wrap:wrap">
            ${p.url && p.url !== '#' ? `<a href="${p.url}" target="_blank" class="btn btn-primary btn-sm">Ver Demo ↗</a>` : ''}
            <button class="btn btn-outline btn-sm" data-wa="proyecto" data-wa-arg1="${p.title}">WhatsApp</button>
          </div>
        </div>
      </div>
      <div class="project-card-body">
        <span class="badge badge-white" style="margin-bottom:.5rem">${p.category}</span>
        <h3 class="project-card-title">${p.title}</h3>
        <p class="project-card-desc">${p.description}</p>
      </div>
    </div>
  `).join('');

  // Re-observe new elements
  initScrollReveal();
  initWhatsApp();

  // Card click → modal
  $$('#projects-grid .project-card').forEach(card => {
    card.addEventListener('click', () => {
      const proj = projects.find(p => p.id == card.dataset.id);
      if (proj) openProjectModal(proj);
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter') card.click();
    });
  });
}

function openProjectModal(proj) {
  const overlay = document.getElementById('project-modal');
  const body    = document.getElementById('project-modal-body');
  if (!overlay || !body) return;

  body.innerHTML = `
    ${proj.image
      ? `<img class="modal-img" src="${proj.image}" alt="${proj.title}">`
      : `<div class="modal-img-placeholder">🖥️</div>`}
    <div class="modal-body">
      <div class="modal-meta">
        <span class="badge badge-orange">${proj.category}</span>
        <span class="badge badge-white">📅 ${proj.date || ''}</span>
      </div>
      <h2 class="modal-title">${proj.title}</h2>
      <p class="modal-desc">${proj.description}</p>
      <div class="project-card-tags" style="margin-bottom:1.5rem">
        ${(proj.tech || []).map(t => `<span class="skill-tag"><span class="dot"></span>${t}</span>`).join('')}
      </div>
      <div class="modal-actions">
        ${proj.url && proj.url !== '#' ? `<a href="${proj.url}" target="_blank" class="btn btn-primary">Ver Demo ↗</a>` : ''}
        <button class="btn btn-whatsapp" data-wa="proyecto" data-wa-arg1="${proj.title}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.122 1.523 5.858L.057 23.214a.75.75 0 00.924.924l5.356-1.466A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22.5c-1.979 0-3.842-.532-5.449-1.462l-.389-.228-4.034 1.104 1.133-4.035-.249-.407A10.453 10.453 0 011.5 12C1.5 6.21 6.21 1.5 12 1.5S22.5 6.21 22.5 12 17.79 22.5 12 22.5z"/></svg>
          Consultar por WhatsApp
        </button>
      </div>
    </div>`;

  overlay.classList.add('open');
  initWhatsApp();
}

// ── Services ──
function renderServices() {
  const grid = document.getElementById('services-grid');
  if (!grid || !services.length) return;

  grid.innerHTML = services.map((s, i) => `
    <div class="service-card reveal delay-${Math.min(i+1,7)}">
      <div class="service-icon">${s.icon}</div>
      <h3>${s.name}</h3>
      <p>${s.desc}</p>
      <button class="btn btn-outline btn-sm" data-wa="${s.key}" style="margin-top:auto">
        Solicitar servicio ↗
      </button>
    </div>
  `).join('');

  initScrollReveal();
  initWhatsApp();
}

// ── Store / Products ──
function renderProducts() {
  const grid = document.getElementById('store-grid');
  if (!grid || !products.length) return;

  grid.innerHTML = products.map((p, i) => `
    <div class="product-card reveal delay-${Math.min(i+1,7)}">
      ${p.image
        ? `<img class="product-card-img" src="${p.image}" alt="${p.name}" loading="lazy">`
        : `<div class="product-card-img-placeholder">${p.emoji || '🛒'}</div>`
      }
      <div class="product-card-body">
        <div class="product-card-title">${p.name}</div>
        <p class="product-card-desc">${p.description}</p>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap">
          <span class="badge badge-orange">${p.category}</span>
          ${!p.available ? `<span class="badge badge-white">No disponible</span>` : ''}
        </div>
      </div>
      <div class="product-card-footer">
        <div>
          <span class="product-price-label">Precio</span>
          <span class="product-price">$${p.price} <small style="font-size:.8rem;color:var(--white-60)">${p.currency}</small></span>
        </div>
        <div style="display:flex;flex-direction:column;gap:.4rem;align-items:flex-end">
          <button class="btn btn-primary btn-sm" onclick="buyWithPayPal('${p.name}', '${p.price}', '${p.currency}')">
            💳 PayPal
          </button>
          <button class="btn btn-whatsapp btn-sm" data-wa="tienda" data-wa-arg1="${p.name}" data-wa-arg2="$${p.price} ${p.currency}">
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  `).join('');

  initScrollReveal();
  initWhatsApp();
}

// ── PayPal redirect ──
function buyWithPayPal(name, price, currency) {
  const PAYPAL_ME = 'https://paypal.me/'; // Actualizar con tu PayPal.me link
  const url = `${PAYPAL_ME}?amount=${price}&currencyCode=${currency}&note=${encodeURIComponent('koudd.lab - ' + name)}`;
  // Fallback to WhatsApp if PayPal.me not configured
  openWhatsApp('tienda', name, `$${price} ${currency}`);
}

window.buyWithPayPal = buyWithPayPal;

// ── Contact form ──
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name    = $('#contact-name', form).value.trim();
    const service = $('#contact-service', form).value;
    const message = $('#contact-message', form).value.trim();
    const email   = $('#contact-email', form).value.trim();

    if (!name || !message) {
      toast('Por favor completa todos los campos.', 'error');
      return;
    }

    const msg = `¡Hola Emmanuel! 👋 Me llamo *${name}* (${email}).\n\nServicio de interés: *${service || 'General'}*\n\nMensaje:\n${message}`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    toast('¡Mensaje enviado! Te redirigimos a WhatsApp.', 'success');
    form.reset();
  });
}

// ── Magnetic buttons ──
function initMagnetic() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  $$('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const dx   = e.clientX - (rect.left + rect.width / 2);
      const dy   = e.clientY - (rect.top  + rect.height / 2);
      btn.style.transform = `translate(${dx*0.25}px, ${dy*0.25}px)`;
    });
    btn.addEventListener('mouseleave', () => btn.style.transform = '');
  });
}

// ── Filter tabs ──
function initFilters() {
  $$('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      renderProjects(currentFilter);
    });
  });
}

// ── Modal close ──
function initModals() {
  $$('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
    const closeBtn = overlay.querySelector('.modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => overlay.classList.remove('open'));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') $$('.modal-overlay').forEach(o => o.classList.remove('open'));
  });
}

// ── Preloader ──
function hidePreloader() {
  const pl = document.getElementById('preloader');
  if (!pl) return;
  setTimeout(() => {
    pl.classList.add('hidden');
    setTimeout(() => pl.remove(), 700);
  }, 1800);
}

// ── Stats animation (section stats) ──
function initStats() {
  const stats = [
    { id: 'stat-projects', val: projects.length || 10 },
    { id: 'stat-clients',  val: 25 },
    { id: 'stat-years',    val: 3, suffix: '+' },
    { id: 'stat-uptime',   val: 99, suffix: '%' },
  ];

  stats.forEach(s => {
    const el = document.getElementById(s.id);
    if (el) {
      el.dataset.count  = s.val;
      el.dataset.suffix = s.suffix || '';
    }
  });
  initCounters();
}

// ── Main init ──
async function init() {
  try {
    await KouddDB.init();
    projects = await KouddDB.getProjects();
    products = await KouddDB.getProducts();
    services = await KouddDB.getServices();
  } catch (err) {
    console.warn('DB error, using defaults', err);
  }

  hidePreloader();
  initNavbar();
  initCursor();
  initTypewriter();
  initScrollReveal();
  initFilters();
  initModals();
  initContactForm();
  initMagnetic();
  initWhatsApp();

  renderProjects();
  renderServices();
  renderProducts();
  initStats();

  // Global particles — fixed full-page canvas, more particles for whole-site coverage
  particleSys = new ParticleSystem('particles-canvas', 120);

  // Init ripples after a tick (so all btns are rendered)
  setTimeout(initRipples, 100);
}

// Wait for DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
