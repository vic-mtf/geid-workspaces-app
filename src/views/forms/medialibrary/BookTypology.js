import React,{ useMemo, useState } from "react";
import { 
    FormControl, 
    FormHelperText, 
    MenuItem, 
    Paper,
    TextField,
    Autocomplete,
    CircularProgress,
} from "@mui/material";
import Typography from "../../../components/Typography";
import useAxios from "../../../utils/useAxios";

export default function BookTypology ({valueRef,  externalError}) {
    const [{error, loading, data}, refresh] = useAxios(
        {url: '/api/stuff/bibliotheque/types'}, 
        {manual: true}
    );
    const [value, setValue] = useState(null);
    const emptyError = useMemo(() => !!(externalError && !value), [ externalError, value ]);
    const handleChange = (event, _value) => {
        const value = _value || null;
        if(valueRef) valueRef.current = value;
        setValue(value);
    };
    const handleRefresh = () => {
        if(!data) refresh();
    };

    return (
        <FormControl fullWidth>
            <Autocomplete
                size="small"
                fullWidth
                onOpen={handleRefresh}
                options={data || []}
                onChange={handleChange}
                value={value}
                loading={loading}
                loadingText={<Typography>Chargement...</Typography>}
                noOptionsText={
                    error ? 
                    (<Typography color="red">
                        Impossible de récupérer des informations, Vérifier le réseau.
                    </Typography>):
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
                        error={emptyError}
                        InputProps={{
                        ...params.InputProps,
                        sx: {fontSize: 14},
                        endAdornment: (
                            <React.Fragment>
                            {loading && <CircularProgress color="inherit" size={15} />}
                            {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                        }}
                    />
                )}
            />
            {emptyError && <FormHelperText sx={{color: theme => theme.palette.error.main }}>
                S'il vous plaît sélectionner un élément.
            </FormHelperText>}
        </FormControl>
    )

}