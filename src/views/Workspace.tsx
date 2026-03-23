import { CssBaseline, Box as MuiBox } from "@mui/material";
import { Outlet } from "react-router-dom";
import Header from "@/views/header/Header";
import Navigation from "@/views/navigation/Navigation";
import MobileBottomNav from "@/views/navigation/MobileBottomNav";

export default function Workspace () {
    return (
    <MuiBox sx={{ display: 'flex', flex: 1, width: "100%"}}>
      <CssBaseline />
      <Header/>
      <Navigation/>
      <Outlet />
      <MobileBottomNav/>
    </MuiBox>
    )
}
