export const MARS_MISSIONS = [
  {
    id: "sojourner",
    name: "Sojourner",
    year: 1997,
    region: "Ares Vallis",
    latitude: 19.13,
    longitude: -33.22,
    description:
      "Sojourner llegó con Mars Pathfinder el 4 de julio de 1997. Fue una demostración tecnológica para comprobar que un rover podía desplazarse y recibir comandos en Marte. Analizó rocas como Barnacle Bill y Yogi con su instrumento APXS; funcionó 83 días, aunque se había diseñado para una misión de siete días.",
    objects: [
      "Rover Sojourner: seis ruedas y panel solar",
      "Espectrómetro APXS para analizar rocas",
      "Rocas Barnacle Bill y Yogi",
      "Módulo de aterrizaje Pathfinder"
    ],
    source: "https://science.nasa.gov/mission/mars-pathfinder/",
    model: "/models/mars/sojourner.stl",
    modelFormat: "stl"
  },
  {
    id: "spirit",
    name: "Spirit",
    year: 2004,
    region: "Cráter Gusev",
    latitude: -14.57,
    longitude: 175.47,
    description:
      "Spirit llegó a Marte en enero de 2004 y exploró el cráter Gusev. Una rueda averiada dejó un surco que expuso suelo rico en sílice, evidencia de actividad relacionada con agua caliente. Quedó atrapado en suelo blando en 2009 y su misión terminó en 2010.",
    objects: [
      "Rover Spirit y su laboratorio de instrumentos",
      "Herramienta de abrasión de rocas RAT",
      "Suelo rico en sílice expuesto por una rueda",
      "Huellas del rover en el cráter Gusev"
    ],
    source: "https://science.nasa.gov/mission/mer-spirit/",
    model: "/models/mars/spirit-opportunity.glb",
    modelFormat: "gltf"
  },
  {
    id: "opportunity",
    name: "Opportunity",
    year: 2004,
    region: "Meridiani Planum",
    latitude: -1.95,
    longitude: -5.53,
    description:
      "Opportunity aterrizó en Meridiani Planum en enero de 2004. Encontró pequeñas esferas de hematita, apodadas «arándanos», y otras señales de que hubo agua líquida en el pasado. Recorrió 45,16 km y trabajó hasta 2018, cuando una tormenta de polvo global interrumpió la energía solar.",
    objects: [
      "Rover Opportunity y su laboratorio de instrumentos",
      "Esférulas de hematita apodadas «arándanos»",
      "Herramienta de abrasión de rocas RAT",
      "45,16 km recorridos en Marte"
    ],
    source: "https://science.nasa.gov/mission/mer-opportunity/",
    model: "/models/mars/spirit-opportunity.glb",
    modelFormat: "gltf"
  },
  {
    id: "viking1",
    name: "Viking 1",
    year: 1976,
    region: "Chryse Planitia",
    latitude: 22.48,
    longitude: -47.97,
    description:
      "Viking 1 fue un módulo de aterrizaje que llegó a Marte en 1976. Tomó imágenes desde la superficie y realizó experimentos para buscar señales de vida en el suelo. Sus resultados no demostraron vida; mostraron reacciones químicas complejas en el suelo marciano.",
    objects: [
      "Módulo de aterrizaje Viking 1",
      "Brazo excavador y muestras de suelo",
      "Experimentos biológicos",
      "Cámara para imágenes de la superficie"
    ],
    source: "https://science.nasa.gov/mission/viking-1/"
  },
  {
    id: "viking2",
    name: "Viking 2",
    year: 1976,
    region: "Utopia Planitia",
    latitude: 47.64,
    longitude: -134.26,
    description:
      "Viking 2 aterrizó en Utopia Planitia en 1976. Como Viking 1, llevaba instrumentos para fotografiar, estudiar el clima y analizar el suelo en busca de señales de vida. La misión amplió las observaciones directas de la superficie marciana.",
    objects: [
      "Módulo de aterrizaje Viking 2",
      "Brazo excavador y muestras de suelo",
      "Experimentos para estudiar el suelo",
      "Instrumentos meteorológicos"
    ],
    source: "https://science.nasa.gov/mission/viking-2/"
  },
  {
    id: "phoenix",
    name: "Phoenix",
    year: 2008,
    region: "Llanura ártica marciana",
    latitude: 68.22,
    longitude: -125.75,
    description:
      "Phoenix aterrizó en la región polar norte de Marte en 2008. Con su brazo excavador descubrió hielo de agua bajo la superficie; el material brillante desapareció al quedar expuesto. Su instrumento TEGA calentaba muestras para analizar los gases liberados.",
    objects: [
      "Módulo de aterrizaje Phoenix",
      "Brazo excavador",
      "Hielo de agua bajo la superficie",
      "Instrumento de análisis de muestras TEGA"
    ],
    source: "https://science.nasa.gov/mission/phoenix/"
  },
  {
    id: "perseverance",
    name: "Perseverance",
    year: 2021,
    region: "Cráter Jezero",
    latitude: 18.44,
    longitude: 77.45,
    description:
      "Perseverance aterrizó en el cráter Jezero en 2021 para buscar señales de vida microbiana antigua y recoger muestras de roca para un posible retorno futuro.",
    objects: [
      "Rover Perseverance",
      "Tubos para muestras de roca",
      "Helicóptero Ingenuity"
    ],
    source:
      "https://science.nasa.gov/mission/mars-2020-perseverance/"
  },
  {
    id: "curiosity",
    name: "Curiosity",
    year: 2012,
    region: "Cráter Gale",
    latitude: -4.59,
    longitude: 137.44,
    description:
      "Curiosity aterrizó en el cráter Gale en 2012. Su laboratorio móvil estudia rocas, suelo y clima para reconstruir si Marte tuvo ambientes habitables.",
    objects: [
      "Rover Curiosity",
      "Laboratorio científico a bordo",
      "Muestras de rocas perforadas"
    ],
    source: "https://science.nasa.gov/mission/msl-curiosity/"
  },
  {
    id: "insight",
    name: "InSight",
    year: 2018,
    region: "Elysium Planitia",
    latitude: 4.5,
    longitude: 135.6,
    description:
      "InSight aterrizó en Elysium Planitia en 2018 para estudiar el interior de Marte. Su sismómetro SEIS registró más de 1.300 eventos sísmicos marcianos. La misión terminó en diciembre de 2022, cuando el polvo acumulado redujo la energía de sus paneles solares.",
    objects: [
      "Módulo de aterrizaje InSight",
      "Sismómetro SEIS",
      "Instrumento de flujo de calor HP3",
      "Más de 1.300 eventos sísmicos registrados"
    ],
    source: "https://science.nasa.gov/mission/insight/"
  }
];
