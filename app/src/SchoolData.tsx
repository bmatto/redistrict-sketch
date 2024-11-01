import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { useCallback, useMemo, useState } from "react";

import type { School, EstimatedImpact, Neighborhood } from "./types";

type SchoolDataProps = {
  school: School;
  estimatedImpact: EstimatedImpact;
  neighborhoods: Neighborhood[];
  isShowProjectedImpact: boolean;
};

const calculateProjectedGradeData = (
  grade: string,
  isShowProjectedImpact: boolean
) => {
  if (!isShowProjectedImpact) {
    return null;
  }

  return null;
};

export default function SchoolData({
  school,
  estimatedImpact,
  neighborhoods,
  isShowProjectedImpact,
}: SchoolDataProps) {
  const frlPercent = Math.round((school.frlCount / school.studentCount) * 100);
  const iep504Percent = Math.round(
    ((school.iepCount + school.num504) / school.studentCount) * 100
  );

  const {
    addedNeighborhoods,
    removedNeighborhoods,
  }: {
    addedNeighborhoods: Set<string>;
    removedNeighborhoods: Set<string>;
  } = estimatedImpact;

  const [sectionsByGrade, setSectionsByGrade] = useState(
    school.sectionsByGrade
  );

  const addedNeighborhoodData = useMemo(() => {
    return [...addedNeighborhoods].map((neighborhoodId) => {
      return neighborhoods.find((n) => n.name === neighborhoodId);
    });
  }, [addedNeighborhoods, neighborhoods]);

  const removedNeighborhoodData = useMemo(() => {
    return [...removedNeighborhoods].map((neighborhoodId) => {
      return neighborhoods.find((n) => n.name === neighborhoodId);
    });
  }, [removedNeighborhoods, neighborhoods]);

  const calculateGradeAdjusted = useCallback(
    (grade: string): number => {
      const gradeLevelId: number = parseFloat(grade.replace("grade", ""));

      const findGradeLevel = (glc) => {
        const gradeLevelCountId = parseFloat(glc.gradeLevel);

        return gradeLevelCountId === gradeLevelId;
      };

      const addedStudents = addedNeighborhoodData.reduce(
        (acc, neighborhood) => {
          const gradeLevel = neighborhood.gradeLevelCounts.find(findGradeLevel);

          return acc + (gradeLevel ? gradeLevel.count : 0);
        },
        0
      );

      const removedStudents = removedNeighborhoodData.reduce(
        (acc, neighborhood) => {
          const gradeLevel = neighborhood.gradeLevelCounts.find(findGradeLevel);

          return acc + (gradeLevel ? gradeLevel.count : 0);
        },
        0
      );

      return addedStudents - removedStudents;
    },
    [addedNeighborhoodData, removedNeighborhoodData]
  );

  const calculateTotalAdjusted = useMemo(() => {
    return Object.keys(sectionsByGrade).reduce((acc, grade) => {
      return acc + calculateGradeAdjusted(grade);
    }, 0);
  }, [sectionsByGrade]);

  return (
    <Box>
      <Stack sx={{ mt: 1, mb: 1 }} direction="row" spacing={1}>
        <Chip label={`Sections ${school.sectionCount}`} />
        <Chip label={`FRL ${school.frlCount}`} />
        <Chip label={`IEP ${school.iepCount}`} />
        <Chip label={`504 ${school.num504}`} />
      </Stack>
      <Stack sx={{ mt: 1, mb: 1 }} direction="row" spacing={1}>
        <Chip label={`IEP/504 % ${frlPercent}`} />
        <Chip label={`FRL % ${frlPercent}`} />
      </Stack>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Grade</TableCell>
              <TableCell>Sections</TableCell>
              <TableCell>Students</TableCell>
              <TableCell>(Adjusted) {calculateTotalAdjusted}</TableCell>
              <TableCell>Section Size</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(sectionsByGrade).map((grade) => {
              if (grade === "__typename" || grade === "grade13") {
                return null;
              }

              const gradeId = parseFloat(grade.replace("grade", ""));
              let projectedGradeId = gradeId;

              if (isShowProjectedImpact) {
                projectedGradeId = gradeId - 1;

                if (projectedGradeId === 0) {
                  projectedGradeId = 14;
                }
              }

              const projectedGradeKey = `grade${projectedGradeId}`;
              const gradeData = sectionsByGrade[projectedGradeKey];

              if (!gradeData) {
                return null;
              }

              return (
                <TableRow key={grade}>
                  <TableCell>{grade}</TableCell>
                  <TableCell>{gradeData.numSections}</TableCell>
                  <TableCell>{gradeData.numStudents}</TableCell>
                  <TableCell>{calculateGradeAdjusted(grade)}</TableCell>
                  <TableCell>
                    {Math.ceil(gradeData.numStudents / gradeData.numSections)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
