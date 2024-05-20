import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [schoolMessages, setSchoolMessages] = useState([]);
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/school-data")
      .then((response) => response.json())
      .then((data) => {
        setSchoolMessages(data.schoolMessages);
        setSchools(data.schools);
      });
  }, []);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Sau52 District Sort</h1>
      <div className="card">
        {schoolMessages.map((message, index) => (
          <p key={`message-${index}`}>{message}</p>
        ))}
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
