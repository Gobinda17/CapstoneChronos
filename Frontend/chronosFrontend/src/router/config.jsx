import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import { AuthProvider, UseAuth } from "../context/AuthContext.jsx";
import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";
import DashboardLayout from "../pages/layout/DashboardLayout.jsx";
import Dashboard from "../pages/dashboard/Dashboard.jsx";
import Jobs from "../pages/jobs/Job.jsx";
import Schedule from "../pages/schedule/Schedule.jsx";
import Logs from "../pages/log/Log.jsx";
import Notification from "../pages/notifications/Notification.jsx";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = UseAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const routes = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: '/notifications',
    element: <Notification />
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
        element: <Dashboard />,
      },
      {
        path: "jobs",
        element: <Jobs />,
      },
      {
        path: "schedule",
        element: <Schedule />,
      },
      {
        path: "logs",
        element: <Logs />,
      }
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
