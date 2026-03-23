import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FileItem } from "@/types";

interface DialogState {
  open: boolean;
  file: FileItem | null;
}

interface FilesDialogState {
  open: boolean;
  files: File[] | null;
}

export interface UiSliceState {
  renameDialog: DialogState;
  detailDialog: DialogState;
  archivesForm: DialogState;
  mediaLibraryForm: DialogState;
  filesForm: FilesDialogState;
  uploadFiles: { files: File[]; doc: Record<string, unknown> } | null;
  searchQuery: string;
  reloadTrigger: number;
  downloadDrawerOpen: boolean;
}

const initialDialogState: DialogState = { open: false, file: null };

const ui = createSlice({
  name: "ui",
  initialState: {
    renameDialog: initialDialogState,
    detailDialog: initialDialogState,
    archivesForm: initialDialogState,
    mediaLibraryForm: initialDialogState,
    filesForm: { open: false, files: null },
    uploadFiles: null,
    searchQuery: "",
    reloadTrigger: 0,
    downloadDrawerOpen: false,
  } as UiSliceState,
  reducers: {
    openRenameDialog(state, action: PayloadAction<FileItem>) {
      state.renameDialog = { open: true, file: action.payload };
    },
    closeRenameDialog(state) {
      state.renameDialog = initialDialogState;
    },
    openDetailDialog(state, action: PayloadAction<FileItem>) {
      state.detailDialog = { open: true, file: action.payload };
    },
    closeDetailDialog(state) {
      state.detailDialog = initialDialogState;
    },
    openArchivesForm(state, action: PayloadAction<FileItem>) {
      state.archivesForm = { open: true, file: action.payload };
    },
    closeArchivesForm(state) {
      state.archivesForm = initialDialogState;
    },
    openMediaLibraryForm(state, action: PayloadAction<FileItem>) {
      state.mediaLibraryForm = { open: true, file: action.payload };
    },
    closeMediaLibraryForm(state) {
      state.mediaLibraryForm = initialDialogState;
    },
    openFilesForm(state, action: PayloadAction<File[]>) {
      state.filesForm = { open: true, files: action.payload };
    },
    closeFilesForm(state) {
      state.filesForm = { open: false, files: null };
    },
    triggerUploadFiles(state, action: PayloadAction<{ files: File[]; doc: Record<string, unknown> }>) {
      state.uploadFiles = action.payload;
    },
    clearUploadFiles(state) {
      state.uploadFiles = null;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    triggerReload(state) {
      state.reloadTrigger += 1;
    },
    toggleDownloadDrawer(state) {
      state.downloadDrawerOpen = !state.downloadDrawerOpen;
    },
  },
});

export const {
  openRenameDialog,
  closeRenameDialog,
  openDetailDialog,
  closeDetailDialog,
  openArchivesForm,
  closeArchivesForm,
  openMediaLibraryForm,
  closeMediaLibraryForm,
  openFilesForm,
  closeFilesForm,
  triggerUploadFiles,
  clearUploadFiles,
  setSearchQuery,
  triggerReload,
  toggleDownloadDrawer,
} = ui.actions;

export default ui.reducer;
