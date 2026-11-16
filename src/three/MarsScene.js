import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MARS_MISSIONS } from "../data/marsMissions.js";

const MARS_RADIUS = 2.3;

export class MarsScene {
  constructor(container, { onMissionSelect } = {}) {
    if (!container) {
      throw new Error("No se encontró el contenedor marciano.");
    }

    this.container = container;
    this.onMissionSelect = onMissionSelect;
    this.disposed = false;
    this.animationId = null;
    this.cameraTransition = null;
    this.selectedMission = null;
    this.markers = [];

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x08030a);

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    this.camera.position.set(0, 0.4, 7.5);

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
    this.renderer.setClearColor(0x08030a, 1);
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.enablePan = false;
    this.controls.enableZoom = true;
    this.controls.minDistance = 3.2;
    this.controls.maxDistance = 16;
    this.controls.minPolarAngle = 0.05;
    this.controls.maxPolarAngle = Math.PI - 0.05;

    this.clock = new THREE.Clock();
    this.textureLoader = new THREE.TextureLoader();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.pointerDown = null;
    this.reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    this.createLights();
    this.createMars();
    this.createStars();
    this.createMissionMarkers();

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

      if (distance <= 6) this.selectMarker(event);
    };
    this.handlePointerCancel = () => {
      this.pointerDown = null;
    };

    this.resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(this.handleResize)
        : null;
    this.resizeObserver?.observe(container);
    window.addEventListener("resize", this.handleResize);

    const canvas = this.renderer.domElement;
    canvas.addEventListener("pointerdown", this.handlePointerDown);
    canvas.addEventListener("pointerup", this.handlePointerUp);
    canvas.addEventListener("pointercancel", this.handlePointerCancel);

    this.resize();
    this.animate();
  }

  createLights() {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.15));

    const sunlight = new THREE.DirectionalLight(0xffffff, 3);
    sunlight.position.set(5, 3, 5);
    this.scene.add(sunlight);
  }

  createMars() {
    const geometry = new THREE.SphereGeometry(MARS_RADIUS, 128, 96);
    const texture = this.textureLoader.load(
      "/textures/planets/mars.jpg",
      undefined,
      undefined,
      (error) => {
        console.error("Error cargando textura de Marte:", error);
      }
    );
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(
      8,
      this.renderer.capabilities.getMaxAnisotropy()
    );

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 1,
      metalness: 0
    });

    this.marsGroup = new THREE.Group();
    this.mars = new THREE.Mesh(geometry, material);
    this.marsGroup.add(this.mars);
    this.marsGroup.rotation.y = -Math.PI / 2;
    this.scene.add(this.marsGroup);
  }

  createStars() {
    const count = 2000;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const radius = 100 + Math.random() * 250;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi);
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    const material = new THREE.PointsMaterial({
      color: 0xffd5bd,
      size: 1.3,
      sizeAttenuation: false
    });
    this.stars = new THREE.Points(geometry, material);
    this.scene.add(this.stars);
  }

  latLonToVector(latitude, longitude, radius) {
    const lat = THREE.MathUtils.degToRad(latitude);
    const lon = THREE.MathUtils.degToRad(longitude);
    return new THREE.Vector3(
      radius * Math.cos(lat) * Math.cos(lon),
      radius * Math.sin(lat),
      -radius * Math.cos(lat) * Math.sin(lon)
    );
  }

  createMissionMarkers() {
    const markerGeometry = new THREE.SphereGeometry(0.085, 16, 12);

    for (const mission of MARS_MISSIONS) {
      const marker = new THREE.Mesh(
        markerGeometry,
        new THREE.MeshBasicMaterial({
          color: 0xffa45b,
          depthTest: true
        })
      );
      marker.position.copy(
        this.latLonToVector(
          mission.latitude,
          mission.longitude,
          MARS_RADIUS + 0.065
        )
      );
      marker.userData.missionId = mission.id;

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.12, 0.16, 32),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.85,
          side: THREE.DoubleSide,
          depthWrite: false
        })
      );
      ring.position.copy(marker.position);
      ring.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        marker.position.clone().normalize()
      );

      this.marsGroup.add(marker);
      this.marsGroup.add(ring);
      this.markers.push({ mission, marker, ring });
    }
  }

  selectMarker(event) {
    if (this.cameraTransition) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    this.raycaster.setFromCamera(this.pointer, this.camera);

    const hits = this.raycaster.intersectObjects(
      [this.mars, ...this.markers.map(({ marker }) => marker)],
      false
    );
    if (!hits.length || hits[0].object === this.mars) return;

    const missionId = hits[0].object.userData.missionId;
    this.selectMission(missionId);
  }

  selectMission(missionId) {
    const mission = MARS_MISSIONS.find(
      (item) => item.id === missionId
    );
    if (!mission || this.disposed) return;

    this.selectedMission = mission;
    for (const item of this.markers) {
      item.marker.material.color.setHex(
        item.mission.id === missionId ? 0xffe18a : 0xffa45b
      );
    }

    this.focusMission(mission);
    this.onMissionSelect?.(mission);
  }

  focusMission(mission) {
    const localDirection = this.latLonToVector(
      mission.latitude,
      mission.longitude,
      1
    );
    const worldDirection = localDirection
      .clone()
      .applyQuaternion(this.marsGroup.quaternion)
      .normalize();

    this.moveCameraTo(
      worldDirection.multiplyScalar(6.2),
      new THREE.Vector3(0, 0, 0),
      1400
    );
  }

  moveCameraTo(position, target, duration = 1400) {
    if (this.reducedMotion) {
      this.camera.position.copy(position);
      this.controls.target.copy(target);
      this.controls.update();
      return;
    }

    this.controls.enabled = false;
    this.cameraTransition = {
      startPosition: this.camera.position.clone(),
      startTarget: this.controls.target.clone(),
      endPosition: position.clone(),
      endTarget: target.clone(),
      elapsed: 0,
      duration: duration / 1000
    };
  }

  resetCamera() {
    this.moveCameraTo(
      new THREE.Vector3(0, 0.4, 7.5),
      new THREE.Vector3(0, 0, 0),
      900
    );
  }

  zoomIn() {
    this.changeZoom(0.8);
  }

  zoomOut() {
    this.changeZoom(1.25);
  }

  changeZoom(factor) {
    if (this.cameraTransition) return;

    const offset = this.camera.position.clone().sub(this.controls.target);
    const distance = THREE.MathUtils.clamp(
      offset.length() * factor,
      this.controls.minDistance,
      this.controls.maxDistance
    );
    offset.setLength(distance);
    this.camera.position.copy(this.controls.target.clone().add(offset));
    this.controls.update();
  }

  resize() {
    if (this.disposed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (!width || !height) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  animate() {
    if (this.disposed) return;
    this.animationId = requestAnimationFrame(() => this.animate());
    const delta = Math.min(this.clock.getDelta(), 0.05);

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
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.animationId);
    this.resizeObserver?.disconnect();
    window.removeEventListener("resize", this.handleResize);

    const canvas = this.renderer.domElement;
    canvas.removeEventListener("pointerdown", this.handlePointerDown);
    canvas.removeEventListener("pointerup", this.handlePointerUp);
    canvas.removeEventListener("pointercancel", this.handlePointerCancel);
    this.controls.dispose();

    const geometries = new Set();
    const materials = new Set();
    const textures = new Set();
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

    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    textures.forEach((texture) => texture.dispose());
    this.renderer.dispose();
    canvas.remove();
  }
}
