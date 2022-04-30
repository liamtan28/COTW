export const ELEMENT_DICT: Record<string, (any?) => Element | SVGElement> = {
    map: (): SVGElement => document.querySelector("svg#map"),
    mapPathGroup: (): SVGElement => document.querySelector<SVGElement>("g#map-path-group"),
    // TODO I hate this dedup solution. Its really inefficient. This is a hashmap collision issue. 
    pathsById: (id: string): NodeListOf<SVGPathElement> => document.querySelectorAll<SVGPathElement>(`g#map-path-group path#${id}`),
    answerInput: (): HTMLInputElement => document.querySelector<HTMLInputElement>("input#answer"),
    counter: (): HTMLElement => document.querySelector<HTMLElement>("p#counter"),
    countryCounter: (continent: Continent): SVGElement => document.querySelector<SVGElement>(`text.score-marker#score-marker-${continent} tspan`),
    history: (): HTMLElement => document.querySelector<HTMLElement>("div#history"),
    countryPanel: (): HTMLElement => document.querySelector<HTMLElement>("div#country-panel"),
    zoomIn: (): HTMLElement => document.querySelector<HTMLElement>("span.control#zoom-in"),
    zoomOut: (): HTMLElement => document.querySelector<HTMLElement>("span.control#zoom-out"),
 
    help: (): HTMLElement => document.querySelector<HTMLElement>("span.control#help"),
    finish: (): HTMLElement => document.querySelector<HTMLElement>("span.control#finish-game"),

    scoreboard: (): HTMLElement => document.querySelector<HTMLElement>("div#scoreboard"),
    scoreboardContainer: (): HTMLElement => document.querySelector<HTMLElement>("div#scoreboard-container"),
    closeScoreboard: (): HTMLElement => document.querySelector<HTMLElement>("svg.control#close-scoreboard"),
    scoreboardSectionByContinent: (continent: string): HTMLElement => document.querySelector<HTMLElement>(`section.scoreboard__continent-container#${continent}`),
 };