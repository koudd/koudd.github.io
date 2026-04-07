# 🚀 Guía de Despliegue — koudd.lab

## Dónde publicar tu portfolio

### ✅ Recomendación #1: Firebase Hosting (GRATIS + Fácil)

Firebase Hosting es perfecto para tu proyecto porque:
- ✅ **Gratis** (plan Spark tiene 10 GB de almacenamiento, 360 MB/día de transferencia)
- ✅ **CDN global** — carga rápido desde cualquier parte del mundo
- ✅ **HTTPS automático** — SSL incluido
- ✅ **Dominio personalizado** — puedes conectar `koudd.lab` o similar
- ✅ Sin servidor necesario (tu código es HTML/CSS/JS puro)

---

## Paso 1: Instalar Firebase CLI

Abre una terminal y ejecuta:

```bash
npm install -g firebase-tools
```

> Si no tienes Node.js instalado: https://nodejs.org

---

## Paso 2: Iniciar sesión en Firebase

```bash
firebase login
```

Se abrirá el navegador para que inicies sesión con tu cuenta Google.

---

## Paso 3: Crear proyecto en Firebase Console

1. Ve a: https://console.firebase.google.com
2. Clic en **"Agregar proyecto"**
3. Nombre del proyecto: `kouddlab` (o el que quieras)
4. Desactiva Google Analytics si no lo necesitas
5. Clic en **"Crear proyecto"**

---

## Paso 4: Configurar Firebase en tu proyecto

Dentro de la carpeta `portfolioWeb` ejecuta:

```bash
cd /home/emmanuel/Documentos/portfolioWeb
firebase init hosting
```

Cuando te pregunte:
- **"Which Firebase project?"** → Selecciona el proyecto que creaste
- **"Public directory?"** → Escribe: `.` (punto — la carpeta actual)
- **"Configure as single-page app?"** → `N` (No)
- **"Set up automatic builds?"** → `N` (No)
- **"File index.html already exists, overwrite?"** → `N` (No)

---

## Paso 5: Publicar

```bash
firebase deploy
```

¡Listo! Te dará una URL como: `https://kouddlab-xxxxx.web.app`

---

## Configurar dominio personalizado (opcional)

Si tienes tu propio dominio (ej: `koudd.lab`, `emmanuellab.dev`, etc.):

1. En Firebase Console → Hosting → **"Agregar dominio personalizado"**
2. Ingresa tu dominio
3. Añade los registros DNS que te proporcione Firebase en tu proveedor de dominio
4. Espera 24-48h para que se propague

---

## ✅ Recomendación #2: Netlify (Alternativa excelente)

Si prefieres algo más visual y sin CLI:

1. Ve a: https://netlify.com
2. Arrastra y suelta la carpeta `portfolioWeb` completa en el área de deploy
3. ¡En segundos tienes tu URL!

Para dominio personalizado: Settings → Domain Management → Add custom domain.

**Plan gratuito incluye:**
- 100 GB de ancho de banda/mes
- HTTPS automático
- Deploy en segundos

---

## ✅ Recomendación #3: GitHub Pages (Gratis, requiere GitHub)

Como tu usuario de GitHub es `koudd`:

```bash
cd /home/emmanuel/Documentos/portfolioWeb
git init
git add .
git commit -m "🚀 koudd.lab portfolio inicial"
git branch -M main
git remote add origin https://github.com/koudd/koudd.github.io
git push -u origin main
```

Tu sitio quedará disponible en: `https://koudd.github.io`

> ⚠️ GitHub Pages con archivos JavaScript complejos (IndexedDB, Three.js) funciona bien. El único límite es que no hay backend.

---

## Comparativa Final

| Plataforma | Precio | Velocidad | Dominio Custom | Facilidad |
|---|---|---|---|---|
| **Firebase** | Gratis | ⭐⭐⭐⭐⭐ | ✅ Fácil | ⭐⭐⭐⭐ |
| **Netlify** | Gratis | ⭐⭐⭐⭐⭐ | ✅ Muy fácil | ⭐⭐⭐⭐⭐ |
| **GitHub Pages** | Gratis | ⭐⭐⭐⭐ | ✅ Fácil | ⭐⭐⭐ |
| VPS (DigitalOcean) | ~$6/mes | ⭐⭐⭐⭐⭐ | ✅ Total control | ⭐⭐ |

**Mi recomendación: Firebase o Netlify** — son los más rápidos y fáciles para tu tipo de proyecto.

---

## ⚠️ Antes de publicar — Checklist

- [ ] Configura tu PayPal.me en `js/main.js` línea ~137 (variable `PAYPAL_ME`)
- [ ] Actualiza las estadísticas en la sección "Sobre mí"
- [ ] Agrega tus proyectos reales desde el panel Admin
- [ ] Agrega tus productos en la Tienda
- [ ] Verifica que los botones de WhatsApp funcionan
- [ ] Cambia la contraseña admin desde el panel de Configuración

---

## Acceso al Panel Admin (local)

- URL: `http://localhost:8080/admin.html`
- Usuario: `emmanuel`
- Contraseña: `E33186351`

---

## Notas importantes sobre IndexedDB en producción

Los datos que agregas en el panel Admin se guardan en el **navegador del dispositivo** (IndexedDB). Esto significa:

- Si abres la web desde **otro dispositivo**, no verás los datos que agregaste localmente
- Para datos persistentes en producción, necesitarías un backend (Firebase Firestore, Supabase, etc.)
- **Por ahora**, los datos de ejemplo (proyectos, servicios, productos) se cargan automáticamente en cualquier dispositivo que visite la web por primera vez

> Si quieres escalar a un backend real en el futuro, podemos migrar a **Firebase Firestore** que es gratuito y se integra perfectamente con tu stack.
