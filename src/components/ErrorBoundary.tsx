import React, { Component, ErrorInfo, ReactNode } from "react";
import { Box, Button, Typography } from "@mui/material";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.VITE_DEBUG === "true") {
      // eslint-disable-next-line no-console
      console.error("ErrorBoundary:", error, info.componentStack);
    }
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height="100vh"
          gap={2}
          p={3}
          textAlign="center"
        >
          <ErrorOutlineRoundedIcon sx={{ fontSize: 64 }} color="error" />
          <Typography variant="h5" fontWeight="bold">
            Une erreur inattendue est survenue
          </Typography>
          <Typography color="text.secondary">
            L'application a rencontré un problème. Veuillez recharger la page.
          </Typography>
          <Button variant="contained" onClick={this.handleReload}>
            Recharger la page
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
