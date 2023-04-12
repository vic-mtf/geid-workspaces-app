import { createContext, useCallback, useContext, useEffect, useMemo } from "react"
import useAxios from "./useAxios";
import { useDispatch, useSelector } from "react-redux";
import { addData } from "../redux/data";


const Data = createContext(null);
export const useData = () => useContext(Data);

export default function DataProvider ({children}) {
    const token = useSelector(store => store.user.token);
    const userId = useSelector(store => store.user.id);
    const dispatch = useDispatch();
    const axiosParams = useMemo(() => ({
        url:'/api/stuff/workspace/',
        headers: {
            Authorization: `Bearer ${token}`
        }
    }), [token]);
    const [{loading: docLoading}, docRefetch] = useAxios(null, {manual: true});
    const [{loading: photoLoading}, photoRefetch] = useAxios(null, {manual: true});
    const [{loading: videoLoading}, videoRefetch] = useAxios(null, {manual: true});
    const loading = useMemo(() => 
        docLoading || photoLoading || videoLoading, 
        [docLoading, photoLoading, videoLoading]
    );

    const docRefresh = useCallback(() => docRefetch({
        ...axiosParams,
        url: axiosParams.url + 
        JSON.stringify({userId, path: 'documents' }), 
      }).then(({data}) => {
        
        dispatch(addData({
          key: 'documents',
          data
        }));
        
        dispatch(addData({
          key: 'others',
          data: []
        }));
      })
    , [axiosParams, docRefetch, userId, dispatch]);

    const photoRefresh = useCallback(() => photoRefetch({
        ...axiosParams,
        url: axiosParams.url + 
        JSON.stringify({userId, path: 'images' }), 
    }).then(({data}) => {
        dispatch(addData({
          key: 'photos',
          data
        }));
      }), [axiosParams, photoRefetch, userId, dispatch]);

    const videoRefresh = useCallback(() => videoRefetch({
        ...axiosParams,
        url: axiosParams.url + 
        JSON.stringify({userId, path: 'videos' }), 
      }).then(({data}) => {
        dispatch(addData({
          key: 'videos',
          data
        }));
      }), [axiosParams, videoRefetch, userId, dispatch]);

    const setters = useMemo(() => ({
        docRefresh, photoRefresh, videoRefresh
    }), [docRefresh, videoRefresh, photoRefresh]);



    useEffect(() => {
       const name = '_load_all_data';
       const root = document.getElementById('root');
       const onGetAllData = () => {
        docRefresh();
        photoRefresh();
        videoRefresh();
       };
       root.addEventListener(name, onGetAllData);
       return () => {
            root.removeEventListener(name, onGetAllData);
       };
    }, [docRefresh, photoRefresh, videoRefresh]);

    return (
        <Data.Provider value={[{loading}, setters]}>
          {children}
        </Data.Provider>
    )
}