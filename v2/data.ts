import COUNTRIES_JSON from "./datasets/all.json";

export interface GeoJson {
    type: "FeatureCollection",
    features: GeoJsonFeature[],
}
interface GeoJsonFeature {
    type: "Feature",
    properties: {
      scalerank: number,
      featurecla: string,
      labelrank: number,
      sovereignt: string, // Belize
      sov_a3: string, // ID (BLZ)
      adm0_dif: number,
      level: number,
      type: string, // Sovereign country,
      admin: string, // Belize
      adm0_a3: string, // ID
      geou_dif: number,
      geounit: string, // Belize,
      gu_a3: string, // ID
      su_dif: number,
      subunit: string, // Belize,
      su_a3: string, // ID,
      brk_diff: number,
  
  
      // ! DATA FIELDS
      name: string, // NAME Belize,
      name_long: string, // NAME_LONG Belize,
  
  
      brk_a3: string, // ID,
      brk_name: string, // Belize,
      brk_group: any, // null,
  
  
      // ! DATA FIELD
      abbrev: string, // Belize, Look for DRC, UK, USA,
      // ! DATA FIELD
      postal: string, // SECOND ID (BZ)
      // ! DATA FIELDS
      formal_en: string, // Belize,
      formal_fr: string, // null here but check for Cote D'Ivore or Cape Verde
  
  
      note_adm0: any, // null 
      note_brk: any, // null,
      name_sort: string // Belize,
      name_alt: string, // null but could be interesting
      mapcolor7: number,
      mapcolor8: number,
      mapcolor9: number,
      mapcolor13: number,
  
  
      // ! IGNORE FOR NOW BUT COULD BE USEFUL
      pop_est: number, // population estimate
      gdp_md_est: number, // median gdp estimate
      pop_year: number, // -99, default value?
      lastcensus: number, // 2010
      gdp_year: number, // -99, default value?
      economy: string, // 6. Developing region,
      income_grp: string, // 4. Lower middle income
      wikipedia: number, // -99, default value?
  
  
      fips_10: any, // null
      iso_a2: string, // SHORT ID (BZ)
      iso_a3: string, // ID (BLZ)
      iso_n3: string, // 084, ID?
      un_a3: string, // 084, ID?
      wb_a2: string, // SHORT ID (BZ)
      wb_a3: string, // ID (BLZ)
      woe_id: number, // -99
      adm0_a3_is: string, // ID (BLZ)
      adm0_a3_us: string,  // ID (BLZ)
      adm0_a3_un: number, // -99,
      adm0_a3_wb: number, // -99,
  
  
      // ! DATA FIELDS
      continent: string, // North America
      region: string, // Americas
      subregion: string, // Central America
      region_wb: string, // Latin America & Caribbean,
  
      name_len: number, // length of name
      long_len: number,
      abbrev_len: number,
      tiny: number,
  
      homepart: number,
      filename: string,
    
  
  
    },
    geometry: {
      type: string, // Polygon, Multi-Polygon
      coordinates: number[][][],
    }
}
  
interface ReducedGeoJsonFeature {
    properties: {

        iso_a2: string, // ID
        name: string,
        name_long: string,
        abbrev: string,
        formal_en: string, // Belize,
        formal_fr: string,

        continent: string, // North America
        region: string, // Americas
        subregion: string, // Central America
        region_wb: string, // Latin America & Caribbean,
    },
    geometry: {
        type: string, // Polygon, MultiPolygon
        coordinates: number[][][],
    },
}
interface CotwGameProps {
    found: boolean;
    reveal: boolean;
    baseColor: string;
    position: {
        lat: number;
        lng: number;
    }
}

export type CotwCountryData = ReducedGeoJsonFeature & CotwGameProps;

enum Continent {
    NORTH_AMERICA = "North America",
    SOUTH_AMERICA = "South America",
    EUROPE = "Europe",
    ASIA = "Asia",
    AFRICA = "Africa",
    OCEANIA = "Oceania",
 }

const COLOR_INDEX: Record<Continent, string[]> = {
    [Continent.ASIA]: ["rgba(255, 250, 101,0.4)", "rgba(255, 242, 0,0.4)"],
    [Continent.NORTH_AMERICA]: ["rgba(50, 255, 126,0.4)", "rgba(58, 227, 116,0.4)"],
    [Continent.SOUTH_AMERICA]: [ "rgba(255, 175, 64,0.4)", "rgba(255, 159, 26,0.4)"],
    [Continent.EUROPE]: ["rgba(125, 95, 255,0.4)", "rgba(113, 88, 226,0.4)"],
    [Continent.AFRICA]: ["rgba(24, 220, 255,0.4)", "rgba(23, 192, 235,0.4)"],
    [Continent.OCEANIA]: ["rgba(126, 255, 245,0.4)", "rgba(103, 230, 220,0.4)"],
 };

export const convertGeoJsonToCountryData = (input: GeoJson): CotwCountryData[] => (
    input.features
        .filter((country: GeoJsonFeature): boolean => 
            country.properties.type !== "Dependency"
        )
        .map((country: GeoJsonFeature): CotwCountryData => ({
            properties: {
                iso_a2: country.properties.iso_a2,
                name: country.properties.name,
                name_long: country.properties.name_long,
                abbrev: country.properties.abbrev,
                formal_en: country.properties.formal_en,
                formal_fr: country.properties.formal_fr,
                continent: country.properties.continent,
                region: country.properties.region,
                subregion: country.properties.subregion,
                region_wb: country.properties.region_wb,
            },
            geometry: country.geometry,
            found: false,
            reveal: false,
            position: {
                lat: country.geometry.type === "Polygon" ? country.geometry.coordinates[0][0][0] as unknown as number : country.geometry.coordinates[0][0][0][0] as number,
                lng: country.geometry.type === "Polygon" ? country.geometry.coordinates[0][0][1] as unknown as number : country.geometry.coordinates[0][0][0][1] as number,
            },
            baseColor: COLOR_INDEX[country.properties.continent][Math.floor(Math.random() * 2)],
        }))
);