import React, { useEffect, useRef, useState } from "react";
import Button from "../../../components/Button";
import Typography from "../../../components/Typography";
import useAxios from "../../../utils/useAxios";
import { useSnackbar } from "notistack";
import { useSelector } from "react-redux";
import textStyle from '../../../styles/text.module.css';
import FormContent from "./FormContent";

export default function ArchivesFrom () {
    const [file, setFile] = useState(null);
    const {id: userId, token} = useSelector(store => store.user);
    const [, refresh, cancel] = useAxios({
      url: 'api/stuff/frozen',
      method: 'post',
      headers: {'Authorization': `Bearer ${token}`}
    }, {manual: true});
    const [fieldsError, setFieldsError] = useState([]);
    const findError = field => !!~fieldsError?.indexOf(field);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const docFields = {
      origin: useRef(),
      type: useRef(),
      activity: useRef(),
      object: useRef(),
      mission: useRef(),
      designation: useRef(),
      emergency: useRef(),
      confidentiality: useRef(),
      destination: useRef(),
      description: useRef(),
      folder: useRef(),
      cover: useRef(),
    };
  
    const handleSendFile = file => event => {
      event.preventDefault();
      const errors = [];
      const datas = { frozenType: 'ressource', };
      const where = `${file?.type}s/${file?.name}`;
      const name = file?.name?.replace(/_/ig, ' ');
      if(fieldsError.length) setFieldsError([]);
      Object.keys(docFields).forEach(key => {
        if(!docFields[key]?.current) errors.push(key);
        else if(key !== 'cover')
          datas[key] = docFields[key]?.current;
        datas.coverName = docFields.cover.current?.name;
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
      docFields.cover.current = null;
    };

    useEffect(() => {
      const rootEl = document.getElementById('root');
      const name = '_open_archives_form';
      const handleOpenMediaForm = event => setFile(event.detail.file);
      rootEl.addEventListener(name, handleOpenMediaForm);
      return () => {
        rootEl.removeEventListener(name, handleOpenMediaForm);
      }
    });

    return (
      <FormContent
        file={file}
        findError={findError}
        handleSendFile={handleSendFile}
        docFields={docFields}
        onClose={event => {
          event.preventDefault();
          setFile(null);
        }}
      />
    );
}