import { Grid, Skeleton, Box } from "@mui/material";

interface SkeletonGridProps {
  count?: number;
}

export default function SkeletonGrid({ count = 12 }: SkeletonGridProps) {
  return (
    <Box p={1}>
      <Grid container>
        {Array.from({ length: count }).map((_, i) => (
          <Grid item md={12 / 5} lg={12 / 6} xl={12 / 8} key={i}>
            <Box p={1}>
              <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2, mb: 1 }} />
              <Skeleton variant="text" width="70%" />
              <Skeleton variant="text" width="40%" />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
