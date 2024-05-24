import { School, Neighborhood, FeatureProperties } from "../types";

type SchoolName = "Little Harbor" | "Dondero" | "New Franklin";

type SchoolProperty = {
  [K in SchoolName]: FeatureProperties;
};

export const SchoolNames = {
  LITTLE_HARBOR: "Little Harbor",
  DONDERO: "Dondero",
  NEW_FRANKLIN: "New Franklin",
} as const;

export const schoolProperties: SchoolProperty = {
  [SchoolNames.LITTLE_HARBOR]: {
    stroke: "#000000",
    strokeWidth: 1,
    strokeOpacity: 1,
    fill: "#0000FF",
    fillOpacity: 1,
  },
  [SchoolNames.DONDERO]: {
    stroke: "#000000",
    strokeWidth: 1,
    strokeOpacity: 1,
    fill: "#ff0000",
    fillOpacity: 1,
  },
  [SchoolNames.NEW_FRANKLIN]: {
    stroke: "#000000",
    strokeWidth: 1,
    strokeOpacity: 1,
    fill: "#ffff00",
    fillOpacity: 1,
  },
};

const schools: {
  [K in SchoolName]: School;
} = {
  [SchoolNames.LITTLE_HARBOR]: {
    name: SchoolNames.LITTLE_HARBOR,
    lat: 43.0671615,
    long: -70.7542339,
    maxCapacity: 315,
    students: [],
    capacityOverflowHandled: false,
  },
  [SchoolNames.DONDERO]: {
    name: SchoolNames.DONDERO,
    lat: 43.0378247,
    long: -70.7709701,
    maxCapacity: 335,
    students: [],
    capacityOverflowHandled: false,
  },
  [SchoolNames.NEW_FRANKLIN]: {
    name: SchoolNames.NEW_FRANKLIN,
    lat: 43.0770831,
    long: -70.7791392,
    maxCapacity: 250,
    students: [],
    capacityOverflowHandled: false,
  },
};

function calculateDistance(
  lat1: number,
  long1: number,
  lat2: number,
  long2: number
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLong = toRad(long2 - long1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLong / 2) *
      Math.sin(dLong / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function sortNeighborhoodsByProximityToSchools(
  neighborhoods: Neighborhood[],
  schools: School[]
): Neighborhood[] {
  return neighborhoods.sort((a, b) => {
    const distA = Math.min(
      ...schools.map((school) =>
        calculateDistance(
          a.centroid.lat,
          a.centroid.long,
          school.lat,
          school.long
        )
      )
    );
    const distB = Math.min(
      ...schools.map((school) =>
        calculateDistance(
          b.centroid.lat,
          b.centroid.long,
          school.lat,
          school.long
        )
      )
    );
    return distA - distB;
  });
}

function assignNeighborhoodsToSchools(
  neighborhoods: Neighborhood[],
  schools: School[]
): void {
  const sortedNeighborhoods = sortNeighborhoodsByProximityToSchools(
    neighborhoods,
    schools
  );

  for (const neighborhood of sortedNeighborhoods) {
    const closestSchool = schools.reduce((prev, curr) => {
      const prevDistance = calculateDistance(
        neighborhood.centroid.lat,
        neighborhood.centroid.long,
        prev.lat,
        prev.long
      );
      const currDistance = calculateDistance(
        neighborhood.centroid.lat,
        neighborhood.centroid.long,
        curr.lat,
        curr.long
      );
      return prevDistance < currDistance ? prev : curr;
    });

    if (
      closestSchool.students.length + neighborhood.students.length <=
      closestSchool.maxCapacity
    ) {
      console.log(
        "assigning",
        neighborhood.name,
        "students to",
        closestSchool.name
      );

      neighborhood.school = closestSchool;
      neighborhood.feature.properties = schoolProperties[closestSchool.name];

      closestSchool.students.push(...neighborhood.students);
    } else {
      // Find the next closest school that can accommodate the students

      console.log(
        `${neighborhood.name} (${neighborhood.students.length})`,
        "students could not be assigned to",
        `${closestSchool.name} (${closestSchool.students.length}) - Max ${closestSchool.maxCapacity}`
      );

      let reassigned = false;

      // const schoolsSortedByDistanceToNeighborhood = schools;

      const schoolsSortedByDistanceToNeighborhood = schools
        .slice()
        .sort((a, b) => {
          const distA = calculateDistance(
            neighborhood.centroid.lat,
            neighborhood.centroid.long,
            a.lat,
            a.long
          );
          const distB = calculateDistance(
            neighborhood.centroid.lat,
            neighborhood.centroid.long,
            b.lat,
            b.long
          );
          return distA - distB;
        });

      for (const school of schoolsSortedByDistanceToNeighborhood) {
        console.log(`checking ${school.name}`);

        if (
          school !== closestSchool &&
          (school.students.length + neighborhood.students.length <=
            school.maxCapacity ||
            school.capacityOverflowHandled === false)
        ) {
          console.log(
            "assigning",
            neighborhood.name,
            "students to",
            school.name
          );

          neighborhood.school = closestSchool;
          neighborhood.feature.properties =
            schoolProperties[closestSchool.name];

          school.students.push(...neighborhood.students);
          reassigned = true;
          school.capacityOverflowHandled = true;
          break;
        }
      }
      if (!reassigned) {
        // Handle cases where no school can accommodate the neighborhood
        // find the next closest school that can accommodate the students

        schools.forEach((school) => {});

        console.log(
          `Neighborhood ${neighborhood.name} could not be assigned within capacity limits.`
        );

        console.log(neighborhood.students.length);

        console.log(
          schools.map((school) => {
            console.log(
              school.students.length,
              school.maxCapacity,
              school.name,
              school.capacityOverflowHandled
            );
          })
        );
      }
    }
  }
}

export const getSchools = () => Object.freeze(schools);

export default function schoolFactory(neighborhoods): {
  [K in SchoolName]: School;
} {
  //console.log("neighborhoods", neighborhoods);
  // console.log("schools", schools);

  assignNeighborhoodsToSchools(neighborhoods, Object.values(schools));

  return schools;
}
