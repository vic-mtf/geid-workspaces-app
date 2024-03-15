import React,{ useLayoutEffect, useMemo, useState } from "react"
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { FormControl, FormHelperText, MenuItem, Paper, Popper, Stack} from "@mui/material";
import Typography from "../../../components/Typography";
import { useSelector } from "react-redux";

export default function Typology ({type, subType,  externalTypeError,  externalSubTypeError}) {
    const docTypes = useSelector(store => store?.user?.docTypes);
    const [values, setValues] = useState({
        type: type?.current,
        subType: subType?.current,
        types: docTypes?.map(({name: label}, index) => ({label, id: index})),
        subTypes: docTypes[0]?.subtypes?.map((label, id) => ({label, id})),
        open: false,
    });
    const funcEmptyError = useMemo(() => !!(externalTypeError && !values.type), 
        [
            externalTypeError, 
            values.type
        ]
    );

    const roleEmptyError = useMemo(() => !!(externalSubTypeError && !values.subType && values.subTypes.length > 1), 
        [
            externalSubTypeError, 
            values.subType,
            values.subTypes.length,
        ]
    );

    const handleType = (event, type) => {
        setValues({
            ...values, 
            type,
            subType: null,
            subTypes: (type && docTypes[type?.id]?.subtypes?.map((label, id) => ({label, id}))) || [] ,
        });
    };

    useLayoutEffect(() => {
        if(type && subType && values.type) {
            type.current = values?.type?.label;
            if(values.subType)
                subType.current = values.subType?.label;
            if(values.subTypes.length <= 1)
                subType.current = values?.subTypes[0]?.label;
        }
        if(type && subType && !values.type) {
            type.current = null;
            subType.current = null;
        }
    }, [
        type, 
        subType, 
        values.type, 
        values.subType, 
        values.types, 
        values.subTypes
    ]);

    return (
        <Stack direction="row" spacing={1}>
            <FormControl fullWidth>
                <Autocomplete
                    size="small"
                    fullWidth
                    options={values.types}
                    onChange={handleType}
                    value={values.type}
                    noOptionsText={
                        (<Typography color="red">Aucun élement</Typography>)
                    }
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
                            error={funcEmptyError}
                            InputProps={{
                            ...params.InputProps,
                            sx: {fontSize: 14},
                            endAdornment: (params.InputProps.endAdornment),
                            }}
                        />
                    )}
                />
                {funcEmptyError && <FormHelperText sx={{color: theme => theme.palette.error.main }}>
                    S'il vous plaît sélectionner un élément.
                </FormHelperText>}
            </FormControl>
            <FormControl fullWidth>
                <Autocomplete
                    size="small"
                    fullWidth
                    key={values.type}
                    disabled={values.subTypes.length  < 2 || !values.type}
                    value={values.subType}
                    title={values.subType?.label}
                    noOptionsText="Aucun élement"
                    onChange={(event, subType) => setValues({...values, subType})}
                    options={values.subTypes}
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
                            error={roleEmptyError}
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
                {roleEmptyError && <FormHelperText sx={{color: theme => theme.palette.error.main }}>
                    S'il vous plaît sélectionner un élément.
                </FormHelperText>}
            </FormControl>
        </Stack>
    )

}