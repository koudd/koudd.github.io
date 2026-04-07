# koudd.lab — Portfolio Web Completo

Construcción de un portfolio web profesional y moderno para **Emmanuel Pirela** bajo la marca **koudd.lab**. El sitio tendrá animaciones avanzadas, panel de administración privado, integración con WhatsApp, y sistema de proyectos/tienda digital.

---

## Resumen del Proyecto

| Campo | Valor |
|---|---|
| Nombre principal | **koudd.lab** |
| Nombre secundario | Emmanuel Pirela |
| GitHub / Profesional | Emmanuel.lab |
| Colores | Naranja eléctrico `#FF5500`, Negro `#0A0A0A`, Blanco `#FFFFFF` |
| WhatsApp API | `+58 424 649 7143` |
| Tecnología | HTML + Vanilla CSS + Vanilla JS (sin frameworks) |
| Almacenamiento | localStorage + IndexedDB (100% local, sin servidor) |

---

## Estructura de Páginas

```
/                   → Hero + Inicio (animaciones de entrada)
/proyectos          → Galería de proyectos públicos
/servicios          → Servicios ofrecidos
/tienda             → Productos digitales a la venta
/contacto           → Formulario + WhatsApp directo
/admin/login        → Login privado (solo Emmanuel)
/admin/dashboard    → Panel de administración
```

---

## Secciones del Sitio Público

### 1. Hero Section
- Logo animado koudd.lab con entrada dramática
- Texto tipografiado "typewriter": `Innovación | Código | Tecnología`
- Fondo con partículas flotantes naranja sobre negro
- CTA: "Ver mis trabajos" + "Solicitar servicio"
- Scroll indicator animado

### 2. Sobre Mí
- Foto/avatar con borde naranja animado
- Bio breve: Emmanuel Pirela, desarrollador web y técnico en sistemas
- GitHub: Emmanuel.lab
- Skills con barras de progreso animadas

### 3. Proyectos (Portfolio)
- Grid de tarjetas con hover glassmorphism naranja
- Filtros por categoría: Web, Sistemas, Diseño, Otros
- Modal con preview, descripción, tecnologías usadas y enlace
- Proyectos cargados desde el panel admin

### 4. Servicios
Tarjetas animadas con iconos para:
- 🌐 Desarrollo Web
- 💻 Desarrollo de Sistemas
- 🔧 Reparación de Computadoras
- 🔌 Redes LAN
- 📷 Instalación de Cámaras
- 🛡️ Soporte/Asistencia Remota (Quick Assist)

Cada servicio tiene botón "Solicitar" → WhatsApp con mensaje preformateado.

### 5. Tienda Digital
- Grid de productos: páginas web, sistemas, cartas de amor web, plantillas
- Precio visible en cada producto
- Botón "Comprar / Consultar" → WhatsApp
- Productos administrados desde el panel admin

### 6. Contacto
- Formulario con nombre, email, mensaje
- Botón directo WhatsApp flotante (siempre visible)
- Links sociales (GitHub, etc.)

---

## Panel de Administración (Privado)

### Login (`/admin`)
- Contraseña encriptada en localStorage
- Credenciales por defecto: usuario `emmanuel` / contraseña a elegir
- Diseño oscuro con logo koudd.lab
- Protegido: redirige si no está autenticado

### Dashboard (`/admin/dashboard`)
Paneles:
- **Proyectos**: Agregar/Editar/Eliminar proyectos (título, descripción, imagen, categoría, URL, tecnologías)
- **Tienda**: Agregar/Editar/Eliminar productos (nombre, precio, descripción, imagen, tipo)
- **Servicios**: Personalizar descripción de servicios
- **Configuración**: Cambiar contraseña admin

---

## Diseño y Animaciones

| Elemento | Animación |
|---|---|
| Logo en hero | Entrada con escala + resplandor naranja |
| Navbar | Scroll → fondo glassmorphism se activa |
| Tarjetas de proyectos | Hover flip 3D con info al reverso |
| Partículas hero | Canvas API, partículas naranja flotantes |
| Secciones al hacer scroll | Fade-in + slide-up con IntersectionObserver |
| Botones | Efecto ripple naranja al hacer clic |
| Texto hero | Typewriter + cursor parpadeante |
| Skills | Barras de progreso que se llenan al hacer scroll |
| Stats (contadores) | Animación numérica al llegar a la sección |

---

## Tecnologías y Stack

- **HTML5** semántico (sin framework)
- **CSS3** con variables, animaciones CSS, glassmorphism
- **JavaScript ES6+** vanilla (sin dependencias)
- **Canvas API** para partículas
- **IndexedDB / localStorage** para persistencia de datos
- **Intersection Observer API** para animaciones de scroll
- **WhatsApp API** vía `https://wa.me/58424649743?text=...`
- **Google Fonts**: Space Grotesk + JetBrains Mono

---

## Estructura de Archivos

```
portfolioWeb/
├── index.html              → Página principal (todo en una sola página SPA)
├── admin.html              → Panel de administración
├── assets/
│   ├── logo-full.png       → Logo koudd.lab completo
│   ├── logo-icon.png       → Ícono K}
│   └── favicon.ico
├── css/
│   ├── main.css            → Estilos principales + variables
│   ├── animations.css      → Todas las animaciones
│   ├── components.css      → Tarjetas, modales, botones
│   └── admin.css           → Estilos del panel admin
└── js/
    ├── main.js             → Lógica principal
    ├── particles.js        → Sistema de partículas Canvas
    ├── animations.js       → Scroll animations
    ├── data.js             → Gestión IndexedDB/localStorage
    ├── whatsapp.js         → Integración WhatsApp
    └── admin.js            → Lógica del panel admin
```

---

## Paleta de Colores

```css
--orange-electric: #FF5500;
--orange-glow:     #FF7733;
--orange-dark:     #CC4400;
--black-deep:      #0A0A0A;
--black-card:      #111111;
--black-border:    #1A1A1A;
--white:           #FFFFFF;
--white-muted:     #CCCCCC;
--white-faint:     #888888;
--glass-bg:        rgba(255, 85, 0, 0.05);
--glass-border:    rgba(255, 85, 0, 0.15);
```

---

## Credenciales Admin (predeterminadas)
- Usuario: `emmanuel`  
- Contraseña: `koudd2024` *(puedes cambiarla desde el panel)*

> [!IMPORTANT]
> El sistema de autenticación es 100% del lado del cliente (localStorage). No hay backend. Para producción real, se recomienda migrar a un backend seguro. Por ahora es suficiente para uso personal.

---

## Plan de Ejecución

1. Copiar logos a `/assets/`
2. Crear `css/main.css` — variables + reset + tipografía
3. Crear `css/animations.css` — keyframes + transiciones
4. Crear `css/components.css` — tarjetas, modales, nav, botones
5. Crear `index.html` — estructura completa SPA
6. Crear `js/particles.js` — Canvas partículas
7. Crear `js/data.js` — IndexedDB + datos iniciales de ejemplo
8. Crear `js/main.js` — navegación, typewriter, scroll, modales
9. Crear `js/whatsapp.js` — mensajes preformateados por servicio
10. Crear `admin.html` + `css/admin.css` + `js/admin.js` — panel privado
11. Verificar en navegador con `python3 -m http.server`
