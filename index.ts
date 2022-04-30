import { default as mapData } from "./map-data.json";
import { ELEMENT_DICT } from "./element-dict";
import { ContinentMarker, Country, OceanMarker } from "./game-object";
import { setViewBoxEventListeners, setZoomEventListeners } from "./map-controls";

enum Continent {
   NORTH_AMERICA = "N. America",
   SOUTH_AMERICA = "S. America",
   EUROPE = "Europe",
   ASIA = "Asia",
   AFRICA = "Africa",
   OCEANIA = "Oceania",
}

type MapData = {
   continents: Record<Continent, {
      x: number,
      y: number,
      uniqueCountryCount: number,
      countries: Record<string, {
         id: string,
         title: string,
         svgPath: string,
         continent: Continent,
         acceptedNames: string[],
         fill: string,
      }>
   }>,
   oceans: {
      x: string,
      y: string,
      title: string,
   }[],
}

/***
 * REV2
 */

type GameState = Record<Continent, {
      numFoundCountries: number,
      totalNumCountries: number,
      marker: ContinentMarker,
      isComplete: boolean,
      countryMap: Record<string, Country>
   }
>;

class GameStateManager {

   private gameState: GameState = {
      [Continent.NORTH_AMERICA]: {
         numFoundCountries: 0,
         totalNumCountries: 0,
         isComplete: false,
         marker: null,
         countryMap: {},
      },
      [Continent.SOUTH_AMERICA]: {
         numFoundCountries: 0,
         totalNumCountries: 0,
         isComplete: false,
         marker: null,
         countryMap: {},
      },
      [Continent.EUROPE]: {
         numFoundCountries: 0,
         totalNumCountries: 0,
         isComplete: false,
         marker: null,
         countryMap: {},
      },
      [Continent.ASIA]: {
         numFoundCountries: 0,
         totalNumCountries: 0,
         isComplete: false,
         marker: null,
         countryMap: {},
      },
      [Continent.AFRICA]: {
         numFoundCountries: 0,
         totalNumCountries: 0,
         isComplete: false,
         marker: null,
         countryMap: {},
      },
      [Continent.OCEANIA]: {
         numFoundCountries: 0,
         totalNumCountries: 0,
         isComplete: false,
         marker: null,
         countryMap: {},
      },
   }

   public constructor(mapData: MapData) {
      console.log(`[GameStateManager] Creating instance`, { mapData });
      
      for (const [title, data] of Object.entries(mapData.continents)) {
         Object.defineProperty(this.gameState, title, {});

         // Set Continent property in game state
         this.gameState[title] = {
            ...this.gameState[title], // Use default values
            totalNumCountries: data.uniqueCountryCount,
         }

         const marker = new ContinentMarker(title, data.uniqueCountryCount, data.x, data.y);
         this.gameState[title].marker = marker;

         // Set country properties on continent
         for (const country of Object.values(data.countries)) {
            const countryInstance = new Country({
               id: country.id,
               title: country.title,
               acceptedNames: country.acceptedNames,
               continent: country.continent,
            },
            country.svgPath,
            country.fill,
            );

            this.gameState[title].countryMap[country.title.toLowerCase()] = countryInstance;
         }
      }
      console.log(`[GameStateManager] Processed JSON`, { gameState: this.gameState });
   }

   public drawMap(): void {
      const map = ELEMENT_DICT.map() as SVGElement;
      const mapPathGroup = ELEMENT_DICT.mapPathGroup() as SVGElement;

      for(const continent of Object.keys(this.gameState)) {
         const continentData: Record<string, Country> = this.gameState[continent];
         
         continentData.marker.draw(map);
         
         for (const country of Object.values(continentData.countryMap)) {
            country.draw(mapPathGroup);
         }
      }
   }

   public checkAnswerAndUpdate(searchKey: string): boolean {
      for (const continent of Object.keys(this.gameState)) {
         const continentData: Record<string, Country> = this.gameState[continent].countryMap;

         if (!continentData.hasOwnProperty(searchKey)) {
            continue;
         }
         const country = continentData[searchKey];

         if (country.found) {
            return false;
         }

         country.setFound(true);
         this.removeDuplicateCountries(country);

         const map = ELEMENT_DICT.map() as SVGElement;
         const mapPathGroup = ELEMENT_DICT.mapPathGroup() as SVGElement;
         country.clear(mapPathGroup);
         country.draw(mapPathGroup);

         this.gameState[country.continent].numFoundCountries++;

         // Update continent marker in DOM.
         this.gameState[country.continent].marker.incrementScore();
         this.gameState[country.continent].marker.clear(map);
         this.gameState[country.continent].marker.draw(map);

         this.updateScoreboard(country);
         this.updateCounters();

         console.log(`[GameStateManager] Correct answer ${country.title}`, { gameState: this.gameState });
         return true;
      }
      return false;
   }

