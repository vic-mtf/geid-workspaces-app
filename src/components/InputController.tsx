import { FormControl, FormHelperText } from '@mui/material';
import React, { useLayoutEffect, useMemo, useState } from 'react';
import capStr from '@/utils/capStr';
import validateFields from '@/utils/validateFields';

interface InputControllerProps {
    children: React.ReactElement;
    regExp?: RegExp | string;
    multiline?: boolean;
    emptyErrorMessage?: string;
    invalidateErrorMessage?: string;
    type?: string;
    trim?: boolean;
    size?: 'small' | 'medium';
    autoController?: boolean;
    valueRef?: React.MutableRefObject<string | null>;
    externalError?: boolean;
    name?: string;
    defaultValue?: string;
    inputRef?: React.Ref<any>;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>, value: string) => void;
    label?: string;
    [key: string]: any;
}

export default function InputController ({
    children,
    regExp = /./,
    multiline,
    emptyErrorMessage = 'Veuillez remplir ce champ.',
    invalidateErrorMessage = `Le champ n'est pas valable, \n    veuillez le remplir correctement.`,
    type,
    trim = true,
    size = 'small',
    autoController = false,
    valueRef,
    externalError,
    name,
    defaultValue = '',
    inputRef,
    onChange: handleChange,
    label,
    ...otherProps
}: InputControllerProps) {
    const [values, setValues] = useState({
        value: defaultValue,
        error: true,
    });
    const validate = (validateFields as any)[`validate${capStr(type || '')}`];
    const validateFunc = (autoController) ? validate :
    (value: string) => value.toString().trim().match(new RegExp(regExp as string));
    const error = useMemo(() => !!(externalError && (values.error)),
        [
            values.error,
            externalError,
        ]
    );
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
            <FormHelperText sx={{color: (theme: any) => theme.palette.error.main}}>
                {
                values.value.trim() ?
                invalidateErrorMessage : emptyErrorMessage
                }
            </FormHelperText>
          )}
        </FormControl>
    )
}
