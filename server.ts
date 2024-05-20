import express from "express";

import districtSort from "./district-sort";

const app = express();
const port = 3000;

// Endpoint for school data analysis
app.get("/school-data", async (req, res) => {
  const { schools, schoolMessages } = await districtSort();

  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.send({
    schools,
    schoolMessages,
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
