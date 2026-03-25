import React from "react";
import InputsBook from "@/views/forms/medialibrary/InputsBook";
import InputsMedia from "@/views/forms/medialibrary/InputsMedia";
import { useTranslation } from "react-i18next";

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material';

interface FormContentProps {
    file: any;
    mediaFields: any;
    findError: (field: string) => boolean;
    handleSendFile: (file: any) => (event: React.FormEvent) => void;
    typeInfos: any;
    bookFields: any;
    onClose: (event: React.MouseEvent) => void;
}

export default function FormContent ({
    file,
    mediaFields,
    findError,
    handleSendFile,
    typeInfos,
    bookFields,
    onClose
}: FormContentProps) {
    const { t } = useTranslation();
    return (
        <React.Fragment>
        <Dialog
          open={!!file}
          BackdropProps={{
            sx: {
              bgcolor: (theme: any) => theme.palette.background.paper +
              theme.customOptions.opacity,
              border: (theme: any) => `1px solid ${theme.palette.divider}`,
              backdropFilter: (theme: any) => `blur(${theme.customOptions.blur})`,
            }
          }}
        >
          <DialogTitle component="div">
            <Typography
                variant="h6"
                fontWeight="bold"
                fontSize={18}
            >
                {t("medialibrary.submitTitle")}
            </Typography>
          </DialogTitle>
          <form onSubmit={handleSendFile(file)}>
          <DialogContent sx={{width: 500}}>
            {
              typeInfos?.type === 'media' ?
              (<InputsMedia {...mediaFields} findError={findError} />) :
              (<InputsBook {...bookFields} findError={findError} />)
            }
            <DialogContentText component="div">
                <Typography my={1}>
                  {t("medialibrary.sectionNotice", { section: typeInfos?.label })}
                </Typography>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={onClose}
              color="primary"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              variant="outlined"
              color="primary"
            >
              {t("archives.sendArticle")}
            </Button>
          </DialogActions>
          </form>
        </Dialog>
      </React.Fragment>
    )
}
