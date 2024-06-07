import React, { useEffect, useState } from "react";
import Map from "./Map";
import MapInfo from "./MapInfo";

import styles from "./MapApp.module.css";

export default function MapApp() {
  console.log(window.location.search);

  const [showAssignments, setShowAssignments] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.has("showAssignments");
  });

  return (
    <div className={styles.mapAppContainer}>
      {showAssignments && (
        <div className={styles.mapInfoContainer}>
          <MapInfo />
        </div>
      )}

      <div className={styles.mapContainer}>
        <Map showAssignments={showAssignments} />
      </div>
    </div>
  );
}
