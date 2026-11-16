
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { NovaController } from './three/NovaController.js';

const container = document.getElementById('nova-viewer');
const status = document.getElementById('status');
const buttons = document.getElementById('animation-buttons');

// ESCENA
const scene = new THREE.Scene();
scene.background = new THREE.Color('#050b19');

// CÁMARA
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);

camera.position.set(0, 1, 5);

// RENDERER
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

container.appendChild(renderer.domElement);

// ILUMINACIÓN
const ambientLight = new THREE.AmbientLight(
  0xffffff,
  2
);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(
  0xffffff,
  3
);

directionalLight.position.set(3, 5, 5);
scene.add(directionalLight);

// CONTROLES
const controls = new OrbitControls(
  camera,
  renderer.domElement
);

controls.enableDamping = true;
controls.enablePan = false;

// NOVA
const nova = new NovaController(scene);

// Ajustar la cámara al tamaño real del modelo
function fitCameraToModel(model) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  const maxSize = Math.max(
    size.x,
    size.y,
    size.z,
    0.01
  );

  const fov = THREE.MathUtils.degToRad(camera.fov);

  const distance =
    (maxSize / (2 * Math.tan(fov / 2))) * 1.8;

  const direction = new THREE.Vector3(0, 0.2, 1)
    .normalize();

  camera.position.copy(center).addScaledVector(
    direction,
    distance
  );

  camera.near = Math.max(0.001, distance / 100);
  camera.far = Math.max(100, distance * 100);
  camera.updateProjectionMatrix();

  controls.target.copy(center);
  controls.update();
}

// Crear controles para probar las animaciones
function createAnimationButtons() {
  const container = document.getElementById(
    'animation-buttons'
  );

  const names = nova.getAnimationNames();

  names.forEach((name) => {
    const button = document.createElement('button');

    button.textContent = name;

    button.addEventListener('click', () => {
      nova.play(name);

      document.querySelectorAll(
        '#animation-buttons button'
      ).forEach((btn) => {
        btn.classList.remove('active');
      });

      button.classList.add('active');

      status.textContent = `Animación: ${name}`;
    });

    container.appendChild(button);
  });
}

// CARGAR MODELO
async function init() {
  try {
    const model = await nova.load(
      '/models/nova/nova.glb'
    );

    fitCameraToModel(model);
    createAnimationButtons();

    status.textContent =
      `NOVA listo — ${nova.getAnimationNames().length} animaciones`;

    const idleButton = [...document.querySelectorAll(
      '#animation-buttons button'
    )].find((button) => button.textContent === 'Idle');

    if (idleButton) {
      idleButton.classList.add('active');
    }
  } catch (error) {
    console.error('Error cargando NOVA:', error);

    status.textContent =
      'Error: verifica la ruta del archivo nova.glb';
  }
}

// ANIMACIÓN
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);

  nova.update(delta);
  controls.update();

  renderer.render(scene, camera);
}

animate();
init();

// RESPONSIVE
window.addEventListener('resize', () => {
  camera.aspect =
    window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );
});
