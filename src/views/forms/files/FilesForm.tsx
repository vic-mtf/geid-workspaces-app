import React, { useCallback, useEffect, useRef, useState } from "react";
import FormContent from "@/views/forms/files/FormContent";

export default function FilesForm() {
    const [files, setFiles] = useState<File[] | null>(null);
    const [isFolder, setIsFolder] = useState(false);
    const tags = useRef<string | null>(null);
    const designation = useRef<string | null>(null);
    const description = useRef<string | null>(null);
    const type = useRef<string | null>(null);
    const subType = useRef<string | null>(null);

    const getFieldDocs = useCallback(() => ({
        designation,
        description,
        tags,
        type,
        subType,
    }), []);

    const handleSendFile = useCallback((_file: any) => (event: React.FormEvent) => {
        event.preventDefault();
        if (!files) return;
        const doc: Record<string, any> = {};
        if (tags.current) doc.tags = tags.current;
        if (description.current) doc.description = description.current;
        if (designation.current) doc.designation = designation.current;
        if (type.current) doc.type = type.current;
        if (subType.current) doc.subType = subType.current;

        document.getElementById('root')?.dispatchEvent(
            new CustomEvent('_upload_files', { detail: { files, name: '_upload_files', doc } })
        );
        setFiles(null);
        tags.current = null;
        designation.current = null;
        description.current = null;
    }, [files]);

    useEffect(() => {
        const rootEl = document.getElementById('root');
        const handler = (event: any) => {
            const fileList = [...event.detail.files];
            setFiles(fileList);
            // Detecter si c'est un upload de dossier
            const hasFolder = fileList.some((f: any) => f.webkitRelativePath && f.webkitRelativePath.includes("/"));
            setIsFolder(hasFolder);
        };
        rootEl?.addEventListener('_open_files_form', handler);
        return () => rootEl?.removeEventListener('_open_files_form', handler);
    }, []);

    return (
        <FormContent
            files={files}
            isFolder={isFolder}
            findError={() => false}
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
