import Globe, { ConfigOptions, GlobeInstance } from "globe.gl";
import * as d3 from "d3";
import { CotwCountryData, convertGeoJsonToCountryData, GeoJson } from "./data";
import GEO_JSON from "./datasets/all.json";
import { Country } from "../game-object";

interface GameState {
  countries: CotwCountryData[],
  countriesComplete: number,

  timeRemaining: number,
  gameStarted: boolean,
  gameOver: boolean,
}

class GlobeManager {

  private root: HTMLElement;
  private instance: GlobeInstance;
  
  private static GLOBE_IMG_MAP_URL = '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
  
  private static POLY_ALTITUDE = 0.01;
  private static POLY_BASE_COLOR = 'rgba(0,0,0,0.3)';
  private static POLY_SIDE_COLOR = 'rgba(0,0,0,0.0)';
  private static POLY_STROKE_COLOR = 'rgba(0,0,0,1)';

  private static POLY_HOVER_ALTITUDE = 0.04;
  private static POLY_HOVER_COLOR = 'rgba(0,0,0,0.5)';
  private static POLY_HOVER_TRANSITION = 300;

  private static POLY_FAILED_COLOR = 'rgba(255, 56, 56, 0.8)';

  public constructor(root: HTMLElement) {
    this.root = root;
  }

  public draw(countryData: CotwCountryData[]): void {
 
    this.instance = Globe()
      .globeImageUrl(GlobeManager.GLOBE_IMG_MAP_URL)

      .lineHoverPrecision(0)
      .polygonsData(countryData)
      .polygonAltitude((country: any) => country.reveal && !country.found ? GlobeManager.POLY_HOVER_ALTITUDE : GlobeManager.POLY_ALTITUDE)
      .polygonCapColor((country: any) => {
        if (country.found && country.reveal) {
          return country.baseColor;
        }
        if (!country.found && !country.reveal) {
          return GlobeManager.POLY_BASE_COLOR;
        }

        // If the country was not found, but the game is over
        return GlobeManager.POLY_FAILED_COLOR;
        
      })
      .polygonSideColor((country: any) => country.reveal && !country.found ? GlobeManager.POLY_FAILED_COLOR : GlobeManager.POLY_SIDE_COLOR)
      .polygonStrokeColor(() => GlobeManager.POLY_STROKE_COLOR)
      .polygonLabel((country: any) => country.reveal ? country.properties.name : "???")

      (this.root);
  }

  public enableHoverPolys(): void {
    this.instance
      .onPolygonHover(hoverD => this.instance
        .polygonAltitude(d => d === hoverD ? GlobeManager.POLY_HOVER_ALTITUDE : GlobeManager.POLY_ALTITUDE)
        .polygonCapColor(d => d === hoverD ? GlobeManager.POLY_HOVER_COLOR : GlobeManager.POLY_BASE_COLOR)
    )
    .polygonsTransitionDuration(GlobeManager.POLY_HOVER_TRANSITION)
  }

  public update(countryData: CotwCountryData[]): void {
    this.instance.polygonsData(countryData);
  }

  public moveTo(position: { lat: number, lng: number }): void {
    const { lat, lng } = position;
    this.instance.pointOfView({ lat: lng, lng: lat });
  }

}

class GameStateManager {

  private gameState: GameState;
  private globeManager: GlobeManager;
  private gameTimerId: number;

  public constructor(countryData: CotwCountryData[], timeLimit: number = 900000) {
    this.gameState = {
      countries: countryData,
      countriesComplete: 0,
      timeRemaining: timeLimit,
      gameStarted: false,
      gameOver: false,
    }


    const globeDOMElement = document.querySelector<HTMLElement>("div#globe");
    this.globeManager = new GlobeManager(globeDOMElement);

  }

  public init(): void {
    this.globeManager.draw(this.gameState.countries); 
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
    window.clearInterval(this.gameTimerId);
    this.revealAll();
  }

  public revealAll(): void {
    for (const country of this.gameState.countries) {
        country.reveal = true;
    }    
    this.globeManager.update(this.gameState.countries);
  }

  public checkAnswerAndUpdate(searchKey: string): boolean {
    console.log(`[GameStateManager] Checking search key ${searchKey}`, { gameState: this.gameState });

    // ! Consider hashmap as this is computationally expensive (172 string matches per key change)
    for (const country of this.gameState.countries) {
  
      if (country.properties.name.toLowerCase() === searchKey.toLowerCase()) {

        if (country.found) {
          return false;
        }
        
        country.found = true;
        country.reveal = true;
        this.globeManager.update(this.gameState.countries);
        this.globeManager.moveTo(country.position);
        console.log(`[GameStateManager] Correct answer ${country.properties.name}`, { gameState: this.gameState });
        
        this.gameState.countriesComplete++;
        this.updateCounterDOM();

        return true;
      }
      
    }
    return false;
 }
 private updateCounterDOM(): void {
   const counter = document.querySelector("p#counter");
   counter.innerHTML = `${this.gameState.countriesComplete}/197`;
 }

 private updateTimerDOM(): void {
  const timer = document.querySelector("strong#time-remaining");

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

}

/** Init Game State Manager */

const processedCountries: CotwCountryData[] = convertGeoJsonToCountryData(GEO_JSON as GeoJson);
const manager = new GameStateManager(processedCountries, 5000);
manager.init();

/**
 * Configure Event Listeners
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
    }
  });
}

setInputEventListener();
setTimerEventListener();
//manager.revealAll();