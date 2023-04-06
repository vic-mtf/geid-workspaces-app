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
import CheckRoundedIcon  from '@mui/icons-material/CheckRounded';
import PropTypes from 'prop-types';

const idField = parseInt(Math.random() * 1000000);

const TextFieldController = forwardRef((props, ref) => {
    const {
        helperTextError,
        helperTextSuccess,
        label,
        regExp,
        type,
        defaultValue,
        checking,
        icon,
        onChange,
        onToggleShowPassword,
        showPasswordProps,
        actionsIcons,
        reverseRegExp,
        inputProps,
        multiline,
        ...otherPros
    } = props;
    const isPassword = type === 'password';
    const [values, setValues] = useState({
        value: defaultValue || '',
        type,
        error: false,
        ...(isPassword ? {showPassword : false} : {})
    });
    const color = checking ? values.error ? 'error': 'primary' : 'primary';
    const handleChange = prop => event => {
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
        if(ref) ref.current = (!values.value.trim() || values.error) ? null : values.value;
        if(!values.value.trim() && !values.error)
            setValues({...values, error: true});
    }, [values.value, checking]);
   
    return (
        <FormControl
            color={color}
            type={values.type}
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
                                        handleChange('password')}
                                    onMouseDown={null}
                                    edge="end"
                                    size="small"
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
                                <ErrorRoundedIcon fontSize="small" color={color}/> : <CheckRoundedIcon  color={color}/>}
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

TextFieldController.defaultProps = {
    variant: 'outlined',
    helperTextError: '',
    helperTextSuccess: '',
    label: '',
    regExp: '',
    defaultValue: '',
    checking: false,
    icon: true,
    type: 'text',
    showPasswordProps: null,
    inputProps: {},
};

TextFieldController.propTypes = {
    ...FormControl.propTypes,
    ...OutlinedInput.propTypes,
    variant: PropTypes.string,
    helperTextError: PropTypes.string,
    helperTextSuccess: PropTypes.string,
    label: PropTypes.string,
    defaultValue: PropTypes.string,
    checking: PropTypes.bool,
    icon: PropTypes.bool,
    onChange: PropTypes.func,
    inputProps: PropTypes.object,
}

export default TextFieldController;
