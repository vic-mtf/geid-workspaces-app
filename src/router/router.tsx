import { createBrowserRouter, Navigate } from "react-router-dom";
import Workspace from "@/views/Workspace";
import Main from "@/views/main/Main";
import FavoritesView from "@/views/favorites/FavoritesView";
import RecentView from "@/views/recent/RecentView";
import TrashView from "@/views/trash/TrashView";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Workspace />,
      children: [
        { index: true, element: <Navigate to="/documents" replace /> },
        { path: "documents", element: <Main /> },
        { path: "images", element: <Main /> },
        { path: "videos", element: <Main /> },
        { path: "others", element: <Main /> },
        { path: "favorites", element: <FavoritesView /> },
        { path: "recent", element: <RecentView /> },
        { path: "trash", element: <TrashView /> },
      ],
    },
    {
      path: "*",
      element: <Navigate to="/documents" replace />,
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  }
);

export default router;
