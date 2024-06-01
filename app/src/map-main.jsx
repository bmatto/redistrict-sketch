import ReactDOM from "react-dom/client";
import MapApp from "./MapApp";

import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

const uri = import.meta.env.VITE_GRAPHQL_URI;

const client = new ApolloClient({
  uri: uri,
  cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <ApolloProvider client={client}>
    <MapApp />
  </ApolloProvider>
);
