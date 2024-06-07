import { School, Student, SchoolName } from "../types";

const students: Student[] = [];

export const getStudents = (): Student[] => students;

export const studentFactory = (schools: {
  [K in SchoolName]: School;
}) => {
  const students = [];

  Object.values(schools).forEach((school) => {
    students.push(...school.students);
  });

  return students;
};
