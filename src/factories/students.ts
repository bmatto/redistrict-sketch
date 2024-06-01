import { Student } from "../types";

const students: Student[] = [];

export const getStudents = (): Student[] => students;

export const studentFactory = (studentsFromData: Student[]) => {
  students.push(...studentsFromData);

  return students;
};
