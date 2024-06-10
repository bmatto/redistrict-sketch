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

export default function SchoolData({ school }) {
  const frlPercent = Math.round((school.frlCount / school.studentCount) * 100);
  const iep504Percent = Math.round(
    ((school.iepCount + school.num504) / school.studentCount) * 100
  );

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
              <TableCell>Section Size</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(school.sectionsByGrade).map((grade) => {
              const gradeData = school.sectionsByGrade[grade];
              if (!gradeData.sectionSize) {
                return null;
              }

              return (
                <TableRow key={grade}>
                  <TableCell>{grade}</TableCell>
                  <TableCell>{gradeData.numSections}</TableCell>
                  <TableCell>{gradeData.numStudents}</TableCell>
                  <TableCell>
                    {Math.round(
                      (gradeData.numStudents / gradeData.numSections) * 100
                    ) / 100}
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
