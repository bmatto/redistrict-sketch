import * as Papa from "papaparse";
import * as fs from "fs";

interface Student {
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  gradeLevel: number;
  neighbourhood: string;
}

interface School {
  name: string;
  lat: number;
  long: number;
  maxCapacity: number;
  students: Student[];
  capacityOverflowHandled: boolean;
}

interface Neighborhood {
  name: string;
  lat: number;
  long: number;
  students: Student[];
}

const schools: School[] = [
  {
    name: "Little Harbor",
    lat: 43.0671615,
    long: -70.7542339,
    maxCapacity: 315,
    students: [],
    capacityOverflowHandled: false,
  },
  {
    name: "Dondero",
    lat: 43.0378247,
    long: -70.7709701,
    maxCapacity: 335,
    students: [],
    capacityOverflowHandled: false,
  },
  {
    name: "New Franklin",
    lat: 43.0770831,
    long: -70.7791392,
    maxCapacity: 250,
    students: [],
    capacityOverflowHandled: false,
  },
];

const CLASS_SIZE = 20;

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
        calculateDistance(a.lat, a.long, school.lat, school.long)
      )
    );
    const distB = Math.min(
      ...schools.map((school) =>
        calculateDistance(b.lat, b.long, school.lat, school.long)
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
        neighborhood.lat,
        neighborhood.long,
        prev.lat,
        prev.long
      );
      const currDistance = calculateDistance(
        neighborhood.lat,
        neighborhood.long,
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

      closestSchool.students.push(...neighborhood.students);
    } else {
      // Find the next closest school that can accommodate the students

      console.log(
        `${neighborhood.name} (${neighborhood.students.length})`,
        "students could not be assigned to",
        `${closestSchool.name} (${closestSchool.students.length}) - Max ${closestSchool.maxCapacity}`
      );

      let reassigned = false;
      for (const school of schools) {
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

function logSchoolAssignments(schools: School[]): String[] {
  const schoolMessages: String[] = [];

  for (const school of schools) {
    schoolMessages.push(
      `School: ${school.name}\nTotal students: ${school.students.length}\n`
    );

    const gradeLevels: { [key: number]: number } = {};
    for (const student of school.students) {
      if (!gradeLevels[student.gradeLevel]) {
        gradeLevels[student.gradeLevel] = 0;
      }
      gradeLevels[student.gradeLevel]++;
    }
    for (const grade in gradeLevels) {
      schoolMessages.push(
        `Grade ${grade}: ${gradeLevels[grade]} students ${Math.ceil(
          gradeLevels[grade] / CLASS_SIZE
        )} classes\n`
      );
    }
  }

  console.log(...schoolMessages);

  return schoolMessages;
}

function loadStudentsFromCSV(filePath: string): Promise<Student[]> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      Papa.parse(data, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          resolve(results.data as Student[]);
        },
        // @ts-ignore
        error: (error) => {
          reject(error);
        },
      });
    });
  });
}

function deriveAndSetNeighborhoodCentroids(neighborhoodsMap: {
  [key: string]: Neighborhood;
}): void {
  for (const neighborhoodName in neighborhoodsMap) {
    const neighborhood = neighborhoodsMap[neighborhoodName];
    const latSum = neighborhood.students.reduce(
      (prev, curr) => prev + curr.latitude,
      0
    );
    const longSum = neighborhood.students.reduce(
      (prev, curr) => prev + curr.longitude,
      0
    );
    neighborhood.lat = latSum / neighborhood.students.length;
    neighborhood.long = longSum / neighborhood.students.length;
  }
}

export default async function main(): Promise<{
  schools: School[];
  schoolMessages: String[];
}> {
  try {
    let students = await loadStudentsFromCSV("sample_data.csv");
    students = students.filter((student) => {
      return student.name && student.formattedAddress.includes("Portsmouth");
    });
    const neighborhoodsMap: { [key: string]: Neighborhood } = {};

    for (const student of students) {
      const neighborhoodName = student.neighbourhood;

      if (!neighborhoodsMap[neighborhoodName]) {
        neighborhoodsMap[neighborhoodName] = {
          name: neighborhoodName,
          lat: student.latitude,
          long: student.longitude,
          students: [],
        };
      }
      neighborhoodsMap[neighborhoodName].students.push(student);
    }

    deriveAndSetNeighborhoodCentroids(neighborhoodsMap);

    Object.keys(neighborhoodsMap).forEach((key) => {
      console.log(key, neighborhoodsMap[key].lat, neighborhoodsMap[key].long);
    });

    const neighborhoods = Object.values(neighborhoodsMap);
    assignNeighborhoodsToSchools(neighborhoods, schools);

    const schoolMessages = logSchoolAssignments(schools);

    fs.writeFileSync("finalAssignments.json", JSON.stringify(schools, null, 2));

    return { schools, schoolMessages };
  } catch (error) {
    console.error("Error loading students:", error);
    throw error;
  }
}

main();
