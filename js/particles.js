// =============================================
// koudd.lab — Particle System (Canvas API)
// Emmanuel Pirela © 2024
// =============================================

class ParticleSystem {
  constructor(canvasId, count = 80) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: -1000, y: -1000 };
    this.count = count;
    this.animId = null;

    this.resize();
    this.init();
    this.bindEvents();
    this.animate();
  }

  resize() {
    // Always match full viewport for fixed-position canvas
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    this.particles = [];
    for (let i = 0; i < this.count; i++) {
      this.particles.push(this.createParticle());
    }
  }

  createParticle(x, y) {
    const types = ['circle', 'cross', 'dot'];
    const type  = types[Math.floor(Math.random() * types.length)];
    return {
      x:     x !== undefined ? x : Math.random() * this.canvas.width,
      y:     y !== undefined ? y : Math.random() * this.canvas.height,
      vx:    (Math.random() - 0.5) * 0.4,
      vy:    (Math.random() - 0.5) * 0.4,
      size:  Math.random() * 2.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
      alphaDir: Math.random() > 0.5 ? 1 : -1,
      type,
      hue:   Math.random() > 0.7 ? 255 : 255,  // all orange-ish
      sat:   Math.random() * 30 + 70,
      light: Math.random() * 20 + 50,
    };
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.init();
    });

    document.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });
  }

  drawParticle(p) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = `hsl(20, ${p.sat}%, ${p.light}%)`;
    ctx.strokeStyle = `hsl(20, ${p.sat}%, ${p.light}%)`;
    ctx.lineWidth = 1;

    if (p.type === 'circle') {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'cross') {
      const s = p.size * 2.5;
      ctx.beginPath();
      ctx.moveTo(p.x - s, p.y);
      ctx.lineTo(p.x + s, p.y);
      ctx.moveTo(p.x, p.y - s);
      ctx.lineTo(p.x, p.y + s);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawConnections() {
    const ctx = this.ctx;
    const maxDist = 120;

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx   = this.particles[i].x - this.particles[j].x;
        const dy   = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.15;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = '#FF5500';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(this.particles[i].x, this.particles[i].y);
          ctx.lineTo(this.particles[j].x, this.particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  update() {
    for (const p of this.particles) {
      // Mouse repulsion
      const dx   = p.x - this.mouse.x;
      const dy   = p.y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 100) {
        const force = (100 - dist) / 100 * 0.8;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      // Damping
      p.vx *= 0.99;
      p.vy *= 0.99;

      p.x += p.vx;
      p.y += p.vy;

      // Alpha pulse
      p.alpha += 0.005 * p.alphaDir;
      if (p.alpha > 0.6 || p.alpha < 0.05) p.alphaDir *= -1;

      // Wrap around
      const margin = 20;
      if (p.x < -margin) p.x = this.canvas.width + margin;
      if (p.x > this.canvas.width + margin)  p.x = -margin;
      if (p.y < -margin) p.y = this.canvas.height + margin;
      if (p.y > this.canvas.height + margin) p.y = -margin;
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawConnections();
    for (const p of this.particles) {
      this.drawParticle(p);
    }
    this.update();
    this.animId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}

// Export
window.ParticleSystem = ParticleSystem;
