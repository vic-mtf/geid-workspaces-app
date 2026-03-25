import React from "react";
import ReactDOM from "react-dom/client";
import "@/i18n/i18n";
import { Provider as ReduxProvider } from "react-redux";
import store from "@/redux/store";
import "./styles/index.css";
import App from "@/App";
import ConfigAppWrapper from "@/utils/ConfigAppWrapper";
import NoticeStackProvider from "@/providers/NoticeStackProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <ConfigAppWrapper>
        <NoticeStackProvider>
          <App />
        </NoticeStackProvider>
      </ConfigAppWrapper>
    </ReduxProvider>
  </React.StrictMode>
);
