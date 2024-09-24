import { createObjectCsvWriter } from "csv-writer";
import fs from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import Papa from "papaparse";
import NodeGeocoder from "node-geocoder";

import calculateDistance from "./lib/calculate-distance.js";

import neighborhoodGeoJsonImport from "./neighborhoods.json" assert { type: "json" };

type NEIGHBORHOOD_GEO_JSON = {
  type: "FeatureCollection";
  features: {
    type: "Feature";
    properties: {
      name: string;
    };
    geometry: {
      type: "Polygon";
      coordinates: number[][][];
    };
  }[];
};

type PSM_STUDENT = {
  Last: string;
  First: string;
  PIN: number;
  Grade: number;
  Gender: "M" | "F";
  School: string;
  "Street Name": string;
  "Address 1": string;
  "Address 2": string;
  "Parent Last": string;
  "Parent First": string;
  Relationship: string;
  IEP?: "Yes" | "No";
  "504"?: "Yes" | "No";
  FRL?: "Yes" | "No";
};

type GeoCodedStudent = {
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
  IEP?: boolean;
  "504"?: boolean;
  School?: string;
  FRL?: boolean;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const neighborhoodGeoJson: NEIGHBORHOOD_GEO_JSON =
  neighborhoodGeoJsonImport as NEIGHBORHOOD_GEO_JSON;

const MAP_BOX_API_KEY = process.env.MAP_BOX_API_KEY;

const csvFilePath = join(__dirname, "../", "psm_data.csv");
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
    { id: "IEP", title: "IEP" },
    { id: "504", title: "504" },
    { id: "FRL", title: "FRL" },
    { id: "School", title: "School" },
  ],
});

const geocoder = NodeGeocoder({
  provider: "mapbox",
  apiKey: MAP_BOX_API_KEY,
});

function loadStudentsFromCSV(filePath: string): Promise<PSM_STUDENT[]> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      Papa.parse(data, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          resolve(results.data as PSM_STUDENT[]);
        },
        // @ts-ignore
        error: (error) => {
          reject(error);
        },
      });
    });
  });
}

function isWithinBoundary(
  latitude: number,
  longitude: number,
  boundaryCoordinates: number[][]
): boolean {
  const point = [longitude, latitude];
  let inside = false;
  for (
    let i = 0, j = boundaryCoordinates.length - 1;
    i < boundaryCoordinates.length;
    j = i++
  ) {
    const xi = boundaryCoordinates[i][0];
    const yi = boundaryCoordinates[i][1];
    const xj = boundaryCoordinates[j][0];
    const yj = boundaryCoordinates[j][1];

    const intersect =
      yi > point[1] !== yj > point[1] &&
      point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

const createStudentFRLChecker = (studentsFRL) => {
  return function (student): "F" | "R" | false {
    const studentAddress = `${student["Address 1"]}`;
    const studentGender = student.Gender;

    const maybeStudent = studentsFRL.find((frlStudent) => {
      const frlStudentAddress = `${frlStudent["Address 1"]}`;
      const frlStudentGender = frlStudent.Gender;

      return (
        frlStudentAddress === studentAddress &&
        frlStudentGender === studentGender
      );
    });

    return maybeStudent ? maybeStudent["F&R Eligibility"] : false;
  };
};

async function main(): Promise<void> {
  let limit = Infinity;
  const dupes = [];
  const data: GeoCodedStudent[] = [];
  const dataWithoutNeighbourhood: GeoCodedStudent[] = [];
  const studentNames: {
    [key: string]: true;
  } = {};

  try {
    let students = await loadStudentsFromCSV("psm_data_09_2024.csv");

    //const studentsFRL = await loadStudentsFromCSV("psm_frl_elementary.csv");

    // const checkStudentFRL = createStudentFRLChecker(studentsFRL);

    for (let i = 0; i < students.length; i++) {
      if (i > limit) {
        break;
      }

      const student = students[i];
      const name = `${student.First} ${student.Last}`;
      const address = `${student["Address 1"]} ${student["Address 2"]}`;
      const studentKey = `${name} ${address}`;
      // const grade = student.Grade;

      // const frl = checkStudentFRL(student);

      // Prevent Duplicate Names
      if (studentNames[studentKey] === true) {
        dupes.push(student);
        continue;
      } else {
        studentNames[studentKey] = true;
      }

      const geocodedResult = await geocoder.geocode(address);
      const geocoded = geocodedResult[0] as GeoCodedStudent;

      let finalAddress: string;
      const formattedAddress = geocoded?.formattedAddress;

      if (!formattedAddress) {
        finalAddress = address;
      } else {
        finalAddress = formattedAddress;
      }

      const neighborhood = neighborhoodGeoJson.features.find((feature) => {
        const coords = feature.geometry.coordinates[0];

        return isWithinBoundary(geocoded.latitude, geocoded.longitude, coords);
      });

      if (geocoded && neighborhood !== undefined) {
        data.push({
          name,
          gradeLevel: student.Grade,
          formattedAddress: finalAddress,
          latitude: geocoded.latitude,
          longitude: geocoded.longitude,
          zipcode: geocoded.zipcode,
          IEP: student["IEP"] === "Yes",
          "504": student["504"] === "Yes",
          School: student.School,
          neighbourhood: neighborhood.properties.name,
          FRL: student["FRL"] === "Yes",
        });
      } else {
        dataWithoutNeighbourhood.push({
          name,
          gradeLevel: student.Grade,
          formattedAddress: finalAddress,
          latitude: geocoded.latitude,
          longitude: geocoded.longitude,
          zipcode: geocoded.zipcode,
          IEP: student["IEP"] === "Yes",
          "504": student["504"] === "Yes",
          School: student.School,
          neighbourhood: neighborhood?.properties.name,
          FRL: student["FRL"] === "Yes",
        });
      }
    }

    console.log("Data without neighbourhood", dataWithoutNeighbourhood);

    // Not being used short term
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

    console.log("removed dupes", dupes);
    console.log(dupes.length);

    csvWriter
      .writeRecords(data)
      .then(() => {
        console.log("CSV file was written successfully");
      })
      .catch((error) => {
        console.error("Error writing CSV file:", error);
      });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

await main();
