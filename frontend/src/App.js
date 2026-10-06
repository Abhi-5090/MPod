import React from "react";
import { Route, Routes } from "react-router-dom";
import routes from "./pages";
import "../src/assets/fonts/font-awesome.css";

function App() {
  return (
    <div className="body header-fixed">
      <Routes>
        {routes.map((data) => (
          <Route key={data.path} path={data.path} element={data.component} />
        ))}
      </Routes>
    </div>
  );
}

export default App;
