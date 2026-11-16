import { MarsScene } from "../three/MarsScene.js";
import { MarsLandingScene } from "../three/MarsLandingScene.js";
import { MARS_MISSIONS } from "../data/marsMissions.js";
import { MARS_STORIES } from "../data/marsStories.js";

export function MarsPage() {
  const missionButtons = MARS_MISSIONS.map(
    (mission) => `
      <button
        class="mars-mission-button"
        type="button"
        data-mission-id="${mission.id}"
      >
        <span class="mars-mission-dot" aria-hidden="true"></span>
        <span>
          <strong>${mission.name}</strong>
          <small>${mission.year} · ${mission.region}</small>
        </span>
      </button>
    `
  ).join("");

  return `
    <main class="mars-page">
      <div
        id="mars-scene-container"
        class="mars-scene-container"
        aria-label="Modelo tridimensional interactivo de Marte"
      ></div>

      <header class="mars-header">
        <div class="mars-brand">
          <span class="mars-brand-icon">✦</span>
          THE LOST EXPLORER
        </div>
        <button id="mars-back" class="mars-back" type="button">
          ← SISTEMA SOLAR
        </button>
      </header>

      <section class="mars-intro">
        <span class="mars-eyebrow">CAPÍTULO III · EL PLANETA ROJO</span>
        <h1>Robots exploradores de Marte</h1>
        <p>
          Nueve robots llegaron al planeta rojo. Gira Marte y selecciona
          un punto luminoso para conocer sus aventuras.
        </p>
      </section>

      <details class="mars-missions">
        <summary>LOS 9 ROBOTS EXPLORADORES</summary>
        <div class="mars-mission-list">${missionButtons}</div>
      </details>

      <section
        id="mars-story"
        class="mars-story"
        aria-label="Historia del robot seleccionado"
        hidden
      >
        <div class="mars-story-top">
          <span class="mars-story-label">DESCUBRIMIENTO MARCIANO</span>
          <button
            id="mars-story-close"
            class="mars-story-close"
            type="button"
            aria-label="Cerrar historia"
          >×</button>
        </div>

        <h2 id="mars-story-title"></h2>
        <p id="mars-story-subtitle" class="mars-story-subtitle"></p>

        <div class="mars-story-progress">
          <span id="mars-story-count"></span>
          <div id="mars-story-progress-bar" class="mars-story-progress-bar"></div>
        </div>

        <h3 id="mars-story-step-title"></h3>

        <button
          id="mars-land-button"
          class="mars-land-button"
          type="button"
          hidden
        >
          🚀 ATERRICEMOS PARA VER EL ROBOT
        </button>

        <div class="mars-story-actions">
          <button id="mars-story-prev" class="mars-story-secondary" type="button">
            ← ANTERIOR
          </button>
          <button id="mars-story-next" class="mars-story-primary" type="button">
            CONTINUAR →
          </button>
        </div>

        <button id="mars-story-repeat" class="mars-story-repeat" type="button">
          <span aria-hidden="true">◉</span>
          ESCUCHAR A NOVA OTRA VEZ
        </button>

        <button
          id="mars-story-facts-toggle"
          class="mars-story-facts-toggle"
          type="button"
          aria-expanded="false"
          aria-controls="mars-story-facts"
        >
          VER DATOS DEL ROBOT
        </button>

        <div id="mars-story-facts" class="mars-story-facts" hidden>
          <p id="mars-story-facts-description"></p>
          <h4>¿Qué dejó esta misión?</h4>
          <ul id="mars-story-facts-objects"></ul>
          <a
            id="mars-story-source"
            href="#"
            target="_blank"
            rel="noopener noreferrer"
          >
            CONSULTAR FUENTE ↗
          </a>
        </div>
      </section>

      <div class="mars-controls">
        <button id="mars-zoom-in" type="button" aria-label="Acercar Marte" title="Acercar">+</button>
        <button id="mars-zoom-out" type="button" aria-label="Alejar Marte" title="Alejar">−</button>
        <button id="mars-reset" type="button" aria-label="Restablecer vista" title="Restablecer vista">↺</button>
      </div>

      <div class="mars-instructions">
        <span>↔ ARRASTRA PARA GIRAR</span>
        <span>◎ SELECCIONA UN PUNTO LUMINOSO O UN ROBOT</span>
      </div>

      <div class="mars-footer">EXPLORACIÓN MARCIANA · 9 ROBOTS</div>

      <section
        id="mars-landing"
        class="mars-landing"
        aria-label="Exploración del robot en la superficie de Marte"
        hidden
      >
        <div
          id="mars-landing-scene"
          class="mars-landing-scene"
          aria-label="Modelo tridimensional del robot marciano"
        ></div>
        <div class="mars-landing-shade" aria-hidden="true"></div>
        <header class="mars-landing-header">
          <div class="mars-brand">
            <span class="mars-brand-icon">✦</span>
            THE LOST EXPLORER
          </div>
          <button
            id="mars-landing-back"
            class="mars-back"
            type="button"
          >
            ← VOLVER AL MAPA DE MARTE
          </button>
        </header>
        <section class="mars-landing-content">
          <div class="mars-eyebrow">ATERRIZAJE COMPLETADO · MARTE</div>
          <div class="mars-landing-location">
            <span id="mars-landing-region"></span>
            <span id="mars-landing-mission"></span>
          </div>
          <h2 id="mars-landing-title"></h2>
          <p
            id="mars-landing-description"
            class="mars-landing-description"
          ></p>
          <p
            id="mars-landing-status"
            class="mars-landing-status"
            role="status"
            aria-live="polite"
          ></p>
          <div class="mars-landing-hint">
            ↔ ARRASTRA PARA GIRAR EL ROBOT · RUEDA PARA ACERCAR
          </div>
        </section>
      </section>
    </main>
  `;
}

