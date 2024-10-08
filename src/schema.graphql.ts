export default `type Student {
  gradeLevel: Int
  neighbourhood: String
  latitude: Float
  longitude: Float
  School: String
  formattedAddress: String
  # name: String
}

type ByGrade {
  grade14: Int
  grade1: Int
  grade2: Int
  grade3: Int
  grade4: Int
  grade5: Int
}

type NewGrade {
  numSections: Int
  sections: [[Student]]
  numStudents: Int
  sectionSize: Int
}

type SectionsByGrade {
  grade14: NewGrade
  grade1: NewGrade
  grade2: NewGrade
  grade3: NewGrade
  grade4: NewGrade
  grade5: NewGrade
}

type School {
  name: String
  lat: Float
  long: Float
  maxCapacity: Int
  students: [Student]
  studentCount: Int
  sectionCount: Int
  sectionsByGrade: SectionsByGrade
  properties: Properties
  frlCount: Int
  iepCount: Int
  num504: Int
  frlByGradeLevel: ByGrade
  iepByGradeLevel: ByGrade
}

type Properties {
  stroke: String
  strokeWidth: Int
  strokeOpacity: Float
  fill: String
  fillOpacity: Float
}

type Geometry {
  type: String
  coordinates: [[[Float]]]
}

type Feature {
  type: String
  properties: Properties
  geometry: Geometry
}

type Coordinate {
  lat: Float
  long: Float
}

type Neighborhood {
  name: String
  students: [Student]
  school: School
  boundary: [[Float]]
  centroid: Coordinate
  feature: Feature
  gradeLevelCounts: [GradeLevelCount]
}

type GradeLevelCount {
  gradeLevel: Int
  count: Int
}

type Grade {
  id: String
  grade: Int
  students: [Student]
  count: Int
  numSections: Int
}

type SchoolWithSection {
  name: String
  grades: [Grade]
}

type Success {
  success: Boolean
}

type AssignedCondition {
  schoolName: String
  neighborhoods: [String]
}

input AssignmentInput {
  schoolName: String
  neighborhoods: [String]
}

# The "Query" type is special: it lists all of the available queries that
# clients can execute, along with the return type for each. In this
# case, the "books" query returns an array of zero or more Books (defined above).
type Query {
  school(schoolName: String): School
  schools: [School]
  neighborhoods(schoolName: String): [Neighborhood]
  neighborhoodFeatureGeoJson: [Feature]
  students(neighbourhood: String): [Student]
  currentSections: [SchoolWithSection]
  assignedConditions: [AssignedCondition]
}

type Mutation {
  setNeighborhoods(assignments: [AssignmentInput]): [Neighborhood]
  reset: Success
}
`