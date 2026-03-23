import { CssBaseline, Box as MuiBox } from "@mui/material";
import { Outlet } from "react-router-dom";
import Header from "@/views/header/Header";
import Navigation from "@/views/navigation/Navigation";
import MobileBottomNav from "@/views/navigation/MobileBottomNav";

export default function Workspace() {
  return (
    <>
      <MuiBox sx={{ display: "flex", flex: 1, width: "100%", height: "100%", minHeight: 0 }}>
        <CssBaseline />
        <Header />
        <Navigation />
        <Outlet />
      </MuiBox>
      <MobileBottomNav />
    </>
  );
}