   public gameOver(): void {
      console.log(`[GameStateManager] Game over`, { gameState: this.gameState });
      for (const continent of Object.keys(this.gameState)) {
         const continentData: Record<string, Country> = this.gameState[continent].countryMap;

         for(const country of Object.values(continentData)) {
            if (!country.found) {
               this.updateScoreboard(country);
               this.removeDuplicateCountries(country);
            }
         }      
      }

      // Remove all elements and replace in alphabetical order.
      // !TODO this is pretty inefficent. Probably need to come up with a way to inst
      // ! BUG doesn't delete duplicates
      const entries = document.querySelectorAll('.scoreboard-entry');
      const sortedEntries = Array.from(entries).sort((a, b) => a.textContent.localeCompare(b.textContent));
      this.clearScoreboard();
      for(const entry of sortedEntries) {
         const querySelector = entry.getAttribute("data-continent")
            .toLowerCase()
            .replace(/. /g, '');

         const scoreboardSection = ELEMENT_DICT.scoreboardSectionByContinent(querySelector);
         scoreboardSection.appendChild(entry);
       
      }
      console.log({sortedEntries});
      
   }

   private removeDuplicateCountries(country: Country): void {
      console.log(`[GameStateManager] Removing duplicates`, { duplicates: country.otherNames })
      for (const name of country.otherNames) {
         delete this.gameState[country.continent].countryMap[name.toLowerCase()];
      }
   }

   private updateScoreboard(country: Country): void {
         // Update scoreboard
         const querySelector = country.continent
            .toLowerCase()
            .replace(/. /g, '')
         ;
         const scoreboardSection = ELEMENT_DICT.scoreboardSectionByContinent(querySelector);
      
         const node = document.createElement("p");
         node.innerHTML = country.title;
         node.className = country.found ? "scoreboard-entry" : "scoreboard-entry scoreboard-entry-missed";
         node.setAttribute("data-continent", country.continent);
         scoreboardSection.appendChild(node);
   }

   private clearScoreboard(): void {
      const scoreboardSections = document.querySelectorAll('section.scoreboard__continent-container');

      scoreboardSections.forEach(section => section.innerHTML = null);
   }

   private updateCounters(): void {
      const counter = ELEMENT_DICT.counter() as HTMLElement;
      const count = Object.values(this.gameState).reduce((prev, curr) => prev + curr.numFoundCountries, 0);
      counter.innerHTML = `${count}/197`;  
   }
}

const setInputEventListener = (game: GameStateManager) => {
   const input = document.querySelector<HTMLInputElement>("input#answer");

    input.addEventListener("keyup", () => {
         const searchKey = input.value.toLowerCase();
         const found = game.checkAnswerAndUpdate(searchKey);
         if (found) {
            input.value = "";
         }
    });
}

const game: GameStateManager = new GameStateManager(mapData as unknown as MapData);
game.drawMap();

/****************
 * OCEAN MARKERS
 */
const map = ELEMENT_DICT.map() as SVGElement;

for (const ocean of mapData.oceans) {
   const marker = new OceanMarker(ocean.title, ocean.x, ocean.y);
   marker.draw(map);
}

const setFinishEventListener = (game: GameStateManager) => {
   const finishButton = ELEMENT_DICT.gameOver() as HTMLElement;

   finishButton.addEventListener("click", () => game.gameOver());
}


setInputEventListener(game);
setViewBoxEventListeners();
setZoomEventListeners();
setFinishEventListener(game);


