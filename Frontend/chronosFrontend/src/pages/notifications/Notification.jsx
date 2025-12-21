import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/base/Card";
import { Badge } from "../../components/base/Badge";
import { Button } from "../../components/base/Button";
import api from "../../api";

const Notification = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
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
          : `${payload.command} is ${status}`;

      const notif = {
        id: payload.jobId,
        type: status,
        title: payload.title,
        message,
        command: payload.command,
        time: new Date().toLocaleString(),
        read: false,
      };

      setNotifications((prev) => [notif, ...prev].slice(0, 50));
    });

    fetchNotifications("all");

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

  useEffect(() => {
    fetchNotifications(filter);
  }, [filter]);

  const fetchNotifications = async (f = filter) => {
    const res = await api.get(`/notifications?filter=${f}&page=1&limit=50`);
    const notificationData = res.data?.data || [];
    const mapped = notificationData.map((n) => ({
      id: n._id,
      type: n.type,
      title: n.title,
      message: n.message,
      command: n.command,
      time: new Date(n.createdAt).toLocaleString(),
      read: n.read,
    }));
    console.log("Fetched notifications:", mapped);
    setNotifications(mapped);
  };

  const getTypeIcon = (type) => {
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

  const getTypeColor = (type) => {
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

  const getTypeBadgeVariant = (type) => {
    switch (type) {
      case "error":
        return "error";
      case "success":
        return "success";
      case "warning":
        return "warning";
      case "info":
        return "info";
      default:
        return "default";
    }
  };

  const handleMarkAsRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllAsRead = async () => {
    await api.patch("/notifications/mark-all-read");
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDeleteNotification = async (id) => {
    await api.delete(`/notifications/${id}`);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all notifications?")) return;
    await api.delete("/notifications");
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notif.read;
    return notif.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors cursor-pointer"
            >
              <i className="ri-arrow-left-line text-xl text-gray-600"></i>
            </button>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <Badge variant="error">{unreadCount} unread</Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 ml-11">
            Stay updated with your cron job activities
          </p>
        </div>

        {/* Actions Bar */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${filter === "unread"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter("error")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${filter === "error"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                Errors
              </button>
              <button
                onClick={() => setFilter("warning")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${filter === "warning"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                Warnings
              </button>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  onClick={handleMarkAllAsRead}
                  className="whitespace-nowrap"
                >
                  <i className="ri-check-double-line mr-2"></i>
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleClearAll}
                  className="whitespace-nowrap text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <i className="ri-delete-bin-line mr-2"></i>
                  Clear all
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-notification-off-line text-3xl text-gray-400"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No notifications
            </h3>
            <p className="text-sm text-gray-600">
              {filter === "unread"
                ? "You're all caught up! No unread notifications."
                : filter === "all"
                  ? "You don't have any notifications yet."
                  : `No ${filter} notifications found.`}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-4 transition-all hover:shadow-md ${!notification.read
                  ? "bg-blue-50/50 border-l-4 border-l-blue-600"
                  : ""
                  }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(
                      notification.type
                    )}`}
                  >
                    <i
                      className={`${getTypeIcon(notification.type)} text-lg`}
                    ></i>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        <Badge variant={getTypeBadgeVariant(notification.type)}>
                          {notification.type}
                        </Badge>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {notification.time}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 mb-2">
                      {notification.message}
                    </p>

                    {notification.jobName && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-gray-500">Job:</span>
                        <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                          {notification.jobName}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer whitespace-nowrap"
                        >
                          Mark as read
                        </button>
                      )}
                      {notification.title && (
                        <button
                          onClick={() => navigate("/dashboard/logs")}
                          className="text-xs text-gray-600 hover:text-gray-700 font-medium cursor-pointer whitespace-nowrap"
                        >
                          View logs
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleDeleteNotification(notification.id)
                        }
                        className="text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer whitespace-nowrap ml-auto"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;
