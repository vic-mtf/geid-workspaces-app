import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import BoxGradient from "@/components/BoxGradient";
import router from "@/router/router";
import Cover from "@/views/cover/Cover";
import { RootState } from "@/types";
import { deconnected } from "@/redux/user";
import { removeData } from "@/redux/data";

export default function App() {
  const connected = useSelector((store: RootState) => store.user.connected);
  const loaded = useSelector((store: RootState) => store.data.loaded);
  const dispatch = useDispatch();
  const [opened, setOpened] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  // Écouter l'expiration de session (déclenché par l'intercepteur axios 401)
  useEffect(() => {
    const root = document.getElementById("root");
    const handler = () => {
      enqueueSnackbar(t("common.sessionExpired"), {
        variant: "warning",
        autoHideDuration: 6000,
      });
      dispatch(deconnected());
      dispatch(removeData());
      sessionStorage.clear();
      setOpened(false);
    };
    root?.addEventListener("_session_expired", handler);
    return () => root?.removeEventListener("_session_expired", handler);
  }, [dispatch, enqueueSnackbar, t]);

  return (
    <BoxGradient>
      {connected && loaded && opened ? (
        <RouterProvider router={router} />
      ) : (
        <Cover setOpened={setOpened} />
      )}
    </BoxGradient>
  );
}
