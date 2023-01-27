import React from "react";
import Button from "../../../../components/Button";
import Typography from "../../../../components/Typography";
import textStyle from "../../../../styles/text.module.css";

export default function removeFile (file) {
    let timer = null;
    const { 
        enqueueSnackbar,
        refresh,
        closeSnackbar,
        user,
        setIsRemoved
    } = file;
    const { id: userId } = user;
    const name = file?.name?.replace(/_/, ' ');
    enqueueSnackbar(
        <React.Fragment>
            <Typography>
                <Typography 
                    title={name} 
                    maxWidth={300} 
                    fontSize={15} 
                    fontWeight="bold" 
                    className={textStyle.monoCrop}
                    padding
                >{name}</Typography>
                Suppression en cours...
                </Typography>
        </React.Fragment>,
        {
            autoHideDuration: null,
            action: snackBar => (
                <Button
                    variant="text"
                    color="inherit"
                    onClick={() => {
                        if(timer) {
                            window.clearTimeout(timer);
                            closeSnackbar(snackBar);
                            setIsRemoved(false);
                        }  
                    }}
                >Annuler</Button>
            )
        }
    );
    setIsRemoved(true);
    if(timer) window.clearTimeout(timer);
        timer = setTimeout(() => {
            refresh({
                method: 'delete',
                url: `/api/stuff/workspace/${JSON.stringify({
                    userId,
                    path: file.type + 's',
                    filename: file?.name
                })}`
            }).then(() => {
                closeSnackbar()
                enqueueSnackbar(
                    <Typography>
                        <Typography 
                            title={name} 
                            maxWidth={300} 
                            fontSize={15} 
                            fontWeight="bold" 
                            className={textStyle.monoCrop}
                            padding
                        >{name}</Typography>
                        Le fichier a été supprimé
                </Typography>,
                    { variant: 'success'}
                )
            }).catch(() => {
                closeSnackbar();
                setIsRemoved(false)
                enqueueSnackbar(
                    <Typography>
                        <Typography 
                            title={name} 
                            maxWidth={300} 
                            fontSize={15} 
                            fontWeight="bold" 
                            className={textStyle.monoCrop}
                            padding
                        >{name}</Typography>
                        Impossible de supprimer le fichier
                    </Typography>,
                    { variant: 'error'}
                )
            });
    },3000);
}