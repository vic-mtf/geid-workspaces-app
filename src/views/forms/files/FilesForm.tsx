import React, { useCallback, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import FormContent from "@/views/forms/files/FormContent";
import { RootState } from "@/types";
import { closeFilesForm, triggerUploadFiles } from "@/redux/ui";

export default function FilesForm () {
    const dispatch = useDispatch();
    const { open, files } = useSelector((store: RootState) => store.ui.filesForm);
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

    const handleSendFile = useCallback((_file: any) => (event: React.FormEvent) => {
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
        if(files) {
          dispatch(triggerUploadFiles({ files, doc }));
        }
        dispatch(closeFilesForm());
      }
    }, [fieldsError, files, getFieldDocs, dispatch]);

    return (
      <FormContent
        files={files}
        findError={findError}
        handleSendFile={handleSendFile}
        docFields={getFieldDocs()}
        setFiles={(f: File[] | null) => {
          if (f === null) dispatch(closeFilesForm());
        }}
        onClose={(event: React.MouseEvent) => {
          event.preventDefault();
          dispatch(closeFilesForm());
        }}
      />
    );
}
