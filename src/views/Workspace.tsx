import { CssBaseline, Box as MuiBox } from "@mui/material";
import Header from "@/views/header/Header";
import Main from "@/views/main/Main";
import Navigation from "@/views/navigation/Navigation";

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
