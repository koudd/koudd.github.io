// =============================================
// koudd.lab — WhatsApp Integration
// Emmanuel Pirela © 2024
// =============================================

const WA_NUMBER = '584246497143'; // Sin + ni espacios

const WA_MESSAGES = {
  general:
    `¡Hola! 👋 Te contacto desde tu portfolio *koudd.lab*. Me gustaría obtener información sobre tus servicios.`,

  web:
    `¡Hola Emmanuel! 🌐 Vi tu portfolio en *koudd.lab*. Me interesa el servicio de *Desarrollo Web*. ¿Podrías darme más información y presupuesto?`,

  sistemas:
    `¡Hola Emmanuel! 💻 Vi tu portfolio en *koudd.lab*. Me interesa el servicio de *Desarrollo de Sistemas*. ¿Podrías contactarme para discutir mi proyecto?`,

  reparacion:
    `¡Hola Emmanuel! 🔧 Vi tu portfolio en *koudd.lab*. Necesito asistencia con *Reparación de Computadora*. ¿Cuál es tu disponibilidad?`,

  redes:
    `¡Hola Emmanuel! 🔌 Vi tu portfolio en *koudd.lab*. Me interesa el servicio de *Redes LAN*. ¿Puedes ayudarme con la instalación/config?`,

  camaras:
    `¡Hola Emmanuel! 📷 Vi tu portfolio en *koudd.lab*. Necesito información sobre la *Instalación de Cámaras de Seguridad*.`,

  soporte:
    `¡Hola Emmanuel! 🛡️ Vi tu portfolio en *koudd.lab*. Necesito *Soporte Técnico Remoto*. ¿Puedes asistirme ahora o pronto?`,

  tienda:
    (productName, price) =>
      `¡Hola Emmanuel! 🛒 Vi tu portfolio en *koudd.lab*. Me interesa comprar *${productName}* (${price} USD). ¿Cómo procedemos con el pago por PayPal?`,

  proyecto:
    (projectTitle) =>
      `¡Hola Emmanuel! 🚀 Vi tu proyecto *${projectTitle}* en *koudd.lab*. Me gustaría saber más o contratar algo similar.`,

  presupuesto:
    `¡Hola Emmanuel! 💬 Me gustaría solicitar un *presupuesto personalizado* para un proyecto. ¿Cuándo tienes disponibilidad?`,
};

function buildWaUrl(msg) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function openWhatsApp(key, ...args) {
  let msg = WA_MESSAGES[key];
  if (typeof msg === 'function') msg = msg(...args);
  if (!msg) msg = WA_MESSAGES.general;
  window.open(buildWaUrl(msg), '_blank', 'noopener,noreferrer');
}

// Attach to all [data-wa] elements
function initWhatsApp() {
  document.querySelectorAll('[data-wa]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const key  = el.dataset.wa;
      const arg1 = el.dataset.waArg1 || '';
      const arg2 = el.dataset.waArg2 || '';
      openWhatsApp(key, arg1, arg2);
    });
  });

  // Floating button
  const floatBtn = document.getElementById('whatsapp-float');
  if (floatBtn) {
    floatBtn.addEventListener('click', () => openWhatsApp('general'));
  }
}

window.openWhatsApp = openWhatsApp;
window.initWhatsApp = initWhatsApp;
