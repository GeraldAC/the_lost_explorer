import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";

export class MarsLandingScene {
  constructor(container, { modelUrl, modelFormat, missionName } = {}) {
    if (!container) {
      throw new Error("No se encontró el contenedor del modelo marciano.");
    }

    this.container = container;
    this.disposed = false;
    this.animationId = null;
    this.scene = new THREE.Scene();
    this.scene.background = null;

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    this.camera.position.set(4.5, 3.3, 5.4);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 2)
    );
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.setClearColor(0x000000, 0);
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.enablePan = false;
    this.controls.minDistance = 2.5;
    this.controls.maxDistance = 12;
    this.controls.target.set(0, 1.1, 0);
    this.controls.update();

    this.scene.add(new THREE.HemisphereLight(0xffe6cf, 0x321c18, 2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3);
    keyLight.position.set(4, 7, 5);
    this.scene.add(keyLight);

    this.status = document.getElementById("mars-landing-status");
    this.handleResize = () => this.resize();
    this.resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(this.handleResize)
        : null;
    this.resizeObserver?.observe(container);
    window.addEventListener("resize", this.handleResize);
    this.resize();

    this.loadModel({ modelUrl, modelFormat, missionName });
    this.animate();
  }

  loadModel({ modelUrl, modelFormat, missionName }) {
    if (!modelUrl || !["gltf", "stl"].includes(modelFormat)) {
      throw new Error(`No hay un modelo 3D válido para ${missionName}.`);
    }

    if (this.status) {
      this.status.textContent = `Cargando el modelo 3D de ${missionName}…`;
    }

    const handleError = (error) => {
      if (this.disposed) return;
      console.error(`Error cargando el modelo de ${missionName}:`, error);
      if (this.status) {
        this.status.textContent =
          `No se pudo cargar el modelo 3D de ${missionName}.`;
      }
    };

    if (modelFormat === "gltf") {
      new GLTFLoader().load(
        modelUrl,
        (gltf) => {
          if (this.disposed) {
            this.disposeObject(gltf.scene);
            return;
          }
          this.addModel(gltf.scene, missionName);
        },
        undefined,
        handleError
      );
      return;
    }

    new STLLoader().load(
      modelUrl,
      (geometry) => {
        if (this.disposed) {
          geometry.dispose();
          return;
        }
        geometry.computeVertexNormals();
        const material = new THREE.MeshStandardMaterial({
          color: 0xcbb89b,
          metalness: 0.42,
          roughness: 0.62
        });
        const rover = new THREE.Mesh(geometry, material);
        this.addModel(rover, missionName);
      },
      undefined,
      handleError
    );
  }

  addModel(model, missionName) {
    const modelGroup = new THREE.Group();
    modelGroup.add(model);
    modelGroup.updateMatrixWorld(true);

    const bounds = new THREE.Box3().setFromObject(modelGroup);
    if (bounds.isEmpty()) {
      this.disposeObject(modelGroup);
      if (this.status) {
        this.status.textContent =
          `El modelo 3D de ${missionName} no contiene geometría visible.`;
      }
      return;
    }

    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const largestDimension = Math.max(size.x, size.y, size.z);
    if (!Number.isFinite(largestDimension) || largestDimension <= 0) {
      this.disposeObject(modelGroup);
      if (this.status) {
        this.status.textContent =
          `No se pudo calcular el tamaño del modelo de ${missionName}.`;
      }
      return;
    }

    const scale = 3.2 / largestDimension;
    modelGroup.scale.setScalar(scale);
    modelGroup.position.set(
      -center.x * scale,
      -bounds.min.y * scale,
      -center.z * scale
    );
    this.scene.add(modelGroup);
    this.controls.target.set(0, size.y * scale * 0.45, 0);
    this.controls.update();

    if (this.status) {
      this.status.textContent =
        `Modelo 3D de ${missionName} cargado. Arrastra para girarlo.`;
    }
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
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  disposeObject(root) {
    const geometries = new Set();
    const materials = new Set();
    const textures = new Set();
    root.traverse((object) => {
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
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.animationId);
    this.resizeObserver?.disconnect();
    window.removeEventListener("resize", this.handleResize);
    this.controls.dispose();
    this.disposeObject(this.scene);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
