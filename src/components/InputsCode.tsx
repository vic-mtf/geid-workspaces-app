import { FormControl, OutlinedInput, Stack, IconButton } from "@mui/material";
import {  useMemo, useState } from "react";
import BackspaceRoundedIcon from '@mui/icons-material/BackspaceRounded';

interface InputsCodeProps {
    len?: number;
    size?: 'small' | 'medium';
    onChange?: (event: any, info: { id: number; value: string }) => void;
    onChangeEnd?: (values: string[]) => void;
    sizes?: number;
    value?: string;
    values?: string[];
    readOnly?: boolean;
    codeRef?: React.MutableRefObject<{ value: string; values: string[] } | null>;
}

export default function InputsCode ({
        len = 6,
        size = 'small',
        onChange,
        onChangeEnd,
        sizes = 45,
        value = '',
        values = [],
        readOnly = false,
        codeRef: ref
    }: InputsCodeProps)  {
    const [_values, _setValues] = useState<{ inputs: string[]; read: number }>({
        inputs: [],
        read: 0,
    });

    const inputs = useMemo(() => {
        const inputsProps = [];
        for (let i = 0; i < len; i++)
            inputsProps.push({
                id: i, size,
                autoComplete: 'off',
                defaultValue: value || values[i],
            });
        return inputsProps;
    }, [len, size, value, values]);

    const handleChange = (id: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.trim().toString();
        if(!~'0123456789'.indexOf(value)) return;
        const inputs = [..._values.inputs];
        inputs[id] = value;
        const read = id + 1;
        _setValues({
            ...values as any,
            inputs,
            read
        });
        document.getElementById(`input_code_${read}`)?.focus();
        if(ref)
            ref.current = {
                value,
                values: inputs
            };
        if(typeof onChange === 'function')
            onChange(event, {
                id,
                value,
            });
        if(typeof onChangeEnd === 'function' && id === len - 1)
        onChangeEnd([...inputs]);
    }

    const handleDelete = (event: React.MouseEvent) => {
        event.preventDefault();
        const read = Math.min(len, Math.max(0, _values.inputs.length - 1));
        document.getElementById(`input_code_${read}`)?.focus();
        let inputs = _values.inputs?.filter((_input, index) => index !== read);
        _setValues({
            ..._values,
            inputs,
            read
        });
        if(typeof onChange === 'function')
            onChange(event, {
                id: read,
                value: inputs[read],
            });
    }

    return (
        <Stack
            direction="row"
            spacing={1}
            display="flex"
            justifyContent="center"
            alignItems="center"
        >
            {
                inputs.map(({id, ...inputProps}) => (
                    <FormControl variant="outlined" key={id}>
                        <OutlinedInput
                            onChange={handleChange(id)}
                            id={`input_code_${id}`}
                            onKeyDown={event => {
                                if(event.keyCode === 8)
                                    handleDelete(event as any);
                            }}
                            inputProps={{
                                style: {
                                    height: sizes,
                                    width: sizes,
                                    textAlign: 'center',
                                    fontSize: 30,
                                },
                                value: _values.inputs[id] || '',
                            }}
                            sx={{height: sizes, width: sizes}}
                            readOnly={readOnly || _values.read !== id}
                            autoFocus={_values.read === id}
                            {...inputProps}
                        />
                    </FormControl>
                ))
            }
            <IconButton
                aria-label="Backspace"
                onClick={handleDelete}
            >
                <BackspaceRoundedIcon/>
            </IconButton>
        </Stack>
    )
}
