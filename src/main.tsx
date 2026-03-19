import React from "react";
import ReactDOM from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";
import store from "@/redux/store";
import "./styles/index.css";
import App from "@/App";
import ConfigAppWrapper from "@/utils/ConfigAppWrapper";
import { SnackbarProvider } from "notistack";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <ConfigAppWrapper>
        <SnackbarProvider maxSnack={10000}>
          <App />
        </SnackbarProvider>
      </ConfigAppWrapper>
    </ReduxProvider>
  </React.StrictMode>
);
