import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import useAxios from '@/utils/useAxios';
import { RootState } from '@/types';
import FolderPickerDialog from '@/views/dialogs/FolderPickerDialog';

export default function CopyFileHandler() {
    const { t } = useTranslation();
    const { token } = useSelector((store: RootState) => store.user);
    const { enqueueSnackbar } = useSnackbar();
    const [file, setFile] = useState<any>(null);

    const [, execute] = useAxios(
        {
            method: 'POST',
            url: '/api/stuff/workspace/copy',
            headers: { Authorization: `Bearer ${token}` },
        },
        { manual: true }
    );

    useEffect(() => {
        const root = document.getElementById('root');
        const handler = (event: any) => {
            setFile(event.detail?.file);
        };
        root?.addEventListener('_open_copy_dialog', handler);
        return () => {
            root?.removeEventListener('_open_copy_dialog', handler);
        };
    }, []);

    const handleConfirm = (destinationPath: string) => {
        const fileId = file?._id;
        if (!fileId) return;

        execute({ data: { fileId, destinationPath } })
            .then(() => {
                enqueueSnackbar(t('copyFile.fileCopied'), { variant: 'success' });
                document
                    .getElementById('root')
                    ?.dispatchEvent(new CustomEvent('_reload_current_dir'));
            })
            .catch(() => {
                enqueueSnackbar(t('copyFile.fileCopyError'), {
                    variant: 'error',
                });
            });
        setFile(null);
    };

    return (
        <FolderPickerDialog
            open={!!file}
            onClose={() => setFile(null)}
            onConfirm={handleConfirm}
        />
    );
}
