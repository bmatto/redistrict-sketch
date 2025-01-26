import ReactDOM from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import PlanMap from "./PlanMap";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import styles from "./MapApp.module.css";

// Import the local JSON data
import neighborhoodData from "./neighborhoods.json";

const SchoolNames = {
  DONDERO: "Dondero",
  LITTLE_HARBOR: "Little Harbor",
  NEW_FRANKLIN: "New Franklin",
};

const planAssignments = {
  ["Wamesit Place"]: SchoolNames.DONDERO,
  ["Osprey Landing"]: SchoolNames.LITTLE_HARBOR,
  ["Hillcrest"]: SchoolNames.DONDERO,
  ["Maplehaven"]: SchoolNames.DONDERO,
  ["Banfield and Ocean"]: SchoolNames.DONDERO,
  ["Cedars"]: SchoolNames.DONDERO,
  ["Elwyn Park"]: SchoolNames.DONDERO,
  ["Greenleaf"]: SchoolNames.DONDERO,
  ["Hillside"]: SchoolNames.LITTLE_HARBOR,
  ["Panaway Manner"]: SchoolNames.NEW_FRANKLIN,
  ["Lafayette Park"]: SchoolNames.LITTLE_HARBOR,
  ["Portsmouth Plains"]: SchoolNames.DONDERO,
  ["Community Campus"]: SchoolNames.DONDERO,
  ["Tucker's Cove"]: SchoolNames.LITTLE_HARBOR,
  ["Peverly West"]: SchoolNames.DONDERO,
  ["Powder House"]: SchoolNames.LITTLE_HARBOR,
  ["Green Belt"]: SchoolNames.DONDERO,
  ["Lang Eastwood"]: SchoolNames.DONDERO,
  ["Beachstone"]: SchoolNames.DONDERO,
  ["Patriots Park"]: SchoolNames.DONDERO,
  ["Cedars Springbrook"]: SchoolNames.DONDERO,
  ["PHS"]: SchoolNames.LITTLE_HARBOR,
  ["Goodwin Park"]: SchoolNames.LITTLE_HARBOR,
  ["South Mill Pond"]: SchoolNames.LITTLE_HARBOR,
  ["Strawbery Banke"]: SchoolNames.LITTLE_HARBOR,
  ["Islington Creek"]: SchoolNames.LITTLE_HARBOR,
  ["Lincoln"]: SchoolNames.LITTLE_HARBOR,
  ["Little Harbor"]: SchoolNames.LITTLE_HARBOR,
  ["Downtown"]: SchoolNames.LITTLE_HARBOR,
  ["West End Yard"]: SchoolNames.LITTLE_HARBOR,
  ["Frank Jones"]: SchoolNames.NEW_FRANKLIN,
  ["Gosling"]: SchoolNames.NEW_FRANKLIN,
  ["Atlantic Heights"]: SchoolNames.NEW_FRANKLIN,
  ["Christian Shore"]: SchoolNames.NEW_FRANKLIN,
  ["New Franklin"]: SchoolNames.NEW_FRANKLIN,
  ["Cutts Cove"]: SchoolNames.NEW_FRANKLIN,
  ["Oxford"]: SchoolNames.NEW_FRANKLIN,
  ["Meadowbrook"]: SchoolNames.NEW_FRANKLIN,
  ["Borthwick"]: SchoolNames.NEW_FRANKLIN,
  ["North End"]: SchoolNames.LITTLE_HARBOR,
  ["Winchester"]: SchoolNames.LITTLE_HARBOR,
  ["Jones"]: SchoolNames.LITTLE_HARBOR,
  ["Pease"]: SchoolNames.NEW_FRANKLIN,
  ["100 Durgin"]: SchoolNames.NEW_FRANKLIN,
  ["Walford"]: SchoolNames.DONDERO,
  ["Urban Forestry"]: SchoolNames.DONDERO,
  ["Marshalls"]: SchoolNames.NEW_FRANKLIN,
  ["Industry"]: SchoolNames.NEW_FRANKLIN,
  ["Oriental Gardens"]: SchoolNames.NEW_FRANKLIN,
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <CssBaseline />
    <div className={styles.mapAppContainer}>
      <PlanMap
        neighborhoodData={neighborhoodData}
        planAssignments={planAssignments}
      />
    </div>
  </>
);
