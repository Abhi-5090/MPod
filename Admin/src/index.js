import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { Provider } from "react-redux"

import App from "./App"
import * as serviceWorker from "./serviceWorker"
import "./i18n"
import store from "./store"
import setupAxios from "./api/setupAxios"
import { AuthProvider } from "./context/AuthContext"

// Must run before any request: sends the httpOnly `adminSessionToken` cookie
// and installs the global 401/403 handling.
setupAxios()

const root = ReactDOM.createRoot(document.getElementById("root"))

root.render(
  <Provider store={store}>
    <BrowserRouter basename={"/admin"}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </Provider>
)

serviceWorker.unregister()
