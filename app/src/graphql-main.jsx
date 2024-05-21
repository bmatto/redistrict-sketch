import React from "react";
import ReactDOM from "react-dom/client";
import "graphiql/graphiql.css";

import GraphiQlApp from "./GraphiQlApp.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GraphiQlApp />
  </React.StrictMode>
);
