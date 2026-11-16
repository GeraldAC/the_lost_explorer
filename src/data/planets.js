import { texture } from "three/src/nodes/accessors/TextureNode.js";

export const PLANETS = [
  {
    id: "mercury",
    name: "Mercurio",
    radius: 0.35,
    distance: 8,
    color: 0x99948d,
    speed: 0.42,
    texture:"/textures/planets/mercury.jpg"
  },
  {
    id: "venus",    
    name: "Venus",
    radius: 0.65,
    distance: 12,
    color: 0xd6b58a,
    speed: 0.31,
    texture:"/textures/planets/venus.jpg"
  },
  {
    id: "earth",
    name: "Tierra",
    radius: 0.72,
    distance: 17,
    color: 0x3778bf,
    speed: 0.25,
    texture:"/textures/planets/earth.jpg",
    destination: "moon"
  },
  {
    id: "mars",
    name: "Marte",
    radius: 0.53,
    distance: 23,
    color: 0xb65a39,
    speed: 0.2,
    destination: "mars",
    texture:"/textures/planets/mars.jpg"
  },
  {
    id: "jupiter",
    name: "Júpiter",
    radius: 2.1,
    distance: 32,
    color: 0xc49b75,
    speed: 0.11,
    texture:"/textures/planets/jupiter.jpg"
  },
  {
    id: "saturn",
    name: "Saturno",
    radius: 1.75,
    distance: 43,
    color: 0xd7bf86,
    speed: 0.08,
    rings: true,
    texture:"/textures/planets/saturn.jpg"
  },
  {
    id: "uranus",
    name: "Urano",
    radius: 1.15,
    distance: 53,
    color: 0x89d5d9,
    speed: 0.06,
    texture:"/textures/planets/uranus.jpg"
  },
  {
    id: "neptune",
    name: "Neptuno",
    radius: 1.1,
    distance: 63,
    color: 0x426ac4,
    speed: 0.045,
    texture:"/textures/planets/neptune.jpg"
  }
];