export function initMarsPage({ onBack } = {}) {
  const $ = (id) => document.getElementById(id);
  const backButton = $("mars-back");
  const zoomInButton = $("mars-zoom-in");
  const zoomOutButton = $("mars-zoom-out");
  const resetButton = $("mars-reset");
  const storyPanel = $("mars-story");
  const closeButton = $("mars-story-close");
  const prevButton = $("mars-story-prev");
  const nextButton = $("mars-story-next");
  const repeatButton = $("mars-story-repeat");
  const factsToggle = $("mars-story-facts-toggle");
  const factsPanel = $("mars-story-facts");
  const landButton = $("mars-land-button");
  const landingPanel = $("mars-landing");
  const landingBackButton = $("mars-landing-back");
  const missionButtons = [
    ...document.querySelectorAll(".mars-mission-button")
  ];

  let currentStory = null;
  let currentMission = null;
  let marsScene = null;
  let landingScene = null;
  let currentStep = 0;
  let disposed = false;

  function novaSay(text, animation = "Talk") {
    if (disposed) return;
    window.dispatchEvent(
      new CustomEvent("nova:say", {
        detail: { text, animation, duration: 2600 }
      })
    );
  }

  function renderStep() {
    if (!currentStory) return;
    const step = currentStory.steps[currentStep];
    $("mars-story-step-title").textContent = step.title;
    $("mars-story-count").textContent =
      `DESCUBRIMIENTO ${currentStep + 1} DE ${currentStory.steps.length}`;
    $("mars-story-progress-bar").style.width =
      `${((currentStep + 1) / currentStory.steps.length) * 100}%`;
    prevButton.disabled = currentStep === 0;
    nextButton.textContent = step.button;
    novaSay(step.text, step.animation);
  }

  function fillMissionFacts(mission) {
    $("mars-story-facts-description").textContent =
      mission.description;
    const list = $("mars-story-facts-objects");
    list.replaceChildren();
    for (const objectName of mission.objects) {
      const item = document.createElement("li");
      item.textContent = objectName;
      list.appendChild(item);
    }
    $("mars-story-source").href = mission.source;
  }

  function openMission(mission) {
    const story = MARS_STORIES[mission.id];
    if (!story) {
      console.warn(`No existe historia para ${mission.id}`);
      return;
    }
    currentMission = mission;
    currentStory = story;
    currentStep = 0;
    $("mars-story-title").textContent = story.title;
    $("mars-story-subtitle").textContent = story.subtitle;
    fillMissionFacts(mission);
    factsPanel.hidden = true;
    factsToggle.setAttribute("aria-expanded", "false");
    factsToggle.textContent = "VER DATOS DEL ROBOT";
    storyPanel.hidden = false;
    landButton.hidden = !mission.model;
    for (const button of missionButtons) {
      button.classList.toggle(
        "is-active",
        button.dataset.missionId === mission.id
      );
    }
    renderStep();
  }

  function closeStory() {
    storyPanel.hidden = true;
    currentStory = null;
    currentMission = null;
    currentStep = 0;
    for (const button of missionButtons) {
      button.classList.remove("is-active");
    }
    novaSay(
      "¡Muy bien, explorador! Sigue buscando los robots en Marte para descubrir más historias.",
      "Wave"
    );
  }

  function nextStep() {
    if (!currentStory) return;
    if (currentStep < currentStory.steps.length - 1) {
      currentStep++;
      renderStep();
    } else {
      closeStory();
    }
  }

  function previousStep() {
    if (!currentStory || currentStep === 0) return;
    currentStep--;
    renderStep();
  }

  function repeatStep() {
    if (!currentStory) return;
    const step = currentStory.steps[currentStep];
    novaSay(step.text, step.animation);
  }

  function toggleFacts() {
    const show = factsPanel.hidden;
    factsPanel.hidden = !show;
    factsToggle.setAttribute("aria-expanded", String(show));
    factsToggle.textContent = show
      ? "OCULTAR DATOS DEL ROBOT"
      : "VER DATOS DEL ROBOT";
  }

  function createMarsScene(selectedMissionId) {
    marsScene = new MarsScene($("mars-scene-container"), {
      onMissionSelect: openMission
    });
    if (selectedMissionId) {
      marsScene.selectMission(selectedMissionId);
    }
  }

  function enterLanding() {
    if (!currentMission?.model || !currentMission.modelFormat) return;

    const mission = currentMission;
    document.body.classList.add("mars-landing-active");
    storyPanel.hidden = true;
    landingPanel.hidden = false;
    $("mars-landing-title").textContent = mission.name;
    $("mars-landing-region").textContent = `📍 ${mission.region}`;
    $("mars-landing-mission").textContent =
      `MISIÓN · ${mission.year}`;
    $("mars-landing-description").textContent =
      mission.description;

    marsScene?.dispose();
    marsScene = null;
    landingScene = new MarsLandingScene(
      $("mars-landing-scene"),
      {
        modelUrl: mission.model,
        modelFormat: mission.modelFormat,
        missionName: mission.name
      }
    );
    novaSay(
      `¡Aterrizaje completado en ${mission.region}! Aquí está el rover ${mission.name}. Puedes girar el modelo para verlo.`,
      "Celebrate"
    );
  }

  function returnToMarsMap() {
    landingScene?.dispose();
    landingScene = null;
    document.body.classList.remove("mars-landing-active");
    landingPanel.hidden = true;
    createMarsScene(currentMission?.id);
  }

  createMarsScene();
  const handleBack = () => onBack?.();
  const handleZoomIn = () => marsScene.zoomIn();
  const handleZoomOut = () => marsScene.zoomOut();
  const handleReset = () => {
    marsScene.resetCamera();
    if (currentStory) closeStory();
  };
  const handleMissionButton = (event) => {
    marsScene.selectMission(event.currentTarget.dataset.missionId);
  };
  const handleLand = () => enterLanding();
  const handleLandingBack = () => returnToMarsMap();

  backButton.addEventListener("click", handleBack);
  zoomInButton.addEventListener("click", handleZoomIn);
  zoomOutButton.addEventListener("click", handleZoomOut);
  resetButton.addEventListener("click", handleReset);
  closeButton.addEventListener("click", closeStory);
  prevButton.addEventListener("click", previousStep);
  nextButton.addEventListener("click", nextStep);
  repeatButton.addEventListener("click", repeatStep);
  factsToggle.addEventListener("click", toggleFacts);
  landButton.addEventListener("click", handleLand);
  landingBackButton.addEventListener("click", handleLandingBack);
  missionButtons.forEach((button) => {
    button.addEventListener("click", handleMissionButton);
  });

  novaSay(
    "¡Llegamos a Marte! Nueve robots exploradores nos esperan. Selecciona uno para conocer su historia.",
    "Wave"
  );

  return () => {
    disposed = true;
    document.body.classList.remove("mars-landing-active");
    backButton.removeEventListener("click", handleBack);
    zoomInButton.removeEventListener("click", handleZoomIn);
    zoomOutButton.removeEventListener("click", handleZoomOut);
    resetButton.removeEventListener("click", handleReset);
    closeButton.removeEventListener("click", closeStory);
    prevButton.removeEventListener("click", previousStep);
    nextButton.removeEventListener("click", nextStep);
    repeatButton.removeEventListener("click", repeatStep);
    factsToggle.removeEventListener("click", toggleFacts);
    landButton.removeEventListener("click", handleLand);
    landingBackButton.removeEventListener("click", handleLandingBack);
    missionButtons.forEach((button) => {
      button.removeEventListener("click", handleMissionButton);
    });
    marsScene?.dispose();
    landingScene?.dispose();
  };
}