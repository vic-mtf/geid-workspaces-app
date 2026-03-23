import { LoadingButton } from "@mui/lab";
import { Button, Dialog, DialogActions, DialogContent, Grid, Stack } from "@mui/material";
import { useSelector } from "react-redux";
import useAxios from "@/utils/useAxios";
import TextFieldController from '@/components/TextFieldController';
import { useCallback, useMemo, useRef, useState } from "react";
import { getName } from "@/utils/getFileExtension";
import DocTypeFrame from "@/components/DocTypeFrame";
import Cover from "@/views/forms/document-covers-pages/Cover";
import { RootState } from "@/types";

interface CoverPageFormProps {
    file?: File | null;
    refresh?: () => void;
    setFile: (file: File | null) => void;
}

export default function CoverPageForm ({file, refresh, setFile}: CoverPageFormProps) {
    const token = useSelector((store: RootState) => store.user.token);
    const fileNameRef = useRef<any>();
    const typeRef = useRef<any>();
    const subTypeRef = useRef<any>();
    const [, setCheckingErrors] = useState<string[]>([]);
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

    const handleCancelCancel = useCallback((event?: React.MouseEvent) => {
        event?.preventDefault();
        cancel();
        if(fileURL) window.URL.revokeObjectURL(fileURL);
        setFile(null);
    }, [fileURL, cancel, setFile]);

    const handlerSendCover = useCallback((event?: React.MouseEvent) => {
        event?.preventDefault();
        const data = new FormData();
        const name = fileNameRef.current;
        const type = typeRef.current;
        const subType = subTypeRef.current;
        const errors: string[] = [];
        data.append('name', name || getName(file?.name || ''));
        data.append('docTypes',JSON.stringify([type, subType]));
        if(file) data.append('file', file);
        if(errors.length)
            setCheckingErrors(errors);
        else
            refetch({
                data,
                method: 'post',
            }).then(() => {
                if(typeof refresh === 'function')
                    refresh();
                handleCancelCancel();
            }).catch(() => {
                // Erreur silencieuse — l'utilisateur voit l'état du formulaire
            });
    }, [file, handleCancelCancel, refetch, refresh]);

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
                        onClick={handleCancelCancel}
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