// class Game 
{

//    private static SVG_NAMESPACE = "http://www.w3.org/2000/svg";

//    private viewPort: {
//       x: number;
//       y: number;
//       width: number;
//       height: number;
//    }

//    private scoreboard: Record<Continent, string[]> = {
//       [Continent.ASIA]: [],
//       [Continent.NORTH_AMERICA]: [],
//       [Continent.SOUTH_AMERICA]: [],
//       [Continent.EUROPE]: [],
//       [Continent.AFRICA]: [],
//       [Continent.OCEANIA]: [],
//       [Continent.NOT_APPLICABLE]: [],
//    }
//    private static targettotalNumCountries: Record<Continent, number> = {
//       [Continent.ASIA]: 49,
//       [Continent.NORTH_AMERICA]: 23,
//       [Continent.SOUTH_AMERICA]: 12,
//       [Continent.EUROPE]: 45,
//       [Continent.AFRICA]: 54,
//       [Continent.OCEANIA]: 14,
//       [Continent.NOT_APPLICABLE]: 0,
//    }
//    private completeCountries: number = 0;

//    private static COLOR_INDEX: Record<Continent, string[]> = {
//       [Continent.ASIA]: ["#fc5c65", "#eb3b5a"],
//       [Continent.NORTH_AMERICA]: ["#fd9644", "#fa8231"],
//       [Continent.SOUTH_AMERICA]: [ "#fed330", "#f7b731"],
//       [Continent.EUROPE]: ["#26de81", "#20bf6b"],
//       [Continent.AFRICA]: ["#4b7bec", "#3867d6"],
//       [Continent.OCEANIA]: ["#a55eea", "#8854d0"],
//       [Continent.NOT_APPLICABLE]: ["#778ca3", "#4b6584"],
//    };

//    public constructor(width: number, height: number, originX: number, originY: number) {
//       this.viewPort = {
//          width,
//          height,
//          x: originX,
//          y: originY,
//       };
//    }

//    /********************
//     * GAME UPDATES
//     */

//    public updateScoreboard(): void {
//       // TODO dynamically add sections to html with id of enum. That 
//       // way only one loop required.

//       const asiaSection = ELEMENT_DICT.scoreboardSectionByContinent("asia") as HTMLElement;
//       const northAmericaSection = ELEMENT_DICT.scoreboardSectionByContinent("northamerica") as HTMLElement;
//       const southAmericaSection = ELEMENT_DICT.scoreboardSectionByContinent("southamerica") as HTMLElement;
//       const europeSection = ELEMENT_DICT.scoreboardSectionByContinent("europe") as HTMLElement;
//       const africaSection = ELEMENT_DICT.scoreboardSectionByContinent("africa") as HTMLElement;
//       const oceaniaSection = ELEMENT_DICT.scoreboardSectionByContinent("oceania") as HTMLElement;
//       const miscSection = ELEMENT_DICT.scoreboardSectionByContinent("misc") as HTMLElement;

//       asiaSection.innerHTML = "";
//       for (const country of this.scoreboard[Continent.ASIA]) {
//          const entry = document.createElement("p");
//          entry.innerHTML = country;
//          entry.className = "scoreboard__continent-entry";
//          asiaSection.appendChild(entry);  
//       }
//    }

//    private colorCountry(country: Country): void {
//       const palette = Game.COLOR_INDEX[country.continent];
//       // Select either the 0th or nth index of the palette at random.
//       const color = palette[Math.floor(Math.random() * palette.length)];
//       (<NodeListOf<SVGPathElement>>ELEMENT_DICT.pathsById(country.id)).forEach(e => e.style.fill = color);
//    }

//    private markCountryAsComplete(country: Country): void {
//       (<NodeListOf<SVGPathElement>>ELEMENT_DICT.pathsById(country.id)).forEach(e => e.setAttribute("data-found", "true"));
//       this.scoreboard[country.continent].push(country.title);
//    }

//    private addCountryToHistory(country: Country): void {
//       const historyElement = ELEMENT_DICT.history() as Element;
//       const palette = Game.COLOR_INDEX[country.continent];
//       const color = palette[Math.floor(Math.random() * palette.length)];
   
//       if (this.completeCountries === 1) {
//          historyElement.innerHTML = "";
//       }
//       const countryEntryElement = document.createElement("p");
//       countryEntryElement.className = "country-entry";
//       countryEntryElement.style.background = color;
   
//       countryEntryElement.innerHTML = `<strong>${this.completeCountries}</strong> ${country.title}`;
   
//       historyElement.prepend(countryEntryElement);
//       historyElement.scrollTop = 0;
   
//    }

//    private deleteCountryAndDuplicates(country: Country): void {
//       delete countryHashMap[country.title.toLowerCase()];
//       if (country.acceptedNames) {
//          for (const name of country.acceptedNames) {
//             if (countryHashMap.hasOwnProperty(name.toLowerCase())) {
//                delete countryHashMap[name.toLowerCase()];
//             }
//          }
//       }
//    }

//    private updateCounters(country: Country): void {
//       (ELEMENT_DICT.counter() as Element).innerHTML = `${this.completeCountries}/197`; 
//       // TODO autogenerate these markers to have the continent enum as part of it
//       (ELEMENT_DICT.countryCounter(country.continent) as SVGElement).innerHTML = `(${this.scoreboard[country.continent].length}/${Game.targettotalNumCountries[country.continent]})`;
//    } 






// const setMouseOverEventListener = (game: Game) => {
//    const countryPanel = ELEMENT_DICT.countryPanel() as HTMLElement;

//    for(const country of Object.values(countryHashMap)) {
//       const countryElements = ELEMENT_DICT.pathsById(country.id) as NodeListOf<SVGPathElement>;
      
//       countryElements.forEach(element => {

//          element.addEventListener("mouseenter", () => {     

//             document.querySelector("body").style.cursor = "pointer";
//             element.style.opacity = 0.5;
//             // TODO CHANGE THIS TO CONSTANT VALUE
//             if (element.getAttribute("data-found") === "true") {
//                countryPanel.innerHTML = `<strong>${country.title}</strong>`;
//             }

//          });
//          element.addEventListener("mouseleave", () => {

//             document.querySelector("body").style.cursor = "auto";
//             element.style.opacity = 1.0;
//             countryPanel.innerHTML = `<strong>...</strong>`;

//          });
//       });
//   }
// }
