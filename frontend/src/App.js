import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import routes from "./pages";
import "../src/assets/fonts/font-awesome.css";

function App() {
  return (
    <div className="body header-fixed">
      <Suspense fallback={<div style={{ color: "#fff", padding: 40 }}>Loading...</div>}>
        <Routes>
          {routes.map((data) => (
            <Route key={data.path} path={data.path} element={data.component} />
          ))}
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
