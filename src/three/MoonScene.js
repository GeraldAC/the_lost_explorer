
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MOON_MISSIONS } from "../data/moonMissions.js";

const MOON_RADIUS = 2.3;

// Se asume que la textura es equirectangular,
// con longitud 0° en su centro horizontal.
// Ajustar después de verificar moon.jpg.
const TEXTURE_LONGITUDE_OFFSET = 0;

export class MoonScene {
  constructor(container, { onMissionSelect } = {}) {
    if (!container) {
      throw new Error("No se encontró el contenedor lunar.");
    }

    this.container = container;
    this.onMissionSelect = onMissionSelect;
    this.disposed = false;
    this.animationId = null;
    this.cameraTransition = null;
    this.selectedMission = null;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x02050e);

    this.camera = new THREE.PerspectiveCamera(
      45, 1, 0.1, 1000
    );
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
    this.renderer.setClearColor(0x02050e, 1);

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
    this.markers = [];

    this.reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    this.createLights();
    this.createMoon();
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

      if (distance <= 6) {
        this.selectMarker(event);
      }
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

  createLights() {
    this.scene.add(
      new THREE.AmbientLight(0xffffff, 0.15)
    );

    const sunlight = new THREE.DirectionalLight(
      0xffffff, 3
    );

    sunlight.position.set(5, 3, 5);
    this.scene.add(sunlight);
  }

  createMoon() {
    const geometry = new THREE.SphereGeometry(
      MOON_RADIUS, 128, 96
    );

    const texture = this.textureLoader.load(
      "/textures/planets/moon.jpg",
      undefined,
      undefined,
      (error) => {
        console.error(
          "Error cargando textura lunar:", error
        );
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

    this.moonGroup = new THREE.Group();

    this.moon = new THREE.Mesh(geometry, material);
    this.moonGroup.add(this.moon);

    // La textura se supone centrada en longitud 0°.
    // En Three.js, ese meridiano está en el eje +X.
    // Esta rotación lo orienta hacia la cámara (+Z).
    this.moonGroup.rotation.y =
      -Math.PI / 2 +
      THREE.MathUtils.degToRad(TEXTURE_LONGITUDE_OFFSET);

    this.scene.add(this.moonGroup);
  }

  createStars() {
    const count = 2000;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const radius = 100 + Math.random() * 250;
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

    const material = new THREE.PointsMaterial({
      color: 0xc8dcff,
      size: 1.3,
      sizeAttenuation: false
    });

    this.stars = new THREE.Points(geometry, material);
    this.scene.add(this.stars);
  }

  // Coordenadas planetocéntricas:
  // latitud positiva al norte,
  // longitud positiva al este.
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
    const markerGeometry = new THREE.SphereGeometry(
      0.085, 16, 12
    );

    for (const mission of MOON_MISSIONS) {
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: 0x57d9ff,
        depthTest: true
      });

      const marker = new THREE.Mesh(
        markerGeometry,
        markerMaterial
      );

      marker.position.copy(
        this.latLonToVector(
          mission.latitude,
          mission.longitude,
          MOON_RADIUS + 0.065
        )
      );

      marker.userData.missionId = mission.id;

      // Anillo para facilitar la identificación.
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

      this.moonGroup.add(marker);
      this.moonGroup.add(ring);

      this.markers.push({
        mission,
        marker,
        ring
      });
    }
  }

  selectMarker(event) {
    if (this.cameraTransition) return;

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

    const hits = this.raycaster.intersectObjects(
      [
        this.moon,
        ...this.markers.map(item => item.marker)
      ],
      false
    );

    if (!hits.length) return;

    // Si la Luna está delante del marcador,
    // no permitimos seleccionar a través de ella.
    const hit = hits[0].object;
    if (hit === this.moon) return;

    const mission = MOON_MISSIONS.find(
      item => item.id === hit.userData.missionId
    );

    if (mission) {
      this.selectMission(mission.id);
    }
  }

  selectMission(missionId) {
    const mission = MOON_MISSIONS.find(
      item => item.id === missionId
    );

    if (!mission || this.disposed) return;

    this.selectedMission = mission;

    for (const item of this.markers) {
      item.marker.material.color.setHex(
        item.mission.id === missionId
          ? 0xffcf69
          : 0x57d9ff
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
      .applyQuaternion(this.moonGroup.quaternion)
      .normalize();

    // Mantiene visible el globo completo
    // y centra el lugar de aterrizaje.
    const destination = worldDirection.multiplyScalar(6.2);

    this.moveCameraTo(
      destination,
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

    const offset = this.camera.position
      .clone()
      .sub(this.controls.target);

    const distance = THREE.MathUtils.clamp(
      offset.length() * factor,
      this.controls.minDistance,
      this.controls.maxDistance
    );

    offset.setLength(distance);

    this.camera.position.copy(
      this.controls.target.clone().add(offset)
    );

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

    this.animationId = requestAnimationFrame(
      () => this.animate()
    );

    const delta = Math.min(
      this.clock.getDelta(), 0.05
    );

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

    window.removeEventListener(
      "resize", this.handleResize
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

    const geometries = new Set();
    const materials = new Set();
    const textures = new Set();

    this.scene.traverse((object) => {
      if (object.geometry) {
        geometries.add(object.geometry);
      }

      const objectMaterials = object.material
        ? Array.isArray(object.material)
          ? object.material
          : [object.material]
        : [];

      for (const material of objectMaterials) {
        materials.add(material);

        for (const value of Object.values(material)) {
          if (value?.isTexture) {
            textures.add(value);
          }
        }
      }
    });

    geometries.forEach(g => g.dispose());
    materials.forEach(m => m.dispose());
    textures.forEach(t => t.dispose());

    this.renderer.dispose();
    canvas.remove();
  }
}
