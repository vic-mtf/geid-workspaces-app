import React, { useEffect, useState, useCallback } from "react";
import useAxios from "@/utils/useAxios";
import { useSnackbar } from "notistack";
import { useSelector } from "react-redux";
import textStyle from "@/styles/text.module.css";
import FormContent from "@/views/forms/archives/FormContent";
import { Button, Dialog, Typography } from "@mui/material";
import { RootState } from "@/types";

export default function ArchivesFrom() {
  const [file, setFile] = useState<any>(null);
  const token = useSelector((store: RootState) => store.user.token);

  const [, refresh, cancel] = useAxios(
    {
      url: "api/stuff/archives/",
      method: "post",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    { manual: true }
  );

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const handleSendFile = useCallback(
    (fields: any) => {
      if (!file?.doc?._id) {
        enqueueSnackbar(
          "Ce fichier ne peut pas être archivé directement. Veuillez d'abord le téléverser dans votre espace de travail.",
          { variant: "error" }
        );
        setFile(null);
        return;
      }
      const data = {
        ...fields,
        doc: file.doc._id,
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
      setFile(null);
    },
    [cancel, refresh, closeSnackbar, enqueueSnackbar, file]
  );

  useEffect(() => {
    const rootEl = document.getElementById("root");
    const name = "_open_archives_form";
    const handleOpenMediaForm = (event: any) => setFile(event.detail.file);
    rootEl?.addEventListener(name, handleOpenMediaForm);
    return () => {
      rootEl?.removeEventListener(name, handleOpenMediaForm);
    };
  }, [file]);

  return (
    <Dialog
      open={!!file}
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
        key={file}
        onClose={() => setFile(null)}
        onSubmit={handleSendFile}
      />
    </Dialog>
  );
}
