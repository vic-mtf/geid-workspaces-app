import store from "../../redux/store";
import { decrypt } from "../../utils/crypt";
import openNewWindow from "../../utils/openNewWindow";

export default function openSignIn () {
    const localUser = store.getState().app.user;
    const userSave = localUser && decrypt(localUser);
    const win = openNewWindow({
        url: `/account/signin/${userSave ? 'userfound' : 'useremail'}`,
    });
    if(win) win.name = 'signin';
}