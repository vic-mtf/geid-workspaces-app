import { CardMedia, useTheme } from "@mui/material";
import { BookCover } from "book-cover-3d";
import { extractColors } from 'extract-colors'
import { useEffect, useState } from "react";

export default function Cover ({uri}) {
    const theme = useTheme();
    const [color, setColor] = useState(theme.palette.primary.main);
    
    useEffect(() => {
        if(uri)
            extractColors(uri).then((colors) => {
                const [color] = colors;
                setColor(color.hex);
            })
    },[uri]);

    return (
        <BookCover
            height={190}
            width={150}
            rotate={15}
            rotateHover={360}
            bgColor={color}
            pagesOffset={0}
            thickness={20}
            transitionDuration={1}
            
        >
            <CardMedia
                component="img"
                height={200}
                src={uri}
                sx={{
                    height: "100%",
                    width: "100%",
                }}
            />
        </BookCover>
    )
}