
import { SolarSystem } from "../three/SolarSystem.js";

export function ExplorePage() {
  return `
    <main class="explore-page">
      <div id="solar-system-container"></div>

      <header class="solar-header">
        <div class="solar-brand">
          <span class="solar-brand-icon">✦</span>
          THE LOST EXPLORER
        </div>

        <button id="back-home" class="solar-back">
          ← INICIO
        </button>
      </header>

      <section class="solar-intro" id="solar-intro">
        <span class="solar-eyebrow">
          CAPÍTULO I · EL UNIVERSO
        </span>

        <h1>Explora el Sistema Solar</h1>

        <p>
          Cada mundo guarda una historia.
          Selecciona un planeta y descubre
          sus secretos junto a NOVA.
        </p>
      </section>

      <div class="solar-hint" id="solar-hint">
        <span>↔ ARRASTRA PARA ROTAR</span>
        <span>⊕ RUEDA PARA ACERCAR</span>
        <span>◎ CLIC PARA SELECCIONAR</span>
      </div>

      <div class="solar-scale-note">
        Representación educativa · Escala visual adaptada
      </div>

      <!-- NOVA: GUÍA PRINCIPAL -->
      
      
    </main>
  `;
}

export function initExplorePage({onBack,nova} = {}) {
  const $ = (id) => document.getElementById(id);

  const container = $("solar-system-container");
  const backButton = $("back-home");
  const intro = $("solar-intro");
  const hint = $("solar-hint");

  const focusMoonButton = $("focus-moon");
  const destinationButton = $("explore-destination");
  const returnEarthButton = $("return-earth");
  const overviewButton = $("return-overview");

  const novaHideButton = $("nova-hide");
  const novaShowButton = $("nova-show");

  const novaDialogues = {
    mercury:
      "¡Mercurio es el planeta más cercano al Sol! Allí las temperaturas cambian muchísimo.",
    venus:
      "¡Venus es increíble! Su atmósfera es muy densa y su superficie es extremadamente caliente.",
    earth:
      "¡Mira, nuestro hogar! Cerca de la Tierra está la Luna. ¿Quieres que viajemos hasta ella?",
    moon:
      "¡Llegamos a la Luna! Aquí los astronautas de Apollo 11 dieron los primeros pasos humanos sobre otro mundo.",
    mars:
      "¡Este es Marte! Aquí exploraron robots como Sojourner, Spirit y Opportunity.",
    jupiter:
      "¡Júpiter es gigantesco! Es el planeta más grande de nuestro Sistema Solar.",
    saturn:
      "¡Observa los anillos de Saturno! Están formados principalmente por fragmentos de hielo.",
    uranus:
      "¡Urano gira casi de costado! Es uno de los planetas más curiosos.",
    neptune:
      "¡Neptuno está muy lejos! En su atmósfera se producen vientos muy intensos."
  };

  let selectedId = null;

  

  const solarSystem = new SolarSystem(container, {
    onSelect: (object) => {
      selectedId = object.planetId;
      updateNavigation();

      // La selección de otros planetas
      // se anuncia aquí.
      if (
        solarSystem.view === "planet" &&
        novaDialogues[selectedId]
      ) {
        nova.say(
          novaDialogues[selectedId],
          "Talk",
          3200
        );
      }
    },

    onViewChange: (view) => {
      if (view === "overview") {
        selectedId = null;

        nova.say(
          "¡Estamos de vuelta en el Sistema Solar! ¿Qué planeta quieres descubrir ahora?",
          "Wave",
          2000
        );
      }

      if (view === "earth") {
        selectedId = "earth";

        nova.say(
          novaDialogues.earth,
          "Point",
          3200
        );
      }

      if (view === "moon") {
        selectedId = "moon";

        nova.say(
          novaDialogues.moon,
          "Celebrate",
          3200
        );
      }

      updateNavigation();
    }
  });

  function updateNavigation() {
    const view = solarSystem.view;

    focusMoonButton.hidden = view !== "earth";
    returnEarthButton.hidden = view !== "moon";
    overviewButton.hidden = view === "overview";

    destinationButton.hidden = !(
      view === "moon" ||
      (view === "planet" && selectedId === "mars")
    );

    if (view === "moon") {
      destinationButton.textContent =
        "EXPLORAR MISIONES LUNARES →";
    }

    if (view === "planet" && selectedId === "mars") {
      destinationButton.textContent =
        "EXPLORAR MISIONES DE MARTE →";
    }

    intro.classList.toggle(
      "solar-intro-hidden",
      view !== "overview"
    );

    hint.classList.toggle(
      "solar-hint-hidden",
      view !== "overview"
    );
  }

  const handleBack = () => onBack?.();

  const handleFocusMoon = () => {
    solarSystem.focusMoon();
  };

  const handleReturnEarth = () => {
    solarSystem.returnToEarth();
  };

  const handleOverview = () => {
    solarSystem.returnToOverview();
  };

  

  const handleDestination = async () => {
    if (selectedId === "moon") {
      if (solarSystem.cameraTransition) return;

      destinationButton.disabled = true;

      nova.say(
        "¡Prepárate, explorador! Vamos a acercarnos a la superficie de la Luna.",
        "Celebrate",
        2600
      );

      const completed = await solarSystem.flyToMoon(
        2600
      );

      if (completed) {
        window.dispatchEvent(
          new CustomEvent("navigation:moon")
        );
      } else {
        destinationButton.disabled = false;
      }

      return;
    }

    if (selectedId === "mars") {
      nova.say(
        "¡Vamos a conocer a los siete robots que llegaron a Marte!",
        "Point",
        2600
      );
      window.dispatchEvent(
        new CustomEvent("navigation:mars")
      );
    }
  };


  const handleNovaHide = () => {
    nova.setVisible(false);
    novaShowButton.hidden = false;
  };

  const handleNovaShow = () => {
    nova.setVisible(true);
    novaShowButton.hidden = true;

    nova.say(
      "¡Aquí estoy! Sigamos explorando juntos.",
      "Wave",
      2000
    );
  };

  backButton.addEventListener("click", handleBack);
  focusMoonButton.addEventListener(
    "click", handleFocusMoon
  );
  returnEarthButton.addEventListener(
    "click", handleReturnEarth
  );
  overviewButton.addEventListener(
    "click", handleOverview
  );
  destinationButton.addEventListener(
    "click", handleDestination
  );
  novaHideButton.addEventListener(
    "click", handleNovaHide
  );
  novaShowButton.addEventListener(
    "click", handleNovaShow
  );

  updateNavigation();

  return () => {
    backButton.removeEventListener(
      "click", handleBack
    );
    focusMoonButton.removeEventListener(
      "click", handleFocusMoon
    );
    returnEarthButton.removeEventListener(
      "click", handleReturnEarth
    );
    overviewButton.removeEventListener(
      "click", handleOverview
    );
    destinationButton.removeEventListener(
      "click", handleDestination
    );
    novaHideButton.removeEventListener(
      "click", handleNovaHide
    );
    novaShowButton.removeEventListener(
      "click", handleNovaShow
    );

    solarSystem.dispose();
    
  };
}
