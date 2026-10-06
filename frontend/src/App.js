import {React} from 'react';
import { Route, Routes } from 'react-router-dom';
import routes from './pages';
import '../src/assets/fonts/font-awesome.css'

function App() {
  return (
    <div className="body header-fixed">
    <>
      <Routes>
          {
              routes.map((data,idx) => (
                  <Route key={idx} path={data.path} element={data.component} exact />
              ))
          }
      </Routes>
    </>
    </div>
  );
}

export default App;
