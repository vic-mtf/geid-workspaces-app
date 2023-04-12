import React, { useEffect, useMemo, useRef, useState } from "react";
import Button from "../../../components/Button";
import Typography from "../../../components/Typography";
import format from "../format";
import useAxios from "../../../utils/useAxios";
import { useSnackbar } from "notistack";
import { useSelector } from "react-redux";
import textStyle from '../../../styles/text.module.css';
import FormContent from "./FormContent";

export default function MediaLibraryForm () {
    const [file, setFile] = useState(null);
    const typeInfos = useMemo(() => format[file?.type], [file?.type]);
    const userId = useSelector(store => store.user.id);
    const token = useSelector(store => store.user.token);
    const [, refresh, cancel] = useAxios({
      url: 'api/stuff/frozen',
      method: 'post',
      headers: {'Authorization': `Bearer ${token}`}
    }, {manual: true});
    const [fieldsError, setFieldsError] = useState([]);
    const findError = field => !!~fieldsError?.indexOf(field);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const bookFields = {
      author: useRef(),
      type: useRef(),
      title: useRef(),
      description: useRef(),
      cover: useRef(),
    };
    const mediaFields = {
      title: useRef(),
      description: useRef(),
    };
    
    const handleSendFile = file => event => {
      event.preventDefault();
      const errors = [];
      const datas = { frozenType: typeInfos?.key, };
      const where = `${file?.type}s/${file?.name}`;
      const name = file?.name?.replace(/_/ig, ' ');
      if(fieldsError.length) setFieldsError([]);
      if(typeInfos?.type === 'media')
        Object.keys(mediaFields).forEach(key => {
          if(!mediaFields[key]?.current) errors.push(key);
          else datas[key] = mediaFields[key]?.current;
        });
      else Object.keys(bookFields).forEach(key => {
        if(!bookFields[key]?.current) errors.push(key);
        else if(key !== 'cover')
          datas[key] = bookFields[key]?.current;
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
                  padding
                >{name}</Typography>
                Le fichier a été envoyé à la mediathèque avec succès
              </Typography>,
              { variant:'success'}
            )
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
                  padding
                >{name}</Typography>
                Impossible de soumettre ce fichier à la Médiathèque
              </Typography>,
              { variant: 'error'}
            )
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
              padding
            >{name}</Typography>
            L'envoi du fichier à la médiathèque en cours...
          </Typography>,
          { 
            action: id => (
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
        setFile(null);
      }
      bookFields.cover.current = null;
    };

    useEffect(() => {
      const rootEl = document.getElementById('root');
      const name = '_open_media_library_form';
      const handleOpenMediaForm = event => setFile(event.detail.file);
      rootEl.addEventListener(name, handleOpenMediaForm);
      return () => {
        rootEl.removeEventListener(name, handleOpenMediaForm);
      }
    });

    return (
      <FormContent
        file={file}
        mediaFields={mediaFields}
        findError={findError}
        handleSendFile={handleSendFile}
        typeInfos={typeInfos}
        bookFields={bookFields}
        onClose={event => {
          event.preventDefault();
          setFile(null);
        }}
      />
    );
}