import { CssBaseline, Box as MuiBox } from "@mui/material";
import Header from "./header/Header";
import Main from "./main/Main";
import Navigation from "./navigation/Navigation";

export default function Workspace () {
    return (
    <MuiBox sx={{ display: 'flex', flex: 1, width: "100%"}}>
      <CssBaseline />
      <Header/>
      <Navigation/>
      <Main/>
    </MuiBox>
    )
}