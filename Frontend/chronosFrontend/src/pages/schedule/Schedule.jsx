import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/base/Card";
import { Button } from "../../components/base/Button";
import { Input } from "../../components/base/Input";
import { Badge } from "../../components/base/Badge";
import api from "../../api";

const Schedule = () => {
  const getTodayIST = () => {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);

    const y = parts.find((p) => p.type === "year").value;
    const m = parts.find((p) => p.type === "month").value;
    const d = parts.find((p) => p.type === "day").value;
    return `${y}-${m}-${d}`;
  };
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getTodayIST());
  const [viewMode, setViewMode] = useState("week");
  const [jobDetails, setJobDetails] = useState([]);

  useEffect(() => {
    setLoading(true);
    const fetchJobDetails = async () => {
      try {
        const response = await api.get(`/jobs/${selectedDate}/details`);
        setJobDetails(response.data.jobs);
      } catch (error) {
        console.error("Error fetching job details:", error);
        setError("Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [selectedDate]);

  const getJobDateField = (job) =>
    job.type === "one-time" ? job.scheduledAt : job.runAt;

  const groupJobsByDate = (jobs) => {
    const map = {};
    for (const job of jobs) {
      const dt = getJobDateField(job);
      if (!dt) continue;

      const key = toDateKeyIST(dt);
      if (!map[key]) map[key] = [];
      map[key].push(job);
    }
    return map;
  };

  const toDateKeyIST = (dateLike) => {
    const d = new Date(dateLike);

    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(d);

    const y = parts.find((p) => p.type === "year").value;
    const m = parts.find((p) => p.type === "month").value;
    const day = parts.find((p) => p.type === "day").value;

    return `${y}-${m}-${day}`; // YYYY-MM-DD
  };

  // Generate calendar data for the selected period
  const getScheduleData = () => {
    const baseDate = new Date(selectedDate);
    baseDate.setHours(0, 0, 0, 0);

    const jobsByDate = groupJobsByDate(jobDetails);

    const scheduleData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);

      const dateKey = toDateKeyIST(date);

      scheduleData.push({
        date: dateKey,
        dayName: new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Kolkata",
          weekday: "short",
        }).format(date),
        dayNumber: Number(
          new Intl.DateTimeFormat("en-US", {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
          }).format(date)
        ),
        jobs: jobsByDate[dateKey] || [],
      });
    }

    return scheduleData;
  };

  const scheduleData = getScheduleData();
  console.log("Schedule Data:", scheduleData);

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      case "scheduled":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadgeColor = (status) => {
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

  // Navigate to previous period
  const handlePrevious = () => {
    const currentDate = new Date(`${selectedDate}T00:00:00`);

    if (viewMode === "day") {
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (viewMode === "week") {
      currentDate.setDate(currentDate.getDate() - 7);
    } else if (viewMode === "month") {
      currentDate.setMonth(currentDate.getMonth() - 1);
    }

    setSelectedDate(toDateKeyIST(currentDate));
  };

  // Navigate to next period
  const handleNext = () => {
    const currentDate = new Date(`${selectedDate}T00:00:00`);
    console.log("Current Date before increment:", currentDate);

    if (viewMode === "day") {
      currentDate.setDate(currentDate.getDate() + 1);
    } else if (viewMode === "week") {
      currentDate.setDate(currentDate.getDate() + 7);
    } else if (viewMode === "month") {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    setSelectedDate(toDateKeyIST(currentDate));
  };

  // Navigate to today
  const handleToday = () => {
    setSelectedDate(getTodayIST());
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
          <p className="text-gray-600">
            Manage and view your cron job schedules
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex rounded-lg bg-gray-100 p-1">
            {["day", "week", "month"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  viewMode === mode
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          <Button
            onClick={() => navigate("/dashboard/jobs")}
            className="whitespace-nowrap"
          >
            <i className="ri-add-line mr-2"></i>
            Schedule Job
          </Button>
        </div>
      </div>

      {/* Calendar Controls */}
      <Card className="p-4 mt-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="whitespace-nowrap"
                onClick={handlePrevious}
              >
                <i className="ri-arrow-left-line"></i>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="whitespace-nowrap"
                onClick={handleToday}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="whitespace-nowrap"
                onClick={handleNext}
              >
                <i className="ri-arrow-right-line"></i>
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Failed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Scheduled</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Schedule Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <i className="ri-loader-4-line animate-spin text-2xl text-gray-400"></i>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-600 text-sm">{error}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
          {scheduleData.map((day, index) => (
            <Card
              key={day.dayNumber}
              className={`p-4 col-span-1 ${index === 6 && "lg:col-span-2"}`}
            >
              <div className="text-center mb-4">
                <div className="text-sm font-medium text-gray-600">
                  {day.dayName}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {day.dayNumber}
                </div>
              </div>

              <div className="space-y-2">
                {day.jobs.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <i className="ri-calendar-line text-2xl mb-2"></i>
                    <p className="text-sm">No jobs scheduled</p>
                  </div>
                ) : (
                  day.jobs.map((job) => (
                    <div
                      key={job.jobId}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`w-2 h-2 rounded-full ${getStatusColor(
                            job.status
                          )}`}
                        ></div>
                        <Badge variant={getStatusBadgeColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                      <div className="text-sm font-medium text-gray-900 truncate mb-1">
                        {job.name} - {job.type}
                      </div>
                      {job.type === "one-time" ? (
                        <div className="text-xs text-gray-600 truncate">
                          {job.scheduledAt
                            ? new Date(job.scheduledAt).toLocaleString()
                            : "Not Scheduled"}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-600 truncate">
                          {job.cronExpr}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        Run At:{" "}
                        {job.runAt
                          ? new Date(job.runAt).toLocaleString()
                          : "N/A"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upcoming Jobs */}
      {/* <Card className="p-6 mt-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Upcoming Jobs (Next 24 Hours)
        </h3>
        <div className="space-y-3">
          {mockCronJobs.slice(0, 5).map((job) => (
            <div
              key={job.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${getStatusColor(
                    job.status
                  )}`}
                ></div>
                <div>
                  <div className="font-medium text-gray-900">{job.name}</div>
                  <div className="text-sm text-gray-600">{job.schedule}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {job.nextRun}
                </div>
                <Badge
                  variant={
                    job.status === "success"
                      ? "success"
                      : job.status === "error"
                      ? "error"
                      : "default"
                  }
                >
                  {job.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card> */}
    </div>
  );
};

export default Schedule;
