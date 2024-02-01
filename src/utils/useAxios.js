import axios from "axios";
import { makeUseAxios } from "axios-hooks";
import axiosConfig from '../configs/axios-config.json';
import store from "../redux/store";

const useAxios = makeUseAxios({
    axios: axios.create({ 
        ...axiosConfig,
         headers: {
            'Authorization': `Bearer ${store.getState().user.token}`,
        }
    })
});

export default useAxios;