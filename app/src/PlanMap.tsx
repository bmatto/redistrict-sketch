import { useRef, useEffect } from "react";

import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAP_BOX_API_KEY;

const SCHOOL_COLORS = {
  Dondero: "red",
  "Little Harbor": "blue",
  "New Franklin": "yellow",
};

export default function MapBox({ neighborhoodData, planAssignments = {} }) {
  const mapRef = useRef(null);
  const mapBoxRef = useRef(null);

  console.log(neighborhoodData);
  console.log(planAssignments);

  useEffect(() => {
    // Initialize the map
    mapBoxRef.current = new mapboxgl.Map({
      container: mapRef.current,
      center: [-70.7626, 43.0718],
      zoom: 13,
      style: "mapbox://styles/mapbox/streets-v12",
    });

    mapBoxRef.current.addControl(new mapboxgl.NavigationControl());
    mapBoxRef.current.addControl(new mapboxgl.FullscreenControl(), "top-right");
    mapBoxRef.current.addControl(new mapboxgl.ScaleControl(), "top-left");
    mapBoxRef.current.addControl(new mapboxgl.GeolocateControl(), "top-right");

    mapBoxRef.current.on("style.load", () => {
      mapBoxRef.current.setFog({});

      const labels = {
        type: "FeatureCollection",
        features: [],
      };

      const students = {
        type: "FeatureCollection",
        features: [],
      };

      const shadesOfGray = [
        "#2f2f2f",
        "#3f3f3f",
        "#4f4f4f",
        "#5f5f5f",
        "#6f6f6f",
        "#7f7f7f",
        "#8f8f8f",
        "#9f9f9f",
        "#afafaf",
        "#bfbfbf",
      ];
      const fillColor = shadesOfGray[5];

      neighborhoodData.features.forEach((neighborhood, index) => {
        const { geometry, properties } = neighborhood;
        const { name } = properties;

        // Calculate center of the neighborhood polygon
        const bounds = new mapboxgl.LngLatBounds();

        // Handle both Polygon and MultiPolygon types
        if (geometry.type === "Polygon") {
          geometry.coordinates[0].forEach((coord) => {
            bounds.extend(coord);
          });
        } else if (geometry.type === "MultiPolygon") {
          geometry.coordinates.forEach((polygon) => {
            polygon[0].forEach((coord) => {
              bounds.extend(coord);
            });
          });
        }

        const center = bounds.getCenter();

        // Add to labels collection
        labels.features.push({
          type: "Feature",
          properties: {
            description: name,
          },
          geometry: {
            type: "Point",
            coordinates: [center.lng, center.lat],
          },
        });

        mapBoxRef.current.addSource(name, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: geometry,
          },
        });

        const neighborhoodFillColor = planAssignments[name]
          ? SCHOOL_COLORS[planAssignments[name]]
          : fillColor;

        mapBoxRef.current.addLayer({
          id: name,
          type: "fill",
          source: name,
          paint: {
            "fill-color": neighborhoodFillColor,
            "fill-opacity": 0.4,
            "fill-outline-color": "#000",
          },
        });

        mapBoxRef.current.addLayer({
          id: `${name}-outline`,
          type: "line",
          source: name,
          paint: {
            "line-color": "#000",
            "line-width": 1,
          },
        });
      });

      mapBoxRef.current.addSource("labels", {
        type: "geojson",
        data: labels,
      });

      mapBoxRef.current.addLayer({
        id: "poi-labels",
        type: "symbol",
        source: "labels",
        layout: {
          "text-field": ["get", "description"],
          "text-size": 14,
          "text-anchor": "center",
          "text-justify": "center",
          "text-allow-overlap": true,
        },
        paint: {
          "text-color": "#fff",
          "text-halo-color": "#000",
          "text-halo-width": 2,
          "text-halo-blur": 1,
        },
      });

      mapBoxRef.current.addLayer({
        id: "schools",
        type: "symbol",
        source: "schools",
        layout: {
          "icon-image": "school-15",
          "icon-allow-overlap": true,
          "icon-size": 2,
          "text-field": ["get", "description"],
        },
        paint: {
          "text-color": "#fff",
          "text-halo-color": "#000",
          "text-halo-width": 1,
          "text-halo-blur": 1,
        },
      });
    });
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
      }}
      id="map"
      ref={mapRef}
    />
  );
}
