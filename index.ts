import { default as countryHashMap } from "./map-data.json";
import { ELEMENT_DICT } from "./element-dict";
import { setViewBoxEventListeners, setZoomEventListeners } from "./map-controls";

enum Continent {
   NORTH_AMERICA,
   SOUTH_AMERICA,
   EUROPE,
   ASIA,
   AFRICA,
   OCEANIA,
   NOT_APPLICABLE,
}

class Game {

   private static SVG_NAMESPACE = "http://www.w3.org/2000/svg";

   private viewPort: {
      x: number;
      y: number;
      width: number;
      height: number;
   }

   private scoreboard: Record<Continent, string[]> = {
      [Continent.ASIA]: [],
      [Continent.NORTH_AMERICA]: [],
      [Continent.SOUTH_AMERICA]: [],
      [Continent.EUROPE]: [],
      [Continent.AFRICA]: [],
      [Continent.OCEANIA]: [],
      [Continent.NOT_APPLICABLE]: [],
   }
   private static targetNumCountries: Record<Continent, number> = {
      [Continent.ASIA]: 49,
      [Continent.NORTH_AMERICA]: 23,
      [Continent.SOUTH_AMERICA]: 12,
      [Continent.EUROPE]: 45,
      [Continent.AFRICA]: 54,
      [Continent.OCEANIA]: 14,
      [Continent.NOT_APPLICABLE]: 0,
   }
   private completeCountries: number = 0;

   private static COLOR_INDEX: Record<Continent, string[]> = {
      [Continent.ASIA]: ["#fc5c65", "#eb3b5a"],
      [Continent.NORTH_AMERICA]: ["#fd9644", "#fa8231"],
      [Continent.SOUTH_AMERICA]: [ "#fed330", "#f7b731"],
      [Continent.EUROPE]: ["#26de81", "#20bf6b"],
      [Continent.AFRICA]: ["#4b7bec", "#3867d6"],
      [Continent.OCEANIA]: ["#a55eea", "#8854d0"],
      [Continent.NOT_APPLICABLE]: ["#778ca3", "#4b6584"],
   };

   public constructor(width: number, height: number, originX: number, originY: number) {
      this.viewPort = {
         width,
         height,
         x: originX,
         y: originY,
      };
   }

   /********************
    * GAME UPDATES
    */

   public updateScoreboard(): void {
      // TODO dynamically add sections to html with id of enum. That 
      // way only one loop required.

      const asiaSection = ELEMENT_DICT.scoreboardSectionByContinent("asia") as HTMLElement;
      const northAmericaSection = ELEMENT_DICT.scoreboardSectionByContinent("northamerica") as HTMLElement;
      const southAmericaSection = ELEMENT_DICT.scoreboardSectionByContinent("southamerica") as HTMLElement;
      const europeSection = ELEMENT_DICT.scoreboardSectionByContinent("europe") as HTMLElement;
      const africaSection = ELEMENT_DICT.scoreboardSectionByContinent("africa") as HTMLElement;
      const oceaniaSection = ELEMENT_DICT.scoreboardSectionByContinent("oceania") as HTMLElement;
      const miscSection = ELEMENT_DICT.scoreboardSectionByContinent("misc") as HTMLElement;

      asiaSection.innerHTML = "";
      for (const country of this.scoreboard[Continent.ASIA]) {
         const entry = document.createElement("p");
         entry.innerHTML = country;
         entry.className = "scoreboard__continent-entry";
         asiaSection.appendChild(entry);  
      }
   }

   private colorCountry(country: Country): void {
      const palette = Game.COLOR_INDEX[country.continent];
      // Select either the 0th or nth index of the palette at random.
      const color = palette[Math.floor(Math.random() * palette.length)];
      (<NodeListOf<SVGPathElement>>ELEMENT_DICT.pathsById(country.id)).forEach(e => e.style.fill = color);
   }

   private markCountryAsComplete(country: Country): void {
      (<NodeListOf<SVGPathElement>>ELEMENT_DICT.pathsById(country.id)).forEach(e => e.setAttribute("data-found", "true"));
      this.scoreboard[country.continent].push(country.title);
   }

   private addCountryToHistory(country: Country): void {
      const historyElement = ELEMENT_DICT.history() as Element;
      const palette = Game.COLOR_INDEX[country.continent];
      const color = palette[Math.floor(Math.random() * palette.length)];
   
      if (this.completeCountries === 1) {
         historyElement.innerHTML = "";
      }
      const countryEntryElement = document.createElement("p");
      countryEntryElement.className = "country-entry";
      countryEntryElement.style.background = color;
   
      countryEntryElement.innerHTML = `<strong>${this.completeCountries}</strong> ${country.title}`;
   
      historyElement.prepend(countryEntryElement);
      historyElement.scrollTop = 0;
   
   }

   private deleteCountryAndDuplicates(country: Country): void {
      delete countryHashMap[country.title.toLowerCase()];
      if (country.acceptedNames) {
         for (const name of country.acceptedNames) {
            if (countryHashMap.hasOwnProperty(name.toLowerCase())) {
               delete countryHashMap[name.toLowerCase()];
            }
         }
      }
   }

