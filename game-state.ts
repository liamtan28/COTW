import { CotwCountryData } from "./data";
import GlobeManager from "./globe";

export interface GameState {
    countries: CotwCountryData[],
    countriesComplete: number,
    alternativeCountryNames: Record<string, string>,

    timeRemaining: number,
  
    gameStarted: boolean,
    gameOver: boolean,
    displayingHelp: boolean,
    displayingGiveUp: boolean,
    displayingMissingCountries: boolean,
  }

export default class GameStateManager {

    private gameState: GameState;
    private globeManager: GlobeManager;
    private gameTimerId: number;
  
    public constructor(countryData: CotwCountryData[], alternativeCountryNames: Record<string, string>, timeLimit: number = 900000) {
      this.gameState = {
        countries: countryData,
        countriesComplete: 0,
        alternativeCountryNames,

        timeRemaining: timeLimit,
  
        gameStarted: false,
        gameOver: false,
        displayingHelp: true,
        displayingGiveUp: false,
        displayingMissingCountries: false,
      }
  
  
      const globeDOMElement = document.querySelector<HTMLElement>("div#globe");
      this.globeManager = new GlobeManager(globeDOMElement, countryData);
  
    }
  
    public init(): void {
      this.globeManager.draw(this.gameState.countries); 
      //this.updateCountryTableDOM();
      this.updateTimerDOM();
    }
  
    public get gameOver(): boolean {
      return this.gameState.gameOver;
    }
    public get gameStarted(): boolean {
      return this.gameState.gameStarted;
    }
    public get timeRemaining(): number {
      return this.gameState.timeRemaining;
    }
  
    public startGame(): void {
      this.gameState.gameStarted = true;
      this.updateTimerDOM();
      this.updateInputDOM();
      
      this.gameTimerId = window.setInterval(() => {
  
        this.gameState.timeRemaining -= 1000;
        this.updateTimerDOM();
  
        if (this.gameState.timeRemaining <= 0) {
          this.endGame();
        }
  
      }, 1000);
      console.log(`[GameStateManager] Starting game!`, { gameState: this.gameState }); 
    }
  
    public endGame(): void {
      this.gameState.gameOver = true;
      this.gameState.displayingGiveUp = false;
      window.clearInterval(this.gameTimerId);
      this.updateInputDOM();
      this.updateGiveUpDOM();
      this.revealAll();
    }
  
    public toggleDisplayMissingCountries(): void {
      this.gameState.displayingMissingCountries = !this.gameState.displayingMissingCountries;
      const missingCountries = this.gameState.displayingMissingCountries ? 
        this.gameState.countries.filter(c => !c.found) :
        [];
      this.globeManager.setMissingCountries(missingCountries);
    }
  
    public toggleHelp(): void {
      this.gameState.displayingHelp = !this.gameState.displayingHelp;
      this.updateHowToPlayDOM();
    }
  
    public toggleGiveUp(): void {
      if (!this.gameState.gameStarted || this.gameState.gameOver) return;
      this.gameState.displayingGiveUp = !this.gameState.displayingGiveUp;
      this.updateGiveUpDOM();
    }
  
    public revealAll(): void {
      for (const country of this.gameState.countries) {
          country.reveal = true;
      }    
      this.globeManager.update(this.gameState.countries);
    }
  
    public checkAnswerAndUpdate(searchKey: string): boolean {
      const _found = (country: CotwCountryData): boolean => {
        if (country.found) {
          return false;
        }
        
        country.found = true;
        country.reveal = true;
        this.globeManager.update(this.gameState.countries);
        this.globeManager.moveTo(country);
        console.log(`[GameStateManager] Correct answer ${country.properties.NAME}`, { gameState: this.gameState });
        
        this.gameState.countriesComplete++;
        this.updateCounterDOM();
        //this.updateCountryTableDOM();
        const missingCountries = this.gameState.displayingMissingCountries ? 
          this.gameState.countries.filter(c => !c.found) :
          [];
        this.globeManager.setMissingCountries(missingCountries);
        return true;
      }
  
      if (!this.gameStarted || this.gameState.gameOver) {
        return false;
      }
  
      console.log(`[GameStateManager] Checking search key ${searchKey}`, { gameState: this.gameState });
      const isAlternativeName = this.gameState.alternativeCountryNames.hasOwnProperty(searchKey.toLowerCase());
  
      // If the user input matches an alternative name
      if (isAlternativeName) {
        const realName = this.gameState.alternativeCountryNames[searchKey.toLowerCase()];
        const country = this.gameState.countries.find((country: CotwCountryData): boolean => {
          const nameLower = country.properties.NAME.toLowerCase();
          return realName === nameLower;
        });
  
        return _found(country);
      }
  
      // If the user input doesn't
      for (const country of this.gameState.countries) {
        const nameLower = country.properties.NAME.toLowerCase();
        const keyLower = searchKey.toLowerCase();
        if (nameLower === keyLower) {
          return _found(country);
        }
        
      }
      return false;
    }
  
    private updateCounterDOM(): void {
      const counter = document.querySelector("p#counter");
      counter.innerHTML = `${this.gameState.countriesComplete}/197`;
    }
  
    private updateHowToPlayDOM(): void {
      const blur = document.querySelector<HTMLElement>("div#how-to-play-blur");
      const window = document.querySelector<HTMLElement>("div#how-to-play");
  
      const value = this.gameState.displayingHelp ? "block" : "none";
  
      blur.style.display = value;
      window.style.display = value;
    }
  
    private updateGiveUpDOM(): void {
      const blur = document.querySelector<HTMLElement>("div#how-to-play-blur");
      const window = document.querySelector<HTMLElement>("div#give-up");
  
      const value = this.gameState.displayingGiveUp ? "block" : "none";
  
      blur.style.display = value;
      window.style.display = value;
    }
  
    private updateTimerDOM(): void {
      const control = document.querySelector<HTMLElement>("span.control#game-over");
      const timer = document.querySelector<HTMLElement>("strong#time-remaining");
  
      // Update color
      const fill = this.gameState.gameStarted ? "rgba(255, 56, 56, 0.8)" : "#000";
    
      control.style.color = fill;
      control.style.fill = fill;
  
      // Update time remaining in minutes
      let minutes = String(Math.floor(this.gameState.timeRemaining / 1000 / 60));
      let seconds = String(Math.round((parseInt(minutes, 10) - this.gameState.timeRemaining / 1000 / 60) * 60) * -1);
  
      if (minutes.length === 1) {
        minutes = "0" + minutes;
      }
      if (seconds.length === 1) {
        seconds = "0" + seconds;
      }
      timer.innerHTML = `${minutes}:${seconds}`;
    }
  
    private updateInputDOM(): void {
      const input = document.querySelector<HTMLInputElement>("input#answer");
      if (!this.gameState.gameStarted || this.gameState.gameOver) {
        input.disabled = true;
        return;
      }
      input.disabled = false;
    }
  }