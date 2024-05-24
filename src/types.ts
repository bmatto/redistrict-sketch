export type FeatureProperties = {
  stroke?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  fill?: string;
  fillOpacity?: number;
};

export type Feature = {
  id: string;
  type: "Feature";
  properties: FeatureProperties;
  geometry: {
    type: string;
    coordinates: Array<[number, number][]>;
  };
};

export interface Student {
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  gradeLevel: number;
  neighbourhood: string;
}

export interface School {
  name: string;
  lat: number;
  long: number;
  maxCapacity: number;
  students: Student[];
  capacityOverflowHandled: boolean;
}

export interface Neighborhood {
  name: string;
  students: Student[];
  school?: School;
  centroid?: {
    lat: number;
    long: number;
  };
  // boundary?: [number, number][];
  feature?: Feature;
}
