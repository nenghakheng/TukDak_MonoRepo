import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import PingTest from "./components/PingTest";
import { Guests } from "./view/guests/Guests";

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
        path: "guests",
        element: <Guests />,
      },
    ],
  },
]);