   private updateCounters(country: Country): void {
      (ELEMENT_DICT.counter() as Element).innerHTML = `${this.completeCountries}/197`; 
      // TODO autogenerate these markers to have the continent enum as part of it
      (ELEMENT_DICT.countryCounter(country.continent) as SVGElement).innerHTML = `(${this.scoreboard[country.continent].length}/${Game.targetNumCountries[country.continent]})`;
   } 


   /********************
    * Public interfaces
    */

   public countryFound(country: Country): void {
  
      this.completeCountries++;
      // Adds found: true prop to DOM element, and pushes to scoreboard
      this.markCountryAsComplete(country);
      // Finds SVG path, and changes fill color
      this.colorCountry(country);
      // Adds DOM element to history scroller at bottom
      this.addCountryToHistory(country);
      // Removes country from dataset (so it can't be found again), as well as any duplicates
      this.deleteCountryAndDuplicates(country);
      // Updates DOM counters.
      this.updateCounters(country);   
   }

   public drawCountries(): void {
      
      const groupNode = ELEMENT_DICT.mapPathGroup() as Element;
      
      for (const country of Object.values(countryHashMap)) {
            let countryNode = Game.createSVGPath();
   
            countryNode = Game.setSVGAttribute(countryNode, "title", country.title);
            countryNode.id = country.id;
            countryNode.setAttribute("d", country.svgPath);
            countryNode.style.fill = "#d1d8e0"; // default grey
            countryNode.style.stroke = "rgba(0,0,0,0.2)"; // dark grey
            countryNode.style.strokeWidth = "0.5"; // dark grey
            countryNode.setAttribute("data-found", "false");
            groupNode.appendChild(countryNode);
      }
          
   }

   public finish(): void {
      console.log(countryHashMap);
   };

   
   /********************
    * SVG UTILS
    */

   private static createSVGPath(): SVGPathElement {
      return document.createElementNS(Game.SVG_NAMESPACE, "path") as SVGPathElement;
   }
   private static setSVGAttribute(node: SVGPathElement, attr: string, value: string): SVGPathElement {
       node.setAttributeNS(Game.SVG_NAMESPACE, attr, value);
       return node;
   };   

}


/****************
 * Event listeners
 */

const setInputEventListener = (game: Game) => {
    const input = document.querySelector<HTMLInputElement>("input#answer");

    input.addEventListener("keyup", () => {
         const country = countryHashMap[input.value.toLowerCase()];
         if (country) {
            input.value = "";
            game.countryFound(country);
         }
    });
}

const setMouseOverEventListener = (game: Game) => {
   const countryPanel = ELEMENT_DICT.countryPanel() as HTMLElement;

   for(const country of Object.values(countryHashMap)) {
      const countryElements = ELEMENT_DICT.pathsById(country.id) as NodeListOf<SVGPathElement>;
      
      countryElements.forEach(element => {

         element.addEventListener("mouseenter", () => {     

            document.querySelector("body").style.cursor = "pointer";
            element.style.opacity = 0.5;
            // TODO CHANGE THIS TO CONSTANT VALUE
            if (element.getAttribute("data-found") === "true") {
               countryPanel.innerHTML = `<strong>${country.title}</strong>`;
            }

         });
         element.addEventListener("mouseleave", () => {

            document.querySelector("body").style.cursor = "auto";
            element.style.opacity = 1.0;
            countryPanel.innerHTML = `<strong>...</strong>`;

         });
      });
  }
}
const setScoreboardEventListener = (game: Game) => {
   const help = ELEMENT_DICT.help() as HTMLElement;
   const scoreboard = ELEMENT_DICT.scoreboard() as HTMLElement;
   const scoreboardContainer = ELEMENT_DICT.scoreboardContainer() as HTMLElement;
   const closeScoreboard = ELEMENT_DICT.closeScoreboard() as HTMLElement;
   
   help.addEventListener("click", () => {
      game.updateScoreboard();
      scoreboardContainer.style.display = "block";
      scoreboard.style.display = "flex";
   });

   closeScoreboard.addEventListener("click", () => {
      scoreboardContainer.style.display = "none";
      scoreboard.style.display = "none";
   });
}
const setFinishEventListener = (game: Game) => {
   const finishButton = ELEMENT_DICT.finish() as HTMLElement;

   finishButton.addEventListener("click", game.finish);
}

window.addEventListener("load", () => {
    const game: Game = new Game(800, 600, 0, 0);
    game.drawCountries();

   // Bind event listeners to game handlers
   setInputEventListener(game);
   setMouseOverEventListener(game);
   setViewBoxEventListeners();
   setZoomEventListeners();
   setScoreboardEventListener(game);
   setFinishEventListener(game);

   // for (const country of Object.values(countryHashMap)) {
   //    game.countryFound(country);
   // }
});

/****
 * NUMBER MARKERS NEXT TO EACH REGION
 * 
 * 54 for Africa (dont forget sao tome)
 */