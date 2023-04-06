import React,{ useCallback, useMemo, useState } from "react"
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { FormControl, FormHelperText, MenuItem, Paper, Popper, Stack} from "@mui/material";
import Typography from "./Typography";
import { useSelector } from "react-redux";

export default function DocTypeFrame ({
    typeRef, 
    subTypeRef,  
    externalTypeError,  
    externalErrorSubTypeError
}) {
    const docTypes = useSelector(store =>  store.user.docTypes);
    const [type, setType] = useState(null);
    const [subType, setSubType] = useState(null);
    const types = useMemo(() => 
        docTypes.map(({name:label}, id) => ({label, id})), 
        [docTypes]
    );

    const subTypes = useMemo(() => 
        docTypes?.find(({name})  => name === type?.label)
        ?.subtypes?.map((label, id) => ({label, id})) || [], 
        [docTypes, type]
    );
    
    const typeEmptyError = useMemo(() => 
        Boolean(externalTypeError && !type), 
        [
            externalTypeError, 
            type
        ]
    );
    const subTypeEmptyError = useMemo(() => 
        Boolean(externalErrorSubTypeError && !subType && subTypes?.length > 1), 
        [
            externalErrorSubTypeError, 
            subType,
            subTypes.length,
        ]
    );
    const onChangeType = useCallback((event, type) => {
        if(typeRef) typeRef.current = type?.label || null;
        if(subTypeRef) subTypeRef.current = null;
        setType(type || null);
        setSubType(null);
    }, [typeRef, subTypeRef]);
    
    const onChangeSubType = useCallback((event, type) => {
        if(subTypeRef) subTypeRef.current = type?.label || null;
        setSubType(type || null);
    }, [subTypeRef]);

    return (
        <Stack width="100%">
            <FormControl>
                <Autocomplete
                    size="small"
                    fullWidth
                    options={types}
                    onChange={onChangeType}
                    title="Type"
                    value={type}
                    noOptionsText="Aucun élement"
                    renderOption={(params) => (
                        <MenuItem {...params} sx={{fontSize: 14}}>{params.key}</MenuItem>)
                    }
                    PaperComponent={
                        (params) => (
                            <Paper 
                                sx={{
                                    bgcolor: theme => theme.palette.background.paper +
                                    theme.customOptions.opacity,
                                    border: theme => `1px solid ${theme.palette.divider}`,
                                    backdropFilter: theme => `blur(${theme.customOptions.blur})`,
                                }}
                            {...params}/>
                        )
                    }
                    renderInput={(params) => (
                        <TextField 
                            {...params} 
                            label="Type" 
                            size="small" 
                            margin="normal"
                            error={typeEmptyError}
                            InputProps={{
                            ...params.InputProps,
                            sx: {fontSize: 14},
                            endAdornment: (
                                <React.Fragment>
                                {params.InputProps.endAdornment}
                                </React.Fragment>
                            ),
                            }}
                        />
                    )}
                />
                {typeEmptyError && <FormHelperText sx={{color: theme => theme.palette.error.main }}>
                    S'il vous plaît sélectionner un élément.
                </FormHelperText>}
            </FormControl>
            <FormControl>
                <Autocomplete
                    size="small"
                    fullWidth
                    disabled={!subTypes.length}
                    value={subType}
                    title="Sous type"
                    noOptionsText="Aucun élement"
                    onChange={onChangeSubType}
                    options={subTypes}
                    renderOption={(params, index) => (
                        <MenuItem {...params} >
                            <Typography 
                                variant="caption"
                                title={params.key}
                                key={index}
                                sx={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {params.key}
                            </Typography>
                        </MenuItem>
                        )
                    }
                    PopperComponent={(params) => (
                        <Popper
                            {...params}
                        />
                    )}
                    PaperComponent={
                        (params) => (
                            <Paper 
                                {...params}
                                sx={{
                                    bgcolor: theme => theme.palette.background.paper +
                                    theme.customOptions.opacity,
                                    border: theme => `1px solid ${theme.palette.divider}`,
                                    backdropFilter: theme => `blur(${theme.customOptions.blur})`,
                                }}
                            />
                        )
                    }
                    renderInput={(params) => (
                        <TextField 
                            {...params} 
                            label="Sous type" 
                            size="small" 
                            margin="normal"
                            error={subTypeEmptyError}
                            InputProps={{
                            ...params.InputProps,
                            sx: {fontSize: 14},
                            endAdornment: (
                                <React.Fragment>
                                    {params.InputProps.endAdornment}
                                </React.Fragment>
                            ),
                            }}
                        />
                    )}
                />
                {subTypeEmptyError && <FormHelperText sx={{color: theme => theme.palette.error.main}}>
                    S'il vous plaît sélectionner un élément.
                </FormHelperText>}
            </FormControl>
        </Stack>
    )

}