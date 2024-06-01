import { createGraphiQLFetcher } from "@graphiql/toolkit";
import { GraphiQL } from "graphiql";

const url = import.meta.env.VITE_GRAPHQL_URI;

const fetcher = createGraphiQLFetcher({ url });

export default function GraphiQlPage() {
  return <GraphiQL fetcher={fetcher} />;
}
