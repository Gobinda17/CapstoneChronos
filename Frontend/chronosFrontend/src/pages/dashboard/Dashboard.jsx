import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/base/Card";
import { Button } from "../../components/base/Button";
import { Badge } from "../../components/base/Badge";
import api from "../../api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    running: 0,
    completed: 0,
    failed: 0,
  });

  const [recentLogs, setRecentLogs] = useState([]);
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newJob, setNewJob] = useState({
    name: "",
    maxRetries: 0,
    command: "",
    scheduleType: "recurring",
    cronExpr: "",
    runAt: "",
    description: "",
  });

  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch stats
        const statsResponse = await api.get("/jobs/stats");
        setStats({
          total: statsResponse.data.stats.total,
          running: statsResponse.data.stats.running,
          completed: statsResponse.data.stats.completed,
          failed: statsResponse.data.stats.failed,
        });

        // Fetch recent logs
        const logsResponse = await api.get("/logs/recent?limit=5");
        console.log(logsResponse.data.logs);
        // Handle nested logs structure
        const logsData = logsResponse.data.logs || [];
        setRecentLogs(logsData);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err.response?.data?.message || "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status) => {
    if (!status) return "default";
    switch (status.toLowerCase()) {
      case "running":
        return "info";
      case "success":
      case "completed":
        return "success";
      case "failed":
      case "error":
        return "danger";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const handleNewJobSubmit = async (e) => {
    e.preventDefault();
    let { runAt } = newJob;
    if (runAt !== "") {
      newJob = { ...newJob, runAt: new Date(runAt).toISOString() };
    }
    try {
      await api.post("/jobs", newJob);
      setShowNewJobModal(false);
      setNewJob({
        name: "",
        maxRetries: 0,
        command: "",
        scheduleType: "recurring",
        cronExpr: "",
        runAt: "",
        description: "",
      });

      // Refresh dashboard data
      const statsResponse = await api.get("/jobs/stats");
      setStats({
        total: statsResponse.data.stats.total,
        running: statsResponse.data.stats.running,
        completed: statsResponse.data.stats.completed,
        failed: statsResponse.data.stats.failed,
      });
    } catch (err) {
      console.error("Error creating job:", err);
      alert(err.response?.data?.message || "Failed to create job");
    }
  };

  const handleInputChange = (e) => {
    setNewJob({
      ...newJob,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor your cron jobs and system performance
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/schedule")}
            className="whitespace-nowrap"
          >
            <i className="ri-calendar-line mr-2"></i>
            View Schedule
          </Button>
          <Button
            onClick={() => setShowNewJobModal(true)}
            className="whitespace-nowrap"
          >
            <i className="ri-add-line mr-2"></i>
            New Job
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mt-5">
        <Card className="p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                {stats.total}
              </p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="ri-time-line text-blue-600 text-lg lg:text-xl"></i>
            </div>
          </div>
        </Card>

        <Card className="p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Running</p>
              <p className="text-2xl lg:text-3xl font-bold text-blue-600 mt-1">
                {stats.running}
              </p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="ri-play-circle-line text-blue-600 text-lg lg:text-xl"></i>
            </div>
          </div>
        </Card>

        <Card className="p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl lg:text-3xl font-bold text-green-600 mt-1">
                {stats.completed}
              </p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="ri-check-double-line text-green-600 text-lg lg:text-xl"></i>
            </div>
          </div>
        </Card>

        <Card className="p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl lg:text-3xl font-bold text-red-600 mt-1">
                {stats.failed}
              </p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <i className="ri-error-warning-line text-red-600 text-lg lg:text-xl"></i>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-5">
        <Card className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Logs</h2>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard/logs")}
              className="text-sm whitespace-nowrap"
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <i className="ri-loader-4-line animate-spin text-2xl text-gray-400"></i>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600 text-sm">
                {error}
              </div>
            ) : recentLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No recent logs available
              </div>
            ) : (
              recentLogs.map((log) => (
                <div
                  key={log._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        log.status?.toLowerCase() === "success" ||
                        log.status?.toLowerCase() === "completed"
                          ? "bg-green-500"
                          : log.status?.toLowerCase() === "running"
                          ? "bg-blue-500"
                          : log.status?.toLowerCase() === "failed" ||
                            log.status?.toLowerCase() === "error"
                          ? "bg-red-500"
                          : log.status?.toLowerCase() === "pending"
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                      }`}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {log.jobname || log.job} || {log.command}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(log.runAt).toLocaleString()}
                        {log.durationMs && ` • ${log.durationMs} ms`}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(log.status)}>
                    {log.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h2>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => setShowNewJobModal(true)}
              className="w-full flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left cursor-pointer"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-add-line text-xl text-white"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Create New Job
                </p>
                <p className="text-xs text-gray-600">
                  Add a new cron job to your schedule
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate("/dashboard/jobs")}
              className="w-full flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left cursor-pointer"
            >
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-file-list-3-line text-xl text-white"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Manage Jobs</p>
                <p className="text-xs text-gray-600">
                  View and edit existing cron jobs
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate("/dashboard/logs")}
              className="w-full flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left cursor-pointer"
            >
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-file-text-line text-xl text-white"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">View Logs</p>
                <p className="text-xs text-gray-600">
                  Check execution history and errors
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate("/dashboard/settings")}
              className="w-full flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left cursor-pointer"
            >
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-settings-3-line text-xl text-white"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Settings</p>
                <p className="text-xs text-gray-600">
                  Configure system preferences
                </p>
              </div>
            </button>
          </div>
        </Card>
      </div>

      {/* New Job Modal */}
      {showNewJobModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Create New Cron Job
                </h2>
                <button
                  onClick={() => setShowNewJobModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-xl text-gray-500"></i>
                </button>
              </div>
            </div>

            <form onSubmit={handleNewJobSubmit} className="p-6 space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Job Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={newJob.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Database Backup"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="command"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Command <span className="text-red-500">*</span>
                </label>
                <select
                  id="command"
                  name="command"
                  required
                  value={newJob.command}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Select a command...</option>
                  <option value="DB_BACKUP">Database Backup</option>
                  <option value="CLEANUP_LOGS">Cleanup Logs</option>
                  <option value="SEND_REPORTS">Send Reports</option>
                  <option value="SEND_EMAIL">Send Email</option>
                  <option value="SYSTEM_UPDATE">System Update</option>
                  <option value="DATA_SYNC">Data Sync</option>
                  <option value="HTTP_REQUEST">HTTP Request</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Max Retries <span className="text-red-500">*</span>
                </label>
                <input
                  id="maxRetries"
                  name="maxRetries"
                  type="number"
                  required
                  value={newJob.maxRetries}
                  onChange={handleInputChange}
                  placeholder="e.g., 3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="scheduleType"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Schedule Type <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="scheduleType"
                      value="recurring"
                      checked={newJob.scheduleType === "recurring"}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Recurring (Cron)
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="scheduleType"
                      value="one-time"
                      checked={newJob.scheduleType === "one-time"}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      One-time (Run once)
                    </span>
                  </label>
                </div>
              </div>

              {newJob.scheduleType === "recurring" ? (
                <div>
                  <label
                    htmlFor="cronExpr"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Cron Schedule <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="cronExpr"
                    name="cronExpr"
                    type="text"
                    required
                    value={newJob.cronExpr}
                    onChange={handleInputChange}
                    placeholder="e.g., 0 2 * * *"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Format: minute hour day month weekday (e.g., "0 2 * * *"
                    runs daily at 2:00 AM)
                  </p>
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="runAt"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Run At <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="runAt"
                    name="runAt"
                    type="datetime-local"
                    required
                    value={newJob.runAt}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  value={newJob.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of what this job does..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                  maxLength="500"
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">
                  {newJob.description.length}/500 characters
                </p>
              </div>

              {newJob.scheduleType === "recurring" && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <i className="ri-information-line text-blue-600 text-lg flex-shrink-0 mt-0.5"></i>
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">
                        Cron Schedule Examples:
                      </p>
                      <ul className="space-y-1 text-xs">
                        <li>
                          <code className="bg-white px-2 py-0.5 rounded">
                            0 * * * *
                          </code>{" "}
                          - Every hour
                        </li>
                        <li>
                          <code className="bg-white px-2 py-0.5 rounded">
                            */15 * * * *
                          </code>{" "}
                          - Every 15 minutes
                        </li>
                        <li>
                          <code className="bg-white px-2 py-0.5 rounded">
                            0 0 * * *
                          </code>{" "}
                          - Daily at midnight
                        </li>
                        <li>
                          <code className="bg-white px-2 py-0.5 rounded">
                            0 0 * * 0
                          </code>{" "}
                          - Weekly on Sunday
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewJobModal(false)}
                  className="flex-1 whitespace-nowrap"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 whitespace-nowrap">
                  <i className="ri-add-line mr-2"></i>
                  Create Job
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
