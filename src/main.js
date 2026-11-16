
import "./styles/global.css";
import "./styles/pages/lunar-site.css";
import "./styles/pages/home.css";
import "./styles/pages/explore.css";
import "./styles/pages/lightspeed.css";
import "./styles/pages/moon.css";
import "./styles/pages/mars.css";
import "./styles/pages/nova-overlay.css";
import {
  LunarSitePage,
  initLunarSitePage
} from "./pages/LunarSitePage.js";
import {
  HomePage,
  initHomePage
} from "./pages/HomePage.js";

import {
  ExplorePage,
  initExplorePage
} from "./pages/ExplorePage.js";

import {
  MoonPage,
  initMoonPage
} from "./pages/MoonPage.js";
import {
  MarsPage,
  initMarsPage
} from "./pages/MarsPage.js";

import {
  playLightSpeedTransition
} from "./components/LightSpeedTransition.js";

import { NovaGuide } from "./components/NovaGuide.js";
import { NovaOverlay } from "./components/NovaOverlay.js";

const app = document.querySelector("#app");

if (!app) {
  throw new Error("No se encontró #app");
}

const novaHost = document.createElement("div");
novaHost.id = "nova-overlay";
novaHost.innerHTML = NovaOverlay();
novaHost.hidden = true;

document.body.appendChild(novaHost);

const sceneFade = document.createElement("div");
sceneFade.id = "scene-fade";
sceneFade.setAttribute("aria-hidden", "true");
document.body.appendChild(sceneFade);

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

let nova = null;
let cleanupPage = null;
let currentPage = "home";
let transitioning = false;

function ensureNova() {
  if (!nova) {
    nova = new NovaGuide(
      document.getElementById(
        "nova-canvas-container"
      )
    );
  }

  return nova;
}

function cleanupCurrentPage() {
  if (typeof cleanupPage === "function") {
    cleanupPage();
    cleanupPage = null;
  }
}

function setNovaPage(page) {
  novaHost.dataset.page = page;
  novaHost.hidden = page === "home";

  if (page !== "home") {
    ensureNova();
  }
}

function showHome() {
  cleanupCurrentPage();

  currentPage = "home";
  app.innerHTML = HomePage();

  setNovaPage("home");

  cleanupPage = initHomePage();
}

function showExplore() {
  cleanupCurrentPage();

  currentPage = "explore";
  app.innerHTML = ExplorePage();

  setNovaPage("explore");

  cleanupPage = initExplorePage({
    onBack: showHome,
    nova: ensureNova()
  });

  nova.say(
    "¡Estamos en el Sistema Solar! Selecciona un planeta para continuar nuestra aventura.",
    "Wave",
    2000
  );
}

function showMoon() {
  cleanupCurrentPage();

  currentPage = "moon";
  app.innerHTML = MoonPage();

  setNovaPage("moon");

  cleanupPage = initMoonPage({
    onBack: returnFromMoon
  });

  nova.say(
    "¡Llegamos a la Luna! Puedes girarla y acercarte para descubrir su superficie.",
    "Wave",
    2400
  );
}

function showLunarSite(missionId = "apollo11") {
  cleanupCurrentPage();

  currentPage = "lunar-site";

  app.innerHTML = LunarSitePage({
    missionId
  });

  setNovaPage("lunar-site");

  cleanupPage = initLunarSitePage({
    missionId,
    nova: ensureNova(),
    onBack: returnToMoonFromSite
  });
}

function showMars() {
  cleanupCurrentPage();

  currentPage = "mars";
  app.innerHTML = MarsPage();

  setNovaPage("mars");

  cleanupPage = initMarsPage({
    onBack: returnFromMars
  });
}




function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}



function handleNovaDialogue(event) {
  if (!nova || currentPage === "home") {
    return;
  }

  const {
    text,
    animation = "Talk",
    duration = 2600
  } = event.detail || {};

  if (!text) return;

  nova.say(text, animation, duration);
}



async function fadeBetweenScenes(changeScene) {
  const duration = reducedMotion ? 0 : 650;

  sceneFade.style.transitionDuration =
    `${duration}ms`;

  sceneFade.classList.add("is-visible");

  if (duration > 0) {
    await wait(duration);
  }

  changeScene();

  // Dejamos que el navegador dibuje
  // la nueva escena antes de revelar la pantalla.
  await new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });

  sceneFade.classList.remove("is-visible");

  if (duration > 0) {
    await wait(duration);
  }
}

