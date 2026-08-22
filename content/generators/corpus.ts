/**
 * Shared surface detail for word problems: names, settings, and units.
 *
 * Keeping these in one place means a generated form reads like a real test
 * paper — varied contexts, no repeated cast of characters — without every
 * template carrying its own list.
 */
export const NAMES = [
  "Amara", "Beatriz", "Chen", "Dmitri", "Elena", "Farrah", "Gideon", "Hana",
  "Idris", "Jelena", "Kwame", "Lucia", "Mateo", "Nadia", "Omar", "Priya",
  "Quentin", "Rosa", "Samuel", "Tariq", "Uma", "Vikram", "Wren", "Ximena",
  "Yusuf", "Zara", "Anika", "Bodhi", "Camila", "Desmond", "Esi", "Freya",
  "Gustavo", "Halima", "Ingrid", "Javier", "Keiko", "Leandro", "Maia", "Niko",
];

export const ORGANIZATIONS = [
  "a community garden", "a campus bookstore", "a neighborhood bakery",
  "a science museum", "a bicycle repair shop", "a public library",
  "a coastal research station", "a printing cooperative", "a farmers market stall",
  "a recycling center", "a robotics club", "a wildlife rehabilitation center",
];

export const ITEMS = [
  { singular: "notebook", plural: "notebooks" },
  { singular: "seedling", plural: "seedlings" },
  { singular: "ticket", plural: "tickets" },
  { singular: "poster", plural: "posters" },
  { singular: "sensor", plural: "sensors" },
  { singular: "canister", plural: "canisters" },
  { singular: "sample", plural: "samples" },
  { singular: "tile", plural: "tiles" },
  { singular: "bracket", plural: "brackets" },
  { singular: "cartridge", plural: "cartridges" },
  { singular: "seed packet", plural: "seed packets" },
  { singular: "water bottle", plural: "water bottles" },
];

export const TIME_UNITS = [
  { singular: "hour", plural: "hours" },
  { singular: "day", plural: "days" },
  { singular: "week", plural: "weeks" },
  { singular: "month", plural: "months" },
  { singular: "minute", plural: "minutes" },
];

export const MEASURED_QUANTITIES = [
  { quantity: "the volume of water in the tank", unit: "liters", symbol: "V" },
  { quantity: "the height of the plant", unit: "centimeters", symbol: "h" },
  { quantity: "the distance from the trailhead", unit: "kilometers", symbol: "d" },
  { quantity: "the temperature of the sample", unit: "degrees Celsius", symbol: "T" },
  { quantity: "the mass of the culture", unit: "grams", symbol: "m" },
  { quantity: "the balance in the account", unit: "dollars", symbol: "B" },
  { quantity: "the number of subscribers", unit: "subscribers", symbol: "S" },
  { quantity: "the pressure in the chamber", unit: "kilopascals", symbol: "P" },
];

export const SPECIES = [
  "kelp", "coral polyps", "mycelium", "cyanobacteria", "sea urchins",
  "mangrove seedlings", "monarch caterpillars", "yeast", "lichen", "tadpoles",
];

export const CITY_SETTINGS = [
  "Riverton", "Ashfield", "Port Clara", "Winslow", "Cedar Hollow",
  "Marisol Bay", "Fairbrook", "Kestrel Ridge", "Lakemont", "Dunmore",
];
