// import "graphql-import-node";

import http from "http";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} from "apollo-server-core";

import districtSort from "./district-sort.js";

import schema from "./schema.graphql.js";

const app = express();
const port = 3000;
const httpServer = http.createServer(app);

import { resolvers } from "./resolvers.js";

const server = new ApolloServer({
  resolvers,
  csrfPrevention: true,
  typeDefs: schema,
  cache: "bounded",
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    ApolloServerPluginLandingPageLocalDefault({ embed: true }),
  ],
});

// Endpoint for school data analysis
app.get("/school-data", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  // res.send({
  //   schools,
  //   schoolMessages,
  // });
});

app.listen(port, async () => {
  await server.start();

  await districtSort();

  server.applyMiddleware({ app, path: "/graphql" });

  console.log(`Server is running on port ${port}`);
});
