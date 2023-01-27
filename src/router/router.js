import { createBrowserRouter, Navigate } from "react-router-dom";
import Workspace from "../views/Workspace";
import TestApp from '../test/App.test';

const router = createBrowserRouter([
    {
        element: <TestApp/>,
        path: '/test',
    },
    {
        element: <Workspace/>,
        path: '*'
    },
    {
        element: <Navigate to={process.env.PUBLIC_URL + "/documents"}/>,
        path: process.env.PUBLIC_URL + '/'
    }
]);

export default router;