import { CotwCountryData, convertGeoJsonToCountryData, GeoJson } from "./data";
import GEO_JSON from "./datasets/countries.json";
import ALTERNATIVES from "./datasets/alternatives.json";

import GameStateManager from "./game-state";

/** Init Game State Manager */

const processedCountries: CotwCountryData[] = convertGeoJsonToCountryData(GEO_JSON as unknown as GeoJson);
const manager = new GameStateManager(processedCountries, ALTERNATIVES);
manager.init();

/**
 * Bind DOM elements to manager actions
 */

const setInputEventListener = () => {
  const input = document.querySelector<HTMLInputElement>("input#answer");
   input.addEventListener("keyup", () => {
        const searchKey = input.value.toLowerCase();
        const found = manager.checkAnswerAndUpdate(searchKey);
        if (found) {
           input.value = "";
        }
   });
}

const setTimerEventListener = () => {
  const timerButton = document.querySelector<HTMLElement>("span.control#game-over");

  timerButton.addEventListener("click", () => {
    if (!manager.gameStarted) {
      manager.startGame();
    } else {
      manager.toggleGiveUp();
    }
  });
}

const setHelpEventListeners = () => {
  const helpButton = document.querySelector<HTMLElement>("span.control#help");
  const dismissButton = document.querySelector<HTMLElement>("div#how-to-play button");

  helpButton.addEventListener("click", () => manager.toggleHelp());
  dismissButton.addEventListener("click", () => manager.toggleHelp());
}

const setGiveUpEventListeners = () => {
  const giveUpConfirm = document.querySelector<HTMLElement>("button#confirm-give-up");
  const giveUpCancel = document.querySelector<HTMLElement>("button#cancel-give-up");

  giveUpConfirm.addEventListener("click", () => manager.endGame());
  giveUpCancel.addEventListener("click", () => manager.toggleGiveUp());
}
const setMissingCountriesEventListeners = () => {
  const counter = document.querySelector<HTMLElement>("p#counter");
  counter.addEventListener("click", () => manager.toggleDisplayMissingCountries());
}

setInputEventListener();
setTimerEventListener();
setHelpEventListeners();
setGiveUpEventListeners();
setMissingCountriesEventListeners();