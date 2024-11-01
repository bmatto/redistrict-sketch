export type Neighborhood = {
  name: string;
  gradeLevelCounts: {
    gradeLevel: string;
    count: number;
  }[];
};

type ByGradeLevel = {
  grade14: number;
  grade1: number;
  grade2: number;
  grade3: number;
  grade4: number;
  grade5: number;
};

export type School = {
  name: string;
  frlCount: number;
  iepCount: number;
  studentCount: number;
  projectedStudentCount: number;
  sectionCount: number;
  num504: number;
  sectionsByGrade: {
    grade14: {
      numStudents: number;
      numSections: number;
      sectionSize: number;
    };
    grade1: {
      numStudents: number;
      numSections: number;
      sectionSize: number;
    };
    grade2: {
      numStudents: number;
      numSections: number;
      sectionSize: number;
    };
    grade3: {
      numStudents: number;
      numSections: number;
      sectionSize: number;
    };
    grade4: {
      numStudents: number;
      numSections: number;
      sectionSize: number;
    };
    grade5: {
      numStudents: number;
      numSections: number;
      sectionSize: number;
    };
  };
  iepByGradeLevel: ByGradeLevel;
  frlByGradeLevel: ByGradeLevel;
};

export type Data = {
  neighborhoods: Array<Neighborhood>;
  schools: Array<School>;
  currentSections: {
    name: string;
    grades: {
      id: string;
      grade: number;
      count: number;
      numSections: number;
    }[];
  }[];
  assignedConditions: Array<{
    schoolName: string;
    neighborhoods: string[];
  }>;
  assignmentPreconditions: Array<{
    schoolName: string;
    neighborhoods: string[];
  }>;
};

export type EstimatedImpact = {
  preConditionNeighborhoods: string[];
  assignmentNeighborhoods: string[];
  preConditionSet: Set<string>;
  assignmentSet: Set<string>;
  addedNeighborhoods: Set<string>;
  removedNeighborhoods: Set<string>;
};
