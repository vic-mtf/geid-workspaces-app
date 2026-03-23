import { useState } from "react";
import { useSelector } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { Box } from "@mui/material";
import BoxGradient from "@/components/BoxGradient";
import ErrorBoundary from "@/components/ErrorBoundary";
import router from "@/router/router";
import Cover from "@/views/cover/Cover";
import { RootState } from "@/types";

export default function App() {
  const connected = useSelector((store: RootState) => store.user.connected);
  const loaded = useSelector((store: RootState) => store.data.loaded);
  const [opened, setOpened] = useState(false);

  const isReady = connected && loaded && opened;

  return (
    <ErrorBoundary>
      <BoxGradient
        sx={isReady ? {
          justifyContent: "stretch",
          alignItems: "stretch",
        } : undefined}
      >
        {isReady ? (
          <Box display="flex" flex={1} width="100%" height="100%" minHeight={0}>
            <RouterProvider router={router} />
          </Box>
        ) : (
          <Cover setOpened={setOpened} />
        )}
      </BoxGradient>
    </ErrorBoundary>
  );
}
