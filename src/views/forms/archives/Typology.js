import React,{ useLayoutEffect, useMemo, useState } from "react"
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { FormControl, FormHelperText, MenuItem, Paper, Stack} from "@mui/material";
import Typography from "../../../components/Typography";
import { useSelector } from "react-redux";
import styled from "@emotion/styled";

export default function Typology ({type, subType,  externalTypeError,  externalSubTypeError}) {
    const docTypes = useSelector(store => store?.user?.docTypes);
    const [values, setValues] = useState({
        type: null,
        subType: null,
        types: docTypes?.map(({ name }) => name),
        subTypes: docTypes[0]?.subtypes?.map(({ name }) => name),
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
        const subTypes =  docTypes?.find(({ name }) => name === type)?.subtypes || [];
        setValues({
            ...values, 
            type,
            subType: null,
            subTypes
        });
    };

    useLayoutEffect(() => {
        if(type && subType && values.type) {
            type.current = values?.type;
            if(values.subType)
                subType.current = values.subType;
            if(values.subTypes.length <= 1)
                subType.current = values?.subTypes[0];
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
                <CutomAutocomplete
                    options={values.types}
                    onChange={handleType}
                    value={values.type}
                />
                {funcEmptyError && <FormHelperText sx={{color: theme => theme.palette.error.main }}>
                    S'il vous plaît sélectionner un élément.
                </FormHelperText>}
            </FormControl>
            <FormControl fullWidth>
                <CutomAutocomplete
                    key={values.type}
                    disabled={values.subTypes.length  < 2 || !values.type}
                    value={values.subType}
                    title={values.subType?.label}
                    onChange={(event, subType) => setValues({...values, subType})}
                    options={values.subTypes}
                />
                {roleEmptyError && <FormHelperText sx={{color: theme => theme.palette.error.main }}>
                    S'il vous plaît sélectionner un élément.
                </FormHelperText>}
            </FormControl>
        </Stack>
    )

}

const CutomAutocomplete = styled(Autocomplete)(() => ({}));

CutomAutocomplete.defaultProps = {
    size: "small",
    fullWidth: true,
    noOptionsText: (<Typography color="red">Aucun élement</Typography>),
    renderOption: (params) => ( <MenuItem {...params} sx={{fontSize: 14}}>{params.key}</MenuItem>),
    PaperComponent: (params) => (
        <Paper 
            sx={{
                bgcolor: theme => theme.palette.background.paper +
                theme.customOptions.opacity,
                border: theme => `1px solid ${theme.palette.divider}`,
                backdropFilter: theme => `blur(${theme.customOptions.blur})`,
            }}
        {...params}/>
    ),
    renderInput: (params) => (
        <TextField 
            {...params} 
            label="Type" 
            size="small" 
            margin="normal"
            // error={funcEmptyError}
            InputProps={{
                ...params.InputProps,
                sx: {fontSize: 14},
                endAdornment: params.InputProps.endAdornment,
            }}
        />
    ),

};