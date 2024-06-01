import React from "react";

import { useQuery, gql } from "@apollo/client";

import styles from "./MapApp.module.css";

const query = gql`
  query MyQuery {
    schools {
      name
      frlCount
      iepCount
      studentCount
      iepByGradeLevel {
        grade14
        grade1
        grade2
        grade3
        grade4
        grade5
      }
      frlByGradeLevel {
        grade14
        grade1
        grade2
        grade3
        grade4
        grade5
      }
    }
    currentSections {
      name
      grades {
        id
        grade
        count
        numSections
      }
    }
  }
`;

const RenderData = ({ data }) => {
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
};

export default function MapInfo() {
  const { loading, error, data } = useQuery(query);

  return (
    <div className={styles.mapInfo}>
      <h1>Map Info</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error.message}</p>
      ) : (
        <RenderData data={data} />
      )}
    </div>
  );
}
