import React from "react";
import textStyle from "@/styles/text.module.css";
import { Button, Typography } from "@mui/material";

export default function removeFile (file: any): void {
    let timer: ReturnType<typeof setTimeout> | null = null;
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
        React.createElement(React.Fragment, null,
            React.createElement(Typography, null,
                React.createElement(Typography, {
                    title: name,
                    maxWidth: 300,
                    fontSize: 15,
                    fontWeight: "bold",
                    className: textStyle.monoCrop,
                    sx: { px: 1 }
                }, name),
                'Suppression en cours...'
            )
        ),
        {
            autoHideDuration: null,
            action: (snackBar: any) => (
                React.createElement(Button, {
                    variant: "text",
                    color: "inherit",
                    onClick: () => {
                        if(timer) {
                            window.clearTimeout(timer);
                            closeSnackbar(snackBar);
                            setIsRemoved(false);
                        }
                    }
                }, 'Annuler')
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
                    React.createElement(Typography, null,
                        React.createElement(Typography, {
                            title: name,
                            maxWidth: 300,
                            fontSize: 15,
                            fontWeight: "bold",
                            className: textStyle.monoCrop,
                            sx: { px: 1 }
                        }, name),
                        'Le fichier a été supprimé'
                    ),
                    { variant: 'success'}
                )
            }).catch(() => {
                closeSnackbar();
                setIsRemoved(false)
                enqueueSnackbar(
                    React.createElement(Typography, null,
                        React.createElement(Typography, {
                            title: name,
                            maxWidth: 300,
                            fontSize: 15,
                            fontWeight: "bold",
                            className: textStyle.monoCrop,
                            sx: { px: 1 }
                        }, name),
                        'Impossible de supprimer le fichier'
                    ),
                    { variant: 'error'}
                )
            });
    },3000);
}
