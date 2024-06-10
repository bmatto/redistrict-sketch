import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import {
  Neighborhood,
  Neighborhoods,
  PartialNeighborhoods,
  Student,
  Feature,
} from "../types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const geoJsonPath = join(__dirname, "../", "neighborhoods.json");

const geoJson = JSON.parse(fs.readFileSync(geoJsonPath, "utf-8"));

let neighborhoods: Neighborhoods = {};

type boundary = [number, number][];

export const getNeighborHoods = (): Neighborhoods => {
  return Object.freeze(neighborhoods);
};

const getBoundaryCentroid = (
  boundary: boundary
): { lat: number; long: number } => {
  let latSum = 0;
  let longSum = 0;

  for (const point of boundary) {
    latSum += point[1];
    longSum += point[0];
  }

  return {
    lat: latSum / boundary.length,
    long: longSum / boundary.length,
  };
};

/**
 * Factory function to create neighborhoods
 *
 * Neighborhoods are created based on the students that live in them
 * Neighborhoods centroid and boundary are calculated based on the students
 *
 * @param students - Array of students
 * @returns Array of neighborhoods
 */
export default function neighborhoodFactory(
  students: Student[]
): Neighborhoods {
  neighborhoods = {};

  const partialNeighborhoods: PartialNeighborhoods = {};

  for (const student of students) {
    const neighborhoodName = student.neighbourhood;

    if (!partialNeighborhoods[neighborhoodName]) {
      partialNeighborhoods[neighborhoodName] = {
        name: neighborhoodName,
        students: [],
      };
    }
    partialNeighborhoods[neighborhoodName].students.push(student);
  }

  Object.keys(partialNeighborhoods).forEach((key) => {
    const hood = geoJson.features.find((neighborhood) => {
      return neighborhood.properties.name === key;
    });

    const boundary = hood.geometry.coordinates[0] as boundary;
    const centroid = getBoundaryCentroid(boundary);

    console.log(`Centroid for ${key} is ${centroid.lat}, ${centroid.long}`);

    partialNeighborhoods[key].centroid = centroid;

    const feature: Feature = {
      id: key,
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [boundary],
        type: "Polygon",
      },
    };

    partialNeighborhoods[key].feature = feature;
    neighborhoods[key] = partialNeighborhoods[key] as Neighborhood;
  });

  return neighborhoods;
}
