import { SVGPathDrawable, SVGTextDrawable } from "./svg";

enum Continent {
    NORTH_AMERICA = "N. America",
    SOUTH_AMERICA = "S. America",
    EUROPE = "Europe",
    ASIA = "Asia",
    AFRICA = "Africa",
    OCEANIA = "Oceania",
 }

interface CountryModel {
    id: string;
    title: string;
    continent: Continent;
    acceptedNames: string[];
}

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

/**
 * Country Game Object class
 * 
 * Exposes public interfaces for game management. 
 * 
 * Stores country data model as well as instance of 
 * SVG drawable to draw to the SVGGroup.
 */
export class Country {

    private static DEFAULT_FILL_COLOR = "#d1d8e0";
    private static DEFAULT_STROKE_COLOR = "rgba(0,0,0,0.2)";
    private static DEFAULT_STROKE_WIDTH = "0.5";

    private foundColor: string;

    private svg: SVGPathDrawable;
    private model: CountryModel;
    private isFound: boolean;

    public constructor(model: CountryModel, path: string, foundColor: string) {
        this.svg = new SVGPathDrawable(SVG_NAMESPACE, path);
        this.model = model;
        this.isFound = false;
        this.foundColor = foundColor;
    }

    public clear(parent: SVGElement): void {
        this.svg.clear(parent);
    }

    public draw(parent: SVGElement): void {
        this.svg.drawTo(
            parent,
            this.isFound ? this.foundColor : Country.DEFAULT_FILL_COLOR,
            Country.DEFAULT_STROKE_COLOR,
            Country.DEFAULT_STROKE_WIDTH,
        ); 
    }

    public get id(): string {
        return this.model.id;
    }

    public get title(): string {
        return this.model.title;
    }

    public get continent(): Continent {
        return this.model.continent;
    }

    public get otherNames(): string[] {
        const names = this.model.acceptedNames;
        return names.filter(n => n !== this.model.title);
    }

    public get found(): boolean {
        return this.isFound;
    }

    public setFound(found: boolean): void {
        this.isFound = found;
    }
    
}

export class OceanMarker {
    private static FILL_COLOR = "#3867d6";

    private svg: SVGTextDrawable;

    public constructor(text: string, x: number, y: number) {
        this.svg = new SVGTextDrawable(SVG_NAMESPACE, text, x, y);
        this.svg.setAttribute("class", "ocean-marker");
    }

    public clear(parent: SVGElement): void {
        this.svg.clear(parent);
    }

    public draw(parent: SVGElement): void {
        this.svg.drawTo(
            parent,
            OceanMarker.FILL_COLOR,
        ); 
    }
}

export class ContinentMarker {
    private static FILL_COLOR = "rgba(0,0,0,0.5";

    private title: string;
    private currentScore: number;
    private maxScore: number;
    private svg: SVGTextDrawable;

    public constructor(title: string, maxScore: number, x: number, y: number) {
        this.title = title;
        this.currentScore = 0;
        this.maxScore = maxScore;

        this.svg = new SVGTextDrawable(SVG_NAMESPACE, this.htmlString, x, y);
        this.svg.setAttribute("class", "continent-marker");
    }

    private get htmlString(): string {
        return `${this.title} <tspan>${this.currentScore}/${this.maxScore}`;
    }

    public incrementScore(): void {
        this.currentScore++;
    }

    public clear(parent: SVGElement): void {
        this.svg.clear(parent);
    }

    public draw(parent: SVGElement): void {
        this.svg.updateText(this.htmlString);
        this.svg.drawTo(
            parent,
            ContinentMarker.FILL_COLOR,
        );
    }
}