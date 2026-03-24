import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Box, LinearProgress, Typography } from '@mui/material';
import useAxios from '@/utils/useAxios';
import normaliseOctetSize from '@/utils/normaliseOctetSize';
import { RootState } from '@/types';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export default function QuotaDisplay() {
    const { token } = useSelector((store: RootState) => store.user);

    const [{ data }, fetchQuota] = useAxios(
        {
            method: 'GET',
            url: '/api/stuff/workspace/quota',
            headers: { Authorization: `Bearer ${token}` },
        },
        { manual: true }
    );

    useEffect(() => {
        if (!token) return;
        fetchQuota();

        const interval = setInterval(() => {
            fetchQuota();
        }, REFRESH_INTERVAL);

        return () => clearInterval(interval);
    }, [token, fetchQuota]);

    const used = data?.used ?? 0;
    const total = data?.total ?? 0;
    const percent = total > 0 ? Math.min((used / total) * 100, 100) : 0;

    const usedLabel = normaliseOctetSize(used);
    const totalLabel = normaliseOctetSize(total);

    return (
        <Box sx={{ px: 2, pb: 2, pt: 1 }}>
            <LinearProgress
                variant="determinate"
                value={percent}
                sx={{ height: 6, borderRadius: 3, mb: 0.5 }}
            />
            <Typography variant="caption" color="text.secondary">
                {usedLabel} utilises sur {totalLabel}
            </Typography>
        </Box>
    );
}
