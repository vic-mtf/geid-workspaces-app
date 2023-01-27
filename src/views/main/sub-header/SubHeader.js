import { Toolbar } from "@mui/material";
import { Stack } from "@mui/system";
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import Button from "../../../components/Button";
import SortButton from "./SortButton";
import UploadFilesButton from "./UploadFilesButton";
import TeleverseButton from "./TeleverseButton";
import DisplayButton from "./DisplayButton";

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