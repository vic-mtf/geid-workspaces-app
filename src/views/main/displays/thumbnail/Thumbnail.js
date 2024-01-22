import {
  Grid,
  Box
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import Typography from '../../../../components/Typography';
import fileExtensionBase from '../../../../utils/fileExtensionBase';
import getFileExtension from '../../../../utils/getFileExtention';
import File from '../file/File';
import WrapperContent from './WrapperContent';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

export default function Thumbnail ({data: _data}) {
    const [findName, setFindName] = useState('');
    const data = useMemo(() =>
     _data?.filter(item => {
        const worlds = findName.split(/\s/).filter(word => word?.trim());
        let find = false;
        if(findName?.trim() === '') 
            return true;
        worlds.forEach(word => {
            const _word = word.toLowerCase().trim()
            if(
                (
                    ~item?.name?.toLowerCase().indexOf(_word) && 
                ~_word && 
                word.length > 2
                ) ||
                ~item?.name?.replace(/_/ig, ' ').toLowerCase()?.indexOf(findName?.toLowerCase()?.trim())

            ) 
                find = true;
        });
        return find
    }), [findName, _data]);

    useEffect(() => {
        const handleFinfName = event => {
            const {value} = event.detail || { value: ''};
            setFindName(value);
        }
        document.getElementById('root')
        .addEventListener('_search_data', handleFinfName);
        return () => {
            document.getElementById('root')
            .removeEventListener('_search_data', handleFinfName);
        }
    })
    return (
        <Box
            overflow="auto"
            p={1}
            height="85vh"
        >
            {data?.length === 0 ?
            (<Typography 
                align="center" 
                color="text.secondary"
                height="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDirection="column"
                variant="body1"
                fontWeight="bold"
            >
                <InboxOutlinedIcon fontSize="large"/> Aucun élement
            </Typography>):
            <Grid
                component="div"
                container
            >
                {
                    data?.map((file, index) => {
                        const infos = fileExtensionBase.find(({exts}) => (
                            ~exts.indexOf(getFileExtension(file.name))
                            )
                        )
                        return (
                            <Grid
                                component="div"
                                item
                                md={12 / 5}
                                lg={12 / 6}
                                xl={12 / 8}
                                key={`${index}_${file.name}`}
                            > 
                                <WrapperContent
                                    {...infos}
                                    {...file}
                                > 
                                    <Box
                                        display="flex"
                                        flex={1}
                                        justifyContent="center"
                                        alignItems="center"
                                    >
                                        <File
                                            {...infos}
                                            name={file.name}
                                            date={file.createdAt}
                                            url={file.url}
                                        /> 
                                    </Box>
                                </WrapperContent>
                            </Grid>
                        )
                    })
                }
            </Grid>}
        </Box>
    );
}