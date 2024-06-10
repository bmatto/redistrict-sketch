import ReactDOM from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";

import MapApp from "./MapApp";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

const uri = import.meta.env.VITE_GRAPHQL_URI;

const client = new ApolloClient({
  uri: uri,
  cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <ApolloProvider client={client}>
    <CssBaseline />
    <MapApp />
  </ApolloProvider>
);
