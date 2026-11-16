
export function HomePage() {
  return `
    <main class="home-page">
      <div class="hero-background" aria-hidden="true"></div>
      <canvas id="stars-canvas" aria-hidden="true"></canvas>
      <div class="hero-overlay" aria-hidden="true"></div>

      <header class="home-navbar">
        <a href="/" class="home-logo">
          <span class="logo-symbol">✦</span>
          THE LOST EXPLORER
        </a>
      </header>

      <section class="hero-content" id="inicio">
        <div class="hero-label">
          NASA SPACE APPS CHALLENGE
        </div>

        <h1>
          THE LOST
          <span>EXPLORER</span>
        </h1>

        <p class="hero-subtitle">
          Sus misiones terminaron.
          <strong>Sus historias siguen vivas.</strong>
        </p>

        <p class="hero-description">
          Viaja más allá de la Tierra y descubre las
          máquinas que exploraron otros mundos.
          Conoce sus aventuras, sus descubrimientos
          y el legado que dejaron en el universo.
        </p>

        <div class="hero-actions">
          <button id="start-exploration" class="explore-button">
            <span>COMENZAR EXPLORACIÓN</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>
    </main>
  `;
}

export function initHomePage() {
  const page = document.querySelector(".home-page");
  const background = document.querySelector(".hero-background");
  const canvas = document.getElementById("stars-canvas");
  const button = document.getElementById("start-exploration");

  if (!page || !background || !canvas) return () => {};

  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  let width = 0;
  let height = 0;
  let stars = [];
  let frameId;
  let lastTime = 0;
  let pointerX = 0;
  let pointerY = 0;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const resize = () => {
    const rect = page.getBoundingClientRect();
    width = rect.width;
    height = rect.height;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(110, Math.floor(width / 12));

    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.3 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 1.5 + 0.4
    }));
  };

  const animate = (time) => {
    const elapsed = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;

    ctx.clearRect(0, 0, width, height);

    for (const star of stars) {
      star.phase += star.speed * elapsed;

      const opacity = 0.25 + (Math.sin(star.phase) + 1) * 0.3;

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 230, 255, ${opacity})`;
      ctx.fill();
    }

    frameId = requestAnimationFrame(animate);
  };

  const handlePointer = (event) => {
    if (reducedMotion) return;

    pointerX = event.clientX / window.innerWidth - 0.5;
    pointerY = event.clientY / window.innerHeight - 0.5;

    background.style.setProperty("--pointer-x", `${pointerX * 12}px`);
    background.style.setProperty("--pointer-y", `${pointerY * 12}px`);
  };

  const handleStart = () => {
  window.dispatchEvent(
    new CustomEvent("exploration:start")
  );
};

  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", handlePointer);

  if (button) {
    button.addEventListener("click", handleStart);
  }

  if (!reducedMotion) {
    frameId = requestAnimationFrame(animate);
  }

  return () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", handlePointer);
    button?.removeEventListener("click", handleStart);
  };
}
