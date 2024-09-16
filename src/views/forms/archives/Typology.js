import React, { useMemo } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { FormControl, MenuItem, Stack } from "@mui/material";
import Typography from "../../../components/Typography";
import { useSelector } from "react-redux";
import { Controller } from "react-hook-form";

export default function Typology({ control, errors }) {
  const docTypes = useSelector((store) => store?.user?.docTypes);
  const types = useMemo(() => docTypes.map(({ name }) => name), [docTypes]);

  return (
    <Stack direction='row' spacing={1}>
      <Controller
        name='type'
        control={control}
        rules={{ required: "Choisir un type" }}
        render={({ field: { onChange, onBlur, value: type = null } }) => {
          const subTypes =
            docTypes?.find(({ name }) => name === type)?.subtypes || [];

          return (
            <>
              <FormControl fullWidth>
                <Autocomplete
                  options={types}
                  value={type}
                  onChange={(_, type) => onChange(type)}
                  onBlur={onBlur}
                  noOptionsText={
                    <Typography color='red'>Aucun type trouvé</Typography>
                  }
                  renderOption={(params) => (
                    <MenuItem
                      {...params}
                      key={params?.key}
                      title={params?.key?.length > 20 ? params?.key : undefined}
                      sx={{
                        fontSize: 14,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        textWrap: "nowrap",
                      }}>
                      {params.key}
                    </MenuItem>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='Type'
                      margin='dense'
                      InputProps={{
                        ...params.InputProps,
                        sx: { fontSize: 14 },
                        endAdornment: params.InputProps.endAdornment,
                      }}
                      color={errors?.type ? "error" : "primary"}
                      helperText={errors?.type?.message}
                      FormHelperTextProps={{
                        sx: { color: "error.main" },
                      }}
                    />
                  )}
                />
              </FormControl>
              <Controller
                control={control}
                name='subType'
                disabled={!subTypes?.length}
                key={type}
                render={({
                  field: { onBlur, onChange, value: subType = null, disabled },
                }) => {
                  return (
                    <FormControl fullWidth>
                      <Autocomplete
                        disabled={disabled}
                        value={subType}
                        onChange={(_, subType) => onChange(subType)}
                        options={subTypes}
                        onBlur={onBlur}
                        fullWidth={true}
                        noOptionsText={
                          <Typography color='red'>
                            Aucun sous type trouvé
                          </Typography>
                        }
                        renderOption={(params) => (
                          <MenuItem
                            {...params}
                            key={params?.key}
                            sx={{ fontSize: 14 }}
                            title={
                              params?.key?.length > 20 ? params?.key : undefined
                            }>
                            {params.key}
                          </MenuItem>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label='Sous type'
                            margin='dense'
                            InputProps={{
                              ...params.InputProps,
                              sx: { fontSize: 14 },
                              endAdornment: params.InputProps.endAdornment,
                            }}
                            color={errors?.subType ? "error" : "primary"}
                            helperText={errors?.subType?.message}
                          />
                        )}
                      />
                    </FormControl>
                  );
                }}
              />
            </>
          );
        }}
      />
    </Stack>
  );
}
