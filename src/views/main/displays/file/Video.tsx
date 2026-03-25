import { Box, Skeleton, Typography } from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/types";

interface VideoProps {
    url?: string;
    name?: string;
    [key: string]: any;
}

function Video(props: VideoProps) {
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
        >
            <Box
                mb={1}
                sx={{
                    boxShadow: loading ? "none" : 5,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                }}
            >
                {blobUrl && (
                    <Box
                        component="video"
                        preload="metadata"
                        onLoadedMetadata={() => setLoading(false)}
                        sx={{
                            width: "100%",
                            border: (theme: any) =>
                                `1px solid ${theme.palette.background.paper}`,
                            ...(loading && {
                                border: "none",
                                background: "transparent",
                            }),
                        }}
                        src={blobUrl}
                    />
                )}
                {loading ? (
                    <Skeleton
                        variant="rectangular"
                        sx={{
                            display: "flex",
                            position: blobUrl ? "absolute" : "relative",
                            width: blobUrl ? "100%" : 150,
                            height: blobUrl ? "100%" : 120,
                        }}
                    />
                ) : (
                    <PlayArrowRoundedIcon
                        sx={{
                            color: "white",
                            position: "absolute",
                            left: "10px",
                            bottom: "10px",
                        }}
                        fontSize="large"
                    />
                )}
            </Box>
            <Typography
                align="center"
                sx={{
                    display: "-webkit-box",
                    width: "100%",
                    maxWidth: 200,
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

export default React.memo(Video);
