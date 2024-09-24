// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
export const typeDefs = `#graphql
type Student {
  name: String
  formattedAddress: String
  latitude: Float
  longitude: Float
  gradeLevel: Int
  neighborhood: String
}

type School {
  name: String
  lat: Float
  long: Float
  maxCapacity: Int
  students: [Student]
}

type Neighborhood {
  name: String
  lat: Float
  long: Float
  students: [Student]
  gradeLevelCounts: [GradeLevelCount]
}

type GradeLevelCount {
  gradeLevel: Int
  count: Int
}

# The "Query" type is special: it lists all of the available queries that
# clients can execute, along with the return type for each. In this
# case, the "books" query returns an array of zero or more Books (defined above).
type Query {
  schools: [School]
  neighborhoods: [Neighborhood]
}

`;
