import React, { forwardRef, useLayoutEffect, useState } from 'react';
import {
    FormControl,
    InputLabel,
    OutlinedInput,
    InputAdornment,
    IconButton,
    FormHelperText,
    Typography,
    Fade
} from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import ErrorRoundedIcon  from '@mui/icons-material/ErrorRounded';
import CheckOutlinedIcon  from '@mui/icons-material/CheckOutlined';

const idField = parseInt(String(Math.random() * 1000000));

interface TextFieldControllerProps {
    helperTextError?: string;
    helperTextSuccess?: string;
    label?: string;
    regExp?: string;
    type?: string;
    defaultValue?: string;
    checking?: boolean;
    icon?: boolean;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onToggleShowPassword?: (show: boolean, callback: () => void) => void;
    showPasswordProps?: boolean | null;
    actionsIcons?: React.ReactNode;
    reverseRegExp?: boolean;
    inputProps?: Record<string, any>;
    multiline?: boolean;
    variant?: string;
    [key: string]: any;
}

const TextFieldController = forwardRef<any, TextFieldControllerProps>((props, ref) => {
    const {
        helperTextError = '',
        helperTextSuccess = '',
        label = '',
        regExp = '',
        type = 'text',
        defaultValue = '',
        checking = false,
        icon = true,
        onChange,
        onToggleShowPassword,
        showPasswordProps = null,
        actionsIcons,
        reverseRegExp,
        inputProps = {},
        multiline,
        ...otherPros
    } = props;
    const isPassword = type === 'password';
    const [values, setValues] = useState<{
        value: string;
        type: string;
        error: boolean;
        showPassword?: boolean;
    }>({
        value: defaultValue || '',
        type,
        error: false,
        ...(isPassword ? {showPassword : false} : {})
    });
    const color = checking ? values.error ? 'error': 'primary' : 'primary';
    const handleChange = (prop: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        if(prop === 'text') {
            const { value } = event.target;
            const test = RegExp(regExp, 'ig').test(value)
            const error = !(value && reverseRegExp ? !test : test);
            setValues({...values, value, error});
            if(typeof onChange === 'function')
                onChange(event);
        }
        if(prop === 'password')
            setValues({
                ...values,
                type: values.showPassword ? 'password' : 'text',
                showPassword: !values.showPassword
            });
    }
    useLayoutEffect(() => {
        if(ref) (ref as any).current = (!values.value.trim() || values.error) ? null : values.value;
        if(!values.value.trim() && !values.error)
            setValues({...values, error: true});
    }, [checking, values, ref]);

    return (
        <FormControl
            color={color as any}
            {...otherPros}
        >
           { label && <InputLabel htmlFor={ label + idField }>{label}</InputLabel>}
            <OutlinedInput
                type={
                    showPasswordProps === null ?
                    values.type : showPasswordProps ?
                    'text' : 'password'
                }
                id={ label + idField }
                multiline={multiline}
                defaultValue={values.value}
                onChange={handleChange('text')}
                label={label}
                {...inputProps}
                endAdornment={
                    <React.Fragment>
                        {isPassword &&
                        <InputAdornment position="end">
                                <IconButton
                                    aria-label={ label + idField }
                                    onClick={
                                        typeof onToggleShowPassword === 'function' ?
                                       () => onToggleShowPassword(
                                            !values.showPassword,
                                             () => setValues({
                                                ...values,
                                                showPassword: !values.showPassword
                                            })) :
                                        handleChange('password') as any}
                                    onMouseDown={null as any}
                                >
                                {
                                    (showPasswordProps === null ?
                                    values.showPassword :
                                    showPasswordProps) ?
                                <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon/>
                                    }
                                </IconButton>
                        </InputAdornment>}
                        { checking && icon &&
                            <InputAdornment position="end">
                                { color === 'error' ?
                                <ErrorRoundedIcon fontSize="small" color={color as any}/> : <CheckOutlinedIcon  color={color as any}/>}
                            </InputAdornment>
                        } {actionsIcons}
                    </React.Fragment>
                }
            />
          { checking &&
          <Fade in={true}>
              <FormHelperText id={ label + idField }>
                    {
                        typeof values.value === 'string' &&
                        (
                            !(props.type === 'password' ? values.value : values.value.trim()) ?
                            <Typography color={color} variant="caption" component="span">
                                champ vide
                            </Typography>
                             : (helperTextError || helperTextSuccess) &&
                             <Typography color={color} variant="caption" component="span">
                                {color === 'error' ? helperTextError : helperTextSuccess}
                             </Typography>
                        )
                    }
            </FormHelperText>
          </Fade>
        }
        </FormControl>
    )
});

TextFieldController.displayName = 'TextFieldController';

export default TextFieldController;
