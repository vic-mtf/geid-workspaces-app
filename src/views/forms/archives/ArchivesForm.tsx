import React, { useCallback } from "react";
import useAxios from "@/utils/useAxios";
import { useSnackbar } from "notistack";
import { useSelector, useDispatch } from "react-redux";
import textStyle from "@/styles/text.module.css";
import FormContent from "@/views/forms/archives/FormContent";
import { Button, Dialog, Typography } from "@mui/material";
import { RootState } from "@/types";
import { closeArchivesForm } from "@/redux/ui";

export default function ArchivesForm() {
  const dispatch = useDispatch();
  const { open, file } = useSelector((store: RootState) => store.ui.archivesForm);

  const [, refresh, cancel] = useAxios(
    {
      url: "api/stuff/archives/",
      method: "post",
    },
    { manual: true }
  );

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const handleSendFile = useCallback(
    (fields: any) => {
      const data = {
        ...fields,
        doc: file?.doc?._id,
        type: {
          type: fields.type,
          subType: fields.subType || undefined,
        },
        tags: fields.tags?.split(/\s/),
      };
      delete data.subType;
      const name = file?.name;
      const timer = setTimeout(() => {
        refresh({ data })
          .then(() => {
            closeSnackbar();
            enqueueSnackbar(
              <Typography>
                <Typography
                  title={name}
                  maxWidth={300}
                  fontSize={15}
                  fontWeight='bold'
                  className={textStyle.monoCrop}
                  sx={{ px: 1 }}>
                  {name}
                </Typography>
                Le fichier a été envoyé au service d'archivage
              </Typography>,
              { variant: "success" }
            );
          })
          .catch(() => {
            closeSnackbar();
            enqueueSnackbar(
              <Typography>
                <Typography
                  title={name}
                  maxWidth={300}
                  fontSize={15}
                  fontWeight='bold'
                  className={textStyle.monoCrop}
                  sx={{ px: 1 }}>
                  {name}
                </Typography>
                Impossible de soumettre ce fichier !
              </Typography>,
              { variant: "error" }
            );
          });
      }, 3000);
      enqueueSnackbar(
        <Typography>
          <Typography
            title={name}
            maxWidth={300}
            fontSize={15}
            fontWeight='bold'
            className={textStyle.monoCrop}
            sx={{ px: 1 }}>
            {name}
          </Typography>
          Transfert du fichier au service d'archivage en cours...
        </Typography>,
        {
          action: (id: any) => (
            <Button
              children='Annuler'
              color='inherit'
              onClick={() => {
                cancel();
                window.clearTimeout(timer);
                closeSnackbar(id);
              }}
            />
          ),
          autoHideDuration: null,
        }
      );
      dispatch(closeArchivesForm());
    },
    [cancel, refresh, closeSnackbar, enqueueSnackbar, file, dispatch]
  );

  return (
    <Dialog
      open={open}
      PaperProps={{
        sx: { overflow: "hidden", maxWidth: 600 },
      }}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: (theme: any) =>
              theme.palette.background.paper + theme.customOptions.opacity,
            border: (theme: any) => `1px solid ${theme.palette.divider}`,
            backdropFilter: (theme: any) => `blur(${theme.customOptions.blur})`,
          },
        },
      }}>
      <FormContent
        file={file}
        key={file?.name}
        onClose={() => dispatch(closeArchivesForm())}
        onSubmit={handleSendFile}
      />
    </Dialog>
  );
}
