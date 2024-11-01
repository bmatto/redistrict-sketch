import { useRef, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";

import mapboxgl from "mapbox-gl";

const query = gql`
  query MappingQuery {
    schools {
      name
      lat
      long
      students {
        latitude
        longitude
        School
      }
    }
    neighborhoods {
      name
      centroid {
        lat
        long
      }
      school {
        name
        properties {
          fill
        }
      }
      feature {
        geometry {
          type
          coordinates
        }
      }
    }
  }
`;

mapboxgl.accessToken = import.meta.env.VITE_MAP_BOX_API_KEY;

export default function MapBox({
  showAssignments = false,
}: {
  showAssignments: boolean;
}) {
  const mapRef = useRef(null);
  const mapBoxRef = useRef(null);

  const { loading, error, data } = useQuery(query, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (loading) return;

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

      const schools = {
        type: "FeatureCollection",
        features: [],
      };

      const students = {
        type: "FeatureCollection",
        features: [],
      };

      data.neighborhoods.forEach((neighborhood, index) => {
        const { name, centroid, school, feature } = neighborhood;

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
        const fillColor = showAssignments
          ? school.properties.fill
          : shadesOfGray[5];

        mapBoxRef.current.addSource(name, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: feature.geometry,
          },
        });

        mapBoxRef.current.addLayer({
          id: name,
          type: "fill",
          source: name,
          paint: {
            "fill-color": fillColor,
            "fill-opacity": 0.7,
            "fill-outline-color": "#000",
          },
        });

        mapBoxRef.current.addLayer({
          id: `${name}-outline`,
          type: "line",
          source: name,
          paint: {
            "line-color": "#000",
            "line-width": 2,
          },
        });

        labels.features.push({
          type: "Feature",
          properties: {
            description: name,
          },
          geometry: {
            type: "Point",
            coordinates: [centroid.long, centroid.lat],
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
          "text-offset": [0, -1],
        },
        paint: {
          "text-color": "#fff",
          "text-halo-color": "#000",
          "text-halo-width": 3,
          "text-halo-blur": 2,
        },
      });

      if (!showAssignments) return;

      data.schools.forEach((school) => {
        const { name, lat, long } = school;

        const id = `school-${name}`;

        schools.features.push({
          type: "Feature",
          properties: {
            description: name,
          },
          geometry: {
            type: "Point",
            coordinates: [long, lat],
          },
        });

        school.students.forEach((student, index) => {
          const { latitude, longitude } = student;

          const id = `student-${index}-${latitude}-${longitude}`;

          const studentSchool = student.School;

          let color;
          switch (studentSchool) {
            case "Dondero School":
              color = "red";
              break;
            case "Little Harbour School":
              color = "blue";
              break;
            case "New Franklin School":
              color = "yellow";
              break;
            default:
              color = "white";
          }

          mapBoxRef.current.addSource(id, {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [longitude, latitude],
              },
            },
          });

          mapBoxRef.current.addLayer({
            id: id,
            type: "circle",
            source: id,
            paint: {
              "circle-radius": 2,
              "circle-color": color,
              "circle-stroke-color": "#000",
              "circle-stroke-width": 1,
            },
          });
        });
      });

      mapBoxRef.current.addSource("schools", {
        type: "geojson",
        data: schools,
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
  }, [loading, data, showAssignments]);

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
