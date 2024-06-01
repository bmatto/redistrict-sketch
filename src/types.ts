export type SchoolName = "Little Harbor" | "Dondero" | "New Franklin";

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
  FRL: "F" | "R" | false;
  IEP: boolean;
}

export interface School {
  name: string;
  lat: number;
  long: number;
  maxCapacity: number;
  students: Student[];
  studentCount?: number;
  properties: FeatureProperties;
  capacityOverflowHandled: boolean;
  frlCount?: number;
  iepCount?: number;
  frlByGradeLevel?: {
    [key: number]: number;
  };
  iepByGradeLevel?: {
    [key: number]: number;
  };
}

export interface Neighborhood {
  name: string;
  students: Student[];
  school?: School;
  centroid: {
    lat: number;
    long: number;
  };
  feature: Feature;
}

export type Neighborhoods = {
  [key: string]: Neighborhood;
};

export type PartialNeighborhoods = {
  [key: string]: Partial<Neighborhood>;
};

export type District = {
  name: SchoolName;
  feature: Feature;
  neighborhoods: Neighborhoods;
};
