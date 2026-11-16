
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { PLANETS } from "../data/planets.js";

export class SolarSystem {
  constructor(container, { onSelect, onViewChange } = {}) {
    this.container = container;
    this.onSelect = onSelect;
    this.onViewChange = onViewChange;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x02040c);

    this.camera = new THREE.PerspectiveCamera(
      50, 1, 0.1, 2000
    );
    this.camera.position.set(0, 65, 105);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance"
    });
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 2)
    );
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 0.55;
    this.controls.maxDistance = 220;
    this.controls.enablePan = false;

    this.clock = new THREE.Clock();
    this.textureLoader = new THREE.TextureLoader();
    this.planets = [];
    this.selectableMeshes = [];
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.view = "overview";
    this.focusedPlanet = null;
    this.cameraTransition = null;
    this.disposed = false;
    this.animationId = null;
    this.pointerDown = null;

    this.overviewPosition = new THREE.Vector3(0, 65, 105);
    this.overviewTarget = new THREE.Vector3(0, 0, 0);

    this.reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    this.moonDistance = 2.5;
    this.moonAngle = 0.7;
    this.moonSpeed = 0.13;

    this.createLights();
    this.createSun();
    this.createStars();
    this.createPlanets();
    this.createMoon();

    this.handleResize = () => this.resize();
    this.handlePointerDown = (event) => {
      this.pointerDown = {
        x: event.clientX,
        y: event.clientY
      };
    };
    this.handlePointerUp = (event) => {
      if (!this.pointerDown) return;

      const distance = Math.hypot(
        event.clientX - this.pointerDown.x,
        event.clientY - this.pointerDown.y
      );
      this.pointerDown = null;

      if (distance <= 5) this.selectObject(event);
    };
    this.handlePointerCancel = () => {
      this.pointerDown = null;
    };

    window.addEventListener("resize", this.handleResize);

    const canvas = this.renderer.domElement;
    canvas.addEventListener(
      "pointerdown", this.handlePointerDown
    );
    canvas.addEventListener(
      "pointerup", this.handlePointerUp
    );
    canvas.addEventListener(
      "pointercancel", this.handlePointerCancel
    );

    this.resize();
    this.animate();
  }

  loadColorTexture(path) {
    if (!path) return null;

    const texture = this.textureLoader.load(
      path,
      undefined,
      undefined,
      (error) => {
        console.error(`Error cargando ${path}`, error);
      }
    );

    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(
      8,
      this.renderer.capabilities.getMaxAnisotropy()
    );

    return texture;
  }

  createLights() {
    this.scene.add(
      new THREE.AmbientLight(0xffffff, 0.18)
    );

    const sunlight = new THREE.PointLight(
      0xffffff, 1800, 0, 2
    );
    sunlight.position.set(0, 0, 0);
    this.scene.add(sunlight);
  }

  createSun() {
    const geometry = new THREE.SphereGeometry(
      4.5, 64, 48
    );
    const material = new THREE.MeshBasicMaterial({
      map: this.loadColorTexture(
        "/textures/planets/sun.jpg"
      ),
      color: 0xffffff
    });

    this.sun = new THREE.Mesh(geometry, material);
    this.scene.add(this.sun);

    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gradient = ctx.createRadialGradient(
      64, 64, 8, 64, 64, 64
    );
    gradient.addColorStop(0, "rgba(255,210,100,0.65)");
    gradient.addColorStop(0.35, "rgba(255,145,35,0.28)");
    gradient.addColorStop(1, "rgba(255,100,20,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);

    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(canvas),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );

    glow.scale.set(22, 22, 1);
    this.sun.add(glow);
  }

  createStars() {
    const count = 3500;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const radius = 250 + Math.random() * 600;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] =
        radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] =
        radius * Math.cos(phi);
      positions[i * 3 + 2] =
        radius * Math.sin(phi) * Math.sin(theta);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    this.scene.add(
      new THREE.Points(
        geometry,
        new THREE.PointsMaterial({
          color: 0xcbdfff,
          size: 1.2,
          sizeAttenuation: false
        })
      )
    );
  }

  createOrbit(radius, parent = this.scene, opacity = 0.4) {
    const points = [];

    for (let i = 0; i < 256; i++) {
      const angle = (i / 256) * Math.PI * 2;
      points.push(
        new THREE.Vector3(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        )
      );
    }

    const orbit = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({
        color: 0x52718d,
        transparent: true,
        opacity,
        depthWrite: false
      })
    );

    parent.add(orbit);
    return orbit;
  }

  createPlanets() {
    const axialTilts = {
      mercury: 0.03,
      venus: 177.4,
      earth: 23.44,
      mars: 25.19,
      jupiter: 3.13,
      saturn: 26.73,
      uranus: 97.77,
      neptune: 28.32
    };

    PLANETS.forEach((data, index) => {
      const texture = this.loadColorTexture(data.texture);

      const planet = new THREE.Mesh(
        new THREE.SphereGeometry(data.radius, 64, 48),
        new THREE.MeshStandardMaterial({
          map: texture,
          color: texture ? 0xffffff : data.color,
          roughness: 0.9,
          metalness: 0
        })
      );

      planet.name = data.name;
      planet.userData = {
        planetId: data.id,
        name: data.name,
        destination: data.destination || null
      };

      const axialGroup = new THREE.Group();
      axialGroup.rotation.z = THREE.MathUtils.degToRad(
        axialTilts[data.id] ?? 0
      );
      axialGroup.add(planet);

      // Este grupo controla el movimiento alrededor
      // del Sol y NO hereda la inclinación axial.
      const orbitalGroup = new THREE.Group();
      orbitalGroup.add(axialGroup);

      const angle = index * 2.39996;
      orbitalGroup.position.set(
        Math.cos(angle) * data.distance,
        0,
        Math.sin(angle) * data.distance
      );

      this.scene.add(orbitalGroup);
      this.createOrbit(data.distance);

      if (data.rings) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(
            data.radius * 1.35,
            data.radius * 2.2,
            128
          ),
          new THREE.MeshBasicMaterial({
            color: 0xb6a181,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.65,
            depthWrite: false
          })
        );

        ring.rotation.x = -Math.PI / 2;
        axialGroup.add(ring);
      }

      const item = {
        mesh: planet,
        group: orbitalGroup,
        data,
        angle
      };

      this.planets.push(item);
      this.selectableMeshes.push(planet);

      if (data.id === "earth") {
        this.earth = item;
      }
    });
  }

  createMoon() {
    if (!this.earth) return;

    // La Luna comparte la traslación solar
    // de la Tierra, pero no su rotación axial.
    this.moonSystem = new THREE.Group();
    this.earth.group.add(this.moonSystem);

    const moonRadius = 0.23;

    this.moon = new THREE.Mesh(
      new THREE.SphereGeometry(moonRadius, 64, 48),
      new THREE.MeshStandardMaterial({
        map: this.loadColorTexture(
          "/textures/planets/moon.jpg"
        ),
        color: 0xffffff,
        roughness: 1,
        metalness: 0
      })
    );

    this.moon.name = "Luna";
    this.moon.userData = {
      planetId: "moon",
      name: "Luna",
      destination: "moon"
    };

    this.moonSystem.add(this.moon);

    this.moonOrbit = this.createOrbit(
      this.moonDistance,
      this.moonSystem,
      0.55
    );

    this.updateMoonPosition();

    this.selectableMeshes.push(this.moon);
  }

  updateMoonPosition() {
    if (!this.moon) return;

    this.moon.position.set(
      Math.cos(this.moonAngle) * this.moonDistance,
      0,
      Math.sin(this.moonAngle) * this.moonDistance
    );

    // Rotación sincronizada de manera ilustrativa.
    this.moon.rotation.y = -this.moonAngle;
  }

  // ==========================================
  // SELECCIÓN
  // ==========================================

  selectObject(event) {
    if (this.cameraTransition) return;
    if (this.view === "moon") return;

    const rect = this.renderer.domElement
      .getBoundingClientRect();

    this.pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    this.raycaster.setFromCamera(
      this.pointer,
      this.camera
    );

    const allowedMeshes =
      this.view === "earth"
        ? [this.earth.mesh, this.moon]
        : this.selectableMeshes;

    const hits = this.raycaster.intersectObjects(
      allowedMeshes,
      false
    );

    if (!hits.length) return;

    const selected = hits[0].object;

    if (selected === this.moon) {
      this.focusMoon();
    } else if (this.view === "overview") {
      this.focusPlanet(selected.userData.planetId);
    }

    this.onSelect?.(selected.userData);
  }

  // ==========================================
  // CÁMARA CINEMATOGRÁFICA
  // ==========================================

  
