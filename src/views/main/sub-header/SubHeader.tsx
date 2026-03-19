import { Button, Toolbar } from "@mui/material";
import { Stack } from "@mui/system";
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SortButton from "@/views/main/sub-header/SortButton";
import UploadFilesButton from "@/views/main/sub-header/UploadFilesButton";
import TeleverseButton from "@/views/main/sub-header/TeleverseButton";
import DisplayButton from "@/views/main/sub-header/DisplayButton";

export default function SubHeader () {
    return (
        <Toolbar variant="dense">
                <Stack
                    direction="row"
                    spacing={2}
                    flexGrow={1}
                >
                    <Button
                        variant="contained"
                        disabled
                        endIcon={<ExpandMoreRoundedIcon/>}
                        startIcon={<AddRoundedIcon/>}
                    >Nouveau</Button>
                    <TeleverseButton/>
                </Stack>
                <Stack
                    direction="row"
                    spacing={2}
                >
                    <UploadFilesButton/>
                    <SortButton/>
                    <DisplayButton/>
                </Stack>
        </Toolbar>
    );
}
