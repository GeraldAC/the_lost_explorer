# The Lost Explorer

[![JavaScript](https://img.shields.io/badge/JavaScript-ES_Modules-f7df1e?logo=javascript&logoColor=000)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Three.js](https://img.shields.io/badge/Three.js-3D_Rendering-black?logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-Development_and_Build-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![HTML5](https://img.shields.io/badge/HTML5-Application_Markup-e34f26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-Responsive_Styling-1572b6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

The Lost Explorer is an interactive educational web experience for exploring the Solar System and learning about human and robotic space exploration. It combines browser-based 3D scenes with mission stories and NOVA, a virtual guide.

https://github.com/user-attachments/assets/1afac0c6-1569-4ea7-be76-148ade8df1f4

## Features

- Explore an interactive, textured 3D representation of the Solar System.
- Visit the Moon and learn about Apollo landing sites.
- Explore Mars and discover the stories of nine missions, including Sojourner, Spirit, Opportunity, Curiosity, and Perseverance.
- View selected Mars rover models in an interactive surface scene.
- Follow NOVA's contextual messages and animations throughout the experience.
- Navigate with mouse, touch, and on-screen controls; reduced-motion preferences are respected for supported transitions.

## Technology Stack

- **JavaScript (ES modules)** for application logic and page navigation.
- **Three.js** for WebGL-based 3D scenes, models, and camera controls.
- **Vite** for local development and production builds.
- **HTML5 and CSS3** for application markup, layout, and styling.

## Requirements

- Node.js compatible with the installed Vite version.
- npm.
- A modern browser with WebGL support.

## Getting Started

1. Clone the repository and move into the project directory.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the local URL printed by Vite in your browser.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create a production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |

## Controls

Controls vary by scene. In the Solar System and Mars scenes, drag to rotate and use the mouse wheel or the on-screen controls to zoom. Select a planet, lunar destination, or Mars mission to continue exploring. On supported touch devices, use touch gestures to interact with the 3D scenes.

## Project Structure

```text
public/
  audio/       Sound effects, music, and narration
  images/      Backgrounds and mission imagery
  models/      3D models used in the scenes
  textures/    Planet and space textures
src/
  components/  Shared interface components and NOVA guide
  data/        Planet, destination, and mission content
  pages/       Application pages
  styles/      Global, component, and page styles
  three/       Three.js scenes, viewers, and model loaders
  utils/       Navigation and accessibility utilities
  main.js      Application entry point and navigation
index.html     Vite HTML entry point
```

## Mission References

Mission descriptions include links to their respective NASA mission pages in the application. The project also maintains source references in `src/data/sources.js`.
