export default `type Student {
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

# type Neighborhood {
#   name: String
#   lat: Float
#   long: Float
#   students: [Student]
# }

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
}

# The "Query" type is special: it lists all of the available queries that
# clients can execute, along with the return type for each. In this
# case, the "books" query returns an array of zero or more Books (defined above).
type Query {
  schools: [School]
  neighborhoods: [Neighborhood]
}
`