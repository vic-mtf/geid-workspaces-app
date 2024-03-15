import { LoadingButton } from "@mui/lab";
import { 
    Dialog, 
    DialogContent, 
    Grid, 
    Stack,
    DialogActions,
} from "@mui/material";
import { useSelector } from "react-redux";
import useAxios from "../../../utils/useAxios";
import TextFieldController from '../../../components/TextFieldController';
import { useCallback, useMemo, useRef, useState } from "react";
import Button from "../../../components/Button";
import { getName } from "../../../utils/getFileExtension";
import DocTypeFrame from "../../../components/DocTypeFrame";
import Cover from "./Cover";

export default function CoverPageForm ({file, refresh, setFile}) {
    const token = useSelector(store => store.user.token);
    const fileNameRef = useRef();
    const typeRef = useRef();
    const subTypeRef = useRef();
    const [, setCheckingErrors] = useState([]);
    const [{loading}, refetch, cancel] = useAxios({
        url: 'api/stuff/cover',
        method: 'post',
        headers: {Authorization: `Bearer ${token}`}
    }, {manual: true});

    const fileURL = useMemo(() => 
        file ? window.URL.createObjectURL(file): null,
        [file]
    );
    const fileName = useMemo(() => 
        file ? getName(file?.name) : null,
        [file]
    );
    // const defaultName = getName(props?.file?.name || '');
    
    // const [values, setValues] = useState({
    //     checking: [],
    // });

    const handlehandleCancelCancel = useCallback(event => {
        event?.preventDefault();
        cancel();
        window.URL.revokeObjectURL(fileURL);
        setFile(null);
    }, [fileURL, cancel, setFile]);

    const handlerSendCover = useCallback(event => {
        event?.preventDefault();
        const data = new FormData();
        const name = fileNameRef.current;
        const type = typeRef.current;
        const subType = subTypeRef.current;
        let errors = [];
        data.append('name', name || getName(file?.name));
        data.append('docTypes',JSON.stringify([type, subType]));
        data.append('file', file);
        if(errors.length)
            setCheckingErrors(errors);
        else;
            refetch({
                data,
                method: 'post',
            }).then( () => {
                if(typeof refresh === 'function')
                    refresh();
                handlehandleCancelCancel();
            }).catch(error => {
                console.log(error);
            });
    }, [file, handlehandleCancelCancel, refetch, refresh]);

    return (
        <Dialog open={Boolean(file)}>
            <DialogContent sx={{
                width: 600
            }}>
                <Grid
                    container
                    spacing={1}
                >
                    <Grid item xs={7}>
                        <Stack spacing={1}>
                            <TextFieldController
                                margin="dense"
                                label="Nom du couverture"
                                fullWidth
                                size="small"
                                defaultValue={fileName}
                                ref={fileNameRef}
                                // checking={!!~values.checking.indexOf('name')}
                                regExp={".+"}
                            />
                            <DocTypeFrame
                                typeRef={typeRef}
                                subTypeRef={subTypeRef}
                            />
                        </Stack>
                    </Grid>
                    <Grid
                        item
                        xs={5}
                        sx={{
                           justifyContent: 'center',
                           alignContent: 'center',
                           display: 'flex'
                        }}
                    >
                        <Cover
                            uri={fileURL}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
                <DialogActions>
                    <Button
                        size="small"
                        children="Annuler"
                        onClick={handlehandleCancelCancel}
                    />
                    <LoadingButton
                        size="small"
                        children="Ajouter"
                        variant="outlined"
                        sx={{
                            textTransform: 'none',
                        }}
                        onClick={handlerSendCover}
                        loading={loading}
                    />
                </DialogActions>
        </Dialog>
    );
}
