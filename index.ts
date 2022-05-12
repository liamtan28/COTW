import { CotwCountryData, convertGeoJsonToCountryData, GeoJson } from "./src/data";
import GEO_JSON from "./datasets/countries.json";
import ALTERNATIVES from "./datasets/alternatives.json";

import GameStateManager from "./src/game-state";

import { 
  bindListeners,
} from "./src/listeners";

const processedCountries: CotwCountryData[] = convertGeoJsonToCountryData(GEO_JSON as unknown as GeoJson);
const manager = new GameStateManager(processedCountries, ALTERNATIVES);
manager.init();

bindListeners(manager);