import React,{ useCallback, useMemo, useState } from "react"
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { FormControl, FormHelperText, MenuItem, Paper, Popper, Stack, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/types";

interface DocTypeFrameProps {
    typeRef?: React.MutableRefObject<string | null>;
    subTypeRef?: React.MutableRefObject<string | null>;
    externalTypeError?: boolean;
    externalErrorSubTypeError?: boolean;
}

export default function DocTypeFrame ({
    typeRef,
    subTypeRef,
    externalTypeError,
    externalErrorSubTypeError
}: DocTypeFrameProps) {
    const docTypes = useSelector((store: RootState) => store.user.docTypes) || [];
    const [type, setType] = useState<{label: string; id: number} | null>(null);
    const [subType, setSubType] = useState<{label: string; id: number} | null>(null);
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
    const onChangeType = useCallback((event: any, type: {label: string; id: number} | null) => {
        if(typeRef) typeRef.current = type?.label || null;
        if(subTypeRef) subTypeRef.current = null;
        setType(type || null);
        setSubType(null);
    }, [typeRef, subTypeRef]);

    const onChangeSubType = useCallback((event: any, type: {label: string; id: number} | null) => {
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
                                    bgcolor: (theme: any) => theme.palette.background.paper +
                                    theme.customOptions.opacity,
                                    border: (theme: any) => `1px solid ${theme.palette.divider}`,
                                    backdropFilter: (theme: any) => `blur(${theme.customOptions.blur})`,
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
                {typeEmptyError && <FormHelperText sx={{color: (theme: any) => theme.palette.error.main }}>
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
                    renderOption={(params, option) => (
                        <MenuItem {...params} >
                            <Typography
                                variant="caption"
                                title={params.key}
                                key={option.id}
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
                                    bgcolor: (theme: any) => theme.palette.background.paper +
                                    theme.customOptions.opacity,
                                    border: (theme: any) => `1px solid ${theme.palette.divider}`,
                                    backdropFilter: (theme: any) => `blur(${theme.customOptions.blur})`,
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
                {subTypeEmptyError && <FormHelperText sx={{color: (theme: any) => theme.palette.error.main}}>
                    S'il vous plaît sélectionner un élément.
                </FormHelperText>}
            </FormControl>
        </Stack>
    )

}
