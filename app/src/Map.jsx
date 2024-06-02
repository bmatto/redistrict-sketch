import { useRef, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";

import mapboxgl from "mapbox-gl";

const query = gql`
  query MyQuery {
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

export default function Map() {
  const mapRef = useRef(null);
  const mapBoxRef = useRef(null);

  const { loading, error, data } = useQuery(query);

  useEffect(() => {
    if (loading) return;

    // Initialize the map
    mapBoxRef.current = new mapboxgl.Map({
      container: mapRef.current,
      center: [-70.7626, 43.0718],
      zoom: 13,
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

      data.neighborhoods.forEach((neighborhood) => {
        const { name, centroid, school, feature } = neighborhood;

        console.log(name, centroid, school);

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
            "fill-color": school.properties.fill,
            "fill-opacity": 0.66,
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
    });
  }, [loading, data]);

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
