import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouterProvider } from "react-router-dom";
import BoxGradient from "./components/BoxGradient";
import router from "./router/router";
import Cover from "./views/cover/Cover";
import {decrypt} from "./utils/crypt";
import useAxios from "./utils/useAxios";
import { changeValues } from "./redux/user";
import { addData } from "./redux/data";
import { useTimer } from "react-timer-hook";

function App() {
  const [startApp, setStartApp] = useState(false);
  const [{loading: docLoading}, docRerefresh] = useAxios({}, {manual: true});
  const [{loading: photoLoading}, photoRerefresh] = useAxios({}, {manual: true});
  const [{loading: videoLoading}, videoRerefresh] = useAxios({}, {manual: true});
  const connected = useSelector(store => store?.user?.connected);
  const {token, id: userId} = useSelector(store => store?.user);
  const isAllData = useSelector(store => store?.data?.isAllData);
  const userSave = useSelector(store => store?.app?.user && 
    decrypt(store.app?.user)
    );
  const dispatch = useDispatch();
  const loading = useMemo(() => docLoading || photoLoading || videoLoading, 
  [docLoading, photoLoading, videoLoading]);

  const {seconds} = useTimer({
    expiryTimestamp: (() => {
      const time = new Date();
      time.setMilliseconds(4000);
      return time;
    })(),
    onExpire () {
      if(seconds);
      if(!startApp) setStartApp(true);
      if(!connected && !startApp) {
          const btn = document.createElement('button');
          btn.onclick = event => {
            event.preventDefault();
            const width = window.innerWidth * .65;
            const height = window.innerHeight * .85;
            const left = (window.innerWidth - width) / 2;
            const top = (window.innerHeight - height) / 2;
            const sizes = `top=${top}, left=${left}, width=${width}, height=${height}`;
            window.open(
                `https://geidbudget.com/account/signin?usersession=${!userSave}`,
                '_blank',
                sizes
            );
        }
        btn.click();
      }
    }
  });
  
  useEffect(() => {
    let timer;
    let handleAutoConnexion;
    (handleAutoConnexion = () => {
        if (!connected) {
            timer = window.setInterval(() => {
               const data = localStorage.getItem('_auto_connexion_data');
               if(data) {
                   window.clearInterval(timer);
                   localStorage.removeItem('_auto_connexion_data');
                   dispatch(changeValues(decrypt(data)));
               }
            }, 100);
       }
    })();
    document.getElementById('root')
    .addEventListener(
        '_deconnected', 
        handleAutoConnexion
        );
    return () => {
            window.clearInterval(timer);
            document.getElementById('root')
                .removeEventListener(
                    '_deconnected', 
                    handleAutoConnexion
                );
    }
}, [connected, dispatch]);

  useEffect(() => {
    if(startApp && connected && token) {
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      docRerefresh({
        url:'/api/stuff/workspace/' + 
        JSON.stringify({userId, path: 'documents' }), 
        headers,
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
      photoRerefresh({
        url:'/api/stuff/workspace/' + 
        JSON.stringify({userId, path: 'images' }),
        headers
      }).then(({data}) => {
        dispatch(addData({
          key: 'photos',
          data
        }));
      });
      videoRerefresh({
        headers,
        url:'/api/stuff/workspace/' + 
        JSON.stringify({userId, path: 'videos' }),
      }).then(({data}) => {
        dispatch(addData({
          key: 'videos',
          data
        }));
      });
    }
  }, [
      startApp, 
      connected, 
      token,
      dispatch, 
      docRerefresh, 
      photoRerefresh, 
      userId,
      videoRerefresh
    ]);

  return (
    <BoxGradient>
        {(startApp &&  isAllData) ? 
        <RouterProvider 
          router={router}
        /> : <Cover loading={loading}/>}
    </BoxGradient>
  );
}

export default App;
