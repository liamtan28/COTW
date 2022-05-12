import Globe, { GlobeInstance } from "globe.gl";
import * as THREE from "three";

import { CotwCountryData } from "./data";
import config from "./config";

export default class GlobeManager {

    private root: HTMLElement;
    private instance: GlobeInstance;
    
    // Unfortunately, I see no way around using this unless I move away from parcel. Unless
    // parcel has a way to serve additional assets from it's webserver, I will need to set
    // a deploy flag here as the images are served using nginx reverse proxy

    private static GLOBE_IMG_MAP_URL = config.NGINX_SERVE ? './img/earth-blue-marble.jpg' : '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
    private static BUMP_MAP_URL = config.NGINX_SERVE ? './img/earth-topology.png' : '//unpkg.com/three-globe/example/img/earth-topology.png';
    private static WATER_BUMP_MAP_URL = config.NGINX_SERVE ? './img/earth-water.png' : '//unpkg.com/three-globe/example/img/earth-water.png';
    
    private static LINE_HOVER_PRECISION = 2;
  
    private static POLY_ALTITUDE = 0.01;
    private static POLY_BASE_COLOR = 'rgba(0,0,0,0.3)';
    private static POLY_STROKE_COLOR = 'rgba(200,200,200,0.5)';
    private static HIGHLIGHT_COLOR = 'rgba(255,255,255,0.4)'; // Labels for small countries that need a highligh
  
    private static POLY_HOVER_ALTITUDE = 0.04;
  
    private static POLY_FAILED_COLOR = 'rgba(255, 56, 56, 1.0)';
  
    private static MISSING_COUNTRY_LABEL = "???";
    private static LABEL_RADIUS = 1000000;
    private static LABEL_ALTITUDE = 0;
    private static LABEL_RES = 2;

    private static AUTO_ROTATE_SPEED = 0.4;
  
    private missingCountries: CotwCountryData[];
    private highlightCountries: CotwCountryData[];
    private isAutoRotating: boolean;
  
    public constructor(root: HTMLElement, data: CotwCountryData[]) {
      this.root = root;
      this.highlightCountries = data.filter(c => c.highlight);
      this.missingCountries = [];
      this.isAutoRotating = false;
    }
  
    private static getCountryAltitude(country: CotwCountryData): number {
      return country.reveal && !country.found ? GlobeManager.POLY_HOVER_ALTITUDE : GlobeManager.POLY_ALTITUDE;
    }
  
    private static getCountryCapColor(country: CotwCountryData): string {
      if (country.found && country.reveal) {
        return country.baseColor;
      }
      if (!country.found && !country.reveal) {
        return GlobeManager.POLY_BASE_COLOR;
      }
      return GlobeManager.POLY_FAILED_COLOR;  
    }
  
    private static getCountrySideColor(country: CotwCountryData): string {
      return country.reveal && !country.found ? GlobeManager.POLY_FAILED_COLOR : country.baseColor;
    }
  
    private static getCountryLabel(country: CotwCountryData): string {
      return country.reveal ? country.properties.NAME : GlobeManager.MISSING_COUNTRY_LABEL;
    }
  
    // If the country has a highlight flag, this means it's not a missing country label, rather
    // a highlight label. 
    private static getLabelRadius(country: CotwCountryData): number {
      return Math.sqrt(GlobeManager.LABEL_RADIUS * 10 * country.highlight) * 4e-4;
    }
  
    private static getLabelColor(country: CotwCountryData): string {
        return country.found ? country.baseColor : GlobeManager.HIGHLIGHT_COLOR; 
    }

  
    public draw(countryData: CotwCountryData[]): void {
   
      this.instance = Globe()
  
        .globeImageUrl(GlobeManager.GLOBE_IMG_MAP_URL)
        .bumpImageUrl(GlobeManager.BUMP_MAP_URL)
        .lineHoverPrecision(GlobeManager.LINE_HOVER_PRECISION)
        .polygonsData(countryData)
  
        // Typecast here is a consequence of limitations of globe.gl library
        .polygonAltitude(c => GlobeManager.getCountryAltitude(c as CotwCountryData))
        .polygonCapColor(c => GlobeManager.getCountryCapColor(c as CotwCountryData))
        .polygonSideColor(c => GlobeManager.getCountrySideColor(c as CotwCountryData))
        .polygonLabel(c => GlobeManager.getCountryLabel(c as CotwCountryData))
        .polygonStrokeColor(GlobeManager.POLY_STROKE_COLOR)
  
         // Highlight countries
        .labelsData(this.highlightCountries)
        .labelLat(c => (c as CotwCountryData).position.lat)
        .labelLng(c => (c as CotwCountryData).position.lng)
        .labelText(() => "") // Provide no label for missing country, just the circle radius
  
        .labelDotRadius(c => GlobeManager.getLabelRadius(c as CotwCountryData))
        .labelColor(c => GlobeManager.getLabelColor(c as CotwCountryData))
  
        .labelResolution(GlobeManager.LABEL_RES)
        .labelAltitude(GlobeManager.LABEL_ALTITUDE)

        // Missing country markers
        .hexAltitude(0.04)
        .hexBinResolution(4)
        .hexTopColor(() => 'rgb(255,255,255)')
        .hexSideColor(() => GlobeManager.POLY_FAILED_COLOR)
        .hexBinMerge(true)
        .hexBinPointsData([])
  
      (this.root);
  
      this.loadCustomTextures();
      this.toggleAutoRotate();
    }

    public toggleAutoRotate(): void {
      this.isAutoRotating = !this.isAutoRotating;
 
      (this.instance.controls() as any).autoRotate = this.isAutoRotating;
      (this.instance.controls() as any).autoRotateSpeed = GlobeManager.AUTO_ROTATE_SPEED;
    }
  
    /**
     * Method loads specular map onto globe
     */
    private loadCustomTextures(): void {
      const globeMaterial = this.instance.globeMaterial();
      globeMaterial.bumpScale = 10;
  
      new THREE.TextureLoader().load(GlobeManager.WATER_BUMP_MAP_URL, texture => {
        globeMaterial.specularMap = texture;
        globeMaterial.specular = new THREE.Color('grey');
        globeMaterial.shininess = 15;
      });
  
      setTimeout(() => {
        const directionalLight = this.instance.scene().children.find(obj3d => obj3d.type === 'DirectionalLight');
        directionalLight && directionalLight.position.set(1, 1, 1);
      });
    }
  
    public setMissingCountries(missingCountries: CotwCountryData[]): void {
      this.missingCountries = missingCountries;
      this.instance.hexBinPointsData(this.missingCountries.map(c => c.position));
    }
  
    public update(countryData: CotwCountryData[]): void {
      this.instance.polygonsData(countryData);
    }
  
    public moveTo(country: CotwCountryData, ms: number = 250): void {
      this.instance.pointOfView({
          lat: country.position.lat,
          lng: country.position.lng,
      }, ms);
    }
}