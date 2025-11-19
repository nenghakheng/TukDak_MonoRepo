import { createBrowserRouter, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import PingTest from "./components/PingTest";
import { Guests } from "./view/guests/Guests";
import { Dashboard } from "./view/dashboard/Dashboard";
import { Login } from "./view/auth/Login";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "ping",
        element: <PingTest />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "guests",
        element: <Guests />,
      },
    ],
  },
]);
