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

export default function Map({
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
      style: "mapbox://styles/mapbox/streets-v11",
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

      data.neighborhoods.forEach((neighborhood) => {
        const { name, centroid, school, feature } = neighborhood;

        const fillColor = showAssignments ? school.properties.fill : "#000";

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
            "fill-opacity": 0.5,
            "fill-outline-color": "#000",
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
          "text-variable-anchor": ["top", "bottom", "left", "right"],
          "text-radial-offset": 0.5,
          "text-justify": "auto",
          "text-size": 14,
          "icon-image": ["get", "icon"],
        },
        paint: {
          "text-color": "#fff",
          "text-halo-color": "#000",
          "text-halo-width": 1,
          "text-halo-blur": 1,
        },
      });

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
            case "Dondero":
              color = "red";
              break;
            case "Little Harbour":
              color = "blue";
              break;
            case "New Franklin":
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

  // useEffect(() => {
  //   // Initialize the map
  //   mapBoxRef.current = new mapboxgl.Map({
  //     container: mapRef.current,
  //     center: [-70.7626, 43.0718],
  //     zoom: 13,
  //   });

  //   mapBoxRef.current.addControl(new mapboxgl.NavigationControl());
  //   mapBoxRef.current.addControl(new mapboxgl.FullscreenControl(), "top-right");
  //   mapBoxRef.current.addControl(new mapboxgl.ScaleControl(), "top-left");
  //   mapBoxRef.current.addControl(new mapboxgl.GeolocateControl(), "top-right");
  // }, []);

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
