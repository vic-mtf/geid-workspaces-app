/**
 * VideoViewer — Lecteur video personnalise avec streaming.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  Box, CircularProgress, IconButton, LinearProgress, Slider, Typography, Tooltip, Menu, MenuItem,
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
  const [buffered, setBuffered] = useState(0);
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
  const onProgress = useCallback(() => {
    if (!videoRef.current || !videoRef.current.buffered.length) return;
    const end = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
    setBuffered(videoRef.current.duration > 0 ? (end / videoRef.current.duration) * 100 : 0);
  }, []);

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
        onProgress={onProgress}
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

      {/* Controls overlay — full width bottom */}
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 10,
          background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
          px: { xs: 1, sm: 2 }, pt: 6, pb: { xs: 1, sm: 1.5 },
          opacity: showControls ? 1 : 0, transition: "opacity 0.3s",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Progress bar — buffer + seek */}
        <Box sx={{ position: "relative", height: 16, display: "flex", alignItems: "center", cursor: "pointer", mb: 0.5 }}>
          {/* Buffer background */}
          <LinearProgress
            variant="determinate"
            value={buffered}
            color="inherit"
            sx={{
              position: "absolute", left: 0, right: 0, height: 3, borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.15)",
              "& .MuiLinearProgress-bar": { bgcolor: "rgba(255,255,255,0.3)", borderRadius: 2 },
            }}
          />
          {/* Seek slider on top */}
          <Slider
            value={currentTime}
            min={0}
            max={duration || 1}
            onChange={seek}
            size="small"
            sx={{
              position: "absolute", left: 0, right: 0, p: 0,
              color: "primary.main", height: 3,
              "& .MuiSlider-rail": { bgcolor: "transparent" },
              "& .MuiSlider-track": { borderRadius: 2 },
              "& .MuiSlider-thumb": {
                width: 14, height: 14, transition: "0.15s",
                boxShadow: "0 0 6px rgba(0,0,0,0.5)",
                "&:hover": { width: 18, height: 18 },
              },
            }}
          />
        </Box>

        {/* Controls row */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.25, sm: 0.5 } }}>
          <IconButton size="small" onClick={togglePlay} sx={{ color: "rgba(255,255,255,0.9)" }}>
            {playing ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
          </IconButton>

          <IconButton size="small" onClick={() => skip(-10)} sx={{ color: "rgba(255,255,255,0.7)" }}>
            <Replay10RoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <IconButton size="small" onClick={() => skip(10)} sx={{ color: "rgba(255,255,255,0.7)" }}>
            <Forward10RoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>

          <Typography sx={{ color: "rgba(255,255,255,0.8)", mx: 1, fontSize: 12, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Typography>

          <Box sx={{ flex: 1 }} />

          {/* Volume */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, "&:hover .volume-slider": { width: 70, opacity: 1 } }}>
            <IconButton size="small" onClick={toggleMute} sx={{ color: "rgba(255,255,255,0.8)" }}>
              {muted || volume === 0 ? <VolumeOffRoundedIcon sx={{ fontSize: 20 }} /> : <VolumeUpRoundedIcon sx={{ fontSize: 20 }} />}
            </IconButton>
            <Slider
              className="volume-slider"
              value={muted ? 0 : volume}
              min={0}
              max={1}
              step={0.05}
              onChange={changeVolume}
              size="small"
              sx={{ width: 0, opacity: 0, transition: "width 0.2s, opacity 0.2s", color: "common.white", "& .MuiSlider-thumb": { width: 10, height: 10 } }}
            />
          </Box>

          {/* Speed */}
          <Tooltip title={`Vitesse ${speed}x`}>
            <IconButton size="small" onClick={(e) => setSpeedAnchor(e.currentTarget)} sx={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 700, minWidth: 0 }}>
              {speed !== 1 ? <Typography sx={{ fontSize: 12, color: "primary.main", fontWeight: 700 }}>{speed}x</Typography> : <SpeedRoundedIcon sx={{ fontSize: 20 }} />}
            </IconButton>
          </Tooltip>
          <Menu
            open={!!speedAnchor}
            anchorEl={speedAnchor}
            onClose={() => setSpeedAnchor(null)}
            MenuListProps={{ dense: true, sx: { px: 0.5 } }}
            slotProps={{ paper: { sx: {
              bgcolor: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)",
              border: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 2,
            } } }}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            transformOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            {SPEEDS.map((s) => (
              <MenuItem key={s} selected={s === speed} onClick={() => changeSpeed(s)}
                sx={{ borderRadius: 1, color: "rgba(255,255,255,0.9)", fontSize: 13, minHeight: 0, py: 0.5,
                  "&.Mui-selected": { bgcolor: "rgba(255,255,255,0.1)" } }}
              >
                {s}x
              </MenuItem>
            ))}
          </Menu>

          {/* Fullscreen */}
          <IconButton size="small" onClick={toggleFullscreen} sx={{ color: "rgba(255,255,255,0.8)" }}>
            {isFullscreen ? <FullscreenExitRoundedIcon sx={{ fontSize: 22 }} /> : <FullscreenRoundedIcon sx={{ fontSize: 22 }} />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
});

export default VideoViewer;
