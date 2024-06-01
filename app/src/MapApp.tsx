import React from "react";
import Map from "./Map";
import MapInfo from "./MapInfo";

import styles from "./MapApp.module.css";

export default function MapApp() {
  return (
    <div className={styles.mapAppContainer}>
      <div className={styles.mapInfoContainer}>
        <MapInfo />
      </div>
      <div className={styles.mapContainer}>
        <Map />
      </div>
    </div>
  );
}
