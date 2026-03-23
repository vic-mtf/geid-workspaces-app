import { Skeleton, Box, Stack } from "@mui/material";

interface SkeletonListProps {
  count?: number;
}

export default function SkeletonList({ count = 10 }: SkeletonListProps) {
  return (
    <Box p={1}>
      {Array.from({ length: count }).map((_, i) => (
        <Stack key={i} direction="row" spacing={2} alignItems="center" py={0.75} px={1}>
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="15%" />
          <Skeleton variant="text" width="10%" />
        </Stack>
      ))}
    </Box>
  );
}
