import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import PingTest from "./components/PingTest";
import { Guests } from "./view/guests/Guests";
import { Dashboard } from "./view/dashboard/Dashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <PingTest />,
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
