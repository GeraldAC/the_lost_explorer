
import * as THREE from "three";
import { NovaController } from "../three/NovaController.js";

export class NovaGuide {
  constructor(container, { onClose } = {}) {
    this.container = container;
    this.onClose = onClose;

    this.disposed = false;
    this.visible = true;
    this.animationId = null;
    this.actionTimer = null;

    this.clock = new THREE.Clock();

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      45,
      1,
      0.1,
      100
    );

    this.camera.position.set(0, 0.2, 4.2);
    this.camera.lookAt(0, 0.8, 0);

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });

    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 2)
    );

    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;

    this.renderer.domElement.setAttribute(
      "aria-hidden",
      "true"
    );

    container.appendChild(this.renderer.domElement);

    this.scene.add(
      new THREE.HemisphereLight(
        0xb8e7ff,
        0x253354,
        2.5
      )
    );

    const keyLight = new THREE.DirectionalLight(
      0xffffff,
      3
    );

    keyLight.position.set(3, 5, 5);
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(
      0x46bfff,
      2
    );

    rimLight.position.set(-3, 2, -4);
    this.scene.add(rimLight);

    this.nova = new NovaController(this.scene);

    this.handleResize = () => this.resize();

    this.resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(this.handleResize)
        : null;

    this.resizeObserver?.observe(container);

    window.addEventListener(
      "resize",
      this.handleResize
    );

    this.resize();
    this.animate();

    this.ready = this.loadNova();
  }

  async loadNova() {
    try {
      const model = await this.nova.load(
        "/models/nova/nova.glb"
      );

      if (this.disposed) {
        this.nova.dispose();
        return;
      }

      // Centramos y escalamos el modelo
      // independientemente de sus dimensiones.
      const bounds = new THREE.Box3().setFromObject(
        model
      );

      const size = bounds.getSize(
        new THREE.Vector3()
      );

      const center = bounds.getCenter(
        new THREE.Vector3()
      );

      const maxDimension = Math.max(
        size.x,
        size.y,
        size.z,
        0.001
      );

      const scale = 2.35 / maxDimension;

      model.scale.multiplyScalar(scale);

      // Volvemos a calcular después de escalar.
      const scaledBounds = new THREE.Box3()
        .setFromObject(model);

      const scaledCenter = scaledBounds.getCenter(
        new THREE.Vector3()
      );

      model.position.x -= scaledCenter.x;
      model.position.y -= scaledCenter.y;
      model.position.z -= scaledCenter.z;

      this.camera.lookAt(0, 0, 0);

      this.playAction("Wave", 1900);

      return model;
    } catch (error) {
      if (!this.disposed) {
        console.error(
          "No se pudo cargar NOVA:",
          error
        );
      }
    }
  }

  playAction(name, duration = 0) {
    if (this.disposed || !this.nova.model) {
      return;
    }

    clearTimeout(this.actionTimer);
    this.actionTimer = null;

    this.nova.play(name);

    if (duration > 0) {
      this.actionTimer = setTimeout(() => {
        if (!this.disposed) {
          this.nova.play("Idle");
        }
      }, duration);
    }
  }

  say(text, animation = "Talk", duration = 2600) {
    if (this.disposed) return;

    const message = document.getElementById(
      "nova-message"
    );

    if (message) {
      message.textContent = text;
    }

    this.playAction(animation, duration);
  }

  setVisible(visible) {
    this.visible = visible;

    const wrapper = document.getElementById(
      "nova-guide"
    );

    if (wrapper) {
      wrapper.hidden = !visible;
    }
  }

  resize() {
    if (this.disposed) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    if (!width || !height) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(
      width,
      height,
      false
    );
  }

  animate() {
    if (this.disposed) return;

    this.animationId = requestAnimationFrame(
      () => this.animate()
    );

    const delta = Math.min(
      this.clock.getDelta(),
      0.05
    );

    this.nova.update(delta);

    if (this.visible) {
      this.renderer.render(
        this.scene,
        this.camera
      );
    }
  }

  dispose() {
    if (this.disposed) return;

    this.disposed = true;

    clearTimeout(this.actionTimer);
    cancelAnimationFrame(this.animationId);

    this.resizeObserver?.disconnect();

    window.removeEventListener(
      "resize",
      this.handleResize
    );

    // Conservamos la limpieza de animaciones
    // que ya implementa NovaController.
    this.nova.dispose();

    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
