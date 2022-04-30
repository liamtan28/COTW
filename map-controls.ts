import { ELEMENT_DICT } from "./element-dict";
// TODO move all of this so we dont have global closure
const viewBox = {
    x: 0,
    y: 0,
    width: 1000,
    height: 600,
 }
 const svg = ELEMENT_DICT.map() as SVGElement;
    // Fix difference between viewbox and svg size
    let ratio = viewBox.width / svg.getBoundingClientRect().width;
 
 /****
  * PAN DRAG ZOOM EFFECTS
  */
 export const setViewBoxEventListeners = () => {
    // Track position of mouse when clicked down
    const pointerOrigin = {
       x: 0,
       y: 0
    };
 
    const translatedViewBox = {
       x: 0,
       y: 0,
    };
 
    let isPointerDown = false;
 
    const onPointerDown = (e: PointerEvent) => {
       isPointerDown = true;
 
       pointerOrigin.x = e.clientX;
       pointerOrigin.y = e.clientY;
 
       document.querySelector("body").style.cursor = "grab";
    };
 
    const onPointerUp = (e: PointerEvent) => {
       document.querySelector("body").style.cursor = "auto";
  
       isPointerDown = false;
 
       // save last position
       viewBox.x = translatedViewBox.x;
       viewBox.y = translatedViewBox.y;
    };
 
    const onPointerLeave = (e) => {
  
       document.querySelector("body").style.cursor = "auto";
    };
 
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
 
    svg.addEventListener("mousedown", onPointerDown);
    svg.addEventListener("mouseup", onPointerUp);
    svg.addEventListener("mouseleave", onPointerLeave);
    svg.addEventListener("mousemove", onPointerMove);
 
    window.addEventListener('resize', () => {
       ratio = calcRatio();
    });
 }
 
export const calcRatio = () => viewBox.width / svg.getBoundingClientRect().width;

export const setZoomEventListeners = (): void => {
    const zoomIn = ELEMENT_DICT.zoomIn() as HTMLElement;
    const zoomOut = ELEMENT_DICT.zoomOut() as HTMLElement;
 
    const ZOOM_VALUE = 80;
 
    zoomIn.addEventListener("mousedown", () => {
       console.log("in");
       viewBox.width -= ZOOM_VALUE;
       viewBox.height -= ZOOM_VALUE;
 
       // translate origin by 50 of zoom value
       viewBox.x += ZOOM_VALUE / 2;
       viewBox.y += ZOOM_VALUE / 2;

      ratio = calcRatio();
 
       const viewBoxString = `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`;
       // We apply the new viewBox values onto the SVG
       svg.setAttribute('viewBox', viewBoxString);
       
    });
 
    zoomOut.addEventListener("mousedown", () => {
       console.log("out");
       viewBox.width += ZOOM_VALUE;
       viewBox.height += ZOOM_VALUE;
 
       // translate origin by 50 of zoom value
       viewBox.x -= ZOOM_VALUE / 2;
       viewBox.y -= ZOOM_VALUE / 2;

       ratio = calcRatio();
       
       const viewBoxString = `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`;
       // We apply the new viewBox values onto the SVG
       svg.setAttribute('viewBox', viewBoxString);
    });
 }
 