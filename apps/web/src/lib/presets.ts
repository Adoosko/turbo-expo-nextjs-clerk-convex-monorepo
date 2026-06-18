export interface ChickenBreedPreset {
  presetId: string;
  name: string;
  description: string;
  color: string;
  imageUrl: string;
}

export const CHICKEN_BREED_PRESETS: ChickenBreedPreset[] = [
  {
    presetId: "leghornka",
    name: "Leghornka",
    description: "Snehobiela talianska nosnica s mimoriadne vysokou produkciou bielych vajec.",
    color: "#F9FAF5",
    imageUrl: "/chickens/leghornka.png",
  },
  {
    presetId: "vlaska",
    name: "Vlaška",
    description: "Tradičné otužilé plemeno s pestrým perím a vynikajúcou znáškou.",
    color: "#A87C53",
    imageUrl: "/chickens/vlaska.png",
  },
  {
    presetId: "araukana",
    name: "Araukana",
    description: "Bezchvosté plemeno z Čile známe znáškou jedinečných tyrkysových/zelených vajíčok.",
    color: "#7FA3A8",
    imageUrl: "/chickens/aurakana.png",
  },
  {
    presetId: "sussexka",
    name: "Sussexka",
    description: "Pokojné, kombinované plemeno s typickým svetlým perím a čiernym golierom.",
    color: "#E0E0D1",
    imageUrl: "/chickens/sussex.png",
  },
  {
    presetId: "maranska",
    name: "Maranska",
    description: "Francúzske robustné plemeno známe znáškou krásnych čokoládovo-hnedých vajíčok.",
    color: "#4A3B32",
    imageUrl: "/chickens/maranska-cierna.png",
  },
  {
    presetId: "plymutka",
    name: "Plymútka",
    description: "Odolné a pokojné plemeno s charakteristickým pásikavým (krahujcovým) vzorom peria.",
    color: "#6B7280",
    imageUrl: "/chickens/plymutka.png",
  },
  {
    presetId: "hodvabnicka",
    name: "Hodvábnička",
    description: "Okrasné mini-plemeno s nadýchaným perím podobným vlasom, modrou kožou a krotkou povahou.",
    color: "#F3F4F6",
    imageUrl: "/chickens/hodvabnicka.png",
  },
  {
    presetId: "kohut",
    name: "Kohút",
    description: "Ochranca a vodca kŕdľa, stará sa o bezpečnosť sliepok a ranné kikiríkanie.",
    color: "#C2410C",
    imageUrl: "/chickens/leghorn-kohut.png",
  },
  {
    presetId: "kuriatko",
    name: "Kuriatko",
    description: "Mladé kuriatka, ktoré sa nedávno vyliahli a zatiaľ nenášajú vajíčka.",
    color: "#EAB308",
    imageUrl: "/chickens/kuriatko.png",
  },
  {
    presetId: "kacka_diva",
    name: "Kačka divá",
    description: "Vodná hydina chovaná pre radosť a znášku špecifických vajíčok.",
    color: "#15803d",
    imageUrl: "/chickens/kacka-diva.png",
  },
];