async function navigateToMoon() {
  if (transitioning || currentPage !== "explore") {
    return;
  }

  transitioning = true;

  try {
    await fadeBetweenScenes(showMoon);
  } finally {
    transitioning = false;
  }
}

async function returnFromMoon() {
  if (transitioning || currentPage !== "moon") {
    return;
  }

  transitioning = true;

  try {
    nova?.say(
      "¡Regresemos al Sistema Solar para descubrir más mundos!",
      "Wave",
      1800
    );

    await fadeBetweenScenes(showExplore);
  } finally {
    transitioning = false;
  }
}

async function navigateToMars() {
  if (transitioning || currentPage !== "explore") {
    return;
  }

  transitioning = true;

  try {
    nova?.say(
      "¡Prepárate, explorador! Vamos a conocer a los robots que llegaron a Marte.",
      "Celebrate",
      2600
    );
    await fadeBetweenScenes(showMars);
  } finally {
    transitioning = false;
  }
}

async function returnFromMars() {
  if (transitioning || currentPage !== "mars") {
    return;
  }

  transitioning = true;

  try {
    nova?.say(
      "¡Regresemos al Sistema Solar para descubrir más mundos!",
      "Wave",
      1800
    );
    await fadeBetweenScenes(showExplore);
  } finally {
    transitioning = false;
  }
}


async function navigateToLunarSite(
  missionId = "apollo11"
) {
  if (
    transitioning ||
    currentPage !== "moon" ||
    missionId !== "apollo11"
  ) {
    return;
  }

  transitioning = true;

  try {
    await fadeBetweenScenes(() => {
      showLunarSite(missionId);
    });
  } finally {
    transitioning = false;
  }
}

async function returnToMoonFromSite() {
  if (
    transitioning ||
    currentPage !== "lunar-site"
  ) {
    return;
  }

  transitioning = true;

  try {
    await fadeBetweenScenes(showMoon);
  } finally {
    transitioning = false;
  }
}

function handleLunarSiteNavigation(event) {
  const missionId =
    event.detail?.missionId || "apollo11";

  void navigateToLunarSite(missionId);
}



async function startExploration() {
  if (transitioning || currentPage !== "home") {
    return;
  }

  transitioning = true;

  try {
    await playLightSpeedTransition({
      duration: 3200,
      onComplete: showExplore
    });
  } finally {
    transitioning = false;
  }
}

function handleMoonNavigation() {
  void navigateToMoon();
}

function handleMarsNavigation() {
  void navigateToMars();
}

function handleNovaHide() {
  nova?.setVisible(false);

  document.getElementById(
    "nova-show"
  ).hidden = false;
}

function handleNovaShow() {
  nova?.setVisible(true);

  document.getElementById(
    "nova-show"
  ).hidden = true;

  nova?.say(
    "¡Aquí estoy! Sigamos explorando juntos.",
    "Wave",
    1800
  );
}

const novaHideButton = document.getElementById(
  "nova-hide"
);

const novaShowButton = document.getElementById(
  "nova-show"
);

novaHideButton.addEventListener(
  "click",
  handleNovaHide
);

novaShowButton.addEventListener(
  "click",
  handleNovaShow
);

window.addEventListener(
  "exploration:start",
  startExploration
);

window.addEventListener(
  "navigation:moon",
  handleMoonNavigation
);
window.addEventListener(
  "navigation:mars",
  handleMarsNavigation
);

window.addEventListener(
  "nova:say",
  handleNovaDialogue
);
window.addEventListener(
  "navigation:lunar-site",
  handleLunarSiteNavigation
);
showHome();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    cleanupCurrentPage();
    nova?.dispose();

    novaHideButton.removeEventListener(
      "click",
      handleNovaHide
    );

    novaShowButton.removeEventListener(
      "click",
      handleNovaShow
    );

    window.removeEventListener(
      "exploration:start",
      startExploration
    );

    window.removeEventListener(
      "navigation:moon",
      handleMoonNavigation
    );

    window.removeEventListener(
      "navigation:mars",
      handleMarsNavigation
    );

    window.removeEventListener(
      "nova:say",
      handleNovaDialogue
    );
    
    window.removeEventListener(
      "navigation:lunar-site",
      handleLunarSiteNavigation
    );

    novaHost.remove();
    sceneFade.remove();
  });
}
