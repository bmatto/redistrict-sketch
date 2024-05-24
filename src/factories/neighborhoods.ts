import { Neighborhood, Student, Feature } from "../types.js";

const neighborhoods: {
  [key: string]: Neighborhood;
} = {};

export const getNeighborHoods = () => {
  return Object.freeze(neighborhoods);
};

function getNeighborHoodCentroidAndBoundary(students: Student[]): {
  centroid: { lat: number; long: number };
  boundary: [number, number][];
} {
  let minLatitude = students[0].latitude;
  let maxLatitude = students[0].latitude;
  let minLongitude = students[0].longitude;
  let maxLongitude = students[0].longitude;
  let latSum = 0;
  let longSum = 0;

  for (const student of students) {
    latSum += student.latitude;
    longSum += student.longitude;

    if (student.latitude < minLatitude) {
      minLatitude = student.latitude;
    }
    if (student.latitude > maxLatitude) {
      maxLatitude = student.latitude;
    }
    if (student.longitude < minLongitude) {
      minLongitude = student.longitude;
    }
    if (student.longitude > maxLongitude) {
      maxLongitude = student.longitude;
    }
  }

  const centroid = {
    lat: latSum / students.length,
    long: longSum / students.length,
  };

  const boundary: [number, number][] = [
    [maxLongitude, maxLatitude],
    [minLongitude, maxLatitude],
    [minLongitude, minLatitude],
    [maxLongitude, minLatitude],

    [maxLongitude, maxLatitude],
  ];

  return { centroid, boundary };
}

/**
 * Factory function to create neighborhoods
 *
 * Neighborhoods are created based on the students that live in them
 * Neighborhoods centroid and boundary are calculated based on the students
 *
 * @param students - Array of students
 * @returns Array of neighborhoods
 */
export default function neighborhoodFactory(students: Student[]): {
  [key: string]: Neighborhood;
} {
  for (const student of students) {
    const neighborhoodName = student.neighbourhood;

    if (!neighborhoods[neighborhoodName]) {
      neighborhoods[neighborhoodName] = {
        name: neighborhoodName!,
        students: [],
      };
    }
    neighborhoods[neighborhoodName].students.push(student);
  }

  Object.keys(neighborhoods).forEach((key) => {
    const { centroid, boundary } = getNeighborHoodCentroidAndBoundary(
      neighborhoods[key].students
    );

    neighborhoods[key].centroid! = centroid;
    // neighborhoods[key].boundary! = boundary;

    const feature: Feature = {
      id: key,
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [boundary],
        type: "Polygon",
      },
    };

    neighborhoods[key].feature = feature;
  });

  return neighborhoods;
}
