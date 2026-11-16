
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class NovaController {
  constructor(scene) {
    this.scene = scene;
    this.model = null;
    this.mixer = null;
    this.actions = new Map();
    this.currentAction = null;
    this.clock = new THREE.Clock();
  }

  async load(path = '/models/nova/nova.glb') {
    const loader = new GLTFLoader();

    const gltf = await loader.loadAsync(path);

    this.model = gltf.scene;
    this.scene.add(this.model);

    this.model.traverse((object) => {
      if (object.isMesh) {
        object.frustumCulled = false;
      }
    });

    this.mixer = new THREE.AnimationMixer(this.model);

    for (const clip of gltf.animations) {
      const action = this.mixer.clipAction(clip);
      this.actions.set(clip.name, action);
    }

    console.log('NOVA cargado correctamente');
    console.log('Animaciones:', [...this.actions.keys()]);

    this.play('Idle', 0);

    return this.model;
  }

  play(name, fadeDuration = 0.25) {
    const nextAction = this.actions.get(name);

    if (!nextAction) {
      console.warn(`Animación no encontrada: ${name}`);
      return false;
    }

    if (this.currentAction === nextAction) {
      return true;
    }

    const previousAction = this.currentAction;

    nextAction.reset();
    nextAction.setLoop(THREE.LoopRepeat);
    nextAction.enabled = true;
    nextAction.play();

    if (previousAction && fadeDuration > 0) {
      nextAction.crossFadeFrom(previousAction, fadeDuration, false);
    } else {
      if (previousAction) previousAction.stop();
      nextAction.setEffectiveWeight(1);
    }

    this.currentAction = nextAction;

    return true;
  }

  update(delta) {
    if (this.mixer) {
      this.mixer.update(delta);
    }
  }

  getAnimationNames() {
    return [...this.actions.keys()];
  }

  dispose() {
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer.uncacheRoot(this.model);
    }

    if (this.model) {
      this.scene.remove(this.model);
    }

    this.actions.clear();
    this.currentAction = null;
    this.model = null;
    this.mixer = null;
  }
}
