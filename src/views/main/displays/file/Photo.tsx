import React, { useEffect, useState } from "react";
import { Box, Skeleton, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/types";

interface PhotoProps {
    url?: string;
    name?: string;
    [key: string]: any;
}

function Photo(props: PhotoProps) {
    const [loading, setLoading] = useState(true);
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const token = useSelector((store: RootState) => store.user.token);

    useEffect(() => {
        if (!props.url) return;
        let revoked = false;
        fetch(props.url, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.blob())
            .then((blob) => {
                if (!revoked) setBlobUrl(URL.createObjectURL(blob));
            })
            .catch(() => {
                if (!revoked) setBlobUrl(null);
            });
        return () => {
            revoked = true;
        };
    }, [props.url, token]);

    useEffect(() => {
        return () => {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, [blobUrl]);

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
            position="relative"
            gap={1}
        >
            {blobUrl && (
                <Box
                    p={0.2}
                    display={loading ? "none" : "flex"}
                    sx={{
                        boxShadow: 5,
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 2,
                        bgcolor: (theme: any) => theme.palette.background.paper,
                    }}
                >
                    <Box
                        component="img"
                        src={blobUrl}
                        onLoad={() => setLoading(false)}
                        sx={{
                            width: "100%",
                            maxHeight: 150,
                            borderRadius: 2,
                            border: (theme: any) =>
                                `2px solid ${theme.palette.divider}`,
                        }}
                    />
                </Box>
            )}
            {loading && (
                <Skeleton
                    variant="rectangular"
                    sx={{ width: "100%", height: 120 }}
                />
            )}
            <Typography
                align="center"
                width={150}
                sx={{
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                }}
            >
                {props.name?.replace(/_/gi, " ")}
            </Typography>
        </Box>
    );
}

export default React.memo(Photo);
