import React, { useEffect, useRef, useState, useCallback } from "react";
import Button from "../../../components/Button";
import Typography from "../../../components/Typography";
import useAxios from "../../../utils/useAxios";
import { useSnackbar } from "notistack";
import { useSelector } from "react-redux";
import textStyle from '../../../styles/text.module.css';
import FormContent from "./FormContent";

export default function ArchivesFrom () {
    const [file, setFile] = useState(null);
    const token = useSelector(store => store.user.token)
    const [, refresh, cancel] = useAxios({
      url: 'api/stuff/archives/',
      method: 'post',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    }, {manual: true});
    const [fieldsError, setFieldsError] = useState([]);
    const findError = field => !!~fieldsError?.indexOf(field);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const type = useRef();
    const subType = useRef();
    const designation = useRef();
    const description = useRef();
    const folder = useRef();
    const getFieldsRef = useCallback(() => ({
      type,
      subType,
      designation,
      description,
      folder,
    }), [])

    const handleSendFile = file => event => {
      event.preventDefault();
      const errors = [];
      const name = file?.name;
      const data = { doc: file?.doc?._id };
      const docFields = getFieldsRef();
      if(fieldsError.length) setFieldsError([]);
      Object.keys(docFields).forEach(key => {
        if(!docFields[key]?.current) errors.push(key);
        else data[key] = docFields[key]?.current;
      });
      data.type = { 
        type: data.type, 
        subType: data.subType,
      };      
      console.log(data);

      delete data.subType;
      if(errors.length) setFieldsError(errors);
      else {
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
                  fontWeight="bold" 
                  className={textStyle.monoCrop}
                  padding
                >{name}</Typography>
                Le fichier a été envoyé au service d'archivage
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
                Impossible de soumettre ce fichier !
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
            Transfert du fichier au service d'archivage en cours...
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
    };
    
    useEffect(() => {
      const rootEl = document.getElementById('root');
      const name = '_open_archives_form';
      const docFields = getFieldsRef();
      const handleOpenMediaForm = event => setFile(event.detail.file);
      rootEl.addEventListener(name, handleOpenMediaForm);
      if(file === null) 
        Object.keys(docFields).forEach(field => {
          docFields[field].current = undefined;
      });
      return () => {
        rootEl.removeEventListener(name, handleOpenMediaForm);
      }
    }, [file, getFieldsRef]);

    return (
      <FormContent
        file={file}
        key={file}
        findError={findError}
        handleSendFile={handleSendFile}
        docFields={getFieldsRef()}
        onClose={event => {
          event.preventDefault();
          setFile(null);
        }}
      />
    );
}