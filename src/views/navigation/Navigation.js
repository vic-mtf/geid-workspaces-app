import { Drawer, Toolbar, Box as MuiBox } from "@mui/material";
import ListOptions from "./ListOptions";

export const drawerWidth = 250;
export default function Navigation () {
    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { 
                    width: drawerWidth, 
                    boxSizing: 'border-box',
                    background: 'none'
                },
            }}
        >
            <Toolbar/>
            <MuiBox sx={{ overflow: 'auto' }}>
                <ListOptions/>
            </MuiBox>
        </Drawer>
    )
}