import React, { useCallback, useEffect, useRef, useState } from "react";
import FormContent from "./FormContent";

export default function FilesForm () {
    const [files, setFiles] = useState(null);
    const [fieldsError, setFieldsError] = useState([]);
    const findError = field => !!~fieldsError?.indexOf(field);
    const designation = useRef();
    const description = useRef();
    const folder = useRef();
    const tags = useRef();

    const getFieldDocs = useCallback(() => ({
      designation,
      description,
      folder,
      tags,
    }), []);

    const handleSendFile = useCallback(file => event => {
      event.preventDefault();
      const errors = [];
      const doc = {};
      const docFields = getFieldDocs();
      docFields.tags.current = docFields.tags.current?.split(/\s/) || [];
      if(fieldsError.length) setFieldsError([]);
      Object.keys(docFields).forEach(key => {
        if(!docFields[key]?.current) errors.push(key);
        else doc[key] = docFields[key]?.current;
      });
      if(errors.length) setFieldsError(errors);
      else {
        const name = '_upload_files';
        if(files) {
            const customEvent = new CustomEvent(name, {
                detail: { files, name, doc }
            });
            document.getElementById('root')
            .dispatchEvent(customEvent);
        }
        setFiles(null);
      }
    }, [fieldsError, files, getFieldDocs]);
    
    useEffect(() => {
      const rootEl = document.getElementById('root');
      const name = '_open_files_form';
      const handleOpenMediaForm = event => setFiles([...event.detail.files]);
      rootEl.addEventListener(name, handleOpenMediaForm);
      return () => {
        rootEl.removeEventListener(name, handleOpenMediaForm);
      }
    }, []);

    return (
      <FormContent
        files={files}
        findError={findError}
        handleSendFile={handleSendFile}
        docFields={getFieldDocs()}
        setFiles={setFiles}
        onClose={event => {
          event.preventDefault();
          setFiles(null);
        }}
      />
    );
}