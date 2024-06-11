import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import { gql, useMutation } from "@apollo/client";

const resetMutationDoc = gql`
  mutation Reset {
    reset {
      success
    }
  }
`;

export default function Reset() {
  const [resetMutation] = useMutation(resetMutationDoc, {
    refetchQueries: ["MapInfoQuery", "MappingQuery"],
  });
  const handleReset = () => {
    resetMutation();
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Button onClick={handleReset} variant="contained" color="primary">
          Reset
        </Button>
      </Paper>
    </Box>
  );
}
