import { School, SchoolName, Neighborhood, FeatureProperties } from "../types";

import calculateDistance from "../lib/calculate-distance.js";
import estimateSections from "../lib/estimate-sections.js";

type Schools = {
  [K in SchoolName]: School;
};

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

let schools: Schools = {
  [SchoolNames.LITTLE_HARBOR]: {
    name: SchoolNames.LITTLE_HARBOR,
    lat: 43.0671615,
    long: -70.7542339,
    maxCapacity: 320,
    maxSections: 20,
    students: [],
    capacityOverflowHandled: false,
    properties: schoolProperties[SchoolNames.LITTLE_HARBOR],
  },
  [SchoolNames.DONDERO]: {
    name: SchoolNames.DONDERO,
    lat: 43.0378247,
    long: -70.7709701,
    maxCapacity: 320,
    maxSections: 19,
    students: [],
    capacityOverflowHandled: false,
    properties: schoolProperties[SchoolNames.DONDERO],
  },
  [SchoolNames.NEW_FRANKLIN]: {
    name: SchoolNames.NEW_FRANKLIN,
    lat: 43.0770831,
    long: -70.7791392,
    maxCapacity: 300,
    maxSections: 15,
    students: [],
    capacityOverflowHandled: false,
    properties: schoolProperties[SchoolNames.NEW_FRANKLIN],
  },
};

const initialSchools = JSON.stringify(schools);

let assignedConditions: {
  [neighborhood: string]: SchoolName;
} = {};

const preConditions = {
  ["Osprey Landing"]: SchoolNames.LITTLE_HARBOR,
  ["Hillcrest"]: SchoolNames.DONDERO,
  ["Maplehaven"]: SchoolNames.DONDERO,
  ["Banfield and Ocean"]: SchoolNames.DONDERO,
  ["Cedars"]: SchoolNames.DONDERO,
  ["Elwyn Park"]: SchoolNames.DONDERO,
  ["Greenleaf"]: SchoolNames.DONDERO,
  ["Hillside"]: SchoolNames.DONDERO,
  ["Panaway Manner"]: SchoolNames.NEW_FRANKLIN,
  ["Lafayette Park"]: SchoolNames.DONDERO,
  ["Portsmouth Plains"]: SchoolNames.DONDERO,
  ["Community Campus"]: SchoolNames.DONDERO,
  ["Tucker's Cove"]: SchoolNames.LITTLE_HARBOR,
  ["Peverly West"]: SchoolNames.DONDERO,
  ["Powder House"]: SchoolNames.NEW_FRANKLIN,
  ["Green Belt"]: SchoolNames.DONDERO,
  ["Lang Eastwood"]: SchoolNames.DONDERO,
  ["Beachstone"]: SchoolNames.DONDERO,
  ["Patriots Park"]: SchoolNames.DONDERO,
  ["Cedars Springbrook"]: SchoolNames.DONDERO,
  ["PHS"]: SchoolNames.LITTLE_HARBOR,
  ["Goodwin Park"]: SchoolNames.LITTLE_HARBOR,
  ["South Mill Pond"]: SchoolNames.LITTLE_HARBOR,
  ["Strawbery Banke"]: SchoolNames.LITTLE_HARBOR,
  ["Islington Creek"]: SchoolNames.LITTLE_HARBOR,
  ["Lincoln"]: SchoolNames.LITTLE_HARBOR,
  ["Little Harbor"]: SchoolNames.LITTLE_HARBOR,
  ["Downtown"]: SchoolNames.LITTLE_HARBOR,
  ["West End Yard"]: SchoolNames.NEW_FRANKLIN,
  ["Frank Jones"]: SchoolNames.NEW_FRANKLIN,
  ["Gosling"]: SchoolNames.NEW_FRANKLIN,
  ["Atlantic Heights"]: SchoolNames.NEW_FRANKLIN,
  ["Christian Shore"]: SchoolNames.NEW_FRANKLIN,
  ["New Franklin"]: SchoolNames.NEW_FRANKLIN,
  ["Cutts Cove"]: SchoolNames.NEW_FRANKLIN,
  ["Oxford"]: SchoolNames.NEW_FRANKLIN,
  ["Meadowbrook"]: SchoolNames.NEW_FRANKLIN,
  ["Borthwick"]: SchoolNames.NEW_FRANKLIN,
  ["North End"]: SchoolNames.LITTLE_HARBOR,
};

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
  schools: School[],
  assignments = []
): void {
  const sortedNeighborhoods = sortNeighborhoodsByProximityToSchools(
    neighborhoods,
    schools
  );

  const assignmentConditions = assignments.reduce((acc, assignment) => {
    const schoolName = assignment.schoolName;

    assignment.neighborhoods.forEach((neighborhood) => {
      acc[neighborhood] = schoolName;
    });

    return acc;
  }, {});

  assignedConditions = {
    ...preConditions,
    ...assignmentConditions,
  };

  for (const neighborhood of sortedNeighborhoods) {
    if (assignedConditions[neighborhood.name]) {
      const school = schools.find(
        (school) => school.name === assignedConditions[neighborhood.name]
      );

      console.log(
        "assigning",
        neighborhood.name,
        "students to",
        school.name,
        "based on conditions"
      );

      neighborhood.school = school;
      neighborhood.feature.properties =
        schoolProperties[neighborhood.school.name];
      neighborhood.school.students.push(...neighborhood.students);
      continue;
    }

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
        neighborhood.students.length,
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
            neighborhood.students.length,
            "students to",
            school.name
          );

          neighborhood.school = school;
          neighborhood.feature.properties = schoolProperties[school.name];

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

export const getSchools = (): {
  [K in SchoolName]: School;
} => Object.freeze(schools);

export const getConditions = () => Object.freeze(assignedConditions);

export default function schoolFactory(
  neighborhoods,
  assignments?
): {
  [K in SchoolName]: School;
} {
  schools = JSON.parse(initialSchools);

  assignNeighborhoodsToSchools(
    neighborhoods,
    Object.values(schools),
    assignments
  );

  Object.keys(schools).forEach((schoolName) => {
    const school = schools[schoolName];
    school.sectionsByGrade = estimateSections(
      school.students,
      school.maxSections
    );
  });

  return schools;
}
