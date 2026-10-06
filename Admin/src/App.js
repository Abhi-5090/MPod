import React, { Suspense } from "react"
import { Navigate, Outlet, Route, Routes } from "react-router-dom"
import { ToastContainer } from "react-toastify"

import { userRoutes, authRoutes, NotFound } from "./routes/allRoutes"
import Authmiddleware from "./routes/middleware/Authmiddleware"
import VerticalLayout from "./components/VerticalLayout/"
import NonAuthLayout from "./components/NonAuthLayout"
import PageLoader from "./components/Common/PageLoader"

import "bootstrap/dist/css/bootstrap.min.css"
import "react-toastify/dist/ReactToastify.css"
import "./assets/scss/theme.scss"

const App = () => {
  return (
    <React.Fragment>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {authRoutes.map(({ path, component: Component }) => (
            <Route
              key={path}
              path={path}
              element={
                <NonAuthLayout>
                  <Component />
                </NonAuthLayout>
              }
            />
          ))}

          {/* Authenticated routes share one layout instance (sidebar does not remount). */}
          <Route
            element={
              <Authmiddleware>
                <VerticalLayout>
                  <Suspense fallback={<PageLoader />}>
                    <Outlet />
                  </Suspense>
                </VerticalLayout>
              </Authmiddleware>
            }
          >
            {userRoutes.map(({ path, component: Component, roles }) => (
              <Route
                key={path}
                path={path}
                element={
                  <Authmiddleware roles={roles}>
                    <Component />
                  </Authmiddleware>
                }
              />
            ))}
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <ToastContainer position="top-right" autoClose={4000} newestOnTop />
    </React.Fragment>
  )
}

export default App
