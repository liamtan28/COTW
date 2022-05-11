import Globe, { ConfigOptions, GlobeInstance } from "globe.gl";
import { CotwCountryData, convertGeoJsonToCountryData, GeoJson } from "./data";
import GEO_JSON from "./datasets/countries.json";
import ALTERNATIVES from "./datasets/alternatives.json";
import * as THREE from "three";
const deploy = false;

interface GameState {
  countries: CotwCountryData[],
  countriesComplete: number,

  timeRemaining: number,

  gameStarted: boolean,
  gameOver: boolean,
  displayingHelp: boolean,
  displayingGiveUp: boolean,
  displayingMissingCountries: boolean,
}

class GlobeManager {

  private root: HTMLElement;
  private instance: GlobeInstance;
  
  private static GLOBE_IMG_MAP_URL = deploy ? './img/earth-blue-marble.jpg' : '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
  private static BUMP_MAP_URL = deploy ? './img/earth-topology.png' : '//unpkg.com/three-globe/example/img/earth-topology.png';
;  private static WATER_BUMP_MAP_URL = deploy ? './img/earth-water.png' : '//unpkg.com/three-globe/example/img/earth-water.png';
  private static POLY_ALTITUDE = 0.01;
  private static POLY_BASE_COLOR = 'rgba(0,0,0,0.3)';
  private static POLY_SIDE_COLOR = 'rgba(200,200,200,0.5)';
  private static POLY_STROKE_COLOR = 'rgba(200,200,200,0.5)';
  private static HIGHLIGHT_COLOR = 'rgba(255,255,255,0.4)'; // Labels for small countries that need a highligh

  private static POLY_HOVER_ALTITUDE = 0.04;
  private static POLY_HOVER_COLOR = 'rgba(0,0,0,0.5)';
  private static POLY_HOVER_TRANSITION = 300;

  private static POLY_FAILED_COLOR = 'rgba(255, 56, 56, 1.0)';

  private missingCountries: CotwCountryData[];
  private highlightCountries: CotwCountryData[];

  public constructor(root: HTMLElement, data: CotwCountryData[]) {
    this.root = root;
    this.highlightCountries = data.filter(c => c.highlight);
    this.missingCountries = [];
  }

  public draw(countryData: CotwCountryData[]): void {
 
    this.instance = Globe()
 

      .globeImageUrl(GlobeManager.GLOBE_IMG_MAP_URL)
      .bumpImageUrl(GlobeManager.BUMP_MAP_URL)
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
      .polygonSideColor((country: any) => country.reveal && !country.found ? GlobeManager.POLY_FAILED_COLOR : country.baseColor)
      .polygonStrokeColor(() => GlobeManager.POLY_STROKE_COLOR)
      .polygonLabel((country: any) => country.reveal ? country.properties.NAME : "???")

      .labelsData(this.missingCountries.concat(this.highlightCountries))
      .labelLat(d => d.position.lat)
      .labelLng(d => d.position.lng)
      .labelText(() => "")
      .labelSize(d => Math.sqrt(1000000) * 4e-4)
      .labelDotRadius(d => d.highlight ? Math.sqrt(10000000 * d.highlight) * 4e-4 : Math.sqrt(1000000) * 4e-4)
      .labelColor((c) => 
        c.highlight ? 
          (c.found ? c.baseColor : GlobeManager.HIGHLIGHT_COLOR) : 
          GlobeManager.POLY_FAILED_COLOR
      )
      .labelResolution(2)
      .labelAltitude(0.00)
      (this.root);

      this.loadCustomTextures();
  }

  private loadCustomTextures(): void {
    const globeMaterial = this.instance.globeMaterial();
    globeMaterial.bumpScale = 10;
    new THREE.TextureLoader().load(GlobeManager.WATER_BUMP_MAP_URL, texture => {
      globeMaterial.specularMap = texture;
      globeMaterial.specular = new THREE.Color('grey');
      globeMaterial.shininess = 15;
    });

    setTimeout(() => { // wait for scene to be populated (asynchronously)
      const directionalLight = this.instance.scene().children.find(obj3d => obj3d.type === 'DirectionalLight');
      directionalLight && directionalLight.position.set(1, 1, 1); // change light position to see the specularMap's effect
    });
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
  public setMissingCountries(missingCountries: CotwCountryData[]): void {
    this.missingCountries = missingCountries;
    this.instance.labelsData(this.missingCountries.concat(this.highlightCountries));
  }

  public moveTo(country: CotwCountryData, ms: number = 250): void {
    const centre = GlobeManager.findCentre(country);
    this.instance.pointOfView(centre, ms);
  }

  private static findCentre(country: CotwCountryData) {
      const { bbox } = country;
      const [lng1, lat1, lng2, lat2] = bbox;
      const latitude = (lat1 + lat2) / 2;
      const longitude = (lng1 + lng2) / 2;
      return { lat: latitude, lng: longitude };
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
    const isAlternativeName = ALTERNATIVES.hasOwnProperty(searchKey.toLowerCase());

    // If the user input matches an alternative name
    if (isAlternativeName) {
      const realName = ALTERNATIVES[searchKey.toLowerCase()];
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

  /*
  private updateCountryTableDOM(): void {
    const table = document.querySelector<HTMLElement>("div#country-table");
    const countries = this.gameState.countries;
    table.querySelectorAll('section p').forEach(i => i.remove());
    for (const country of countries) {
      const entry = document.createElement("p");
      const continent = country.properties.CONTINENT.toLowerCase().replace(/ /g, '');
      entry.innerHTML = country.found ? country.properties.NAME : "&nbsp;";
      table.querySelector(`section#${continent}`).appendChild(entry);

    }
  }
  */

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

/** Init Game State Manager */

const processedCountries: CotwCountryData[] = convertGeoJsonToCountryData(GEO_JSON as unknown as GeoJson);
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