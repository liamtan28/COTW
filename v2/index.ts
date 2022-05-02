import Globe, { ConfigOptions, GlobeInstance } from "globe.gl";
import * as d3 from "d3";
import { CotwCountryData, convertGeoJsonToCountryData, GeoJson } from "./data";
import GEO_JSON from "./datasets/all.json";
import { Country } from "../game-object";

interface GameState {
  countries: CotwCountryData[],
  countriesComplete: number,
  timeRemaining: number,
}

class GlobeManager {

  private root: HTMLElement;
  private instance: GlobeInstance;
  
  private static GLOBE_IMG_MAP_URL = '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
  
  private static POLY_ALTITUDE = 0.01;
  private static POLY_BASE_COLOR = 'rgba(0,0,0,0.3)';
  private static POLY_SIDE_COLOR = 'rgba(0,0,0,0.3)';
  private static POLY_STROKE_COLOR = 'rgba(0,0,0,1)';

  private static POLY_HOVER_ALTITUDE = 0.04;
  private static POLY_HOVER_COLOR = 'rgba(0,0,0,0.5)';
  private static POLY_HOVER_TRANSITION = 300;

  public constructor(root: HTMLElement) {
    this.root = root;
  }

  public draw(countryData: CotwCountryData[]): void {
 
    this.instance = Globe()
      .globeImageUrl(GlobeManager.GLOBE_IMG_MAP_URL)

      .lineHoverPrecision(0)
      .polygonsData(countryData)
      .polygonAltitude(GlobeManager.POLY_ALTITUDE)
      .polygonCapColor((country: any) => country.isFound ? country.baseColor : GlobeManager.POLY_BASE_COLOR)
      .polygonSideColor(() => GlobeManager.POLY_SIDE_COLOR)
      .polygonStrokeColor(() => GlobeManager.POLY_STROKE_COLOR)
      .polygonLabel((country: any) => country.isFound ? country.properties.name : "???")

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
    this.instance
      .polygonsData(countryData)
      .polygonCapColor((country: any) => country.isFound ? country.baseColor : GlobeManager.POLY_BASE_COLOR)
  }

}

class GameStateManager {

  private gameState: GameState;
  private globeManager: GlobeManager;

  public constructor(countryData: CotwCountryData[], timeLimit: number = 900000) {
    this.gameState = {
      countries: countryData,
      countriesComplete: 0,
      timeRemaining: timeLimit,
    }


    const globeDOMElement = document.querySelector<HTMLElement>("div#globe");
    this.globeManager = new GlobeManager(globeDOMElement);

  }

  public init(): void {
    this.globeManager.draw(this.gameState.countries); 
  }

  public revealAll(): void {
    for (const country of this.gameState.countries) {
        country.isFound = true;
    }    
    this.globeManager.draw(this.gameState.countries);
  }

  public checkAnswerAndUpdate(searchKey: string): boolean {
    console.log(`[GameStateManager] Checking search key ${searchKey}`, { gameState: this.gameState });

    // ! Consider hashmap as this is computationally expensive (172 string matches per key change)
    for (const country of this.gameState.countries) {
  
      if (country.properties.name.toLowerCase() === searchKey.toLowerCase()) {
        country.isFound = true;
        this.globeManager.update(this.gameState.countries);
        console.log(`[GameStateManager] Correct answer ${country.properties.name}`, { gameState: this.gameState });
        return true;
      }
      
    }
    return false;
 }

}

/** Init Game State Manager */

const processedCountries: CotwCountryData[] = convertGeoJsonToCountryData(GEO_JSON as GeoJson);
const manager = new GameStateManager(processedCountries);
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

setInputEventListener();
//manager.revealAll();