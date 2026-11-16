
export function playLightSpeedTransition({
  onComplete,
  duration = 3200
} = {}) {
  return new Promise((resolve) => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      onComplete?.();
      resolve();
      return;
    }

    const overlay = document.createElement("div");
    overlay.className = "lightspeed-overlay";

    const canvas = document.createElement("canvas");
    canvas.className = "lightspeed-canvas";

    const flash = document.createElement("div");
    flash.className = "lightspeed-flash";

    overlay.append(canvas, flash);
    document.body.appendChild(overlay);

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      overlay.remove();
      onComplete?.();
      resolve();
      return;
    }

    let width = 0;
    let height = 0;
    let stars = [];
    let frameId = 0;
    let startTime = null;
    let finished = false;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      const dpr = Math.min(
        window.devicePixelRatio || 1,
        2
      );

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const createStar = (randomDepth = true) => ({
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
      z: randomDepth
        ? Math.random() * 1.4 + 0.1
        : 1.5,
      hue: Math.random() > 0.8 ? 200 : 220
    });

    const resetStars = () => {
      stars = Array.from(
        { length: 650 },
        () => createStar()
      );
    };

    const finish = () => {
      if (finished) return;
      finished = true;

      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);

      try {
        onComplete?.();
      } finally {
        overlay.classList.add("lightspeed-fadeout");

        window.setTimeout(() => {
          overlay.remove();
          resolve();
        }, 500);
      }
    };

    const animate = (timestamp) => {
      if (startTime === null) startTime = timestamp;

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      ctx.fillStyle = "#02040c";
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      const acceleration = Math.min(
        1,
        progress * 2.2
      );

      const speed = 0.004 + acceleration * 0.075;
      const focalLength = Math.min(width, height) * 0.45;

      for (const star of stars) {
        const previousZ = star.z;
        star.z -= speed;

        if (star.z <= 0.025) {
          Object.assign(star, createStar(false));
          continue;
        }

        const previousX =
          centerX + (star.x / previousZ) * focalLength;

        const previousY =
          centerY + (star.y / previousZ) * focalLength;

        const x =
          centerX + (star.x / star.z) * focalLength;

        const y =
          centerY + (star.y / star.z) * focalLength;

        if (
          x < -width ||
          x > width * 2 ||
          y < -height ||
          y > height * 2
        ) {
          Object.assign(star, createStar(false));
          continue;
        }

        ctx.beginPath();
        ctx.moveTo(previousX, previousY);
        ctx.lineTo(x, y);

        ctx.strokeStyle =
          `hsla(${star.hue}, 100%, 85%, 0.9)`;

        ctx.lineWidth = 0.7 + acceleration * 1.4;
        ctx.stroke();
      }

      if (progress > 0.76) {
        const flashProgress =
          (progress - 0.76) / 0.24;

        flash.style.opacity = String(
          Math.min(1, flashProgress)
        );
      }

      if (progress >= 1) {
        finish();
        return;
      }

      frameId = requestAnimationFrame(animate);
    };

    resize();
    resetStars();

    window.addEventListener("resize", resize);

    frameId = requestAnimationFrame(animate);
  });
}
