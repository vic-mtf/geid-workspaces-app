import { Box } from '@mui/material'
import TextField from '@mui/material/TextField';

export default function AppTest () {
    return (
        <Box>
            <Box>Hello world</Box>
            <TextField
            error
            multiline
            rows={3}
            />
        </Box>
    );
}