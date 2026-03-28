import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import { RootState } from "@/types";

let globalSocket: Socket | null = null;

export default function useSocket(onEvent?: (event: string, data: any) => void) {
  const token = useSelector((store: RootState) => store.user.token);
  const userId = useSelector((store: RootState) => store.user.id);
  const callbackRef = useRef(onEvent);
  callbackRef.current = onEvent;

  useEffect(() => {
    if (!token || !userId) return;
    if (!globalSocket) {
      const baseUrl = import.meta.env.VITE_SERVER_BASE_URL || "";
      globalSocket = io(baseUrl, {
        query: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 3000,
      });
    }
    const socket = globalSocket;
    const events = [
      "workspace:share-invitation",
      "workspace:share-accepted",
      "workspace:file-moved",
      "workspace:file-renamed",
      "workspace:file-deleted",
      "workspace:folder-created",
      "workspace:folder-deleted",
    ];
    const handler = (eventName: string) => (data: any) => {
      if (data.targetUserId && data.targetUserId !== userId) return;
      callbackRef.current?.(eventName, data);
    };
    const handlers = events.map((ev) => { const h = handler(ev); socket.on(ev, h); return { ev, h }; });
    return () => { handlers.forEach(({ ev, h }) => socket.off(ev, h)); };
  }, [token, userId]);

  return globalSocket;
}
