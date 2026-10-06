import React from "react";
import ReactDOM from 'react-dom/client';
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter } from "react-router-dom";
import "./i18n";
import { Provider } from "react-redux";
import store from "./store";

const root = ReactDOM.createRoot(document.getElementById('root'));

const publicUrl = process.env.REACT_APP_PUBLIC_URL || "";

console.log(publicUrl);

root.render(
  <Provider store={store}>
    <BrowserRouter basename={"/admin"}>
      <App />
    </BrowserRouter>
  </Provider>
);

serviceWorker.unregister();
