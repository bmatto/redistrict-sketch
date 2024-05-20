import { createObjectCsvWriter } from "csv-writer";
import NodeGeocoder from "node-geocoder";
import * as path from "path";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const MAP_BOX_API_KEY = process.env.MAP_BOX_API_KEY;

console.log("MAP_BOX_API_KEY", MAP_BOX_API_KEY);

type GeoCodedAddress = {
  name?: string;
  gradeLevel?: number;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
  country?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  streetName?: string;
  streetNumber?: string;
  countryCode?: string;
  neighbourhood?: string;
  provider?: string;
};

const NUM_ROWS = 900;

// Sample data for neighborhoods and streets in Portsmouth, NH
// const neighborhoods = ["North End", "South End", "West End"];
const streets = [
  "State Street",
  "Islington Street",
  "Middle Street",
  "Pleasant Street",
  "Maplewood Avenue",
  "Lafayette Road",
  "Congress Street",
  "Market Street",
  "Deer Street",
  "Hanover Street",
  "Bridge Street",
  "Bartlett Street",
  "Miller Avenue",
  "Marcy Street",
  "Fleet Street",
  "Russell Street",
  "Court Street",
  "Daniel Street",
  "South Street",
  "Aldrich Road",
  "Sagamore Avenue",
  "Woodbury Avenue",
  "Broad Street",
  "Lincoln Avenue",
  "Richards Avenue",
  "Cabot Street",
  "Andrew Jarvis Drive",
  "Junkins Avenue",
  "Elwyn Road",
  "Spinney Road",
  "Greenleaf Avenue",
  "Thornton Street",
  "Union Street",
  "Maple Haven",
  "Fernald Court",
  "Brewster Street",
  "Austin Street",
  "Sherburne Road",
  "South Mill Street",
  "Mirona Road",
  "Farm Lane",
  "Peverly Hill Road",
  "Langdon Street",
  "McKinley Road",
  "Willard Avenue",
  "Adams Avenue",
  "Madison Street",
  "Cass Street",
  "Kane Street",
  "Leslie Drive",
  "Pinehurst Road",
  "Parrott Avenue",
  "Mechanic Street",
  "Salter Street",
  "Gardner Street",
  "Whipple Street",
  "Gates Street",
  "Hancock Street",
  "New Castle Avenue",
  "Austin Lane",
  "Richards Lane",
  "Summit Avenue",
  "Austin Court",
  "Marcy Court",
  "Vaughan Street",
  "High Street",
  "Pearl Street",
  "Rockland Street",
  "Parker Street",
  "Wibird Street",
  "Brackett Lane",
  "Colonial Drive",
  "Banfield Road",
  "Echo Avenue",
  "Granite Street",
  "Leslie Drive",
  "Cass Street",
  "Wibird Street",
  "Echo Avenue",
  "Colonial Drive",
  "Rockland Street",
  "Parker Street",
  "Peverly Hill Road",
  "Sagamore Avenue",
  "Richards Avenue",
  "Greenleaf Avenue",
  "McKinley Road",
  "Lincoln Avenue",
  "Spinney Road",
  "Summit Avenue",
  "South Street",
  "Langdon Street",
  "Pinehurst Road",
  "Brewster Street",
  "Farm Lane",
  "Mechanic Street",
  "Salter Street",
  "Gardner Street",
  "Willard Avenue",
  "Whipple Street",
];

// Generate random names
const firstNames = [
  "Alice",
  "Bob",
  "Charlie",
  "Daisy",
  "Ethan",
  "Fiona",
  "George",
  "Hannah",
  "Isaac",
  "Julia",
  "Kevin",
  "Lily",
  "Michael",
  "Nancy",
  "Oliver",
  "Paula",
  "Quincy",
  "Rachel",
  "Sam",
  "Tina",
];
const lastNames = [
  "Johnson",
  "Smith",
  "Brown",
  "Miller",
  "Davis",
  "Garcia",
  "White",
  "Wilson",
  "Lee",
  "Kim",
  "Clark",
  "Adams",
  "Scott",
  "Allen",
  "Harris",
  "Baker",
  "Reed",
  "Green",
  "Hill",
  "Turner",
];

// Step 2: Geocode addresses
const geocoder = NodeGeocoder({
  provider: "mapbox", // or any other provider
  apiKey: MAP_BOX_API_KEY,
});

function generateRandomName(): string {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
}

Promise.resolve(true).then(async () => {
  // Generate sample data
  const data: GeoCodedAddress[] = [];
  while (data.length < NUM_ROWS) {
    let geocodedResult;
    const name = generateRandomName();
    const address = `${Math.floor(Math.random() * 2000) + 1} ${
      streets[Math.floor(Math.random() * streets.length)]
    }, Portsmouth, NH 03801`;
    const gradeLevel = Math.floor(Math.random() * 5) + 1;

    // const neighborhood =
    //   neighborhoods[Math.floor(Math.random() * neighborhoods.length)];

    // // const stub = { name, address, gradeLevel, neighborhood };

    try {
      geocodedResult = await geocoder.geocode(address);
    } catch (error) {
      console.log("Error geocoding address:", error);
      continue;
    }

    const geocoded = geocodedResult[0] as GeoCodedAddress;

    if (geocoded && geocoded.neighbourhood) {
      console.log("pushing record", name, geocoded.neighbourhood);
      data.push({
        name,
        gradeLevel,
        formattedAddress: geocoded.formattedAddress,
        latitude: geocoded.latitude,
        longitude: geocoded.longitude,
        neighbourhood: geocoded.neighbourhood,
        zipcode: geocoded.zipcode,
      });
    }
  }

  // for (let i = 0; i < 10; i++) {

  // }

  // Define the CSV file path and writer
  const csvFilePath = path.join(__dirname, "sample_data.csv");
  const csvWriter = createObjectCsvWriter({
    path: csvFilePath,
    header: [
      { id: "name", title: "name" },
      { id: "gradeLevel", title: "gradeLevel" },
      { id: "formattedAddress", title: "formattedAddress" },
      { id: "latitude", title: "latitude" },
      { id: "longitude", title: "longitude" },
      { id: "neighbourhood", title: "neighbourhood" },
      { id: "zipcode", title: "zipcode" },
    ],
  });

  // Write data to CSV
  csvWriter
    .writeRecords(data)
    .then(() => {
      console.log("CSV file was written successfully");
    })
    .catch((error) => {
      console.error("Error writing CSV file:", error);
    });
});
