import React, { useMemo } from "react";
import InputsDoc from "@/views/forms/files/InputsDoc";
import { Box as MuiBox, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import FileItem from "@/views/forms/files/FileItem";
import getFileInfos from "@/utils/getFileInfos";
import normaliseOctetSize from "@/utils/normaliseOctetSize";

interface FormContentProps {
    files: File[] | null;
    findError: (field: string) => boolean;
    handleSendFile: (file: any) => (event: React.FormEvent) => void;
    docFields: any;
    onClose: (event: React.MouseEvent) => void;
    setFiles: (files: any) => void;
}

export default function FormContent ({
    files,
    findError,
    handleSendFile,
    docFields,
    onClose,
    setFiles
}: FormContentProps) {
    const { t } = useTranslation();
    const items = useMemo(() => files ? [...files] : [], [files]);
    return (
        <React.Fragment>
        <Dialog
          open={!!files}
          PaperProps={{
            sx: {overflow: 'hidden'}
          }}
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
            >{t('files.uploadFiles')}
            </Typography>
          </DialogTitle>
          <form onSubmit={handleSendFile(files)}>
          <DialogContent
            sx={{
              maxHeight: '70vh',
              maxWidth: 500,
              minWidth: 300,
            }}
          >
            <MuiBox>
              {items.map((file, index) => (
                <FileItem
                  {...getFileInfos(file)}
                  name={file.name}
                  key={index}
                  title={`${file.name}, ${normaliseOctetSize(file.size)}`}
                  onDelete={() =>
                      setFiles((prevFiles: File[] | null) => prevFiles && prevFiles.length > 1 ?
                          prevFiles.filter((_: File, currentIndex: number) => index !== currentIndex) :
                          null
                      )
                  }
                />
              ))}
            </MuiBox>
            <InputsDoc {...docFields} findError={findError} />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={onClose}
              color="primary"
            >{t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="outlined"
              color="primary"
            >{t('files.upload')}</Button>
          </DialogActions>
          </form>
        </Dialog>
      </React.Fragment>
    )
}
