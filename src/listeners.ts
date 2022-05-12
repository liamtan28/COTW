import GameStateManager from "./game-state";

const setInputEventListener = (manager: GameStateManager) => {
    const input = document.querySelector<HTMLInputElement>("input#answer");
    input.addEventListener("keyup", () => {
        const searchKey = input.value.toLowerCase();
        const found = manager.checkAnswerAndUpdate(searchKey);
        if (found) {
            input.value = "";
        }
    });
}
  
const setTimerEventListener = (manager: GameStateManager) => {
    const timerButton = document.querySelector<HTMLElement>("span.control#game-over");

    timerButton.addEventListener("click", () => {
        if (!manager.gameStarted) {
            manager.startGame();
        } else {
            manager.toggleGiveUp();
        }
    });
}
  
const setExplanationEventListeners = (manager: GameStateManager) => {
    const dismissButton = document.querySelector<HTMLElement>("div#how-to-play button");
    dismissButton.addEventListener("click", () => manager.toggleExplanation());
}
  
const setGiveUpEventListeners = (manager: GameStateManager) => {
    const giveUpConfirm = document.querySelector<HTMLElement>("button#confirm-give-up");
    const giveUpCancel = document.querySelector<HTMLElement>("button#cancel-give-up");
  
    giveUpConfirm.addEventListener("click", () => manager.endGame());
    giveUpCancel.addEventListener("click", () => manager.toggleGiveUp());
}

const setMissingCountriesEventListeners = (manager: GameStateManager) => {
    const help = document.querySelector<HTMLElement>("span.control#help");
    help.addEventListener("click", () => manager.toggleDisplayMissingCountries());
}

const listeners = [
    setInputEventListener,
    setTimerEventListener,
    setExplanationEventListeners,
    setGiveUpEventListeners,
    setMissingCountriesEventListeners
];

export const bindListeners = (manager: GameStateManager): void => {
    for (const listener of listeners) {
        listener(manager);
    }
}