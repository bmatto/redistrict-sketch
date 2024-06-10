import { expect, jest, test, describe } from "@jest/globals";

import estimateSections from "./estimate-sections";
import { Student } from "../types";

const grades = [14, 1, 2, 3, 4, 5];

describe("estimateSections", () => {
  test("should return an object with keys for each grade level", () => {
    expect(estimateSections([], 1)).toEqual({});
  });

  test("foo", () => {
    const students = new Array(320).fill(0).map((_, i) => {
      return {
        name: `student${i}`,
        formattedAddress: "123 Main St",
        latitude: 43.123,
        longitude: -70.123,
        gradeLevel: grades[i % grades.length],
        neighbourhood: "Downtown",
        FRL: "F",
        IEP: false,
      } as Student;
    });

    const sectionsByGrade = estimateSections(students, 19);

    Object.keys(sectionsByGrade).forEach((grade) => {
      const section = sectionsByGrade[grade];

      console.log(grade, { section });
    });

    expect(sectionsByGrade["14"].length).toEqual(3);
  });
});
