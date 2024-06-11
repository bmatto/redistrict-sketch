import { useState, useEffect } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";

import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

import SchoolData from "./SchoolData";
import Reset from "./Reset";

import styles from "./MapApp.module.css";

type Neighborhood = {
  name: string;
};

type School = {
  name: string;
  frlCount: number;
  iepCount: number;
  studentCount: number;
  iepByGradeLevel: {
    grade14: number;
    grade1: number;
    grade2: number;
    grade3: number;
    grade4: number;
    grade5: number;
  };
  frlByGradeLevel: {
    grade14: number;
    grade1: number;
    grade2: number;
    grade3: number;
    grade4: number;
    grade5: number;
  };
};

type Data = {
  neighborhoods: Array<Neighborhood>;
  schools: Array<School>;
  currentSections: {
    name: string;
    grades: {
      id: string;
      grade: number;
      count: number;
      numSections: number;
    }[];
  }[];
  assignedConditions: Array<{
    schoolName: string;
    neighborhoods: string[];
  }>;
};

const query = gql`
  fragment gradeInfo on NewGrade {
    numSections
    numStudents
    sectionSize
  }

  query MapInfoQuery {
    neighborhoods {
      name
    }
    assignedConditions {
      schoolName
      neighborhoods
    }
    schools {
      name
      frlCount
      iepCount
      num504
      studentCount
      sectionCount
      sectionsByGrade {
        grade14 {
          ...gradeInfo
        }
        grade1 {
          ...gradeInfo
        }
        grade2 {
          ...gradeInfo
        }
        grade3 {
          ...gradeInfo
        }
        grade4 {
          ...gradeInfo
        }
        grade5 {
          ...gradeInfo
        }
      }
    }
  }
`;

const setNeighborhoodsMutationDocument = gql`
  mutation SetNeighborhoods($assignments: [AssignmentInput]!) {
    setNeighborhoods(assignments: $assignments) {
      name
    }
  }
`;

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const checkDisabled = (neighborhoodAssignments, name) => {
  return Object.values(neighborhoodAssignments).flat().includes(name);
};

const SchoolAssignmentSelect = ({
  school,
  neighborhoods,
  neighborhoodAssignments,
  setNeighborhoodAssignments,
  setDirty,
}) => {
  const sortedNeighborhoods = neighborhoods.map(({ name }) => name).sort();

  const [schoolNeighborhoods, setSchoolNeighborhoods] = useState<string[]>(
    neighborhoodAssignments[school.name] || []
  );

  const handleChange = (
    event: SelectChangeEvent<typeof schoolNeighborhoods>
  ) => {
    const {
      target: { value },
    } = event;
    setDirty(true);
    setNeighborhoodAssignments({
      ...neighborhoodAssignments,
      [school.name]: value,
    });
    setSchoolNeighborhoods(
      typeof value === "string" ? value.split(",") : value
    );
  };

  return (
    <FormControl sx={{ mt: 1, mb: 1, width: 300 }}>
      <InputLabel id="demo-multiple-checkbox-label">Neighborhoods</InputLabel>
      <Select
        labelId="demo-multiple-checkbox-label"
        id="demo-multiple-checkbox"
        multiple
        value={schoolNeighborhoods}
        onChange={handleChange}
        input={<OutlinedInput label="Tag" />}
        renderValue={(selected) => selected.join(", ")}
        MenuProps={MenuProps}
      >
        {sortedNeighborhoods.map((neighborhoodName) => (
          <MenuItem
            disabled={
              checkDisabled(neighborhoodAssignments, neighborhoodName) &&
              schoolNeighborhoods.indexOf(neighborhoodName) === -1
            }
            key={neighborhoodName}
            value={neighborhoodName}
          >
            <Checkbox
              checked={schoolNeighborhoods.indexOf(neighborhoodName) > -1}
            />
            <ListItemText primary={neighborhoodName} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

const NeighborhoodAssignment = ({ data }: { data: Data }) => {
  const initialNeighborhoodAssignments = data.assignedConditions.reduce(
    (acc, ac) => {
      const schoolName = ac.schoolName;
      const neighborhoods = ac.neighborhoods;

      neighborhoods.forEach((neighborhood) => {
        if (!acc[schoolName]) {
          acc[schoolName] = [];
        }

        acc[schoolName].push(neighborhood);
      });

      return acc;
    },
    {}
  );

  const [isDirty, setIsDirty] = useState(false);
  const [neighborhoodAssignments, setNeighborhoodAssignments] = useState(
    initialNeighborhoodAssignments
  );
  const [setNeighborhoodsMutation] = useMutation(
    setNeighborhoodsMutationDocument,
    {
      refetchQueries: ["MapInfoQuery", "MappingQuery"],
    }
  );

  useEffect(() => {
    // Do some graphql mutation thing?
    if (!isDirty) return;

    const assignmentsAsMutationArgument = Object.keys(
      neighborhoodAssignments
    ).map((schoolName) => {
      return {
        schoolName,
        neighborhoods: neighborhoodAssignments[schoolName],
      };
    });

    console.log("mutationData", assignmentsAsMutationArgument);

    setNeighborhoodsMutation({
      variables: {
        assignments: assignmentsAsMutationArgument,
      },
    });
  }, [neighborhoodAssignments, isDirty]);

  return (
    <Box>
      {data.schools.map((school) => {
        return (
          <Paper key={school.name} sx={{ p: 2, mb: 2 }}>
            <h2>
              {school.name} - {school.studentCount} Total Students
            </h2>

            <SchoolAssignmentSelect
              school={school}
              neighborhoods={data.neighborhoods}
              neighborhoodAssignments={neighborhoodAssignments}
              setNeighborhoodAssignments={setNeighborhoodAssignments}
              setDirty={setIsDirty}
            />
            <SchoolData key={`table-${school.name}`} school={school} />
          </Paper>
        );
      })}
    </Box>
  );
};

export default function MapInfo() {
  const {
    loading,
    error,
    data,
  }: {
    loading: boolean;
    error?: any;
    data?: Data;
  } = useQuery(query, {
    fetchPolicy: "network-only",
  });

  return (
    <div className={styles.mapInfo}>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error.message}</p>
      ) : (
        <>
          <NeighborhoodAssignment data={data} />
          <Reset />
        </>
      )}
    </div>
  );
}
