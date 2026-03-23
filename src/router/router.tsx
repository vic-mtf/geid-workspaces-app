import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";

const Workspace = lazy(() => import("@/views/Workspace"));
const Main = lazy(() => import("@/views/main/Main"));
const FavoritesView = lazy(() => import("@/views/favorites/FavoritesView"));
const RecentView = lazy(() => import("@/views/recent/RecentView"));
const TrashView = lazy(() => import("@/views/trash/TrashView"));

function Loading() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <CircularProgress />
    </Box>
  );
}

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Lazy><Workspace /></Lazy>,
      children: [
        { index: true, element: <Navigate to="/documents" replace /> },
        { path: "documents", element: <Lazy><Main /></Lazy> },
        { path: "images", element: <Lazy><Main /></Lazy> },
        { path: "videos", element: <Lazy><Main /></Lazy> },
        { path: "others", element: <Lazy><Main /></Lazy> },
        { path: "favorites", element: <Lazy><FavoritesView /></Lazy> },
        { path: "recent", element: <Lazy><RecentView /></Lazy> },
        { path: "trash", element: <Lazy><TrashView /></Lazy> },
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
