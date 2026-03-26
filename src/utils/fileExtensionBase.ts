/**
 * fileExtensionBase — Mapping extension → icône SVG + type + docType.
 *
 * Utilise file-icon-vectors (vivid) pour des icônes homogènes.
 * Chaque extension connue a sa propre icône SVG.
 */

import { FileExtensionInfo } from "@/types";

// Helper : importe l'icône vivid pour une extension donnée
function icon(ext: string): string {
  return new URL(`../../node_modules/file-icon-vectors/dist/icons/vivid/${ext}.svg`, import.meta.url).href;
}

// Fallback si l'icône spécifique n'existe pas
const genericIcon = icon("blank");

function iconSafe(ext: string): string {
  try { return icon(ext); } catch { return genericIcon; }
}

const fileExtensionBase: FileExtensionInfo[] = [
  // ── Documents Office ──────────────────────────────
  { exts: ["doc"],  icon: iconSafe("doc"),  type: "document", docType: "word" },
  { exts: ["docx"], icon: iconSafe("docx"), type: "document", docType: "word" },
  { exts: ["ppt"],  icon: iconSafe("ppt"),  type: "document", docType: "powerpoint" },
  { exts: ["pptx"], icon: iconSafe("pptx"), type: "document", docType: "powerpoint" },
  { exts: ["xls"],  icon: iconSafe("xls"),  type: "document", docType: "excel" },
  { exts: ["xlsx"], icon: iconSafe("xlsx"), type: "document", docType: "excel" },
  { exts: ["xml"],  icon: iconSafe("xml"),  type: "document", docType: "xml" },
  { exts: ["pdf"],  icon: iconSafe("pdf"),  type: "document", docType: "pdf" },
  { exts: ["odt"],  icon: iconSafe("odt"),  type: "document", docType: "opendocument" },
  { exts: ["ods"],  icon: iconSafe("ods"),  type: "document", docType: "opendocument" },
  { exts: ["odp"],  icon: iconSafe("odp"),  type: "document", docType: "opendocument" },
  { exts: ["rtf"],  icon: iconSafe("rtf"),  type: "document", docType: "rtf" },

  // ── Texte / Code ──────────────────────────────────
  { exts: ["txt"],  icon: iconSafe("txt"),  type: "document", docType: "text" },
  { exts: ["md"],   icon: iconSafe("md"),   type: "document", docType: "text" },
  { exts: ["csv"],  icon: iconSafe("csv"),  type: "document", docType: "text" },
  { exts: ["log"],  icon: iconSafe("log"),  type: "document", docType: "text" },
  { exts: ["json"], icon: iconSafe("json"), type: "document", docType: "text" },
  { exts: ["html"], icon: iconSafe("html"), type: "document", docType: "text" },
  { exts: ["css"],  icon: iconSafe("css"),  type: "document", docType: "text" },
  { exts: ["js"],   icon: iconSafe("js"),   type: "document", docType: "text" },
  { exts: ["ts"],   icon: iconSafe("ts"),   type: "document", docType: "text" },
  { exts: ["py"],   icon: iconSafe("py"),   type: "document", docType: "text" },
  { exts: ["sh"],   icon: iconSafe("sh"),   type: "document", docType: "text" },
  { exts: ["yml", "yaml"], icon: iconSafe("yml"), type: "document", docType: "text" },
  { exts: ["ini"],  icon: iconSafe("ini"),  type: "document", docType: "text" },
  { exts: ["conf"], icon: iconSafe("conf"), type: "document", docType: "text" },

  // ── Images ────────────────────────────────────────
  { exts: ["jpg", "jpeg", "jfif", "pjpeg", "pjp"], icon: iconSafe("jpg"),  type: "image", docType: "image" },
  { exts: ["png"],  icon: iconSafe("png"),  type: "image", docType: "image" },
  { exts: ["gif"],  icon: iconSafe("gif"),  type: "image", docType: "image" },
  { exts: ["webp"], icon: iconSafe("webp"), type: "image", docType: "image" },
  { exts: ["svg"],  icon: iconSafe("svg"),  type: "image", docType: "image" },
  { exts: ["bmp"],  icon: iconSafe("bmp"),  type: "image", docType: "image" },
  { exts: ["tiff", "tif"], icon: iconSafe("tiff"), type: "image", docType: "image" },
  { exts: ["ico", "cur"],  icon: iconSafe("ico"),  type: "image", docType: "image" },
  { exts: ["avif"],        icon: iconSafe("png"),   type: "image", docType: "image" },

  // ── Vidéo ─────────────────────────────────────────
  { exts: ["mp4"],  icon: iconSafe("mp4"),  type: "video", docType: "video" },
  { exts: ["webm"], icon: iconSafe("webm"), type: "video", docType: "video" },
  { exts: ["mov", "qt"],   icon: iconSafe("mov"), type: "video", docType: "video" },
  { exts: ["avi"],  icon: iconSafe("avi"),  type: "video", docType: "video" },
  { exts: ["mkv", "mka", "mks", "mk3d"], icon: iconSafe("mkv"), type: "video", docType: "video" },
  { exts: ["flv"],  icon: iconSafe("flv"),  type: "video", docType: "video" },
  { exts: ["wmv", "asf"],  icon: iconSafe("wmv"),  type: "video", docType: "video" },
  { exts: ["mpg", "mpeg", "mxf"], icon: iconSafe("mpg"), type: "video", docType: "video" },

  // ── Audio ─────────────────────────────────────────
  { exts: ["mp3"],  icon: iconSafe("mp3"),  type: "audio", docType: "audio" },
  { exts: ["wav"],  icon: iconSafe("wav"),  type: "audio", docType: "audio" },
  { exts: ["ogg"],  icon: iconSafe("ogg"),  type: "audio", docType: "audio" },
  { exts: ["wma"],  icon: iconSafe("wma"),  type: "audio", docType: "audio" },
  { exts: ["mid"],  icon: iconSafe("mid"),  type: "audio", docType: "audio" },

  // ── Archives ──────────────────────────────────────
  { exts: ["zip"],  icon: iconSafe("zip"),  type: "other", docType: "archive" },
  { exts: ["rar"],  icon: iconSafe("rar"),  type: "other", docType: "archive" },
  { exts: ["7z"],   icon: iconSafe("7z"),   type: "other", docType: "archive" },
  { exts: ["tar", "gz", "bz2", "xz"], icon: iconSafe("zip"), type: "other", docType: "archive" },
];

export default fileExtensionBase;
