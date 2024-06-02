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
  introspection: true,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    ApolloServerPluginLandingPageLocalDefault({ embed: true }),
  ],
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, async () => {
  await districtSort();
  await server.start();

  server.applyMiddleware({ app, path: "/graphql", cors: true });

  console.log(`Server is running on port ${port}`);
});
