import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/base/Card";
import { Button } from "../../components/base/Button";
import { Input } from "../../components/base/Input";
import { Badge } from "../../components/base/Badge";
import api from "../../api";

const Schedule = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [viewMode, setViewMode] = useState("week");
  const [ jobDetails, setJobDetails ] = useState([]);


  const mockCronJobs = [
    {
      id: "1",
      name: "Database Backup",
      schedule: "0 2 * * *",
      command: "pg_dump -h localhost -U postgres mydb > backup.sql",
      status: "running",
      lastRun: "2024-01-15T02:00:00Z",
      nextRun: "2024-01-16T02:00:00Z",
      description: "Daily database backup at 2 AM",
      enabled: true,
      successCount: 45,
      errorCount: 2,
      avgDuration: 120000,
    },
    {
      id: "2",
      name: "Email Newsletter",
      schedule: "0 9 * * 1",
      command: "node /app/scripts/send-newsletter.js",
      status: "success",
      lastRun: "2024-01-15T09:00:00Z",
      nextRun: "2024-01-22T09:00:00Z",
      description: "Weekly newsletter sent every Monday at 9 AM",
      enabled: true,
      successCount: 12,
      errorCount: 0,
      avgDuration: 45000,
    },
  ];

  useEffect(() => {
    setLoading(true);
    // console.log("Selected Date:", selectedDate);
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

  // Generate calendar data for the selected period
  const getScheduleData = () => {
    const baseDate = new Date(selectedDate);
    const scheduleData = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);

      const dayJobs = jobDetails.filter((job, index) => {
        // Simulate jobs scheduled for different days
        const jobDay = (index + 1) % 7;
        return jobDay === date.getDay();
      });

      scheduleData.push({
        date: date.toISOString().split("T")[0],
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        dayNumber: date.getDate(),
        jobs: dayJobs,
      });
    }

    return scheduleData;
  };

  const scheduleData = getScheduleData();
  console.log("Schedule Data:", scheduleData);

  const getStatusColor = (status) => {
    switch (status) {
      case "running":
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

  // Navigate to previous period
  const handlePrevious = () => {
    const currentDate = new Date(selectedDate);

    if (viewMode === "day") {
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (viewMode === "week") {
      currentDate.setDate(currentDate.getDate() - 7);
    } else if (viewMode === "month") {
      currentDate.setMonth(currentDate.getMonth() - 1);
    }

    setSelectedDate(currentDate.toISOString().split("T")[0]);
  };

  // Navigate to next period
  const handleNext = () => {
    const currentDate = new Date(selectedDate);
    console.log("Current Date before increment:", currentDate);

    if (viewMode === "day") {
      currentDate.setDate(currentDate.getDate() + 1);
    } else if (viewMode === "week") {
      currentDate.setDate(currentDate.getDate() + 7);
    } else if (viewMode === "month") {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    setSelectedDate(currentDate.toISOString().split("T")[0]);
  };

  // Navigate to today
  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
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
              <span>Success</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Running</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Error</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Scheduled</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 mt-4">
        {scheduleData.map((day) => (
          <Card key={day.date} className="p-4">
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
                    key={job.id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-2 h-2 rounded-full ${getStatusColor(
                          job.status
                        )}`}
                      ></div>
                      <Badge
                        variant={
                          job.status === "completed"
                            ? "success"
                            : job.status === "failed"
                            ? "failed"
                            : "default"
                        }
                      >
                        {job.status}
                      </Badge>
                    </div>
                    <div className="text-sm font-medium text-gray-900 truncate mb-1">
                      {job.name}
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {job.schedule}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Next: {job.nextRun}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Upcoming Jobs */}
      <Card className="p-6 mt-4">
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
      </Card>
    </div>
  );
};

export default Schedule;
