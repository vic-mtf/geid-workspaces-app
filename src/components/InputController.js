import { FormControl, FormHelperText } from '@mui/material';
import React, { useLayoutEffect, useMemo, useState } from 'react';
import capStr from '../utils/capStr';
import validateFields from '../utils/validateFields';

export default function InputController ({
    children, 
    regExp,
    multiline,
    emptyErrorMessage,
    invalidateErrorMessage,
    type,
    trim,
    size,
    autoController,
    valueRef,
    externalError,
    name,
    defaultValue,
    inputRef,
    onChange: handleChange,
    label,
    ...otherProps
}) {
    const [values, setValues] = useState({
        value: defaultValue,
        error: true,
    });
    const validate = validateFields[`validate${capStr(type)}`];
    const validateFunc = (autoController) ? validate :
    value => value.toString().trim().match(new RegExp(regExp));
    const error = useMemo(() => !!(externalError && (values.error)), 
        [
            values.error, 
            externalError,
        ]
    );
    const onChange = event => {
        const value = trim ? event.target?.value?.trim() : event.target?.value;
        setValues({
            value,
            error: Boolean(typeof validateFunc === 'function' ?
            !validateFunc(value) : false),
        });
        if(typeof handleChange === 'function')
            handleChange(event, value);
       
    };
    
    useLayoutEffect(() => {
        if(typeof valueRef === 'object') 
            valueRef.current = values.error ? null : values.value.trim();
    });

    const cloneChild = React.cloneElement(
        React.Children.only(children),
        {
            ...values, 
            error, 
            size, 
            onChange,
            multiline, 
            rows: 3,
            inputRef,
        }
    );

    return (
        <FormControl  {...otherProps}>
          {cloneChild}
          {error && (
            <FormHelperText sx={{color: theme => theme.palette.error.main}}>
                {
                values.value.trim() ? 
                invalidateErrorMessage : emptyErrorMessage
                }
            </FormHelperText>
          )}
        </FormControl>
    )
}

InputController.defaultProps = {
    size: 'small',
    trim: true,
    regExp: /./,
    autoController: false,
    defaultValue: '',
    emptyErrorMessage: 'Veuillez remplir ce champ.',
    invalidateErrorMessage: `Le champ n'est pas valable, 
    veuillez le remplir correctement.`
};
