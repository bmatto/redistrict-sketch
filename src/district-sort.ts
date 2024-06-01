//import * as Papa from "papaparse";
import fs from "fs";
import Papa from "papaparse";

import { School, Student } from "./types.js";
import neighborhoodFactory from "./factories/neighborhoods.js";
import schoolFactory from "./factories/schools.js";
import { studentFactory } from "./factories/students.js";

const CLASS_SIZE = 19;

function logSchoolAssignments(schools: School[]): String[] {
  const schoolMessages: String[] = [];

  for (const school of schools) {
    const schoolFRL = school.students.filter((student) => {
      return student.FRL !== false;
    });

    const schoolIEP = school.students.filter((student) => {
      return student.IEP !== false;
    });

    const frlByGradeLevel = schoolFRL.reduce((acc, student) => {
      if (!acc["grade" + student.gradeLevel]) {
        acc["grade" + student.gradeLevel] = 0;
      }
      acc["grade" + student.gradeLevel]++;
      return acc;
    }, {});

    const iepByGradeLevel = schoolIEP.reduce((acc, student) => {
      if (!acc["grade" + student.gradeLevel]) {
        acc["grade" + student.gradeLevel] = 0;
      }
      acc["grade" + student.gradeLevel]++;
      return acc;
    }, {});

    console.log({ iepByGradeLevel });
    console.log({ frlByGradeLevel });

    school.frlCount = schoolFRL.length;
    school.iepCount = schoolIEP.length;
    school.frlByGradeLevel = frlByGradeLevel;
    school.iepByGradeLevel = iepByGradeLevel;

    schoolMessages.push(
      `\n\nSchool: ${school.name}
      Total students: ${school.students.length}
      Free and Reduced Lunch: ${school.frlCount}
      IEP: ${school.iepCount}\n`
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
    let students = await loadStudentsFromCSV("psm_data.csv");
    students = students.filter((student) => {
      return student.name && student.formattedAddress.includes("Portsmouth");
    });

    studentFactory(students);
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
