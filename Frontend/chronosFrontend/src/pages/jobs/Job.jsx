import { useState, useEffect, use } from "react";
import { Card } from "../../components/base/Card";
import { Button } from "../../components/base/Button";
import { Badge } from "../../components/base/Badge";
import { Input } from "../../components/base/Input";
import api from "../../api";

const Job = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  let [newJob, setNewJob] = useState({
    name: "",
    maxRetries: 0,
    command: "",
    scheduleType: "recurring",
    cronExpr: "",
    runAt: "",
    description: "",
  });
  const [editingJobId, setEditingJobId] = useState(null);

  const toDatetimeLocal = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    const fetchJobsData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get("/jobs");
        console.log("Jobs data fetched:", response.data);

        setJobs(response.data.jobs || []);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobsData();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const name = (job.name || "").toString().toLowerCase();
    const command = (job.command || "").toString().toLowerCase();
    const search = (searchTerm || "").toString().toLowerCase();
    const matchesSearch = name.includes(search) || command.includes(search);
    const matchesStatus = filterStatus === "all" || (job.status || "").toString() === filterStatus;
    return matchesSearch && matchesStatus;
  });

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

  const toggleJobStatus = async (jobId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/jobs/${jobId}/toggle`);
      const updatedJob = response.data.job;
      console.log("Toggled job status:", updatedJob);
      setJobs((prevJobs) =>
        prevJobs.map((job) => (job._id === jobId ? updatedJob : job))
      );
    } catch (err) {
      console.error("Error toggling job status:", err);
      setError(err.response?.data?.message || "Failed to toggle job status");
    } finally {
      setLoading(false);
    }
  };

  const handleNewJobSubmit = async (e) => {
    e.preventDefault();
    let { runAt } = newJob;
    let jobResponse;
    if (runAt !== "") {
      setNewJob({ ...newJob, runAt: new Date(runAt).toISOString() });
    }
    console.log(editingJobId);
    try {
      if (editingJobId) {
        jobResponse = await api.put(`/jobs/${editingJobId}/update`, newJob);
        setJobs((prevJobs) =>
          prevJobs.map((job) =>
            job._id === editingJobId ? jobResponse.data.job : job
          )
        );
      } else {
        jobResponse = await api.post("/jobs", newJob);
        setJobs((prevJobs) => [...prevJobs, jobResponse.data.job]);
      }
      setShowNewJobModal(false);
      reset();
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

  const editJob = (jobId) => {
    const job = filteredJobs.find((j) => j._id === jobId);
    if (!job) return;

    setEditingJobId(jobId);

    setNewJob({
      name: job.name || "",
      maxRetries: job.maxRetries ?? 3,
      command: job.command || "",
      scheduleType: job.type || "recurring", // map type -> scheduleType
      cronExpr: job.type === "recurring" ? job.cronExpr || "" : "",
      runAt: job.type === "one-time" ? toDatetimeLocal(job.scheduledAt) : "",
      description: job.description || "",
    });
  };

  const deleteAjob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(`/jobs/${jobId}`);
      if (response.status === 200) {
        setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
      }
    } catch (err) {
      console.error("Error deleting job:", err);
      alert(err.response?.data?.message || "Failed to delete job");
      setError(err.response?.data?.message || "Failed to delete job");
    } finally {
      setLoading(false);
    }
  };

  const rerunJob = async (jobId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/jobs/${jobId}/rerun`);
      if (response.status === 'success') {
        const updatedJob = await api.get("/jobs");
        setJobs((prevJobs) => [...prevJobs, updatedJob.data.jobs]);
      }
    } catch (err) {
      console.error("Error re-running job:", err);
      setError(err.response?.data?.message || "Failed to re-run job");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setNewJob({
      name: "",
      maxRetries: 0,
      command: "",
      scheduleType: "recurring",
      cronExpr: "",
      runAt: "",
      description: "",
    });
    setEditingJobId(null);
  };

  return (
    <div>
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
      <Card className="p-4 lg:p-6 mt-5">
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
              <option value="completed">Completed</option>
              <option value="active">Active</option>
              <option value="failed">Failed</option>
              {/* <option value="scheduled">Scheduled</option> */}
            </select>
            {/* <Button variant="outline" className="whitespace-nowrap">
              <i className="ri-filter-line mr-2"></i>
              More Filters
            </Button> */}
          </div>
        </div>
      </Card>

      {/* Jobs List */}
      <Card className="overflow-hidden mt-5">
        {/* Desktop Table View */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <i className="ri-loader-4-line animate-spin text-2xl text-gray-400"></i>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600 text-sm">{error}</div>
        ) : filteredJobs.length === 0 ? (
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
        ) : (
          <div>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cron Expression
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Schedule Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Schedule At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Run At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredJobs.map((job) => (
                    <tr key={job._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                job.status === "active"
                                  ? "bg-green-400"
                                  : "bg-gray-300"
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
                        {new Date(job.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {job.type === "recurring"
                          ? job.cronExpr
                          : "Not Applicable"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {job.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {job.scheduledAt ? new Date(job.scheduledAt).toLocaleString() : 'Not Applicable'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {job.lastRunAt ? new Date(job.lastRunAt).toLocaleString() : 'Not Applicable'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {job.type === "one-time" && job.status === "completed" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="whitespace-nowrap w-full"
                              onClick={() => rerunJob(job._id)}
                            >
                              <i className="ri-replay-5-line mr-1"></i>
                              Re-Run
                            </Button>
                          ) : job.type === "recurring" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="whitespace-nowrap w-full"
                              onClick={() => toggleJobStatus(job._id)}
                            >
                              {job.status === "active" ? (
                                <>
                                  <i className="ri-pause-line mr-1"></i>
                                  Pause
                                </>
                              ) : (
                                <>
                                  <i className="ri-play-line mr-1"></i>
                                  Play
                                </>
                              )}
                            </Button>
                          ) : null}
                          <Button
                            variant="outline"
                            size="sm"
                            className="whitespace-nowrap w-full"
                            onClick={() => {
                              setShowNewJobModal(true);
                              editJob(job._id);
                            }}
                          >
                            <i className="ri-edit-line mr-1"></i>
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 whitespace-nowrap w-full"
                            onClick={() => deleteAjob(job._id)}
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

            {/* Mobile List View */}
            <div className="lg:hidden">
              <div className="divide-y divide-gray-200">
                {filteredJobs.map((job) => (
                  <div key={job._id} className="p-4">
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
                            Schedule Type: {job.type}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Created At: {new Date(job.createdAt).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Schedule At: {job.scheduledAt ? new Date(job.scheduledAt).toLocaleString() : 'Not Applicable'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Last Run At: {job.lastRunAt ? new Date(job.lastRunAt).toLocaleString() : 'Not Applicable'}
                          </p>
                        </div>
                      </div>
                      <Badge variant={getStatusColor(job.status)} size="sm">
                        {job.status}
                      </Badge>
                    </div>

                    <div className="text-xs text-gray-600 mb-3 break-all">
                      Command: {job.command}
                    </div>
                    <div className="text-xs text-gray-600 mb-3 break-all">
                      Cron Expression: {job.type === "recurring"
                          ? job.cronExpr
                          : "Not Applicable"}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center space-x-2">
                          {job.type === "one-time" && job.status === "completed" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="whitespace-nowrap w-full"
                              onClick={() => rerunJob(job._id)}
                            >
                              <i className="ri-replay-5-line mr-1"></i>
                              Re-Run
                            </Button>
                          ) : job.type === "recurring" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="whitespace-nowrap w-full"
                              onClick={() => toggleJobStatus(job._id)}
                            >
                              {job.status === "active" ? (
                                <>
                                  <i className="ri-pause-line mr-1"></i>
                                  Pause
                                </>
                              ) : (
                                <>
                                  <i className="ri-play-line mr-1"></i>
                                  Play
                                </>
                              )}
                            </Button>
                          ) : null}
                          <Button
                            variant="outline"
                            size="sm"
                            className="whitespace-nowrap w-full"
                            onClick={() => {
                              setShowNewJobModal(true);
                              editJob(job._id);
                            }}
                          >
                            <i className="ri-edit-line mr-1"></i>
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 whitespace-nowrap w-full"
                            onClick={() => deleteAjob(job._id)}
                          >
                            <i className="ri-delete-bin-line mr-1"></i>
                            Delete
                          </Button>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                  {editingJobId ? "Edit Job" : "Create New Job"}
                </h2>
                <button
                  onClick={() => {
                    setShowNewJobModal(false);
                    reset();
                  }}
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
                  htmlFor="scheduleType"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Schedule Type <span className="text-red-500">*</span>
                </label>
                {editingJobId && newJob.scheduleType === "recurring" ? (
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
                  </div>
                ) : editingJobId && newJob.scheduleType === "one-time" ? (
                  <div className="flex gap-4">
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
                ) : (
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
                )}
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
                  onClick={() => {
                    setShowNewJobModal(false);
                    reset();
                  }}
                  className="flex-1 whitespace-nowrap"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 whitespace-nowrap">
                  <i
                    className={
                      editingJobId ? "ri-save-line mr-2" : "ri-add-line mr-2"
                    }
                  ></i>
                  {editingJobId ? "Update Job" : "Create Job"}
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
