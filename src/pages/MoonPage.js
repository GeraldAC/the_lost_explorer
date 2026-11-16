
import { MoonScene } from "../three/MoonScene.js";
import { MOON_STORIES } from "../data/moonStories.js";

export function MoonPage() {
  return `
    <main class="moon-page">
      <div
        id="moon-scene-container"
        class="moon-scene-container"
        aria-label="Modelo tridimensional interactivo de la Luna"
      ></div>

      <header class="moon-header">
        <div class="moon-brand">
          <span class="moon-brand-icon">✦</span>
          THE LOST EXPLORER
        </div>

        <button
          id="moon-back"
          class="moon-back"
          type="button"
        >
          ← SISTEMA SOLAR
        </button>
      </header>

      <section class="moon-intro">
        <span class="moon-eyebrow">
          CAPÍTULO II · NUESTRO SATÉLITE
        </span>

        <h1>Los secretos de la Luna</h1>

        <p>
          Gira la Luna y encuentra los puntos
          luminosos. ¡Cada uno esconde una historia!
        </p>
      </section>

      <section
        id="moon-story"
        class="moon-story"
        aria-label="Historia de la misión seleccionada"
        hidden
      >
        <div class="moon-story-top">
          <span class="moon-story-label">
            DESCUBRIMIENTO LUNAR
          </span>

          <button
            id="moon-story-close"
            class="moon-story-close"
            type="button"
            aria-label="Cerrar historia"
          >
            ×
          </button>
        </div>

        <h2 id="moon-story-title"></h2>

        <p
          id="moon-story-subtitle"
          class="moon-story-subtitle"
        ></p>

        <div class="moon-story-progress">
          <span id="moon-story-count"></span>
          <div
            id="moon-story-progress-bar"
            class="moon-story-progress-bar"
          ></div>
        </div>

        <h3 id="moon-story-step-title"></h3>
        <button
        id="moon-land-button"
        class="moon-land-button"
        type="button"
        hidden
        >
        🚀 ¡ATERRICEMOS!
        </button>

        <div class="moon-story-actions">
          <button
            id="moon-story-prev"
            class="moon-story-secondary"
            type="button"
          >
            ← ANTERIOR
          </button>

          <button
            id="moon-story-next"
            class="moon-story-primary"
            type="button"
          >
            CONTINUAR →
          </button>
        </div>

        <button
          id="moon-story-repeat"
          class="moon-story-repeat"
          type="button"
        >
          <span aria-hidden="true">◉</span>
          ESCUCHAR A NOVA OTRA VEZ
        </button>

        <button
          id="moon-story-facts-toggle"
          class="moon-story-facts-toggle"
          type="button"
          aria-expanded="false"
          aria-controls="moon-story-facts"
        >
          VER DATOS DE LA MISIÓN
        </button>

        <div
          id="moon-story-facts"
          class="moon-story-facts"
          hidden
        >
          <p id="moon-story-facts-description"></p>

          <h4>¿Qué quedó en la Luna?</h4>

          <ul id="moon-story-facts-objects"></ul>

          <a
            id="moon-story-source"
            href="#"
            target="_blank"
            rel="noopener noreferrer"
          >
            CONSULTAR FUENTE NASA ↗
          </a>
        </div>
      </section>

      <div class="moon-controls">
        <button
          id="moon-zoom-in"
          type="button"
          aria-label="Acercar Luna"
          title="Acercar"
        >
          +
        </button>

        <button
          id="moon-zoom-out"
          type="button"
          aria-label="Alejar Luna"
          title="Alejar"
        >
          −
        </button>

        <button
          id="moon-reset"
          type="button"
          aria-label="Restablecer vista"
          title="Restablecer vista"
        >
          ↺
        </button>
      </div>

      <div class="moon-instructions">
        <span>↔ ARRASTRA PARA GIRAR</span>
        <span>◎ SELECCIONA UN PUNTO LUMINOSO</span>
      </div>

      <div class="moon-footer">
        EXPLORACIÓN LUNAR · DATOS NASA
      </div>
    </main>
  `;
}

