import { useCallback } from "react";
import useAxios from "@/utils/useAxios";
import { useDispatch, useSelector } from "react-redux";
import { updateData } from "@/redux/data";
import { RootState } from "@/types";

const { stringify } = JSON;

export const useGetUrlData = () => {
  const token = useSelector((store: RootState) => store.user.token);
  const userId = useSelector((store: RootState) => store.user.id);
  const getUrlData = useCallback(
    ({ token: tk, ...data }: any) => ({
      url: `/api/stuff/workspace/${stringify({ userId, ...data })}`,
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
      const fullPath = subFolder ? `${key}/${subFolder}` : key;
      return refetch(getUrlData({ path: fullPath, ...(urlProps || data?.urlProps) })).then(
        ({ data: responseData }: any) => {
          dispatch(
            updateData({
              data: onBefore({ [key]: responseData }),
            })
          );
        }
      );
    },
    [getUrlData, dispatch, refetch, key, onBefore, urlProps]
  );

  return [loading, getData] as const;
};

export default useGetData;
