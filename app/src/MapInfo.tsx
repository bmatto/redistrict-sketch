import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";

import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Checkbox from "@mui/material/Checkbox";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";

import SchoolData from "./SchoolData";
import Reset from "./Reset";

import styles from "./MapApp.module.css";
import { Stack } from "@mui/material";

import type { Neighborhood, School, Data, EstimatedImpact } from "./types";

const TOTAL_DISTRICT_SECTIONS = 55;

const CURRENT_TOTAL_LH_SECTIONS = 19;
const CURRENT_TOTAL_DON_SECTIONS = 21;
const CURRENT_TOTAL_NF_SECTIONS = 15;

const currentTotalSectionMap = new Map([
  ["Little Harbor", CURRENT_TOTAL_LH_SECTIONS],
  ["Dondero", CURRENT_TOTAL_DON_SECTIONS],
  ["New Franklin", CURRENT_TOTAL_NF_SECTIONS],
]);

const query = gql`
  fragment gradeInfo on NewGrade {
    numSections
    numStudents
    sectionSize
  }

  query MapInfoQuery {
    neighborhoods {
      name
      gradeLevelCounts {
        gradeLevel
        count
      }
    }
    assignmentPreconditions {
      schoolName
      neighborhoods
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
      projectedStudentCount
      sectionCount
      sectionsByGrade {
        grade13 {
          ...gradeInfo
        }
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

const getTotalSectionsCount = (data) => {
  return data.schools.reduce((acc, school) => {
    return acc + school.sectionCount;
  }, 0);
};

const getSectionCount = (school) => {
  return school.sectionCount;
};

const getTotalStudentsMoved = (data) => {
  const preconditionMap = new Map(
    data.assignmentPreconditions.map((precondition) => [
      precondition.schoolName,
      new Set(precondition.neighborhoods),
    ])
  );

  const assignmentMap = new Map(
    data.assignedConditions.map((assignment) => [
      assignment.schoolName,
      new Set(assignment.neighborhoods),
    ])
  );

  let totalStudentsMoved = 0;

  data.neighborhoods.forEach((neighborhood) => {
    const neighborhoodName = neighborhood.name;
    const preconditionSchool = Array.from(preconditionMap.entries()).find(
      ([, neighborhoods]) => neighborhoods.has(neighborhoodName)
    )?.[0];
    const assignmentSchool = Array.from(assignmentMap.entries()).find(
      ([, neighborhoods]) => neighborhoods.has(neighborhoodName)
    )?.[0];

    if (preconditionSchool !== assignmentSchool) {
      totalStudentsMoved += neighborhood.gradeLevelCounts.reduce(
        (acc, grade) => acc + grade.count,
        0
      );
    }
  });

  return totalStudentsMoved;
};

const findSchoolChange = (precondition, assignment): EstimatedImpact => {
  const preConditionNeighborhoods = precondition.neighborhoods;
  const assignmentNeighborhoods = assignment.neighborhoods;

  const preConditionSet: Set<string> = new Set(preConditionNeighborhoods);
  const assignmentSet: Set<string> = new Set(assignmentNeighborhoods);

  const addedNeighborhoods = new Set(
    [...assignmentSet].filter((x) => !preConditionSet.has(x))
  );
  const removedNeighborhoods = new Set(
    [...preConditionSet].filter((x) => !assignmentSet.has(x))
  );

  return {
    preConditionNeighborhoods,
    assignmentNeighborhoods,
    preConditionSet,
    assignmentSet,
    addedNeighborhoods,
    removedNeighborhoods,
  };
};

const EstimatedImpact = ({ addedNeighborhoods, removedNeighborhoods }) => {
  if (!addedNeighborhoods.size && !removedNeighborhoods.size) {
    return <p>No change in neighborhood assignments</p>;
  }

  return (
    <div>
      {addedNeighborhoods.size ? (
        <>
          <h4>Added Neighborhoods:</h4>
          <Stack sx={{ mb: 2 }} direction="row" spacing={1}>
            {Array.from(addedNeighborhoods).map((n: string) => {
              return <Chip key={n} label={n} />;
            })}
          </Stack>
        </>
      ) : null}

      {removedNeighborhoods.size ? (
        <>
          <h4>Removed Neighborhoods:</h4>
          <Stack sx={{ mb: 2 }} direction="row" spacing={1}>
            {Array.from(removedNeighborhoods).map((n: string) => {
              return <Chip key={n} label={n} />;
            })}
          </Stack>
        </>
      ) : null}
    </div>
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

  const [isShowProjectedImpact, setIsShowProjectedImpact] = useState(false);
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

  const getStudentCount = useCallback((): number => {
    if (isShowProjectedImpact) {
      return data.schools.reduce(
        (acc, school) => (acc += school.projectedStudentCount),
        0
      );
    } else {
      return data.schools.reduce(
        (acc, school) => (acc += school.studentCount),
        0
      );
    }
  }, [data.schools, isShowProjectedImpact]);

  return (
    <Box>
      <Paper key="district" sx={{ p: 2, mb: 2 }}>
        <h2>PSM District - {getStudentCount()} Total Primary Students</h2>
        <h3>Total Students Moved: {getTotalStudentsMoved(data)}</h3>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={isShowProjectedImpact}
                onChange={(e) => setIsShowProjectedImpact(e.target.checked)}
              />
            }
            label="Show Projected 25/26 Impacts"
          />
        </FormGroup>
      </Paper>
      {data.schools.map((school) => {
        const assignmentPrecondition = data.assignmentPreconditions.find(
          (schoolPreCondition) => schoolPreCondition.schoolName === school.name
        );
        const assignment = data.assignedConditions.find(
          (schoolCondition) => schoolCondition.schoolName === school.name
        );
        const estimatedImpact: EstimatedImpact = findSchoolChange(
          assignmentPrecondition,
          assignment
        );

        return (
          <Paper key={school.name} sx={{ p: 2, mb: 2 }}>
            <h2>
              {school.name} -{" "}
              {isShowProjectedImpact
                ? school.projectedStudentCount
                : school.studentCount}{" "}
              Total Students
            </h2>
            <h3>
              Sections - Current: {currentTotalSectionMap.get(school.name)} |
              Estimated: {getSectionCount(school)}
            </h3>

            <EstimatedImpact
              addedNeighborhoods={estimatedImpact.addedNeighborhoods}
              removedNeighborhoods={estimatedImpact.removedNeighborhoods}
            />

            <SchoolAssignmentSelect
              school={school}
              neighborhoods={data.neighborhoods}
              neighborhoodAssignments={neighborhoodAssignments}
              setNeighborhoodAssignments={setNeighborhoodAssignments}
              setDirty={setIsDirty}
            />
            <SchoolData
              isShowProjectedImpact={isShowProjectedImpact}
              key={`table-${school.name}`}
              school={school}
              estimatedImpact={estimatedImpact}
              neighborhoods={data.neighborhoods}
            />
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
