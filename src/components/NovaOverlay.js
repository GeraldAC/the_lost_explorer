
export function NovaOverlay() {
  return `
    <aside id="nova-guide" class="nova-guide">
      <div class="nova-dialogue">
        <div class="nova-dialogue-header">
          <span class="nova-status-dot"></span>
          <strong>NOVA</strong>
          <span class="nova-role">GUÍA ESPACIAL</span>
        </div>

        <p id="nova-message" aria-live="polite">
          ¡Hola, explorador! Soy NOVA.
          Vamos a descubrir el universo juntos.
        </p>

        <div class="nova-actions">
          <button
            id="focus-moon"
            class="solar-primary-action"
            hidden
          >
            ACERCARSE A LA LUNA →
          </button>

          <button
            id="explore-destination"
            class="solar-primary-action"
            hidden
          >
            EXPLORAR DESTINO →
          </button>

          <button
            id="return-earth"
            class="solar-secondary-action"
            hidden
          >
            ← VOLVER A LA TIERRA
          </button>

          <button
            id="return-overview"
            class="solar-secondary-action"
            hidden
          >
            ← VER SISTEMA SOLAR
          </button>
        </div>

        <button
          id="nova-hide"
          class="nova-hide"
          type="button"
        >
          Ocultar guía
        </button>
      </div>

      <div
        id="nova-canvas-container"
        class="nova-model"
      ></div>
    </aside>

    <button
      id="nova-show"
      class="nova-show"
      type="button"
      hidden
    >
      ✦ MOSTRAR NOVA
    </button>
  `;
}
