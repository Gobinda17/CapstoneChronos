import {
  createBrowserRouter,
  RouterProvider,
  useNavigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "../context/AuthContext.jsx";
import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";
// import HomePage from "../pages/home/HomePage.jsx";
import DashboardLayout from "../pages/layout/DashboardLayout.jsx";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return navigate("/", { replace: true });
  }

  return children;
};

const routes = createBrowserRouter([
  // {
  //   path: "/",
  //   element: <HomePage />,
  // },
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <div>Dashboard Home</div>,
      },
    ],
  },
]);

const AppRoutes = () => {
  return (
    <AuthProvider>
      <RouterProvider router={routes} />
    </AuthProvider>
  );
};

export default AppRoutes;
