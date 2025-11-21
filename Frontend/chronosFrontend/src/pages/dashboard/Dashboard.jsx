import { useState, useEffect } from "react";
import { Card } from "../../components/base/Card";
import { Button } from "../../components/base/Button";
import { Badge } from "../../components/base/Badge";

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    running: 0,
    success: 0,
    failed: 0,
  });

  const [recentLogs, setRecentLogs] = useState([]);

  const getStatusColor = (status) => {
    if (!status) return "gray";
    switch (status.toLowerCase()) {
      case "running":
        return "blue";
      case "success":
        return "green";
      case "failed":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <div className="space-y-6">
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
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            <i className="ri-refresh-line mr-2"></i>
            Refresh
          </Button>
          <Button size="sm" className="whitespace-nowrap">
            <i className="ri-add-line mr-2"></i>
            New Job
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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
              <p className="text-sm font-medium text-gray-600">Successful</p>
              <p className="text-2xl lg:text-3xl font-bold text-green-600 mt-1">
                {stats.success}
              </p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="ri-check-circle-line text-green-600 text-lg lg:text-xl"></i>
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Active Jobs */}
        <div className="xl:col-span-2">
          <Card className="p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                Active Jobs
              </h2>
              <Button variant="outline" size="sm" className="whitespace-nowrap">
                View All
              </Button>
            </div>

            <div className="space-y-4">
              {/* {mockCronJobs.slice(0, 4).map((job) => (
                <div
                  key={job.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        {job.name}
                      </h3>
                      <Badge variant={getStatusColor(job.status)} size="sm">
                        {job.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 break-all">
                      {job.command}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Next run: {job.nextRun}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      <i className="ri-play-line mr-1"></i>
                      Run
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      <i className="ri-edit-line mr-1"></i>
                      Edit
                    </Button>
                  </div>
                </div>
              ))} */}
            </div>
          </Card>
        </div>

        {/* Recent Logs */}
        <div>
          <Card className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                Recent Logs
              </h2>
              <Button variant="outline" size="sm" className="whitespace-nowrap">
                View All
              </Button>
            </div>

            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 text-sm truncate flex-1 mr-2">
                      {log.jobName}
                    </span>
                    <Badge variant={getStatusColor(log.status)} size="sm">
                      {log.status}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-gray-600">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Duration: {log.duration}ms
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="p-4 lg:p-6">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="flex flex-col items-center p-4 h-auto"
          >
            <i className="ri-add-circle-line text-2xl mb-2"></i>
            <span className="text-sm">Create Job</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center p-4 h-auto"
          >
            <i className="ri-file-download-line text-2xl mb-2"></i>
            <span className="text-sm">Export Logs</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center p-4 h-auto"
          >
            <i className="ri-settings-3-line text-2xl mb-2"></i>
            <span className="text-sm">Settings</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center p-4 h-auto"
          >
            <i className="ri-bar-chart-line text-2xl mb-2"></i>
            <span className="text-sm">Analytics</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;