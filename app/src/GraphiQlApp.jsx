import { createGraphiQLFetcher } from "@graphiql/toolkit";
import { GraphiQL } from "graphiql";

const fetcher = createGraphiQLFetcher({ url: "http://localhost:3000/graphql" });

export default function GraphiQlPage() {
  return <GraphiQL fetcher={fetcher} />;
}
