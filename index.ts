import { default as countryHashMap } from "./map-data.json";
/********************
 * MAP DATA
 */

enum Continent {
   NORTH_AMERICA,
   SOUTH_AMERICA,
   EUROPE,
   ASIA,
   AFRICA,
   OCEANIA,
   NOT_APPLICABLE,
}
 
/********************
 * COLOR DATA
 */
const colors: string[] = [
    "#fc5c65", //red
    "#eb3b5a",

    "#fd9644", //orange
    "#fa8231",

    "#fed330", //yellow
    "#f7b731",

    "#26de81", //green
    "#20bf6b",

    "#2bcbba", //bluegreen
    "#0fb9b1",

    "#45aaf2", //lightblue
    "#2d98da",

    "#4b7bec", //darkblue
    "#3867d6",

    "#a55eea", //purple
    "#8854d0", 

    "#d1d8e0", //silver
    "#a5b1c2",

    "#778ca3", //grey
    "#4b6584",
];

const COLOR_INDEX: Record<Continent, string[]> = {
   [Continent.ASIA]: ["#fc5c65", "#eb3b5a"],
   [Continent.NORTH_AMERICA]: ["#fd9644", "#fa8231"],
   [Continent.SOUTH_AMERICA]: [ "#fed330", "#f7b731"],
   [Continent.EUROPE]: ["#26de81", "#20bf6b"],
   [Continent.AFRICA]: ["#4b7bec", "#3867d6"],
   [Continent.OCEANIA]: ["#a55eea", "#8854d0"],
   [Continent.NOT_APPLICABLE]: ["#778ca3", "#4b6584"],
};

/********************
 * SVG UTILS
 */

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

const createSVGPath = (): SVGPathElement => document.createElementNS(SVG_NAMESPACE, "path");
const setSVGAttribute = (node: SVGPathElement, attr: string, value: string): SVGPathElement => {
   node.setAttributeNS(SVG_NAMESPACE, attr, value);
   return node;
};

/********************
 * DRAW AND RENDER
 */

const ELEMENT_DICT: Record<string, (any?) => Element> = {
   mapPathGroup: () => document.querySelector("g#map-path-group"),
   pathById: (id: string): SVGPathElement => document.querySelector<SVGPathElement>(`g#map-path-group path#${id}`),
   answerInput: (): HTMLInputElement => document.querySelector<HTMLInputElement>("input#answer"),
   counter: (): HTMLElement => document.querySelector<HTMLElement>("p#counter"),
};

let completeCountries = 0;

const drawCountries = () => {

    const groupNode = ELEMENT_DICT.mapPathGroup();
    
    for (const country of Object.values(countryHashMap)) {
        let countryNode = createSVGPath();

        countryNode = setSVGAttribute(countryNode, "title", country.title);
        countryNode.id = country.id;
        countryNode.setAttribute("d", country.svgPath);
        countryNode.style.fill = "#d1d8e0"; // default grey
        countryNode.style.stroke = "#a5b1c2"; // dark grey
        groupNode.appendChild(countryNode);
    }

}

const fillAll = () => {
    for(const country of Object.values(countryHashMap)) {
    
      ELEMENT_DICT.pathById(country.id).style.fill = COLOR_INDEX[country.continent][Math.floor(Math.random() * 2)];
      completeCountries++;
    }
}

const setInputEventListener = () => {
    const input = document.querySelector<HTMLInputElement>("input#answer");

    input.addEventListener("keyup", () => {

         const country = countryHashMap[input.value.toLowerCase()];
         if (country) {
            const palette = COLOR_INDEX[country.continent];
            // Select either the 0th or nth index of the palette at random.
            const color = palette[Math.floor(Math.random() * palette.length)];
         
            ELEMENT_DICT.pathById(country.id).style.fill = color;

            // Reset input
            input.value = "";

            completeCountries++;
            ELEMENT_DICT.counter().innerHTML = `${completeCountries}/196`;  
         }
    });
}

const setMouseOverEventListener = () => {

   for(const country of Object.values(countryHashMap)) {
      document.querySelector(`g#map-path-group path#${country.id}`).addEventListener("mouseenter", () => {     
         ELEMENT_DICT.pathById(country.id).style.opacity = 0.5;
      });
      document.querySelector(`g#map-path-group path#${country.id}`).addEventListener("mouseleave", () => {
         ELEMENT_DICT.pathById(country.id).style.opacity = 1.0;
      });
   
  }
}

window.addEventListener("load", () => {
    drawCountries();
    setInputEventListener();
    setMouseOverEventListener();
    //fillAll();
});
