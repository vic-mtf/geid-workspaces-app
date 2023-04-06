import { 
    CardActionArea, 
    CardMedia, 
    ImageList, 
    ImageListItem, 
    ImageListItemBar, 
    useMediaQuery,
    useTheme
} from "@mui/material";
import Typography from "../../../components/Typography";

export default function Content ({data, onChooseCoverPage}) {
    const theme = useTheme();
    const matchSmall = useMediaQuery(theme.breakpoints.between('xs', 'sm'));
    const matchMedium = useMediaQuery(theme.breakpoints.down('lg'));
    console.log(data);
    return (
    <ImageList 
        cols={matchSmall ?  2 : matchMedium ? 4: 8}
        sx={{ px:1, width: '100%', }}
    >
    {data?.map((cover) => (
        <ImageListItem 
        key={cover._id}>
            <CardActionArea
                sx={{width: 130,}}
                onClick={() => {
                    if(typeof onChooseCoverPage === 'function')
                        onChooseCoverPage({...cover});
                }}
                title={
                    (cover.docTypes[0] || '') + (cover.docTypes[1] ? `/${cover.docTypes[1]}` : '')  
                }
            >
                <CardMedia
                    src={cover.contentUrl}
                    srcSet={cover.contentUrl}
                    alt={cover.name}
                    loading="lazy"
                    component="img"
                    height={160}
                    sx={{
                        width: 130,
                    }}
                />
            </CardActionArea>
            <ImageListItemBar
                title={
                    <Typography> 
                        {cover?.name?.toLowerCase()}
                    </Typography> 
                }
                subtitle={
                    <span>
                        { 
                        (cover.docTypes[0] || '') + 
                        (cover.docTypes[1] ? `/${cover.docTypes[1]}` : '') 
                        }
                    </span>
                }
                position="below"
                sx={{width: 120}}
            />
        </ImageListItem>
    ))}
    </ImageList>
    );
}