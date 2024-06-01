import { createObjectCsvWriter } from "csv-writer";
import NodeGeocoder from "node-geocoder";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import calculateDistance from "./lib/calculate-distance.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  "Miller Avenue",
  "Marcy Street",
  "Fleet Street",
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
  "Rockland Street",
  "Parker Street",
  "Wibird Street",
  "Brackett Lane",
  "Colonial Drive",
  "Banfield Road",
  "Echo Avenue",
  "Leslie Drive",
  "Cass Street",
  "Wibird Street",
  "Echo Avenue",
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
  "Osprey Drive",
  "Kearsarge Way",
  "Wedgewood Road",
  "Freedom Circle",
  "Beachstone Drive",
  "Harding Road",
  "FW Hartford Drive",
  "Taft Road",
  "Coolidge Drive",
  "Denise Street",
  "Pamela Drive",
  "Suzanne Drive",
  "Mariette Drive",
  "Buckminster Way",
  "Colonial Drive",
  "Mason Ave",
  "Greenside Ave",
  "Sherbourne Ave",
  "Holly Lane",
  "Gosport Road",
  "Odiorne Point Road",
  "Essex Ave",
  "Sheffield Road",
  "Coakley Road",
  "Larry Lane",
  "Blue Heron Drive",
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
  const dataWithoutNeighbourhood: GeoCodedAddress[] = [];
  while (data.length + dataWithoutNeighbourhood.length < NUM_ROWS) {
    let geocodedResult;
    const name = generateRandomName();
    const number = Math.floor(Math.random() * 1000) + 1;
    const street = streets[Math.floor(Math.random() * streets.length)];
    const numberAndStreet = `${number} ${street}`;
    const address = `${numberAndStreet}, Portsmouth, NH 03801`;
    const gradeLevel = Math.floor(Math.random() * 6);

    try {
      geocodedResult = await geocoder.geocode(address);
    } catch (error) {
      console.log("Error geocoding address:", error);
      continue;
    }

    const geocoded = geocodedResult[0] as GeoCodedAddress;

    let finalAddress: string;
    const formattedAddress = geocoded?.formattedAddress;

    if (!formattedAddress || !formattedAddress.includes(street)) {
      finalAddress = address;
    } else {
      finalAddress = formattedAddress;
    }

    console.log("Geocoded address", finalAddress, geocoded?.neighbourhood);

    if (geocoded && geocoded.neighbourhood) {
      console.log("pushing record", name, geocoded.neighbourhood);

      data.push({
        name,
        gradeLevel,
        formattedAddress: finalAddress,
        latitude: geocoded.latitude,
        longitude: geocoded.longitude,
        neighbourhood: geocoded.neighbourhood,
        zipcode: geocoded.zipcode,
      });
    } else if (geocoded) {
      dataWithoutNeighbourhood.push({
        name,
        gradeLevel,
        formattedAddress: finalAddress,
        latitude: geocoded.latitude,
        longitude: geocoded.longitude,
        zipcode: geocoded.zipcode,
      });
    } else {
      console.log("Geocode false", address);
    }
  }

  dataWithoutNeighbourhood.forEach((record) => {
    const { latitude, longitude } = record;

    console.log(
      "Finding closest record for",
      record.formattedAddress,
      latitude,
      longitude
    );

    const closestRecord = data.reduce((closest, current) => {
      const closestLatLong = {
        latitude: closest.latitude,
        longitude: closest.longitude,
      };
      const currentLatLong = {
        latitude: current.latitude,
        longitude: current.longitude,
      };

      const distanceToClosest = calculateDistance(
        latitude,
        longitude,
        closestLatLong.latitude,
        closestLatLong.longitude
      );

      const distanceToCurrent = calculateDistance(
        latitude,
        longitude,
        currentLatLong.latitude,
        currentLatLong.longitude
      );

      if (distanceToCurrent < distanceToClosest && current.neighbourhood) {
        return current;
      }

      return closest;
    }, data[0]);

    record.neighbourhood = closestRecord.neighbourhood;
  });

  data.push(...dataWithoutNeighbourhood);

  // Define the CSV file path and writer
  const csvFilePath = join(__dirname, "../", "sample_data.csv");
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
