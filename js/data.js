// =============================================
// koudd.lab — Data Layer (localStorage + IndexedDB)
// Emmanuel Pirela © 2024
// =============================================

const DB_NAME    = 'kouddlab_db';
const DB_VERSION = 1;
let   db         = null;

// ── Default sample data ──
const DEFAULT_PROJECTS = [
  {
    id: 1,
    title: 'Landing Page Corporativa',
    category: 'web',
    description: 'Landing page moderna con animaciones CSS avanzadas y diseño responsive para empresa de tecnología.',
    tech: ['HTML', 'CSS', 'JavaScript'],
    image: null,
    url: '#',
    featured: true,
    date: '2024-01-15'
  },
  {
    id: 2,
    title: 'Sistema de Inventario',
    category: 'sistemas',
    description: 'Sistema de gestión de inventario con módulo de ventas, reportes y dashboard administrativo.',
    tech: ['Python', 'MySQL', 'Tkinter'],
    image: null,
    url: '#',
    featured: true,
    date: '2024-02-20'
  },
  {
    id: 3,
    title: 'Carta de Amor Web',
    category: 'especial',
    description: 'Carta de amor interactiva con animaciones, música de fondo y efectos de partículas para San Valentín.',
    tech: ['HTML', 'CSS', 'JS', 'Canvas'],
    image: null,
    url: '#',
    featured: false,
    date: '2024-02-14'
  },
  {
    id: 4,
    title: 'Portfolio Personal',
    category: 'web',
    description: 'Portfolio web profesional con Three.js, animaciones avanzadas y panel de administración.',
    tech: ['HTML', 'CSS', 'JS', 'Three.js'],
    image: null,
    url: '#',
    featured: true,
    date: '2024-03-01'
  }
];

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: 'Carta de Amor Web Premium',
    category: 'especial',
    description: 'Carta de amor web interactiva personalizada con tu nombre, fotos y música. Perfecta para ocasiones especiales.',
    price: '15.00',
    currency: 'USD',
    image: null,
    emoji: '💌',
    available: true,
    date: '2024-01-01'
  },
  {
    id: 2,
    name: 'Landing Page Profesional',
    category: 'web',
    description: 'Landing page completa y responsive. Incluye hosting por 1 año y dominio .com.',
    price: '80.00',
    currency: 'USD',
    image: null,
    emoji: '🌐',
    available: true,
    date: '2024-01-01'
  },
  {
    id: 3,
    name: 'Sistema de Inventario Básico',
    category: 'sistemas',
    description: 'Sistema de inventario con módulo de ventas, reportes PDF y backup automático.',
    price: '120.00',
    currency: 'USD',
    image: null,
    emoji: '📦',
    available: true,
    date: '2024-01-01'
  },
  {
    id: 4,
    name: 'Plantilla HTML/CSS Premium',
    category: 'plantilla',
    description: 'Pack de 5 plantillas HTML/CSS de alta calidad para negocios, portfolios y tiendas.',
    price: '25.00',
    currency: 'USD',
    image: null,
    emoji: '🎨',
    available: true,
    date: '2024-01-01'
  }
];

const DEFAULT_SERVICES = [
  {
    id: 1, key: 'web',
    name: 'Desarrollo Web',
    desc: 'Sitios web modernos, responsivos y optimizados. Desde landing pages hasta e-commerce completos.',
    icon: '🌐'
  },
  {
    id: 2, key: 'sistemas',
    name: 'Desarrollo de Sistemas',
    desc: 'Software a medida para gestión de inventario, RRHH, facturación y más.',
    icon: '💻'
  },
  {
    id: 3, key: 'reparacion',
    name: 'Reparación de Computadoras',
    desc: 'Diagnóstico y reparación de hardware, formateo, limpieza y actualización de equipos.',
    icon: '🔧'
  },
  {
    id: 4, key: 'redes',
    name: 'Redes LAN',
    desc: 'Instalación y configuración de redes cableadas e inalámbricas para hogares y empresas.',
    icon: '🔌'
  },
  {
    id: 5, key: 'camaras',
    name: 'Instalación de Cámaras',
    desc: 'Instalación de sistemas de videovigilancia CCTV/IP para hogares y negocios.',
    icon: '📷'
  },
  {
    id: 6, key: 'soporte',
    name: 'Soporte Remoto',
    desc: 'Asistencia técnica remota rápida vía Quick Assist. Resolución inmediata de problemas.',
    icon: '🛡️'
  }
];

// ── Auth ──
const AUTH = {
  USER: 'emmanuel',
  PASS_HASH: btoa('E33186351'), // base64 encode
  TOKEN_KEY: 'koudd_auth_token'
};

function hashPass(pass) { return btoa(pass); }

function login(user, pass) {
  if (user === AUTH.USER && hashPass(pass) === AUTH.PASS_HASH) {
    const token = btoa(Date.now() + ':' + AUTH.USER);
    localStorage.setItem(AUTH.TOKEN_KEY, token);
    return true;
  }
  return false;
}

function logout() {
  localStorage.removeItem(AUTH.TOKEN_KEY);
}

function isLoggedIn() {
  return !!localStorage.getItem(AUTH.TOKEN_KEY);
}

function changePassword(oldPass, newPass) {
  if (hashPass(oldPass) !== localStorage.getItem('koudd_pass') && hashPass(oldPass) !== AUTH.PASS_HASH) return false;
  localStorage.setItem('koudd_pass', hashPass(newPass));
  AUTH.PASS_HASH = hashPass(newPass);
  return true;
}

// ── IndexedDB ──
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains('projects')) {
        d.createObjectStore('projects', { keyPath: 'id', autoIncrement: true });
      }
      if (!d.objectStoreNames.contains('products')) {
        d.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
      }
      if (!d.objectStoreNames.contains('services')) {
        d.createObjectStore('services', { keyPath: 'id', autoIncrement: true });
      }
    };

    req.onsuccess = (e) => { db = e.target.result; resolve(db); };
    req.onerror   = (e) => reject(e);
  });
}

function getAll(store) {
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

function putItem(store, item) {
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).put(item);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

function deleteItem(store, id) {
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).delete(id);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

async function seedIfEmpty(store, defaults) {
  const existing = await getAll(store);
  if (existing.length === 0) {
    for (const item of defaults) {
      const { id: _, ...rest } = item;
      await putItem(store, rest);
    }
  }
}

// ── Public API ──
const KouddDB = {
  async init() {
    await openDB();
    await seedIfEmpty('projects', DEFAULT_PROJECTS);
    await seedIfEmpty('products', DEFAULT_PRODUCTS);
    await seedIfEmpty('services', DEFAULT_SERVICES);
  },

  // Projects
  getProjects:  () => getAll('projects'),
  saveProject:  (p) => putItem('projects', p),
  deleteProject:(id) => deleteItem('projects', Number(id)),

  // Products
  getProducts:  () => getAll('products'),
  saveProduct:  (p) => putItem('products', p),
  deleteProduct:(id) => deleteItem('products', Number(id)),

  // Services
  getServices:  () => getAll('services'),
  saveService:  (s) => putItem('services', s),
  deleteService:(id) => deleteItem('services', Number(id)),

  // Auth
  login, logout, isLoggedIn, changePassword,

  // Utils
  nextId(arr) {
    return arr.length ? Math.max(...arr.map(i => i.id || 0)) + 1 : 1;
  }
};

window.KouddDB = KouddDB;
