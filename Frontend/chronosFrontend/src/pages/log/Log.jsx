import { useState, useEffect } from "react";
import { Card } from "../../components/base/Card";
import { Button } from "../../components/base/Button";
import { Badge } from "../../components/base/Badge";
import { Input } from "../../components/base/Input";
import api from "../../api";

const Log = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedLog, setExpandedLog] = useState(null);

  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [appliedDateRange, setAppliedDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const [filteredLogs, setFilteredLogs] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const logsPerPage = 20;

  const fetchLogs = async (page = currentPage) => {
    try {
      const response = await api.get(`/logs?page=${page}&limit=${logsPerPage}`);

      setTotalPages(response.data.logs.totalPages);

      setLogs(response.data.logs.items);
    } catch (error) {
      console.error("Error fetching logs:", error);
      setError(
        error.response?.data?.message ||
          "Failed to fetch logs. Please try again."
      );
    }
  };

  // Fetch logs (backend pagination)
  useEffect(() => {
    setLoading(true);
    fetchLogs(currentPage).finally(() => setLoading(false));
  }, [currentPage]);

  // Apply filters
  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          (log.jobname || "").toLowerCase().includes(q) ||
          (log.command || "").toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((log) => log.status === statusFilter);
    }

    if (appliedDateRange.startDate && appliedDateRange.endDate) {
      const startDate = new Date(appliedDateRange.startDate);
      const endDate = new Date(appliedDateRange.endDate);
      endDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter((log) => {
        const logDate = new Date(log.runAt);
        return logDate >= startDate && logDate <= endDate;
      });
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, statusFilter, appliedDateRange]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, appliedDateRange]);

  const handleDateRangeClear = () => {
    setDateRange({ startDate: "", endDate: "" });
    setAppliedDateRange({ startDate: "", endDate: "" });
    setShowDateRangeModal(false);
  };

  const handleDateRangeApply = () => {
    if (dateRange.startDate && dateRange.endDate) {
      setAppliedDateRange(dateRange);
      setShowDateRangeModal(false);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return "default";
    switch (status.toLowerCase()) {
      case "active":
        return "info";
      case "success":
      case "completed":
        return "success";
      case "failed":
      case "error":
        return "danger";
      case "scheduled":
        return "warning";
      default:
        return "default";
    }
  };

  const formatDuration = (ms = 0) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const toggleLogExpansion = (logId) => {
    setExpandedLog((prev) => (prev === logId ? null : logId));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Since backend paginates, showing range is computed from page + pageSize
  const showingFrom = (currentPage - 1) * logsPerPage + 1;
  const showingTo = (currentPage - 1) * logsPerPage + filteredLogs.length;

  return (
    <div>
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
          <Button
            variant="outline"
            className="whitespace-nowrap"
            onClick={() => fetchLogs(currentPage)}
          >
            <i className="ri-refresh-line mr-2"></i>
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <i className="ri-loader-4-line animate-spin text-2xl text-gray-400"></i>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-600 text-sm">{error}</div>
      ) : (
        <Card className="p-4 lg:p-6 mt-4">
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
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="active">Active</option>
              </select>

              <Button
                variant="outline"
                className="whitespace-nowrap"
                onClick={() => setShowDateRangeModal(true)}
              >
                <i className="ri-calendar-line mr-2"></i>
                Date Range
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Logs List */}
      <Card className="overflow-hidden mt-4">
        <div className="divide-y divide-gray-200">
          {filteredLogs.map((log) => (
            <div key={log._id} className="p-4 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <h3 className="text-sm lg:text-base font-medium text-gray-900 truncate">
                      {log.jobname}
                    </h3>
                    <Badge variant={getStatusColor(log.status)} size="sm">
                      {log.status}
                    </Badge>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs lg:text-sm text-gray-500">
                    <span>{new Date(log.runAt).toLocaleString()}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Duration: {formatDuration(log.durationMs)}</span>
                  </div>

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
                    onClick={() => toggleLogExpansion(log._id)}
                    className="whitespace-nowrap"
                  >
                    <i
                      className={`ri-${
                        expandedLog === log._id ? "arrow-up" : "arrow-down"
                      }-s-line mr-1`}
                    ></i>
                    {expandedLog === log._id ? "Collapse" : "Details"}
                  </Button>
                </div>
              </div>

              {expandedLog === log._id && (
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
                        <p className="text-gray-600 break-all">{log.jobId}</p>
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
                          {formatDuration(log.durationMs)}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">
                          Timestamp:
                        </span>
                        <p className="text-gray-600">
                          {new Date(log.runAt).toLocaleString()}
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{showingFrom}</span> to{" "}
            <span className="font-medium">{showingTo}</span>
          </p>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="whitespace-nowrap"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <i className="ri-arrow-left-line mr-1"></i>
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2)
                  pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="whitespace-nowrap"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
              <i className="ri-arrow-right-line ml-1"></i>
            </Button>
          </div>
        </div>
      )}

      {/* Date Range Modal */}
      {showDateRangeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Select Date Range
                </h2>
                <button
                  onClick={() => setShowDateRangeModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-xl text-gray-500"></i>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange((p) => ({ ...p, startDate: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange((p) => ({ ...p, endDate: e.target.value }))
                  }
                  min={dateRange.startDate}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <Button
                variant="outline"
                onClick={handleDateRangeClear}
                className="flex-1 whitespace-nowrap"
              >
                Clear Filter
              </Button>
              <Button
                onClick={handleDateRangeApply}
                disabled={!dateRange.startDate || !dateRange.endDate}
                className="flex-1 whitespace-nowrap"
              >
                Apply Filter
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Log;
