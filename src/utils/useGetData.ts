import { useCallback } from "react";
import useAxios from "@/utils/useAxios";
import { useDispatch, useSelector } from "react-redux";
import { updateData, dataStore } from "@/redux/data";
import { RootState } from "@/types";

const { stringify } = JSON;

export const useGetUrlData = () => {
  const token = useSelector((store: RootState) => store.user.token);
  const userId = useSelector((store: RootState) => store.user.id);
  const getUrlData = useCallback(
    ({ token: tk, ...data }: any) => ({
      url: `/api/stuff/workspace/${encodeURIComponent(stringify({ userId, ...data }))}`,
      headers: {
        Authorization: `Bearer ${token || tk}`,
      },
    }),
    [token, userId]
  );
  return getUrlData;
};

interface UseGetDataOptions {
  key: string;
  urlProps?: any;
  onBeforeUpdate?: (data: any) => any;
}

const useGetData = ({ key, urlProps, onBeforeUpdate }: UseGetDataOptions) => {
  const getUrlData = useGetUrlData();
  const [{ loading }, refetch] = useAxios(null as any, { manual: true });
  const dispatch = useDispatch();
  const onBefore = useCallback(
    (data: any) =>
      typeof onBeforeUpdate === "function" ? onBeforeUpdate(data) : data,
    [onBeforeUpdate]
  );
  const getData = useCallback(
    (data?: any) => {
      // Support folder navigation: data.folder = sous-dossier courant
      const subFolder: string = data?.folder ?? "";
      // Pour key "files", on envoie directement le folder (ou "" pour la racine)
      const apiPath = key === "files" ? subFolder : (subFolder ? `${key}/${subFolder}` : key);
      const cachePath = subFolder ? `${key}/${subFolder}` : key;
      return refetch(getUrlData({ path: apiPath, ...(urlProps || data?.urlProps) })).then(
        ({ data: responseData }: any) => {
          const processed = onBefore({ [key]: responseData });
          // Write to Redux for reactivity
          dispatch(updateData({ data: processed }));
          // Write to in-memory dataStore for instant access on remount
          dataStore.folderData[cachePath] = { data: processed[key], timestamp: Date.now() };
          if (key === "files") dataStore.files = processed[key];
        }
      );
    },
    [getUrlData, dispatch, refetch, key, onBefore, urlProps]
  );

  return [loading, getData] as const;
};

export default useGetData;
