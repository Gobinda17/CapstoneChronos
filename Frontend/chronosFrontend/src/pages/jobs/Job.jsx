import { useState, useEffect } from "react";
import { Card } from "../../components/base/Card";
import { Button } from "../../components/base/Button";
import { Badge } from "../../components/base/Badge";
import { Input } from "../../components/base/Input";

const Job = () => {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [newJob, setNewJob] = useState({
    name: "",
    command: "",
    schedule: "",
    description: "",
  });

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.command.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || job.status === filterStatus;
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
      case "scheduled":
        return "yellow";
      default:
        return "gray";
    }
  };

  const toggleJobStatus = (jobId) => {
    setJobs(
      jobs.map((job) =>
        job.id === jobId ? { ...job, enabled: !job.enabled } : job
      )
    );
  };

  const handleNewJobSubmit = (e) => {
    e.preventDefault();
    console.log("New job created:", newJob);
    setShowNewJobModal(false);
    setNewJob({ name: "", command: "", schedule: "", description: "" });
    // In a real app, you would add the new job to the jobs list
  };

  const handleInputChange = (e) => {
    setNewJob({
      ...newJob,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Cron Jobs
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage and monitor all your scheduled tasks
          </p>
        </div>
        <Button
          onClick={() => setShowNewJobModal(true)}
          className="whitespace-nowrap"
        >
          <i className="ri-add-line mr-2"></i>
          Create New Job
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
            >
              <option value="all">All Status</option>
              <option value="running">Running</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
              <option value="scheduled">Scheduled</option>
            </select>
            {/* <Button variant="outline" className="whitespace-nowrap">
              <i className="ri-filter-line mr-2"></i>
              More Filters
            </Button> */}
          </div>
        </div>
      </Card>

      {/* Jobs List */}
      <Card className="overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Run
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            job.enabled ? "bg-green-400" : "bg-gray-300"
                          }`}
                        ></div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {job.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {job.command}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.schedule}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.nextRun}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(
                      (job.successCount / (job.successCount + job.errorCount)) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleJobStatus(job.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          job.enabled ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            job.enabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 whitespace-nowrap"
                      >
                        <i className="ri-delete-bin-line mr-1"></i>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden">
          <div className="divide-y divide-gray-200">
            {filteredJobs.map((job) => (
              <div key={job.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        job.enabled ? "bg-green-400" : "bg-gray-300"
                      }`}
                    ></div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {job.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Schedule: {job.schedule}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(job.status)} size="sm">
                    {job.status}
                  </Badge>
                </div>

                <div className="text-xs text-gray-600 mb-3 break-all">
                  {job.command}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-gray-500">
                    <span>Next: {job.nextRun}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>
                      Success:{" "}
                      {(
                        (job.successCount /
                          (job.successCount + job.errorCount)) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleJobStatus(job.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        job.enabled ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          job.enabled ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      <i className="ri-play-line"></i>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      <i className="ri-edit-line"></i>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 whitespace-nowrap"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-time-line text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No jobs found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Get started by creating your first cron job."}
            </p>
            <Button onClick={() => setShowNewJobModal(true)}>
              <i className="ri-add-line mr-2"></i>
              Create New Job
            </Button>
          </div>
        )}
      </Card>

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
                <input
                  id="command"
                  name="command"
                  type="text"
                  required
                  value={newJob.command}
                  onChange={handleInputChange}
                  placeholder="e.g., /usr/bin/backup.sh"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                />
              </div>

              <div>
                <label
                  htmlFor="schedule"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Cron Schedule <span className="text-red-500">*</span>
                </label>
                <input
                  id="schedule"
                  name="schedule"
                  type="text"
                  required
                  value={newJob.schedule}
                  onChange={handleInputChange}
                  placeholder="e.g., 0 2 * * *"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Format: minute hour day month weekday (e.g., "0 2 * * *" runs
                  daily at 2:00 AM)
                </p>
              </div>

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

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <i className="ri-information-line text-blue-600 text-lg flex-shrink-0 mt-0.5"></i>
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Cron Schedule Examples:</p>
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

export default Job;
