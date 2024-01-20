import { createBrowserRouter, Navigate } from "react-router-dom";
import Workspace from "../views/Workspace";
import TestApp from '../test/App.test';

const router = createBrowserRouter([
    {
        element: <TestApp delay={2}/>,
        path: '/test',
    },
    {
        element: <Navigate to="/documents"/>,
        path:  '/'
    },
    {
        element: <Workspace/>,
        path: '*'
    },
]);

export default router;