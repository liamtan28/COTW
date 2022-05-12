export interface GeoJson {
    type: "FeatureCollection",
    features: GeoJsonFeature[],
}
export type GeoJsonFeature = {
    type: string;
    proximity: number;
    properties: {
      scalerank: number;
      featurecla: string;
      LABELRANK: number;
      SOVEREIGNT: string;
      SOV_A3: string; 
      ADM0_DIF: number;
      LEVEL: number;
      TYPE: string;
      ADMIN: string;
      ADM0_A3: string;
      GEOU_DIF: number;
      GEOUNIT: string;
      GU_A3: string;
      SU_DIF: number;
      SUBUNIT: string;
      SU_A3: string;
      BRK_DIFF: number;
      NAME: string;
      NAME_LONG: string;
      BRK_A3: string;
      BRK_NAME: string;
      BRK_GROUP: null;
      ABBREV: string;
      POSTAL: string;
      FORMAL_EN: string | null;
      FORMAL_FR: string | null;
      NAME_CIAWF: string | null;
      NOTE_ADM0: string | null;
      NOTE_BRK: string | null;
      NAME_SORT: string;
      NAME_ALT: string | null;
      MAPCOLOR7: number;
      MAPCOLOR8: number;
      MAPCOLOR9: number;
      MAPCOLOR13: number;
      POP_EST: number;
      POP_RANK: number;
      GDP_MD_EST: number;
      POP_YEAR: number;
      LASTCENSUS: number;
      GDP_YEAR: number;
      ECONOMY: string;
      INCOME_GRP: string;
      WIKIPEDIA: number;
      FIPS_10_: string;
      ISO_A2: string;
      ISO_A2_EH: string;
      FLAG: string;
      ISO_A3: string;
      ISO_A3_EH: string;
      ISO_N3: string;
      UN_A3: string;
      WB_A2: string;
      WB_A3: string;
      WOE_ID: number;
      WOE_ID_EH: number;
      WOE_NOTE: string;
      ADM0_A3_IS: string;
      ADM0_A3_US: string;
      ADM0_A3_UN: number;
      ADM0_A3_WB: number;
      CONTINENT: string;
      REGION_UN: string;
      SUBREGION: string;
      REGION_WB: string;
      NAME_LEN: number;
      LONG_LEN: number;
      ABBREV_LEN: number;
      TINY: number;
      HOMEPART: number;
      MIN_ZOOM: number;
      MIN_LABEL: number;
      MAX_LABEL: number;
      NAME_AR: string;
      NAME_BN: string;
      NAME_DE: string;
      NAME_EN: string;
      NAME_ES: string;
      NAME_FA: string;
      NAME_FR: string;
      NAME_EL: string;
      NAME_HE: string;
      NAME_HI: string;
      NAME_HU: string;
      NAME_ID: string;
      NAME_IT: string;
      NAME_JA: string;
      NAME_KO: string;
      NAME_NL: string;
      NAME_PL: string;
      NAME_PT: string;
      NAME_RU: string;
      NAME_SV: string;
      NAME_TR: string;
      NAME_UK: string;
      NAME_UR: string;
      NAME_VI: string;
      NAME_ZH: string;
      NAME_ZHT: string;
    };
    bbox: number[];
    highlight?: number;
    geometry:
      | {
          TYPE: "Polygon";
          coordinates: number[][][];
        }
      | {
          TYPE: "MultiPolygon";
          coordinates: number[][][][];
        };
}

  
interface ReducedGeoJsonFeature {
    properties: {
        ISO_A2?: string, // ID
        NAME: string,
        NAME_LONG?: string,
        ABBREV?: string,
        FORMAL_EN?: string, // Belize,
        FORMAL_FR?: string,

        CONTINENT: string, // North America
        TYPE: string,

        REGION_UN?: string, // Americas
        SUBREGION?: string, // Central America
        REGION_WB?: string, // Latin America & Caribbean,
    },
    bbox: number[];
    geometry:
      | {
          TYPE: "Polygon";
          coordinates: number[][][];
        }
      | {
          TYPE: "MultiPolygon";
          coordinates: number[][][][];
    };
}
interface CotwGameProps {
    found: boolean;
    reveal: boolean;
    baseColor: string;
    highlight: number;
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
    [Continent.ASIA]: ["rgba(255, 250, 101,0.9)", "rgba(255, 242, 0,0.9)"],
    [Continent.NORTH_AMERICA]: ["rgba(50, 255, 126,0.9)", "rgba(58, 227, 116,0.9)"],
    [Continent.SOUTH_AMERICA]: [ "rgba(255, 175, 64,0.9)", "rgba(255, 159, 26,0.9)"],
    [Continent.EUROPE]: ["rgba(125, 95, 255,0.9)", "rgba(113, 88, 226,0.9)"],
    [Continent.AFRICA]: ["rgba(24, 220, 255,0.9)", "rgba(23, 192, 235,0.9)"],
    [Continent.OCEANIA]: ["rgba(126, 255, 245,0.9)", "rgba(103, 230, 220,0.9)"],
}

export const convertGeoJsonToCountryData = (input: GeoJson): CotwCountryData[] => (
    input.features
        .map((country: GeoJsonFeature): CotwCountryData => {
            const { bbox } = country;
            const [lng1, lat1, lng2, lat2] = bbox;
            const lat = (lat1 + lat2) / 2;
            const lng = (lng1 + lng2) / 2;

            return {
                properties: {
                    ISO_A2: country.properties.ISO_A2,
                    NAME: country.properties.NAME,
                    NAME_LONG: country.properties.NAME_LONG,
                    ABBREV: country.properties.ABBREV,
                    FORMAL_EN: country.properties.FORMAL_EN,
                    FORMAL_FR: country.properties.FORMAL_FR,
                    TYPE: country.properties.TYPE,
                    CONTINENT: country.properties.CONTINENT,
                    REGION_UN: country.properties.REGION_UN,
                    SUBREGION: country.properties.SUBREGION,
                    REGION_WB: country.properties.REGION_WB,
                },
                geometry: country.geometry,
                highlight: country.highlight ?? 0,
                bbox: country.bbox,
                found: false,
                reveal: false,
                position: {
                    lat,
                    lng,
                },
                baseColor: COLOR_INDEX[country.properties.CONTINENT][Math.floor(Math.random() * 2)],
            };
        }
    )
);
/**
 *       const { bbox } = country;
      const [lng1, lat1, lng2, lat2] = bbox;
      const latitude = (lat1 + lat2) / 2;
      const longitude = (lng1 + lng2) / 2;
      return { lat: latitude, lng: longitude };
 */