export function initMoonPage({ onBack } = {}) {
  const $ = (id) => document.getElementById(id);

  const backButton = $("moon-back");
  const zoomInButton = $("moon-zoom-in");
  const zoomOutButton = $("moon-zoom-out");
  const resetButton = $("moon-reset");

  const storyPanel = $("moon-story");
  const closeButton = $("moon-story-close");
  const prevButton = $("moon-story-prev");
  const nextButton = $("moon-story-next");
  const repeatButton = $("moon-story-repeat");
  const factsToggle = $("moon-story-facts-toggle");
  const factsPanel = $("moon-story-facts");
  const landButton = $("moon-land-button");
  let currentMission = null;
  let currentStory = null;
  let currentStep = 0;
  let disposed = false;

  function novaSay(text, animation = "Talk") {
    if (disposed) return;

    window.dispatchEvent(
      new CustomEvent("nova:say", {
        detail: {
          text,
          animation,
          duration: 2600
        }
      })
    );
  }

  function renderStep() {
    if (!currentStory) return;

    const steps = currentStory.steps;
    const step = steps[currentStep];

    $("moon-story-step-title").textContent =
      step.title;

    $("moon-story-count").textContent =
      `DESCUBRIMIENTO ${currentStep + 1} DE ${steps.length}`;

    const progress = (
      (currentStep + 1) / steps.length
    ) * 100;

    $("moon-story-progress-bar").style.width =
      `${progress}%`;

    prevButton.disabled = currentStep === 0;

    nextButton.textContent = step.button;

    // NOVA cuenta el contenido principal.
    // No duplicamos el diálogo en una tarjeta.
    novaSay(step.text, step.animation);
  }

  function fillMissionFacts(mission) {
    $("moon-story-facts-description").textContent =
      mission.description;

    const list = $("moon-story-facts-objects");
    list.replaceChildren();

    for (const objectName of mission.objects) {
      const item = document.createElement("li");
      item.textContent = objectName;
      list.appendChild(item);
    }

    $("moon-story-source").href = mission.source;
  }

  function openMission(mission) {
    console.log(
    "Marcador lunar seleccionado:",
    mission.id
    );
    const story = MOON_STORIES[mission.id];

    if (!story) {
      console.warn(
        `No existe historia para ${mission.id}`
      );
      return;
    }

    currentMission = mission;
    currentStory = story;
    currentStep = 0;

    $("moon-story-title").textContent =
      story.title;

    $("moon-story-subtitle").textContent =
      story.subtitle;

    fillMissionFacts(mission);

    factsPanel.hidden = true;
    factsToggle.setAttribute(
      "aria-expanded", "false"
    );

    factsToggle.textContent =
      "VER DATOS DE LA MISIÓN";

    
    storyPanel.hidden = false;

    const isApollo11 = mission.id === "apollo11";

    landButton.hidden = !isApollo11;

    const storyActions = storyPanel.querySelector(
    ".moon-story-actions"
    );

    storyActions.hidden = isApollo11;
    repeatButton.hidden = isApollo11;
    factsToggle.hidden = isApollo11;

    $("moon-story-step-title").hidden = isApollo11;
    const progressElement = storyPanel.querySelector(
    ".moon-story-progress"
    );

    if (progressElement) {
    progressElement.hidden = isApollo11;
    }

    if (isApollo11) {
    novaSay(
        "¡Guau, explorador! ¡Encontramos Apollo 11! Aquí aterrizaron los primeros astronautas que caminaron sobre la Luna, en 1969. ¡Vamos a descubrir qué dejaron aquí!",
        "Wave"
    );
    } else {
    renderStep();
    }

  }

  function closeStory() {
    storyPanel.hidden = true;
    landButton.hidden = true;
    currentMission = null;
    currentStory = null;
    currentStep = 0;
    

    novaSay(
      "¡Muy bien, explorador! Sigue buscando otros puntos luminosos. ¡Todavía quedan historias por descubrir!",
      "Wave"
    );
  }

  function nextStep() {
    if (!currentStory) return;

    if (
      currentStep <
      currentStory.steps.length - 1
    ) {
      currentStep++;
      renderStep();
    } else {
      closeStory();
    }
  }

  function previousStep() {
    if (!currentStory || currentStep === 0) {
      return;
    }

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

    factsToggle.setAttribute(
      "aria-expanded",
      String(show)
    );

    factsToggle.textContent = show
      ? "OCULTAR DATOS DE LA MISIÓN"
      : "VER DATOS DE LA MISIÓN";
  }

  const moonScene = new MoonScene(
    $("moon-scene-container"),
    {
      onMissionSelect: openMission
    }
  );

    const handleLand = () => {
    if (currentMission?.id !== "apollo11") {
        return;
    }

    window.dispatchEvent(
        new CustomEvent("navigation:lunar-site", {
        detail: {
            missionId: "apollo11"
        }
        })
    );
    };

    landButton.addEventListener(
    "click",
    handleLand
    );


  const handleBack = () => onBack?.();

  const handleZoomIn = () => {
    moonScene.zoomIn();
  };

  const handleZoomOut = () => {
    moonScene.zoomOut();
  };

  const handleReset = () => {
    moonScene.resetCamera();

    if (currentStory) {
      closeStory();
    }
  };

  backButton.addEventListener(
    "click", handleBack
  );

  zoomInButton.addEventListener(
    "click", handleZoomIn
  );

  zoomOutButton.addEventListener(
    "click", handleZoomOut
  );

  resetButton.addEventListener(
    "click", handleReset
  );

  closeButton.addEventListener(
    "click", closeStory
  );

  prevButton.addEventListener(
    "click", previousStep
  );

  nextButton.addEventListener(
    "click", nextStep
  );

  repeatButton.addEventListener(
    "click", repeatStep
  );

  factsToggle.addEventListener(
    "click", toggleFacts
  );

  return () => {
    disposed = true;

    backButton.removeEventListener(
      "click", handleBack
    );

    zoomInButton.removeEventListener(
      "click", handleZoomIn
    );

    zoomOutButton.removeEventListener(
      "click", handleZoomOut
    );

    resetButton.removeEventListener(
      "click", handleReset
    );

    closeButton.removeEventListener(
      "click", closeStory
    );

    prevButton.removeEventListener(
      "click", previousStep
    );

    nextButton.removeEventListener(
      "click", nextStep
    );

    repeatButton.removeEventListener(
      "click", repeatStep
    );

    factsToggle.removeEventListener(
      "click", toggleFacts
    );

    landButton.removeEventListener(
    "click",
    handleLand
    );

    moonScene.dispose();
  };
}
