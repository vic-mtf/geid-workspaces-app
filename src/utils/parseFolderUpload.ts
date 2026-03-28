import fileExtensionBase from "@/utils/fileExtensionBase";
import getFileExtension from "@/utils/getFileExtension";

const KNOWN_EXTS = new Set(fileExtensionBase.flatMap((e) => e.exts));

export interface FolderUploadResult {
  rootName: string;
  validFiles: { file: File; relativePath: string }[];
  ignoredFiles: { name: string; reason: string }[];
  subFolders: string[];
  totalCount: number;
}

const SYSTEM_FILES = new Set([".DS_Store", "Thumbs.db", "thumbs.db", ".gitkeep", "desktop.ini"]);

export default function parseFolderUpload(files: FileList | File[]): FolderUploadResult {
  const fileArray = Array.from(files);
  const validFiles: FolderUploadResult["validFiles"] = [];
  const ignoredFiles: FolderUploadResult["ignoredFiles"] = [];
  const folderSet = new Set<string>();
  const firstPath = (fileArray[0] as any)?.webkitRelativePath || "";
  const rootName = firstPath.split("/")[0] || "Dossier";

  for (const file of fileArray) {
    const relPath: string = (file as any).webkitRelativePath || file.name;
    const parts = relPath.split("/");
    const withoutRoot = parts.slice(1);
    const fileName = withoutRoot[withoutRoot.length - 1];
    if (!fileName || fileName.startsWith(".") || SYSTEM_FILES.has(fileName)) continue;
    if (withoutRoot.length > 1) {
      for (let i = 1; i < withoutRoot.length; i++) folderSet.add(withoutRoot.slice(0, i).join("/"));
    }
    const ext = getFileExtension(fileName)?.toLowerCase() ?? "";
    if (ext && KNOWN_EXTS.has(ext)) {
      validFiles.push({ file, relativePath: withoutRoot.join("/") });
    } else {
      ignoredFiles.push({ name: fileName, reason: ext ? `Extension .${ext} non reconnue` : "Pas d'extension" });
    }
  }

  return {
    rootName,
    validFiles,
    ignoredFiles,
    subFolders: Array.from(folderSet).sort((a, b) => a.split("/").length - b.split("/").length),
    totalCount: fileArray.length,
  };
}
