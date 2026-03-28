import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import useAxios from '@/utils/useAxios';
import { RootState } from '@/types';

export default function FavoriteHandler() {
    const { t } = useTranslation();
    const { token } = useSelector((store: RootState) => store.user);
    const { enqueueSnackbar } = useSnackbar();

    const [, execute] = useAxios(
        {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` },
        },
        { manual: true }
    );

    useEffect(() => {
        const root = document.getElementById('root');

        const handler = (event: any) => {
            const file = event.detail?.file;
            const id = file?._id;
            if (!id) return;

            execute({ url: `/api/stuff/workspace/favorite/${id}` })
                .then(() => {
                    enqueueSnackbar(t('favorites.updated'), { variant: 'success' });
                    root?.dispatchEvent(new CustomEvent('_reload_current_dir'));
                })
                .catch(() => {
                    enqueueSnackbar(t('favorites.updateError'), {
                        variant: 'error',
                    });
                });
        };

        root?.addEventListener('_toggle_favorite', handler);
        return () => {
            root?.removeEventListener('_toggle_favorite', handler);
        };
    }, [execute, enqueueSnackbar]);

    return null;
}
