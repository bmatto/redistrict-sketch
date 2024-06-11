import { __, prop, groupBy, count } from "ramda";
import neighborhoodFactory, {
  getNeighborHoods,
} from "./factories/neighborhoods.js";
import { getSchools, getConditions } from "./factories/schools.js";
import { getStudents } from "./factories/students.js";
import districtSort from "./district-sort.js";
import { School } from "./types.js";

export const resolvers = {
  Query: {
    school: (__parent, args) => {
      const { schoolName } = args;
      const schools = getSchools();
      const school: School = schools[schoolName];

      if (!school) {
        return null;
      }

      school.studentCount = school.students.length;

      return school;
    },
    schools: () => {
      const schools = Object.values(getSchools());

      schools.forEach((school) => {
        school.studentCount = school.students.length;
        const grades = Object.values(school.sectionsByGrade);

        school.sectionCount = grades.reduce((acc, grade) => {
          acc += grade.sections.length;
          return acc;
        }, 0);

        console.log(school.name, school.sectionCount, school.studentCount);
      });

      return schools;
    },
    neighborhoods: (__parent, args) => {
      const { schoolName } = args;
      const neighborhoods = Object.values(getNeighborHoods());

      if (schoolName) {
        return neighborhoods.filter(
          (neighborhood) => neighborhood.school.name === schoolName
        );
      }

      return neighborhoods;
    },
    neighborhoodFeatureGeoJson: () => {
      const neighborhoods = Object.values(getNeighborHoods());

      return neighborhoods
        .map((neighborhood) => neighborhood.feature)
        .filter((n) => {
          return n.geometry.coordinates[0].length > 3;
        });
    },
    students: (__parent, args) => {
      // This doesn't do anything yet

      const students = getStudents();

      if (args.neighbourhood) {
        return students.filter(
          (student) => student.neighbourhood === args.neighbourhood
        );
      }

      return students;
    },
    currentSections: (__parent, args: { schoolName: string }) => {
      const classSize = 19;
      const SCHOOL_CALENDAR = "School Calendar";
      const Calendars = {
        DONDERO: "24-25 Dondero School",
        LITTLE_HARBOUR: "24-25 Little Harbour School",
        NEW_FRANKLIN: "24-25 New Franklin School",
      };

      // @ts-ignore
      const studentsBySchool = groupBy(prop(SCHOOL_CALENDAR), getStudents());

      return Object.keys(Calendars).map((schoolName) => {
        const schoolStudents = studentsBySchool[Calendars[schoolName]] || [];

        // @ts-ignore
        const studentsByGrade = groupBy(prop("gradeLevel"), schoolStudents);

        const grades = Object.keys(studentsByGrade).map((grade, index) => {
          const students = studentsByGrade[grade];
          const numSections = Math.ceil(students.length / classSize);
          return {
            id: `${grade}-${index}`,
            grade,
            students: studentsByGrade[grade],
            count: studentsByGrade[grade].length,
            numSections,
          };
        });

        return {
          name: schoolName,
          grades: grades,
        };
      });
    },
    assignedConditions: (): Array<{
      schoolName: string;
      neighborhoods: string[];
    }> => {
      const assignedConditions = getConditions();

      return Object.keys(assignedConditions).reduce((acc, key) => {
        const schoolName = assignedConditions[key];
        const schoolAssignments = acc.find((a) => a.schoolName === schoolName);

        if (schoolAssignments) {
          schoolAssignments.neighborhoods.push(key);
          return acc;
        }

        acc.push({
          schoolName,
          neighborhoods: [key],
        });

        return acc;
      }, []);
    },
  },
  Mutation: {
    setNeighborhoods: async (__parent, args) => {
      console.log("Setting neighborhoods", args);

      const { assignments } = args;

      await districtSort(assignments);

      const neighborhoods = Object.values(getNeighborHoods());

      return neighborhoods;
    },
    reset: async (__parent, args) => {
      console.log("Resetting");

      await districtSort([]);

      return {
        success: true,
      };
    },
  },
};
