// =============================================
// koudd.lab — 3D Laptop Scene (Three.js)
// La laptop se desarma en piezas al hacer scroll / mover el mouse
// Emmanuel Pirela © 2024
// =============================================

class LaptopScene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container || typeof THREE === 'undefined') return;

    this.width     = this.container.clientWidth;
    this.height    = this.container.clientHeight;
    this.mouse     = { x: 0, y: 0 };
    this.scroll    = 0;
    this.animId    = null;
    this.parts     = [];
    this.targets   = [];

    this.initScene();
    this.createLaptop();
    this.bindEvents();
    this.animate();
  }

  initScene() {
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
    this.camera.position.set(0, 1.5, 5);
    this.camera.lookAt(0, 0, 0);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambient);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(3, 5, 3);
    mainLight.castShadow = true;
    this.scene.add(mainLight);

    const orangeLight = new THREE.PointLight(0xFF5500, 2, 8);
    orangeLight.position.set(-2, 2, 2);
    this.scene.add(orangeLight);

    const rimLight = new THREE.PointLight(0xFF7733, 1, 6);
    rimLight.position.set(2, -1, -2);
    this.scene.add(rimLight);

    this.orangeLight = orangeLight;
  }

  makeMat(color = 0x1a1a1a, emissive = 0x000000, roughness = 0.3, metalness = 0.85) {
    return new THREE.MeshStandardMaterial({ color, emissive, roughness, metalness });
  }

  makeOrangeMat() {
    return new THREE.MeshStandardMaterial({
      color: 0xFF5500,
      emissive: 0xFF3300,
      emissiveIntensity: 0.3,
      roughness: 0.2,
      metalness: 0.7
    });
  }

  createBox(w, h, d, mat, x = 0, y = 0, z = 0) {
    const geo  = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  createLaptop() {
    const mat      = this.makeMat(0x111111, 0x0A0605);
    const matKbd   = this.makeMat(0x0D0D0D, 0x000000, 0.6, 0.5);
    const matOrange = this.makeOrangeMat();
    const matScreen = new THREE.MeshStandardMaterial({
      color: 0x050505,
      emissive: 0xFF5500,
      emissiveIntensity: 0.08,
      roughness: 0.1,
      metalness: 0.5
    });
    const matGlass = new THREE.MeshStandardMaterial({
      color: 0x050E16,
      emissive: 0xFF5500,
      emissiveIntensity: 0.15,
      roughness: 0.0,
      metalness: 0.0,
      transparent: true,
      opacity: 0.85
    });

    // ── Base/keyboard ──
    const base = this.createBox(3.2, 0.15, 2.1, mat, 0, 0, 0);
    // Keyboard deck surface
    const deck = this.createBox(2.9, 0.02, 1.8, matKbd, 0, 0.085, 0);
    base.add(deck);

    // Orange accent strip rear
    const strip = this.createBox(3.2, 0.04, 0.08, matOrange, 0, 0.09, -1.01);
    base.add(strip);

    // Touchpad
    const tp = this.createBox(0.8, 0.01, 0.55, this.makeMat(0x0E0E0E, 0x000000, 0.1, 0.2), 0, 0.088, 0.62);
    base.add(tp);

    // ── Hinge bar ──
    const hingeGeo = new THREE.CylinderGeometry(0.06, 0.06, 3, 12);
    const hinge    = new THREE.Mesh(hingeGeo, matOrange);
    hinge.rotation.z = Math.PI / 2;
    hinge.position.set(0, 0.1, -1.0);

    // ── Lid / screen back ──
    const lid = this.createBox(3.2, 0.1, 2.05, mat, 0, 0, 0);

    // Screen bezel
    const bezel = this.createBox(2.9, 0.05, 1.85, matKbd, 0, 0, 0.03);
    lid.add(bezel);

    // Screen glass
    const screen = this.createBox(2.6, 0.01, 1.55, matGlass, 0, 0.03, 0.08);
    lid.add(screen);

    // Logo "K}" on lid back
    const logoBack = this.createBox(0.4, 0.02, 0.4, matOrange, 0, -0.06, -0.1);
    lid.add(logoBack);

    // Camera dot
    const camDot = this.createBox(0.06, 0.015, 0.06, matOrange, 0, 0.039, -0.88);
    lid.add(camDot);

    // ── Group & position ──
    this.laptopGroup = new THREE.Group();
    this.lidPivot    = new THREE.Group();

    // Lid pivot at hinge y
    this.lidPivot.position.set(0, 0.1, -1.0);

    // Offset lid so it pivots from hinge
    lid.position.set(0, 0.02, 1.0);
    this.lidPivot.add(lid);

    this.laptopGroup.add(base);
    this.laptopGroup.add(hinge);
    this.laptopGroup.add(this.lidPivot);

    // Initial lid angle (~100 deg open)
    this.lidPivot.rotation.x = -1.75;

    this.scene.add(this.laptopGroup);
    this.laptopGroup.position.set(0, -0.5, 0);
    this.laptopGroup.rotation.y = Math.PI * 0.08;

    // ── Floating parts (circuit-like pieces that scatter) ──
    this.floatingParts = [];
    const partCount = 14;
    const partMats  = [matOrange, mat, this.makeMat(0x222222), matScreen];

    for (let i = 0; i < partCount; i++) {
      const w    = Math.random() * 0.25 + 0.05;
      const h    = Math.random() * 0.05 + 0.02;
      const d    = Math.random() * 0.25 + 0.05;
      const pmat = partMats[i % partMats.length];
      const mesh = this.createBox(w, h, d, pmat);
      // Resting position — inside the laptop volume
      mesh.position.set(
        (Math.random() - 0.5) * 2.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 1.5
      );
      mesh.userData.restPos = mesh.position.clone();
      mesh.userData.explodePos = new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        Math.random() * 5 + 1,
        (Math.random() - 0.5) * 8
      );
      mesh.userData.rotSpeed = new THREE.Vector3(
        (Math.random() - 0.5) * 0.05,
        (Math.random() - 0.5) * 0.05,
        (Math.random() - 0.5) * 0.05
      );
      this.laptopGroup.add(mesh);
      this.floatingParts.push(mesh);
    }
  }

  bindEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      this.mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener('scroll', () => {
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      this.scroll = window.scrollY / Math.max(maxScroll, 1);
    });

    window.addEventListener('resize', () => {
      this.width  = this.container.clientWidth;
      this.height = this.container.clientHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    });
  }

  lerp(a, b, t) { return a + (b - a) * t; }

  animate() {
    const scrollFactor = Math.min(this.scroll * 3, 1); // 0..1 over first 33% scroll

    // Rotate laptop group with mouse
    this.laptopGroup.rotation.y = this.lerp(
      this.laptopGroup.rotation.y,
      Math.PI * 0.08 + this.mouse.x * 0.25,
      0.04
    );
    this.laptopGroup.rotation.x = this.lerp(
      this.laptopGroup.rotation.x,
      this.mouse.y * 0.15,
      0.04
    );

    // Lid opens/closes with scroll
    const targetLidAngle = this.lerp(-1.75, -0.05, scrollFactor);
    this.lidPivot.rotation.x = this.lerp(
      this.lidPivot.rotation.x,
      targetLidAngle,
      0.05
    );

    // Pulse orange light
    this.orangeLight.intensity = 2 + Math.sin(Date.now() * 0.002) * 0.5;

    // Explode parts on scroll
    for (const p of this.floatingParts) {
      const target = p.userData.restPos.clone().lerp(p.userData.explodePos, scrollFactor);
      p.position.lerp(target, 0.04);

      // Spin while exploding
      p.rotation.x += p.userData.rotSpeed.x * (1 + scrollFactor * 4);
      p.rotation.y += p.userData.rotSpeed.y * (1 + scrollFactor * 4);
      p.rotation.z += p.userData.rotSpeed.z * (1 + scrollFactor * 4);
    }

    // Gentle float
    this.laptopGroup.position.y = -0.5 + Math.sin(Date.now() * 0.001) * 0.08;

    this.renderer.render(this.scene, this.camera);
    this.animId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}

window.LaptopScene = LaptopScene;
