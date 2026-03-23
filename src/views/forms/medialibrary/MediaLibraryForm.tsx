import React, { useMemo, useRef, useState } from "react";
import format from "@/views/forms/format";
import useAxios from "@/utils/useAxios";
import { useSnackbar } from "notistack";
import { useSelector, useDispatch } from "react-redux";
import textStyle from '@/styles/text.module.css';
import FormContent from "@/views/forms/medialibrary/FormContent";
import { RootState } from "@/types";
import { Button, Typography } from "@mui/material";
import { closeMediaLibraryForm } from "@/redux/ui";

export default function MediaLibraryForm () {
    const dispatch = useDispatch();
    const { open, file } = useSelector((store: RootState) => store.ui.mediaLibraryForm);
    const typeInfos = useMemo(() => format[(file?.type as string)], [file?.type]);
    const userId = useSelector((store: RootState) => store.user.id);
    const [, refresh, cancel] = useAxios({
      url: 'api/stuff/frozen',
      method: 'post',
    }, {manual: true});
    const [fieldsError, setFieldsError] = useState<string[]>([]);
    const findError = (field: string) => !!~fieldsError?.indexOf(field);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const bookFields = {
      author: useRef<string | null>(null),
      type: useRef<string | null>(null),
      title: useRef<string | null>(null),
      description: useRef<string | null>(null),
      cover: useRef<any>(null),
    };
    const mediaFields = {
      title: useRef<string | null>(null),
      description: useRef<string | null>(null),
    };

    const handleSendFile = (f: any) => (event: React.FormEvent) => {
      event.preventDefault();
      const errors: string[] = [];
      const datas: Record<string, any> = { frozenType: typeInfos?.key };
      const where = `${f?.type}s/${f?.name}`;
      const name = f?.name?.replace(/_/ig, ' ');
      if(fieldsError.length) setFieldsError([]);
      if(typeInfos?.type === 'media')
        Object.keys(mediaFields).forEach(key => {
          const k = key as keyof typeof mediaFields;
          if(!mediaFields[k]?.current) errors.push(key);
          else datas[key] = mediaFields[k]?.current;
        });
      else Object.keys(bookFields).forEach(key => {
        const k = key as keyof typeof bookFields;
        if(!bookFields[k]?.current) errors.push(key);
        else if(key !== 'cover')
          datas[key] = bookFields[k]?.current;
        datas.coverName = bookFields.cover.current?.name;
      });
      if(errors.length) setFieldsError(errors);
      else {
        const timer = setTimeout(() => {
          refresh({
            data: { userId, where, datas }
          })
          .then(() => {
            closeSnackbar();
            enqueueSnackbar(
              <Typography>
                <Typography
                  title={name}
                  maxWidth={300}
                  fontSize={15}
                  fontWeight="bold"
                  className={textStyle.monoCrop}
                  sx={{ px: 1 }}
                >{name}</Typography>
                Le fichier a été envoyé à la mediathèque avec succès
              </Typography>,
              { variant:'success'}
            );
          }).catch(() => {
            closeSnackbar();
            enqueueSnackbar(
              <Typography>
                <Typography
                  title={name}
                  maxWidth={300}
                  fontSize={15}
                  fontWeight="bold"
                  className={textStyle.monoCrop}
                  sx={{ px: 1 }}
                >{name}</Typography>
                Impossible de soumettre ce fichier à la Médiathèque
              </Typography>,
              { variant: 'error'}
            );
          });
        }, 3000);
        enqueueSnackbar(
          <Typography>
            <Typography
              title={name}
              maxWidth={300}
              fontSize={15}
              fontWeight="bold"
              className={textStyle.monoCrop}
              sx={{ px: 1 }}
            >{name}</Typography>
            L'envoi du fichier à la médiathèque en cours...
          </Typography>,
          {
            action: (id: any) => (
              <Button
                children="Annuler"
                color="inherit"
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
        dispatch(closeMediaLibraryForm());
      }
      bookFields.cover.current = null;
    };

    return (
      <FormContent
        file={file}
        mediaFields={mediaFields}
        findError={findError}
        handleSendFile={handleSendFile}
        typeInfos={typeInfos}
        bookFields={bookFields}
        onClose={(event: React.MouseEvent) => {
          event.preventDefault();
          dispatch(closeMediaLibraryForm());
        }}
      />
    );
}