moveCameraTo(
  position,
  target,
  duration = 2200,
  onComplete = null
) {
  if (this.reducedMotion) {
    this.camera.position.copy(position);
    this.controls.target.copy(target);
    this.cameraTransition = null;
    this.controls.enabled = true;
    this.controls.update();

    onComplete?.();
    return;
  }

  this.controls.enabled = false;

  this.cameraTransition = {
    startPosition: this.camera.position.clone(),
    startTarget: this.controls.target.clone(),
    endPosition: position.clone(),
    endTarget: target.clone(),
    elapsed: 0,
    duration: duration / 1000,
    onComplete
  };
  }


  focusPlanet(planetId) {
    const selected = this.planets.find(
      (item) => item.data.id === planetId
    );

    if (!selected) return false;

    this.focusedPlanet = selected;
    this.view = planetId === "earth"
      ? "earth"
      : "planet";

    const target = selected.group.position.clone();

    const distance = planetId === "earth"
      ? 7.5
      : Math.max(selected.data.radius * 5, 4.5);

    const direction = new THREE.Vector3(
      0.6, 0.28, 1
    ).normalize();

    const position = target.clone().addScaledVector(
      direction,
      distance
    );

    this.moveCameraTo(position, target, 2300);
    this.onViewChange?.(this.view);
    return true;
  }

  focusMoon() {
    if (!this.moon) return;

    this.view = "moon";
    this.focusedPlanet = this.earth;

    const target = new THREE.Vector3();
    this.moon.getWorldPosition(target);

    const direction = new THREE.Vector3(
      0.6, 0.25, 1
    ).normalize();

    const position = target.clone().addScaledVector(
      direction,
      1.35
    );

    this.moveCameraTo(position, target, 1900);
    this.onViewChange?.("moon");
  }


  flyToMoon(duration = 2600) {
    if (!this.moon || this.disposed) {
      return Promise.resolve(false);
    }

    if (this.cameraTransition) {
      return Promise.resolve(false);
    }

    this.view = "moon";
    this.focusedPlanet = this.earth;

    // Posición real de la Luna dentro de la
    // representación actual del Sistema Solar.
    const target = new THREE.Vector3();
    this.moon.getWorldPosition(target);

    // La cámara avanza hacia la superficie lunar.
    // Radio lunar actual: 0.23 unidades.
    const direction = this.camera.position
      .clone()
      .sub(target)
      .normalize();

    if (direction.lengthSq() < 0.001) {
      direction.set(0, 0, 1);
    }

    const destination = target.clone()
      .addScaledVector(direction, 0.53);

    return new Promise((resolve) => {
      this.moveCameraTo(
        destination,
        target,
        duration,
        () => resolve(true)
      );
    });
  }


  returnToEarth() {
    if (!this.earth) return;

    this.view = "earth";
    this.focusedPlanet = this.earth;

    const target = this.earth.group.position.clone();

    const direction = new THREE.Vector3(
      0.6, 0.28, 1
    ).normalize();

    const position = target.clone().addScaledVector(
      direction,
      7.5
    );

    this.moveCameraTo(position, target, 1700);
    this.onViewChange?.("earth");
  }

  returnToOverview() {
    this.view = "overview";
    this.focusedPlanet = null;

    this.moveCameraTo(
      this.overviewPosition,
      this.overviewTarget,
      1800
    );

    this.onViewChange?.("overview");
  }

  // ==========================================
  // RESPONSIVE
  // ==========================================

  resize() {
    if (this.disposed) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    if (!width || !height) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  // ==========================================
  // ANIMACIÓN
  // ==========================================

  animate() {
    if (this.disposed) return;

    this.animationId = requestAnimationFrame(
      () => this.animate()
    );

    const delta = Math.min(
      this.clock.getDelta(),
      0.05
    );

    this.sun.rotation.y += delta * 0.025;

    // Pausamos las órbitas al acercarnos
    // para mantener el destino enfocado.
    const orbiting = this.view === "overview";

    for (const item of this.planets) {
      if (orbiting) {
        item.angle += item.data.speed * delta * 0.12;

        item.group.position.x =
          Math.cos(item.angle) * item.data.distance;

        item.group.position.z =
          Math.sin(item.angle) * item.data.distance;
      }

      item.mesh.rotation.y += delta * 0.08;
    }

    if (this.moon) {
      if (orbiting) {
        this.moonAngle += delta * this.moonSpeed;
        this.updateMoonPosition();
      }
    }

    if (this.cameraTransition) {
      const transition = this.cameraTransition;

      transition.elapsed += delta;

      const t = Math.min(
        transition.elapsed / transition.duration,
        1
      );

      const eased = t * t * (3 - 2 * t);

      this.camera.position.lerpVectors(
        transition.startPosition,
        transition.endPosition,
        eased
      );

      this.controls.target.lerpVectors(
        transition.startTarget,
        transition.endTarget,
        eased
      );

      if (t >= 1) {
      this.cameraTransition = null;
      this.controls.enabled = true;

      transition.onComplete?.();
    }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  // ==========================================
  // LIMPIEZA
  // ==========================================

  dispose() {
    if (this.disposed) return;

    this.disposed = true;
    cancelAnimationFrame(this.animationId);

    window.removeEventListener(
      "resize",
      this.handleResize
    );

    const canvas = this.renderer.domElement;
    canvas.removeEventListener(
      "pointerdown", this.handlePointerDown
    );
    canvas.removeEventListener(
      "pointerup", this.handlePointerUp
    );
    canvas.removeEventListener(
      "pointercancel", this.handlePointerCancel
    );

    this.controls.dispose();

    const textures = new Set();
    const materials = new Set();
    const geometries = new Set();

    this.scene.traverse((object) => {
      if (object.geometry) geometries.add(object.geometry);

      const objectMaterials = object.material
        ? Array.isArray(object.material)
          ? object.material
          : [object.material]
        : [];

      for (const material of objectMaterials) {
        materials.add(material);

        for (const value of Object.values(material)) {
          if (value?.isTexture) textures.add(value);
        }
      }
    });

    textures.forEach((texture) => texture.dispose());
    materials.forEach((material) => material.dispose());
    geometries.forEach((geometry) => geometry.dispose());

    this.renderer.dispose();
    canvas.remove();
  }
}
