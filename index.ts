import { CotwCountryData, convertGeoJsonToCountryData, GeoJson } from "./src/data";
import GEO_JSON from "./datasets/countries.json";
import ALTERNATIVES from "./datasets/alternatives.json";

import GameStateManager from "./src/game-state";

import { 
  setInputEventListener,
  setTimerEventListener,
  setHelpEventListeners,
  setGiveUpEventListeners,
  setMissingCountriesEventListeners,
} from "./src/listeners";

/** Init Game State Manager */

const processedCountries: CotwCountryData[] = convertGeoJsonToCountryData(GEO_JSON as unknown as GeoJson);
const manager = new GameStateManager(processedCountries, ALTERNATIVES);
manager.init();

setInputEventListener(manager);
setTimerEventListener(manager);
setHelpEventListeners(manager);
setGiveUpEventListeners(manager);
setMissingCountriesEventListeners(manager);