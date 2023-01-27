import { LoadingButton } from "@mui/lab";
import { 
    Box, 
    CardMedia, 
    Dialog, 
    DialogContent, 
    Grid, 
    Stack 
} from "@mui/material";

export default function CoverForm (props) {
    const [{loading}, refetch, cancel] = useAxios(COVER_URL, {
        manual: true,
    });
    const defaultName = getName(props?.file?.name || '');
    const [,{ getSession }] = useSession();
    const {/*id: userId, */ token, } = getSession('user') || {};
    const [values, setValues] = useState({
        checking: [],
    });

    const dataFile = {
        doc: useRef(''),
        subDoc: useRef(''),
        name: useRef(defaultName),
    };
    const handleCancel = event => {
        event?.preventDefault();
        cancel();
        props?.onClose();
    }
   // console.log(dataFile);
    const handlerSend = event => {
        event?.preventDefault();
        const data = new FormData();
        let errors = [];
        Object.keys(dataFile).forEach(field => {
            if(!dataFile[field].current)
                errors.push(field);
            if(field === 'subDoc') 
            errors = dataFile[field]?.current === null ? 
            errors.map(field => field !== 'subDoc' && field)
            .filter(field => field) : errors;
        });
        data.append('name',  dataFile.name.current || defaultName);
        data.append('docTypes',
            parse([
                dataFile.doc.current, 
                dataFile.subDoc.current,
            ].filter(e => e))
        );
        data.append('file', props.file);
        if(errors.length)
            setValues({checking: errors});
        else
            refetch({
                data,
                method: 'post',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            }).then( () => {
                props?.refetch();
                props?.onClose();
            }).catch(error => {
                console.log(error);
            });
    };

    return (
        <Dialog
            open={!!props.file}
        >
            <DialogContent sx={{
                width: 500
            }}>
                <Stack direction="row" spacing={1}>
                    <Box sx={{flexGrow: 1}}>
                        <Grid container spacing={1}>
                            <Box item xs={12} component={Grid}>
                                <TextFieldController
                                    margin="dense"
                                    label="Nom du couverture"
                                    fullWidth
                                    size="small"
                                    defaultValue={defaultName}
                                    ref={dataFile.name}
                                    checking={!!~values.checking.indexOf('name')}
                                    regExp={".+"}
                                />
                            </Box>
                            {/* <Structure
                                refs={{
                                    doc: dataFile.doc,
                                    subDoc: dataFile.subDoc,
                                }}
                                checking={values.checking}
                            /> */}
                        </Grid>
                    </Box>
                    <Box>
                        <Card>
                            <CardMedia
                                component="img"
                                height={200}
                                src={props.file && URL.createObjectURL(props.file)}
                                sx={{
                                    height: 150,
                                    width: 120,
                                }}
                            />
                        </Card>
                    </Box>
                </Stack>
            </DialogContent>
            <FormInputTheme>
                <DialogActions>
                    <Button
                        size="small"
                        children="annuler"
                        onClick={handleCancel}
                    />
                    <LoadingButton
                        size="small"
                        children="ajouter"
                        variant="outlined"
                        onClick={handlerSend}
                        loading={loading}
                    />
                </DialogActions>
            </FormInputTheme>
        </Dialog>
    );
}