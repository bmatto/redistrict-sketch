import http from "http";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} from "apollo-server-core";

import districtSort from "./district-sort.js";
import { schoolFactory } from "./schools.js";
import { typeDefs as schema } from "./type-defs.js";

const app = express();
const port = 3000;
const httpServer = http.createServer(app);

import { resolvers } from "./resolvers.js";

console.log(schema);

const server = new ApolloServer({
  resolvers,
  typeDefs: schema,
  csrfPrevention: true,
  cache: "bounded",
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    ApolloServerPluginLandingPageLocalDefault({ embed: true }),
  ],
});

// Endpoint for school data analysis
app.get("/school-data", async (req, res) => {
  const { schools, schoolMessages } = await districtSort(schoolFactory());

  server.applyMiddleware({ app, path: "/graphql" });

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

app.listen(port, async () => {
  await server.start();

  console.log(`Server is running on port ${port}`);
});
