import React from "react";
import textStyle from "@/styles/text.module.css";
import { Button, Typography } from "@mui/material";
import i18n from "@/i18n/i18n";

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
                i18n.t('files.deletingFile')
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
                }, i18n.t('common.cancel'))
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
                    path: file.currentPath || (file.type + 's'),
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
                        i18n.t('files.fileDeleted')
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
                        i18n.t('files.fileDeleteError')
                    ),
                    { variant: 'error'}
                )
            });
    },3000);
}
