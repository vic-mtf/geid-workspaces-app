import React, { useEffect, useState, useCallback } from "react";
import Button from "../../../components/Button";
import Typography from "../../../components/Typography";
import useAxios from "../../../utils/useAxios";
import { useSnackbar } from "notistack";
import { useSelector } from "react-redux";
import textStyle from "../../../styles/text.module.css";
import FormContent from "./FormContent";
import { Dialog } from "@mui/material";

export default function ArchivesFrom() {
  const [file, setFile] = useState(null);
  const token = useSelector((store) => store.user.token);

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
    (fields) => {
      const data = {
        ...fields,
        type: {
          type: fields.type,
          subType: fields.subType,
        },
      };
      delete fields.subType;

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
                  padding>
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
                  padding>
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
            padding>
            {name}
          </Typography>
          Transfert du fichier au service d'archivage en cours...
        </Typography>,
        {
          action: (id) => (
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
    const handleOpenMediaForm = (event) => setFile(event.detail.file);
    rootEl.addEventListener(name, handleOpenMediaForm);
    return () => {
      rootEl.removeEventListener(name, handleOpenMediaForm);
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
            bgcolor: (theme) =>
              theme.palette.background.paper + theme.customOptions.opacity,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            backdropFilter: (theme) => `blur(${theme.customOptions.blur})`,
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
