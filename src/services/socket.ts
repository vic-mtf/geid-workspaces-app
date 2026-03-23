import { io, Socket } from "socket.io-client";
import store from "@/redux/store";
import { triggerReload } from "@/redux/ui";

let socket: Socket | null = null;

export function connectWorkspaceSocket() {
  const token = store.getState().user.token;
  if (!token || socket?.connected) return;

  socket = io(import.meta.env.VITE_SERVER_BASE_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    if (import.meta.env.VITE_DEBUG === "true") {
      // eslint-disable-next-line no-console
      console.log("[socket] connected");
    }
  });

  // Workspace real-time events — trigger data reload
  const workspaceEvents = [
    "workspace:file-created",
    "workspace:file-deleted",
    "workspace:file-moved",
    "workspace:file-renamed",
    "workspace:folder-created",
    "workspace:folder-deleted",
  ];

  workspaceEvents.forEach((event) => {
    socket!.on(event, () => {
      store.dispatch(triggerReload());
    });
  });

  socket.on("disconnect", () => {
    if (import.meta.env.VITE_DEBUG === "true") {
      // eslint-disable-next-line no-console
      console.log("[socket] disconnected");
    }
  });
}

export function disconnectWorkspaceSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}
