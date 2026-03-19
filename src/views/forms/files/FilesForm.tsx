import React, { useCallback, useEffect, useRef, useState } from "react";
import FormContent from "./FormContent";

export default function FilesForm () {
    const [files, setFiles] = useState<File[] | null>(null);
    const [fieldsError, setFieldsError] = useState<string[]>([]);
    const findError = (field: string) => !!~fieldsError?.indexOf(field);
    const designation = useRef<string | null>(null);
    const description = useRef<string | null>(null);
    const folder = useRef<string | null>(null);
    const tags = useRef<string | null>(null);

    const getFieldDocs = useCallback(() => ({
      designation,
      description,
      folder,
      tags,
    }), []);

    const handleSendFile = useCallback((file: any) => (event: React.FormEvent) => {
      event.preventDefault();
      const errors: string[] = [];
      const doc: Record<string, any> = {};
      const docFields = getFieldDocs();
      if(docFields.tags.current)
        (docFields.tags as any).current = docFields.tags.current?.split(/\s/) || [];
      if(fieldsError.length) setFieldsError([]);
      Object.keys(docFields).forEach(key => {
        if(!(docFields as any)[key]?.current) errors.push(key);
        else doc[key] = (docFields as any)[key]?.current;
      });
      if(errors.length) setFieldsError(errors);
      else {
        const name = '_upload_files';
        if(files) {
            const customEvent = new CustomEvent(name, {
                detail: { files, name, doc }
            });
            document.getElementById('root')
            ?.dispatchEvent(customEvent);
        }
        setFiles(null);
      }
    }, [fieldsError, files, getFieldDocs]);

    useEffect(() => {
      const rootEl = document.getElementById('root');
      const name = '_open_files_form';
      const handleOpenMediaForm = (event: any) => setFiles([...event.detail.files]);
      rootEl?.addEventListener(name, handleOpenMediaForm);
      return () => {
        rootEl?.removeEventListener(name, handleOpenMediaForm);
      }
    }, []);

    return (
      <FormContent
        files={files}
        findError={findError}
        handleSendFile={handleSendFile}
        docFields={getFieldDocs()}
        setFiles={setFiles}
        onClose={(event: React.MouseEvent) => {
          event.preventDefault();
          setFiles(null);
        }}
      />
    );
}
