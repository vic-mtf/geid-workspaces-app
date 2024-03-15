import { Chip } from '@mui/material';
import textOverflowMiddle from "../../../utils/textOverflowMiddle";

export default function  FileItem ({ name, title, onDelete, icon }) {

    return (
        <Chip
            label={textOverflowMiddle(name)}
            title={title}
            icon={
                <img
                    src={icon}  
                    alt={name}
                    style={{
                        width: 25,
                        height: 25,
                        borderRadius: '10px',
                    }}
                />
            }
            onDelete={onDelete}
            variant="outlined"
            sx={{
                maxWidth: 150,
                borderRadius: 1,
                m: .25,
            }}
        />
    );
}
