import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import useAxios from '@/utils/useAxios';
import { RootState } from '@/types';
import FolderPickerDialog from '@/views/dialogs/FolderPickerDialog';

export default function MoveFileHandler() {
    const { t } = useTranslation();
    const { token } = useSelector((store: RootState) => store.user);
    const { enqueueSnackbar } = useSnackbar();
    const [file, setFile] = useState<any>(null);

    const [, execute] = useAxios(
        {
            method: 'POST',
            url: '/api/stuff/workspace/move',
            headers: { Authorization: `Bearer ${token}` },
        },
        { manual: true }
    );

    useEffect(() => {
        const root = document.getElementById('root');
        const handler = (event: any) => {
            setFile(event.detail?.file);
        };
        root?.addEventListener('_open_move_dialog', handler);
        return () => {
            root?.removeEventListener('_open_move_dialog', handler);
        };
    }, []);

    const handleConfirm = (destinationPath: string) => {
        const fileId = file?.doc?._id || file?._id;
        if (!fileId) return;

        execute({ data: { fileId, destinationPath } })
            .then(() => {
                enqueueSnackbar(t('move.fileMoved'), { variant: 'success' });
                document
                    .getElementById('root')
                    ?.dispatchEvent(new CustomEvent('_reload_current_dir'));
            })
            .catch(() => {
                enqueueSnackbar(t('move.fileMoveError'), {
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
