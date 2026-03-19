import { useState } from "react";
import { useSelector } from "react-redux";
import { RouterProvider } from "react-router-dom";
import BoxGradient from "./components/BoxGradient";
import router from "./router/router";
import Cover from "./views/cover/Cover";
import { RootState } from "./types";

export default function App() {
  const connected = useSelector((store: RootState) => store.user.connected);
  const loaded = useSelector((store: RootState) => store.data.loaded);
  const [opened, setOpened] = useState(false);

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
