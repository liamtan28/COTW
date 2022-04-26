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

const ELEMENT_DICT: Record<string, (any?) => Element | NodeListOf<Element>> = {
   svg: (): SVGElement => document.querySelector("svg"),
   mapPathGroup: (): Element => document.querySelector<Element>("g#map-path-group"),
   // TODO I hate this dedup solution. Its really inefficient. This is a hashmap collision issue. 
   pathsById: (id: string): NodeListOf<SVGPathElement> => document.querySelectorAll<SVGPathElement>(`g#map-path-group path#${id}`),
   answerInput: (): HTMLInputElement => document.querySelector<HTMLInputElement>("input#answer"),
   counter: (): HTMLElement => document.querySelector<HTMLElement>("p#counter"),
   history: (): HTMLElement => document.querySelector<HTMLElement>("div#history"),
};

let completeCountries = 0;

const drawCountries = () => {

    const groupNode = ELEMENT_DICT.mapPathGroup() as Element;
    
    for (const country of Object.values(countryHashMap)) {
        let countryNode = createSVGPath();

        countryNode = setSVGAttribute(countryNode, "title", country.title);
        countryNode.id = country.id;
        countryNode.setAttribute("d", country.svgPath);
        countryNode.style.fill = "#d1d8e0"; // default grey
        countryNode.style.stroke = "rgba(0,0,0,0.2)"; // dark grey
        countryNode.style.strokeWidth = "0.5"; // dark grey
        groupNode.appendChild(countryNode);
    }

}

const fillAll = () => {
    for(const country of Object.values(countryHashMap)) {
      colorCountry(country);
      addCountryToHistory(country);
      updateCounter();    
      completeCountries++;
    }
}

const colorCountry = (country: Country): void => {

   const palette = COLOR_INDEX[country.continent];

   // Select either the 0th or nth index of the palette at random.
   const color = palette[Math.floor(Math.random() * palette.length)];
  
   (<NodeListOf<SVGPathElement>>ELEMENT_DICT.pathsById(country.id)).forEach(e => e.style.fill = color);
 
}

const addCountryToHistory = (country: Country): void => {
   const historyElement = ELEMENT_DICT.history() as Element;
   const palette = COLOR_INDEX[country.continent];
   const color = palette[Math.floor(Math.random() * palette.length)];

   if (completeCountries === 1) {
      historyElement.innerHTML = "";
   }
   const countryEntryElement = document.createElement("p");
   countryEntryElement.className = "country-entry";
   countryEntryElement.style.background = color;

   countryEntryElement.innerHTML = `<strong>${completeCountries}</strong> ${country.title}`;

   historyElement.prepend(countryEntryElement);
   historyElement.scrollTop = 0;

}
// delete all entries for this country.
const deleteCountryAndDuplicates = (country: Country): void => {
   // 1. save the accepted names
   // 2. delete this element
   // 3. for each accepted name, delete this too.
   
   delete countryHashMap[country.title.toLowerCase()];
   if (country.acceptedNames) {
      for (const name of country.acceptedNames) {
         delete countryHashMap[name.toLowerCase()];
      }
   }

};
const updateCounter = (): any => (ELEMENT_DICT.counter() as Element).innerHTML = `${completeCountries}/196`;  


/** TODO ADD VIEWPORT SCROLL MANIP WITH MOUSE EVENTS */
const setInputEventListener = () => {
    const input = document.querySelector<HTMLInputElement>("input#answer");

    input.addEventListener("keyup", () => {
         const country = countryHashMap[input.value.toLowerCase()];
         if (country) {
            input.value = "";
            completeCountries++;

            colorCountry(country);
            addCountryToHistory(country);
            deleteCountryAndDuplicates(country);
            updateCounter();    
         }
    });
}

const setMouseOverEventListener = () => {
   for(const country of Object.values(countryHashMap)) {
      const countryElements = ELEMENT_DICT.pathsById(country.id) as NodeListOf<SVGPathElement>;
      countryElements.forEach(element => {
         element.addEventListener("mouseenter", () => {     
            element.style.opacity = 0.5;
         });
         element.addEventListener("mouseleave", () => {
            element.style.opacity = 1.0;
         });
      });
  }
}


/****
 * PAN DRAG ZOOM EFFECTS
 */
const setViewBoxEventListeners = () => {
   const svg = ELEMENT_DICT.svg() as SVGElement;
   
   // Track position of mouse when clicked down
   const pointerOrigin = {
      x: 0,
      y: 0
   };

   const viewBox = {
      x: 0,
      y: 0,
      width: 800,
      height: 600,
   }

   const translatedViewBox = {
      x: 0,
      y: 0,
   };

   let isPointerDown = false;

   const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      isPointerDown = true;

      pointerOrigin.x = e.clientX;
      pointerOrigin.y = e.clientY;

      document.querySelector("body").style.cursor = "grab";
   };

   const onPointerUp = (e: PointerEvent) => {
      document.querySelector("body").style.cursor = "auto";
      e.preventDefault();
      isPointerDown = false;

      // save last position
      viewBox.x = translatedViewBox.x;
      viewBox.y = translatedViewBox.y;
   };

   const onPointerLeave = (e) => {
      e.preventDefault();
      document.querySelector("body").style.cursor = "auto";
   };

   // Fix difference between viewbox and svg size
   let ratio = viewBox.width / svg.getBoundingClientRect().width;

   const onPointerMove = (e) => {
      // Only run this function if the pointer is down
      if (!isPointerDown) {
         return;
      }
      // This prevent user to do a selection on the page
      e.preventDefault();

      // Get the pointer position
      const pointerPosition = { x: e.clientX, y: e.clientY };

      // We calculate the distance between the pointer origin and the current position
      // The viewBox x & y values must be calculated from the original values and the distances
      translatedViewBox.x = viewBox.x - ((pointerPosition.x - pointerOrigin.x) * ratio);
      translatedViewBox.y = viewBox.y - ((pointerPosition.y - pointerOrigin.y) * ratio);

      // We create a string with the new viewBox values
      // The X & Y values are equal to the current viewBox minus the calculated distances
      const viewBoxString = `${translatedViewBox.x} ${translatedViewBox.y} ${viewBox.width} ${viewBox.height}`;
      // We apply the new viewBox values onto the SVG
      svg.setAttribute('viewBox', viewBoxString);
      

   };


   // TODO check for window.PointerEvent and use pointer listeners for mobile. do this for touch as well.

   /**
    * // This function returns an object with X & Y values from the pointer event
      function getPointFromEvent (event) {
      var point = {x:0, y:0};
      // If event is triggered by a touch event, we get the position of the first finger
      if (event.targetTouches) {
         point.x = event.targetTouches[0].clientX;
         point.y = event.targetTouches[0].clientY;
      } else {
         point.x = event.clientX;
         point.y = event.clientY;
      }
      
      return point;
      }
    */

   svg.addEventListener("mousedown", onPointerDown);
   svg.addEventListener("mouseup", onPointerUp);
   svg.addEventListener("mouseleave", onPointerLeave);
   svg.addEventListener("mousemove", onPointerMove);

   window.addEventListener('resize', () => {
      ratio = viewBox.width / svg.getBoundingClientRect().width;
   });
}

window.addEventListener("load", () => {
    drawCountries();
    setInputEventListener();
   // setMouseOverEventListener();
    setViewBoxEventListeners();
    //fillAll();
});
