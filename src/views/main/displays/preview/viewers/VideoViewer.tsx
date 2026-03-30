/**
 * VideoViewer — Lecteur video personnalise avec streaming.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  Box, CircularProgress, IconButton, Slider, Typography, Tooltip, Menu, MenuItem,
} from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";
import VolumeOffRoundedIcon from "@mui/icons-material/VolumeOffRounded";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import FullscreenExitRoundedIcon from "@mui/icons-material/FullscreenExitRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import Forward10RoundedIcon from "@mui/icons-material/Forward10Rounded";
import Replay10RoundedIcon from "@mui/icons-material/Replay10Rounded";
import { RootState } from "@/types";

interface VideoViewerProps {
  fileUrl: string;
  filename: string;
}

function extractFilePath(fileUrl: string): string {
  const marker = "/api/stuff/workspace/file/";
  const idx = fileUrl.indexOf(marker);
  if (idx >= 0) return decodeURIComponent(fileUrl.substring(idx + marker.length));
  if (fileUrl.startsWith(marker)) return decodeURIComponent(fileUrl.substring(marker.length));
  return decodeURIComponent(fileUrl);
}

function formatTime(s: number): string {
  if (!s || isNaN(s)) return "0:00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const VideoViewer = React.memo(function VideoViewer({ fileUrl, filename }: VideoViewerProps) {
  const { t } = useTranslation();
  const token = useSelector((store: RootState) => store.user.token);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Player state
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [speedAnchor, setSpeedAnchor] = useState<null | HTMLElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get stream token
  useEffect(() => {
    if (!fileUrl || !token) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    setStreamUrl(null);

    const filePath = extractFilePath(fileUrl);
    fetch("/api/stuff/workspace/stream-token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ filePath }),
    })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data) => {
        if (cancelled) return;
        const streamToken = data.token;
        const encodedPath = filePath.split("/").map(encodeURIComponent).join("/");
        setStreamUrl(`/api/stuff/workspace/file/${encodedPath}?token=${streamToken}`);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false); } });
    return () => { cancelled = true; };
  }, [fileUrl, token]);

  // Video events
  const onLoadedMetadata = useCallback(() => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  }, []);
  const onTimeUpdate = useCallback(() => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  }, []);
  const onPlay = useCallback(() => setPlaying(true), []);
  const onPause = useCallback(() => setPlaying(false), []);
  const onEnded = useCallback(() => setPlaying(false), []);

  // Controls
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (playing) videoRef.current.pause();
    else videoRef.current.play().catch(() => {});
  }, [playing]);

  const seek = useCallback((_: any, val: number | number[]) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = val as number;
    setCurrentTime(val as number);
  }, []);

  const skip = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
  }, [duration]);

  const changeVolume = useCallback((_: any, val: number | number[]) => {
    if (!videoRef.current) return;
    const v = val as number;
    videoRef.current.volume = v;
    setVolume(v);
    setMuted(v === 0);
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const newMuted = !muted;
    videoRef.current.muted = newMuted;
    setMuted(newMuted);
  }, [muted]);

  const changeSpeed = useCallback((s: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = s;
    setSpeed(s);
    setSpeedAnchor(null);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) { document.exitFullscreen(); setIsFullscreen(false); }
    else { containerRef.current.requestFullscreen().catch(() => {}); setIsFullscreen(true); }
  }, []);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => { if (playing) setShowControls(false); }, 3000);
  }, [playing]);

  useEffect(() => { resetHideTimer(); }, [playing, resetHideTimer]);

  // Autoplay
  useEffect(() => {
    if (streamUrl && videoRef.current) videoRef.current.play().catch(() => {});
  }, [streamUrl]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " ") { e.preventDefault(); togglePlay(); }
      else if (e.key === "f") toggleFullscreen();
      else if (e.key === "m") toggleMute();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePlay, toggleFullscreen, toggleMute]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
        <CircularProgress sx={{ color: "common.white" }} />
      </Box>
    );
  }

  if (error || !streamUrl) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
        <Typography sx={{ color: "common.white" }}>{t("viewer.noPreview")}</Typography>
      </Box>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Box
      ref={containerRef}
      onMouseMove={resetHideTimer}
      onClick={togglePlay}
      sx={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
    >
      {/* Video element */}
      <Box
        component="video"
        ref={videoRef}
        src={streamUrl}
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
        sx={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 1, outline: "none" }}
      />

      {/* Big play button center */}
      {!playing && (
        <Box sx={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
        }}>
          <Box sx={{
            bgcolor: "rgba(0,0,0,0.5)", borderRadius: "50%", width: 64, height: 64,
            display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)",
          }}>
            <PlayArrowRoundedIcon sx={{ color: "common.white", fontSize: 40 }} />
          </Box>
        </Box>
      )}

      {/* Controls bar bottom */}
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          bgcolor: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
          px: 2, py: 0.5,
          opacity: showControls ? 1 : 0, transition: "opacity 0.3s",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Seek bar */}
        <Slider
          value={currentTime}
          min={0}
          max={duration || 1}
          onChange={seek}
          size="small"
          sx={{
            color: "primary.main", height: 4, py: 0.5,
            "& .MuiSlider-thumb": { width: 12, height: 12 },
          }}
        />

        {/* Controls row */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton size="small" onClick={togglePlay} sx={{ color: "common.white" }}>
            {playing ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
          </IconButton>

          <IconButton size="small" onClick={() => skip(-10)} sx={{ color: "common.white" }}>
            <Replay10RoundedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => skip(10)} sx={{ color: "common.white" }}>
            <Forward10RoundedIcon fontSize="small" />
          </IconButton>

          <Typography variant="caption" sx={{ color: "common.white", mx: 1, fontSize: 12, flexShrink: 0 }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Typography>

          <Box sx={{ flex: 1 }} />

          {/* Volume */}
          <IconButton size="small" onClick={toggleMute} sx={{ color: "common.white" }}>
            {muted || volume === 0 ? <VolumeOffRoundedIcon fontSize="small" /> : <VolumeUpRoundedIcon fontSize="small" />}
          </IconButton>
          <Slider
            value={muted ? 0 : volume}
            min={0}
            max={1}
            step={0.05}
            onChange={changeVolume}
            size="small"
            sx={{ width: 70, color: "common.white", "& .MuiSlider-thumb": { width: 10, height: 10 } }}
          />

          {/* Speed */}
          <Tooltip title={`${speed}x`}>
            <IconButton size="small" onClick={(e) => setSpeedAnchor(e.currentTarget)} sx={{ color: "common.white" }}>
              <SpeedRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Menu
            open={!!speedAnchor}
            anchorEl={speedAnchor}
            onClose={() => setSpeedAnchor(null)}
            MenuListProps={{ dense: true }}
          >
            {SPEEDS.map((s) => (
              <MenuItem key={s} selected={s === speed} onClick={() => changeSpeed(s)}>
                {s}x
              </MenuItem>
            ))}
          </Menu>

          {/* Fullscreen */}
          <IconButton size="small" onClick={toggleFullscreen} sx={{ color: "common.white" }}>
            {isFullscreen ? <FullscreenExitRoundedIcon /> : <FullscreenRoundedIcon />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
});

export default VideoViewer;
