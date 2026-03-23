import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";

const Workspace = lazy(() => import("@/views/Workspace"));

function Loading() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <CircularProgress />
    </Box>
  );
}

function LazyWorkspace() {
  return (
    <Suspense fallback={<Loading />}>
      <Workspace />
    </Suspense>
  );
}

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Navigate to="/documents" replace />,
    },
    {
      path: "/documents",
      element: <LazyWorkspace />,
    },
    {
      path: "/images",
      element: <LazyWorkspace />,
    },
    {
      path: "/videos",
      element: <LazyWorkspace />,
    },
    {
      path: "/others",
      element: <LazyWorkspace />,
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
