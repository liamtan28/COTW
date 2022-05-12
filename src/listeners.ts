import GameStateManager from "./game-state";

export const setInputEventListener = (manager: GameStateManager) => {
    const input = document.querySelector<HTMLInputElement>("input#answer");
    input.addEventListener("keyup", () => {
        const searchKey = input.value.toLowerCase();
        const found = manager.checkAnswerAndUpdate(searchKey);
        if (found) {
            input.value = "";
        }
    });
}
  
export const setTimerEventListener = (manager: GameStateManager) => {
    const timerButton = document.querySelector<HTMLElement>("span.control#game-over");

    timerButton.addEventListener("click", () => {
        if (!manager.gameStarted) {
            manager.startGame();
        } else {
            manager.toggleGiveUp();
        }
    });
}
  
export const setHelpEventListeners = (manager: GameStateManager) => {
    const helpButton = document.querySelector<HTMLElement>("span.control#help");
    const dismissButton = document.querySelector<HTMLElement>("div#how-to-play button");
  
    helpButton.addEventListener("click", () => manager.toggleHelp());
    dismissButton.addEventListener("click", () => manager.toggleHelp());
}
  
export const setGiveUpEventListeners = (manager: GameStateManager) => {
    const giveUpConfirm = document.querySelector<HTMLElement>("button#confirm-give-up");
    const giveUpCancel = document.querySelector<HTMLElement>("button#cancel-give-up");
  
    giveUpConfirm.addEventListener("click", () => manager.endGame());
    giveUpCancel.addEventListener("click", () => manager.toggleGiveUp());
}

export const setMissingCountriesEventListeners = (manager: GameStateManager) => {
    const counter = document.querySelector<HTMLElement>("p#counter");
    counter.addEventListener("click", () => manager.toggleDisplayMissingCountries());
}