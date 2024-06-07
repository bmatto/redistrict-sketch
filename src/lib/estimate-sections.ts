import { Student, Grade, SectionsByGrade } from "../types";

type StudentsByGrade = {
  [K in Grade]?: Student[];
};

const CLASS_SIZE = 19;

const maxSectionsPerGrade = 5;
const minSectionsPerGrade = 3;

const gradeSectionSizeMap = {
  grade14: [14, 17],
  grade1: [14, 17],
  grade2: [14, 17],
  grade3: [14, 17],
  grade4: [15, 19],
  grade5: [15, 19],
};

function assignStudentsToSections(
  studentsByGrade: StudentsByGrade,
  sectionsByGrade: SectionsByGrade,
  sectionSizeOverride?: number
): [SectionsByGrade, number] {
  let numSections = 0;

  console.log({ sectionSizeOverride });

  for (const grade in studentsByGrade) {
    const [minSectionSize, maxSectionSize] = gradeSectionSizeMap[grade];
    const sectionSize = sectionSizeOverride
      ? minSectionSize + sectionSizeOverride
      : minSectionSize;
    const studentsInGrade = studentsByGrade[grade];
    const sectionsInGrade = Math.ceil(
      studentsByGrade[grade].length / sectionSize
    );

    numSections += sectionsInGrade;

    sectionsByGrade[grade] = {
      numStudents: studentsInGrade.length,
      numSections: sectionsInGrade,
      sectionSize: sectionSize,
      sections: Array.from({ length: sectionsInGrade }, () => []),
    };

    for (let i = 0; i < studentsInGrade.length; i++) {
      const sectionIndex = i % sectionsInGrade;
      sectionsByGrade[grade].sections[sectionIndex].push(studentsInGrade[i]);
    }
  }

  return [sectionsByGrade, numSections];
}

export default function estimateSections(
  students: Student[],
  maxSections: number
) {
  let numSections = 0;
  const sectionsByGrade: SectionsByGrade = {};

  const studentsByGrade: StudentsByGrade = students.reduce((acc, student) => {
    const grade = `grade${student.gradeLevel}` as Grade;

    if (!acc[grade]) {
      acc[grade] = [];
    }
    acc[grade].push(student);
    return acc;
  }, {});

  let [assignedSectionsByGrade, createdSections] = assignStudentsToSections(
    studentsByGrade,
    sectionsByGrade
  );

  let sectionSizeOverride = 0;
  while (createdSections > maxSections) {
    sectionSizeOverride++;
    const retrySectionByGrade: SectionsByGrade = {};

    const retriedSections = assignStudentsToSections(
      studentsByGrade,
      retrySectionByGrade,
      sectionSizeOverride
    );

    assignedSectionsByGrade = retriedSections[0];
    createdSections = retriedSections[1];

    if (sectionSizeOverride > 5) {
      break;
    }
  }

  if (createdSections > maxSections) {
    console.log(numSections);
    console.log("too many sections");
  }

  console.log({ createdSections });

  return assignedSectionsByGrade;
}
