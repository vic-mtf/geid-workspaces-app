import { useCallback } from "react"
import useAxios from "./useAxios";
import { useDispatch, useSelector } from "react-redux";
import { updateData } from "../redux/data";

const { stringify } = JSON;

export const useGetUrlData = () => {
    const token = useSelector(store => store.user.token);
    const userId = useSelector(store => store.user.id);
    const getUrlData = useCallback(({token: tk, ...data}) => ({
      url: `/api/stuff/workspace/${ stringify({ userId, ...data }) }`,
      headers: {
        Authorization: `Bearer ${token || tk}`
      }
    }),[token, userId]);
    return getUrlData;
};

const useGetData = ({ key, urlProps, onBeforeUpdate }) => {
  const getUrlData = useGetUrlData();
  const [{ loading }, refetch] = useAxios(null, { manual: true });
  const dispatch = useDispatch();
  const onBefore = useCallback(data => 
      typeof onBeforeUpdate === 'function' ?  onBeforeUpdate(data) : data,
      [onBeforeUpdate]
  );
  const getData = useCallback((data) => 
      refetch(getUrlData({ path: key, ...(urlProps || data?.urlProps) }))
      .then(({ data }) => {
        dispatch(
          updateData({
            data: onBefore({ [key]: data })
          })
        );
      }), 
    [getUrlData, dispatch, refetch, key, onBefore, urlProps]);

  return [loading, getData];
};

export default useGetData;