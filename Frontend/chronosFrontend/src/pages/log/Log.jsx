import { useState, useEffect } from "react";
import { Card } from "../../components/base/Card";
import { Button } from "../../components/base/Button";
import { Badge } from "../../components/base/Badge";
import { Input } from "../../components/base/Input";

const Log = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedLog, setExpandedLog] = useState(null);

  useEffect(() => {
    // Generate mock logs
    const mockLogs = Array.from({ length: 50 }, (_, i) => {
      const statuses = ["success", "error", "running"];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const jobNames = [
        "Database Backup",
        "Email Cleanup",
        "Log Rotation",
        "Cache Clear",
        "Report Generation",
      ];

      return {
        id: `log-${i}`,
        jobName: jobNames[Math.floor(Math.random() * jobNames.length)],
        status,
        timestamp: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        duration: Math.floor(Math.random() * 10000) + 100,
        output:
          status === "success"
            ? "Job completed successfully. All tasks executed without errors."
            : status === "error"
            ? "Error: Connection timeout. Failed to connect to database server."
            : "Job is currently running...",
        error:
          status === "error"
            ? "Database connection failed: timeout after 30 seconds"
            : undefined,
      };
    });

    setLogs(
      mockLogs.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    );
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.jobName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.output.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "running":
        return "blue";
      case "success":
        return "green";
      case "error":
        return "red";
      default:
        return "gray";
    }
  };

  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const toggleLogExpansion = (logId) => {
    setExpandedLog(expandedLog === logId ? null : logId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Execution Logs
          </h1>
          <p className="text-gray-600 mt-1">
            View detailed logs of all cron job executions
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="whitespace-nowrap">
            <i className="ri-refresh-line mr-2"></i>
            Refresh
          </Button>
          <Button variant="outline" className="whitespace-nowrap">
            <i className="ri-download-line mr-2"></i>
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
              <option value="running">Running</option>
            </select>
            <Button variant="outline" className="whitespace-nowrap">
              <i className="ri-calendar-line mr-2"></i>
              Date Range
            </Button>
          </div>
        </div>
      </Card>

      {/* Logs List */}
      <Card className="overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <h3 className="text-sm lg:text-base font-medium text-gray-900 truncate">
                      {log.jobName}
                    </h3>
                    <Badge variant={getStatusColor(log.status)} size="sm">
                      {log.status}
                    </Badge>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs lg:text-sm text-gray-500">
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Duration: {formatDuration(log.duration)}</span>
                  </div>

                  {/* Log Output Preview */}
                  <div className="mt-3">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {log.output}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleLogExpansion(log.id)}
                    className="whitespace-nowrap"
                  >
                    <i
                      className={`ri-${
                        expandedLog === log.id ? "arrow-up" : "arrow-down"
                      }-s-line mr-1`}
                    ></i>
                    {expandedLog === log.id ? "Collapse" : "Details"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    <i className="ri-download-line mr-1"></i>
                    Export
                  </Button>
                </div>
              </div>

              {/* Expanded Log Details */}
              {expandedLog === log.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Output
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-3 overflow-x-auto">
                        <pre className="text-xs lg:text-sm text-gray-700 whitespace-pre-wrap break-words">
                          {log.output}
                        </pre>
                      </div>
                    </div>

                    {log.error && (
                      <div>
                        <h4 className="text-sm font-medium text-red-900 mb-2">
                          Error Details
                        </h4>
                        <div className="bg-red-50 rounded-lg p-3 overflow-x-auto">
                          <pre className="text-xs lg:text-sm text-red-700 whitespace-pre-wrap break-words">
                            {log.error}
                          </pre>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">
                          Job ID:
                        </span>
                        <p className="text-gray-600 break-all">{log.id}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">
                          Status:
                        </span>
                        <p className="text-gray-600">{log.status}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">
                          Duration:
                        </span>
                        <p className="text-gray-600">
                          {formatDuration(log.duration)}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">
                          Timestamp:
                        </span>
                        <p className="text-gray-600">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-file-list-line text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No logs found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Logs will appear here once your cron jobs start executing."}
            </p>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {filteredLogs.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to{" "}
            <span className="font-medium">20</span> of{" "}
            <span className="font-medium">{filteredLogs.length}</span> results
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="whitespace-nowrap">
              <i className="ri-arrow-left-line mr-1"></i>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="whitespace-nowrap">
              Next
              <i className="ri-arrow-right-line ml-1"></i>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Log;