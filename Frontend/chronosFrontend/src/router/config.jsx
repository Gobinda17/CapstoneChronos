import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";
import HomePage from "../pages/home/HomePage.jsx";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);


const AppRoutes = () => {
    return <RouterProvider router={routes} />;
};

export default AppRoutes