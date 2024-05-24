//import * as Papa from "papaparse";
import fs from "fs";
import Papa from "papaparse";

import { School, Student } from "./types.js";
import neighborhoodFactory from "./factories/neighborhoods.js";
import schoolFactory from "./factories/schools.js";

const CLASS_SIZE = 20;

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

export default async function main(): Promise<{
  schoolMessages: String[];
}> {
  try {
    let students = await loadStudentsFromCSV("sample_data.csv");
    students = students.filter((student) => {
      return student.name && student.formattedAddress.includes("Portsmouth");
    });

    const neighborhoodsMap = neighborhoodFactory(students);
    const neighborhoods = Object.values(neighborhoodsMap);
    const schools = schoolFactory(neighborhoods);
    const schoolMessages = logSchoolAssignments(Object.values(schools));

    fs.writeFileSync("finalAssignments.json", JSON.stringify(schools, null, 2));

    return { schoolMessages };
  } catch (error) {
    console.error("Error loading students:", error);
    throw error;
  }
}

// main(schoolFactory());
