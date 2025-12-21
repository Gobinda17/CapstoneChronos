import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export const Header = ({ user, onLogout, onMobileMenuToggle }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    const url = "/airtribe/capstone/chronos/app/api/v1/sse/events";
    const eventSource = new EventSource(url);

    eventSource.addEventListener("connected", (e) => {
      console.log("SSE Connected:", e.data);
    });

    eventSource.addEventListener("job_update", (e) => {
      const payload = JSON.parse(e.data);

      const status = payload.type;

      const title =
        status === "failed"
          ? "Job Failed"
          : status === "completed"
          ? "Job Completed"
          : status === "running"
          ? "Job Running"
          : "Job Update";

      const message =
        status === "failed"
          ? `${title} failed: ${payload.error || "Unknown error"}`
          : `${title} is ${status}`;

      const notif = {
        id: crypto.randomUUID?.() || String(Date.now()),
        type: status,
        title : payload.title,
        message,
        time: new Date().toLocaleString(),
        read: false,
      };

      setNotifications((prev) => [notif, ...prev].slice(0, 20));
    });

    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      eventSource.close();
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case "failed":
        return "ri-error-warning-line";
      case "completed":
        return "ri-checkbox-circle-line";
      case "scheduled":
        return "ri-alert-line";
      case "running":
        return "ri-information-line";
      default:
        return "ri-notification-line";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "failed":
        return "text-red-600 bg-red-100";
      case "completed":
        return "text-green-600 bg-green-100";
      case "scheduled":
        return "text-orange-600 bg-orange-100";
      case "running":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })));
  };

  const handleNotificationClick = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleViewAllNotifications = () => {
    setShowNotifications(false);
    navigate("/notifications");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <i className="ri-menu-line text-xl"></i>
          </button>

          <div className="hidden sm:block">
            <h2 className="text-xl lg:text-2xl font-semibold text-gray-800">
              Cron Job Manager
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
              onClick={() => setShowNotifications((s) => !s)}
            >
              <i className="ri-notification-line text-xl"></i>

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer whitespace-nowrap"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>
                <div className="overflow-y-auto flex-1">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-sm text-gray-500 text-center">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id)}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notification.read ? "bg-blue-50/50" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getNotificationColor(
                              notification.type
                            )}`}
                          >
                            <i
                              className={`${getNotificationIcon(
                                notification.type
                              )} text-sm`}
                            ></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mb-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-gray-200">
                  <button
                    onClick={handleViewAllNotifications}
                    className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 lg:space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-full text-white font-semibold">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-700 truncate max-w-32 lg:max-w-none">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-32 lg:max-w-none">
                  {user?.email || "user@example.com"}
                </p>
              </div>
              <i className="ri-arrow-down-s-line text-gray-400"></i>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" onClick={() => {
                    setShowDropdown(false);
                    navigate("/dashboard/profile");
                  }}>
                  <i className="ri-user-line mr-2"></i>
                  Profile
                </button>
                <hr className="my-2" />
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <i className="ri-logout-box-line mr-2"></i>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
