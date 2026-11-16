
const LUNAR_SITES = {
  apollo11: {
    mission: "APOLLO 11",
    year: "1969",
    place: "Mar de la Tranquilidad",
    title: "¡Llegamos a la Luna!",
    subtitle: "El lugar donde aterrizó el Eagle",
    intro:
            "¡Aterrizaje completado! ¡Mira, explorador! Estamos en el Mar de la Tranquilidad. En 1969, los astronautas llegaron aquí a bordo del Eagle. ¡Y una parte de esa nave todavía permanece en la Luna!",
    discovery:
  "¡Ese es el Eagle! Bueno, una recreación de la nave que llegó aquí. Su parte inferior se quedó en la Luna porque los astronautas utilizaron la parte superior para despegar y regresar con su compañero que los esperaba en órbita.",
  }
};

export function LunarSitePage({
  missionId = "apollo11"
} = {}) {
  const site = LUNAR_SITES[missionId];

  if (!site) {
    throw new Error(
      `Lugar lunar no encontrado: ${missionId}`
    );
  }

  return `
    <main class="lunar-site-page">
      <div
        class="lunar-site-landscape"
        aria-hidden="true"
      ></div>

      <div
        class="lunar-site-vignette"
        aria-hidden="true"
      ></div>

      <header class="lunar-site-header">
        <div class="lunar-site-brand">
          <span>✦</span>
          THE LOST EXPLORER
        </div>

        <button
          id="lunar-site-back"
          class="lunar-site-back"
          type="button"
        >
          ← VOLVER A LA LUNA
        </button>
      </header>

      <section class="lunar-site-content">
        <div class="lunar-site-eyebrow">
          <span class="lunar-site-status"></span>
          EXPLORACIÓN EN SUPERFICIE
        </div>

        <div class="lunar-site-location">
          <span>📍 ${site.place}</span>
          <span>${site.mission} · ${site.year}</span>
        </div>

        <h1>${site.title}</h1>

        <p class="lunar-site-subtitle">
          ${site.subtitle}
        </p>

        <div class="lunar-site-discovery">
          <span class="lunar-site-discovery-icon">
            ✦
          </span>

          <div>
            <span class="lunar-site-discovery-label">
              OBJETO HISTÓRICO DETECTADO
            </span>

            <h2>El módulo lunar Eagle</h2>

            <p>
              ¡Hay algo increíble por descubrir
              en este lugar!
            </p>
          </div>
        </div>

        <button
          id="lunar-site-discover"
          class="lunar-site-discover-button"
          type="button"
        >
          DESCUBRIR EL EAGLE →
        </button>

        <p class="lunar-site-footnote">
          Recreación educativa del paisaje lunar.
          Misión documentada por NASA.
        </p>
      </section>
    

      <div class="lunar-eagle-container">
        <img
            src="/images/lunar-sites/apollo11-eagle.png"
            alt="Ilustración del módulo lunar Eagle de Apollo 11"
            class="lunar-eagle-image"
        />

        <div class="lunar-eagle-label">
            <span>✦ OBJETO DESCUBIERTO</span>
            <strong>MÓDULO LUNAR EAGLE</strong>
            <small>APOLLO 11 · 1969</small>
        </div>
        </div>

      <div class="lunar-site-ground" aria-hidden="true">
        <div class="lunar-site-ground-line"></div>
      </div>

      <div class="lunar-site-bottom">
        <span>DESTINO 01 · APOLLO 11</span>
        <span>EXPLORACIÓN GUIADA POR NOVA</span>
      </div>
    </main>
  `;
}

export function initLunarSitePage({
  missionId = "apollo11",
  onBack,
  nova
} = {}) {
  const site = LUNAR_SITES[missionId];

  const backButton = document.getElementById(
    "lunar-site-back"
  );

  const discoverButton = document.getElementById(
    "lunar-site-discover"
  );

  let disposed = false;

  const say = (text, animation = "Talk") => {
    if (disposed) return;
    nova?.say(text, animation, 3000);
  };

  // NOVA presenta el lugar al entrar.
  say(site.intro, "Celebrate");

  const handleBack = () => {
    onBack?.();
  };

  const handleDiscover = () => {
    say(site.discovery, "Point");

    discoverButton.textContent =
      "¡PRONTO LO EXPLORAREMOS EN 3D!";

    discoverButton.disabled = true;
  };

  backButton.addEventListener(
    "click",
    handleBack
  );

  discoverButton.addEventListener(
    "click",
    handleDiscover
  );

  return () => {
    disposed = true;

    backButton.removeEventListener(
      "click",
      handleBack
    );

    discoverButton.removeEventListener(
      "click",
      handleDiscover
    );
  };
}
