import { axiosInstance } from "@/utils/useAxios";

export interface SearchParams {
  q?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  minSize?: string;
  maxSize?: string;
  tags?: string;
}

const workspaceApi = {
  // Files & Folders (existing)
  listFiles: (data: string) =>
    axiosInstance.get(`/api/stuff/workspace/${data}`),

  uploadFile: (formData: FormData) =>
    axiosInstance.post("/api/stuff/workspace", formData),

  renameFile: (data: Record<string, unknown>) =>
    axiosInstance.put("/api/stuff/workspace", data),

  deleteFile: (data: string) =>
    axiosInstance.delete(`/api/stuff/workspace/${data}`),

  createFolder: (data: { path: string; folderName: string }) =>
    axiosInstance.post("/api/stuff/workspace/folder", data),

  renameFolder: (data: { path: string; oldName: string; newName: string }) =>
    axiosInstance.put("/api/stuff/workspace/folder", data),

  deleteFolder: (data: string) =>
    axiosInstance.delete(`/api/stuff/workspace/folder/${data}`),

  // Search
  search: (params: SearchParams) =>
    axiosInstance.get("/api/stuff/workspace/search", { params }),

  // Favorites
  getFavorites: () =>
    axiosInstance.get("/api/stuff/workspace/favorites"),

  toggleFavorite: (id: string) =>
    axiosInstance.patch(`/api/stuff/workspace/favorite/${id}`),

  // Trash
  getTrash: () =>
    axiosInstance.get("/api/stuff/workspace/trash"),

  moveToTrash: (id: string) =>
    axiosInstance.patch(`/api/stuff/workspace/trash/${id}`),

  restoreFromTrash: (id: string) =>
    axiosInstance.patch(`/api/stuff/workspace/restore/${id}`),

  permanentDelete: (id: string) =>
    axiosInstance.delete(`/api/stuff/workspace/trash/${id}`),

  emptyTrash: () =>
    axiosInstance.delete("/api/stuff/workspace/trash/empty"),

  // Tags
  getAllTags: () =>
    axiosInstance.get("/api/stuff/workspace/tags"),

  updateTags: (id: string, tags: string[]) =>
    axiosInstance.patch(`/api/stuff/workspace/tags/${id}`, { tags }),

  // Move / Copy
  moveFile: (fileId: string, destinationPath: string) =>
    axiosInstance.post("/api/stuff/workspace/move", { fileId, destinationPath }),

  copyFile: (fileId: string, destinationPath: string) =>
    axiosInstance.post("/api/stuff/workspace/copy", { fileId, destinationPath }),

  // Recent
  getRecent: (limit = 50) =>
    axiosInstance.get("/api/stuff/workspace/recent", { params: { limit } }),

  // Quota
  getQuota: () =>
    axiosInstance.get("/api/stuff/workspace/quota"),

  // Activity
  getActivity: (limit = 50, before?: string) =>
    axiosInstance.get("/api/stuff/workspace/activity", { params: { limit, before } }),
};

export default workspaceApi;
