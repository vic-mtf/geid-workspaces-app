import { createBrowserRouter, Navigate } from "react-router-dom";
import Workspace from "@/views/Workspace";

const router = createBrowserRouter(
  [
    {
      element: <Navigate to="/files" />,
      path: "/",
    },
    {
      element: <Workspace />,
      path: "*",
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  }
);

export default router;
