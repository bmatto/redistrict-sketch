import { School, Student, SchoolName } from "../types";

// Dead code
const students: Student[] = [];
export const getStudents = (): Student[] => students;
// End dead code

export const studentFactory = (schools: {
  [K in SchoolName]: School;
}) => {
  const students = [];

  Object.values(schools).forEach((school) => {
    students.push(...school.students);
  });

  return students;
};
