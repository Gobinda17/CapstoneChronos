# Chronos - Job Scheduling & Management System

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Architecture & Design Decisions](#architecture--design-decisions)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Usage Guide](#usage-guide)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Chronos** is a full-stack job scheduling and management system that allows users to create, manage, and monitor scheduled tasks. The system supports both **one-time** and **recurring** jobs with cron expressions, providing real-time notifications through Server-Sent Events (SSE) and comprehensive logging capabilities.

Perfect for automating tasks like:
- Database backups
- Log cleanup operations
- Scheduled email notifications
- HTTP requests
- Data synchronization
- Report generation
- System updates

---

## ✨ Features

### Core Functionality
- **User Authentication**: Secure JWT-based authentication with refresh tokens
- **Job Management**: Create, update, pause/resume, and delete jobs
- **Dual Job Types**:
  - **One-time Jobs**: Execute at a specific datetime
  - **Recurring Jobs**: Execute based on cron expressions
- **Real-time Notifications**: Server-Sent Events (SSE) for live job updates
- **Comprehensive Logging**: Track all job executions with detailed logs
- **Job Queue Management**: BullMQ-powered job processing with Redis
- **Retry Mechanism**: Configurable retry logic with exponential backoff
- **Job Statistics Dashboard**: Monitor active, paused, completed, and failed jobs

### Supported Commands
- `DB_BACKUP` - Database backup operations
- `CLEANUP_LOGS` - Log cleanup tasks
- `SEND_EMAIL` - Email notifications
- `HTTP_REQUEST` - HTTP API calls
- `DATA_SYNC` - Data synchronization
- `SEND_REPORTS` - Report generation
- `SYSTEM_UPDATE` - System update tasks

---

## 🏗️ Architecture & Design Decisions

### System Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │◄───────►│   Backend    │◄───────►│   MongoDB   │
│   (React)   │  HTTP   │   (Express)  │         │  (Database) │
└─────────────┘         └──────┬───────┘         └─────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │    Redis     │
                        │ (Job Queue)  │
                        └──────┬───────┘
                               │
                               ▼
                        ┌──────────────┐
                        │  BullMQ      │
                        │  Worker      │
                        └──────────────┘
```

### Key Design Decisions

#### 1. **BullMQ with Redis for Job Queue**
- **Why**: BullMQ provides robust job queue management with features like:
  - Delayed job execution
  - Retry mechanism with exponential backoff
  - Job priority and rate limiting
  - Built-in job monitoring
- **Alternative Considered**: Node-cron (rejected due to lack of persistence and scalability)

#### 2. **Server-Sent Events (SSE) for Real-time Updates**
- **Why**: Unidirectional communication from server to client is perfect for job status updates
- **Benefits**: 
  - Simpler than WebSockets for one-way communication
  - Automatic reconnection
  - Works over HTTP (no special protocol)
- **Alternative Considered**: WebSockets (overkill for one-way notifications)

#### 3. **JWT Token Authentication**
- **Why**: Stateless authentication for scalability
- **Implementation**: 
  - JWT tokens for user authentication
  - Token-based session management
  - Secure token storage on client side

#### 4. **Separate Job Worker Process**
- **Why**: Isolates job execution from API server
- **Benefits**:
  - API server remains responsive
  - Workers can scale independently
  - Better error isolation

#### 5. **MongoDB for Data Persistence**
- **Why**: Flexible schema for job payloads and configurations
- **Benefits**:
  - Easy to store varying job payloads
  - Good indexing for queries
  - Scalable for large log volumes

#### 6. **React with Context API**
- **Why**: State management without additional dependencies
- **Benefits**:
  - Lightweight authentication state management
  - No need for Redux for this scale
  - Built-in React features

#### 7. **Cron Expression Support**
- **Why**: Industry-standard format for recurring jobs
- **Library**: cron-parser for validation and next execution calculation
- **Benefits**: Familiar to developers, highly flexible

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js v5
- **Database**: MongoDB (Mongoose ODM)
- **Job Queue**: BullMQ
- **Cache/Queue Store**: Redis (ioredis)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **Monitoring**: Bull Board (job queue dashboard)

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: Context API

### DevOps & Tools
- **Development**: Nodemon (backend), Vite (frontend)
- **Environment**: dotenv
- **CORS**: cors middleware
- **Cookie Parsing**: cookie-parser

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.x or higher ([Download](https://nodejs.org/))
- **MongoDB**: v6.x or higher ([Download](https://www.mongodb.com/try/download/community))
- **Redis**: v7.x or higher ([Download](https://redis.io/download))
- **npm**: v9.x or higher (comes with Node.js)

### Verify Installation

```bash
node --version    # Should be v18+
npm --version     # Should be v9+
mongod --version  # Should be v6+
redis-server --version  # Should be v7+
```

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd CapstoneChronos
```

### 2. Backend Setup

```bash
cd Backend/ExpressServer

# Install dependencies
npm install

# The following packages will be installed:
# - express: Web framework
# - mongoose: MongoDB ODM
# - bullmq: Job queue
# - ioredis: Redis client
# - jsonwebtoken: JWT authentication
# - bcrypt: Password hashing
# - express-validator: Input validation
# - cors: CORS middleware
# - dotenv: Environment variables
# - cron-parser: Cron expression parser
# - @bull-board/api & @bull-board/express: Job monitoring UI
```

### 3. Frontend Setup

```bash
cd ../../Frontend/chronosFrontend

# Install dependencies
npm install

# The following packages will be installed:
# - react & react-dom: UI framework
# - react-router-dom: Routing
# - axios: HTTP client
# - tailwindcss: CSS framework
# - vite: Build tool
```

---

## ⚙️ Environment Configuration

### Backend Environment Variables

Create a `.env` file in `Backend/ExpressServer/`:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/chronos

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRATION=1d
BCRYPT_SALT_ROUNDS=10

# CORS Configuration (comma-separated list)
ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend Environment Variables

The frontend currently reads the API root from `API_BASE_URL` inside [Frontend/chronosFrontend/src/api.js](Frontend/chronosFrontend/src/api.js#L1-L12). Update that constant to match your backend (default: `http://localhost:3001/airtribe/capstone/chronos/app/api/v1`).

If you prefer environment-based configuration, add a `.env` file in `Frontend/chronosFrontend/` and wire it in `api.js`:

```env
VITE_API_BASE_URL=http://localhost:3001/airtribe/capstone/chronos/app/api/v1
```

### Security Notes

⚠️ **Important**: 
- Never commit `.env` files to version control
- Use strong, unique secrets in production
- Enable HTTPS in production and set `COOKIE_SECURE=true`
- Change default JWT secrets before deploying

---

## 🏃 Running the Application

### 1. Start MongoDB

```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod
# or
sudo service mongod start
```

### 2. Start Redis

```bash
# Windows (if using Redis on Windows)
redis-server

# Linux/Mac
sudo systemctl start redis
# or
sudo service redis start
```

### 3. Start Backend Server

```bash
cd Backend/ExpressServer

# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The backend will start on `http://localhost:3001`

**Backend Monitoring Dashboard**: Access Bull Board at `http://localhost:3001/admin/queues`

### 4. Start Frontend

```bash
cd Frontend/chronosFrontend

# Development mode
npm run dev
```

The frontend will start on `http://localhost:5173`

### 5. Verify Everything is Running

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:3001](http://localhost:3001)
- Job Queue Dashboard: [http://localhost:3001/admin/queues](http://localhost:3001/admin/queues)

---

## 📚 API Documentation

### Base URL
```
http://localhost:3001/airtribe/capstone/chronos/app/api/v1
```

All examples below use the prefixed API gateway path. The Bull Board UI stays at `http://localhost:3001/admin/queues`.

### Authentication

Authentication is handled via HTTP-only cookies. After login, the JWT token is automatically set as a cookie and sent with all subsequent requests. No need to manually set Authorization headers.

---

### Auth Endpoints

All auth routes are served under the API base path. Responses return `status` + `message`, and the `accessToken` cookie is managed automatically on login/refresh/logout.

#### 1. Register User
```http
POST /airtribe/capstone/chronos/app/api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (201)**: plain text `User registered successfully`.

#### 2. Login
```http
POST /airtribe/capstone/chronos/app/api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200)** (also sets `accessToken` cookie):
```json
{
  "status": "success",
  "message": "Login successful",
  "user": {
    "name": "John Doe",
    "email": "user@example.com"
  }
}
```

#### 3. Refresh Access Token
```http
POST /airtribe/capstone/chronos/app/api/v1/auth/refresh
Cookie: accessToken=<jwt_token>
```

**Response (200)** (issues a new cookie):
```json
{
  "status": "success",
  "message": "Token refreshed successfully",
  "user": {
    "name": "John Doe",
    "email": "user@example.com"
  }
}
```

#### 4. Logout
```http
POST /airtribe/capstone/chronos/app/api/v1/auth/logout
Cookie: accessToken=<jwt_token>
```

**Response (200)**:
```json
{
  "status": "success",
  "message": "Logout successful"
}
```

#### 5. Get Current User
```http
GET /airtribe/capstone/chronos/app/api/v1/auth/me
Cookie: accessToken=<jwt_token>
```

**Response (200)**:
```json
{
  "status": "success",
  "user": {
    "email": "user@example.com"
  }
}
```

#### 6. Update Email
```http
PUT /airtribe/capstone/chronos/app/api/v1/auth/me/email
Cookie: accessToken=<jwt_token>
Content-Type: application/json

{
  "newEmail": "new@example.com"
}
```

**Response (200)** (also refreshes the cookie with the new email):
```json
{
  "status": "success",
  "message": "Email Updated Successful"
}
```

#### 7. Update Password
```http
PUT /airtribe/capstone/chronos/app/api/v1/auth/me/password
Cookie: accessToken=<jwt_token>
Content-Type: application/json

{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

**Response (200)**:
```json
{
  "status": "success",
  "message": "Password updated successfully"
}
```

#### 8. Password Reset (no login required)
```http
POST /airtribe/capstone/chronos/app/api/v1/auth/password-reset
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "NewPass123!"
}
```

**Response (200)**:
```json
{
  "status": "success",
  "message": "Password reset successful"
}
```

---

### Job Endpoints

#### 1. Create Job
```http
POST /jobs
Cookie: accessToken=<jwt_token>
Content-Type: application/json

# One-time Job Example
{
  "name": "Database Backup",
  "type": "one-time",
  "command": "DB_BACKUP",
  "scheduledAt": "2024-12-25T02:00:00Z",
  "payload": {
    "database": "production",
    "destination": "s3://backups/"
  },
  "description": "Daily production DB backup",
  "maxRetries": 3
}

# Recurring Job Example
{
  "name": "Hourly Log Cleanup",
  "type": "recurring",
  "command": "CLEANUP_LOGS",
  "cronExpr": "0 * * * *",
  "payload": {
    "olderThan": "7d",
    "logPath": "/var/logs"
  },
  "description": "Clean up old logs every hour",
  "maxRetries": 2
}
```

**Response (201)**:
```json
{
  "success": true,
  "message": "Job created successfully",
  "data": {
    "jobId": "507f1f77bcf86cd799439012",
    "name": "Database Backup",
    "type": "one-time",
    "status": "scheduled",
    "nextRunAt": "2024-12-25T02:00:00Z"
  }
}
```

#### 2. Get All Jobs
```http
GET /jobs?page=1&limit=10&status=active
Cookie: accessToken=<jwt_token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (active, paused, completed, failed)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Database Backup",
        "type": "one-time",
        "command": "DB_BACKUP",
        "status": "active",
        "scheduledAt": "2024-12-25T02:00:00Z",
        "nextRunAt": "2024-12-25T02:00:00Z",
        "lastRunAt": null,
        "retryCount": 0,
        "maxRetries": 3,
        "createdAt": "2024-12-20T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "pages": 5
    }
  }
}
```

#### 3. Get Job Statistics
```http
GET /jobs/stats
Cookie: accessToken=<jwt_token>
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "total": 50,
    "active": 30,
    "paused": 5,
    "completed": 10,
    "failed": 3,
    "scheduled": 2
  }
}
```

#### 4. Toggle Job Status (Pause/Resume)
```http
PUT /jobs/:id/toggle
Cookie: accessToken=<jwt_token>
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Job paused successfully",
  "data": {
    "jobId": "507f1f77bcf86cd799439012",
    "status": "paused"
  }
}
```

#### 5. Update Job
```http
PUT /jobs/:id/update
Cookie: accessToken=<jwt_token>
Content-Type: application/json

{
  "name": "Updated Job Name",
  "cronExpr": "0 */2 * * *",
  "payload": {
    "updated": "payload"
  }
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Job updated successfully",
  "data": {
    "jobId": "507f1f77bcf86cd799439012",
    "name": "Updated Job Name",
    "nextRunAt": "2024-12-20T12:00:00Z"
  }
}
```

#### 6. Delete Job
```http
DELETE /jobs/:id
Cookie: accessToken=<jwt_token>
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

---

### Log Endpoints

#### 1. Get Recent Logs
```http
GET /logs/recent?limit=20
Cookie: accessToken=<jwt_token>
```

**Query Parameters**:
- `limit` (optional): Number of recent logs (default: 10)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "jobId": "507f1f77bcf86cd799439012",
        "userId": "507f1f77bcf86cd799439011",
        "jobName": "Database Backup",
        "command": "DB_BACKUP",
        "status": "success",
        "startedAt": "2024-12-20T10:00:00Z",
        "completedAt": "2024-12-20T10:05:23Z",
        "duration": 323,
        "output": "Backup completed successfully",
        "error": null
      }
    ]
  }
}
```

#### 2. Get All Logs (Paginated)
```http
GET /logs?page=1&limit=20&status=success&jobId=507f1f77bcf86cd799439012
Cookie: accessToken=<jwt_token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (success, failed, running)
- `jobId` (optional): Filter by job ID

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "logs": [...],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "pages": 8
    }
  }
}
```

---

### SSE (Server-Sent Events) Endpoint

#### Real-time Job Updates
```http
GET /sse/events
Cookie: accessToken=<jwt_token>
```

**Event Stream Format**:
```
event: job-update
data: {"jobId":"507f1f77bcf86cd799439012","status":"running","message":"Job started"}

event: job-complete
data: {"jobId":"507f1f77bcf86cd799439012","status":"completed","duration":323}

event: job-failed
data: {"jobId":"507f1f77bcf86cd799439012","status":"failed","error":"Connection timeout"}
```

**Usage in Frontend**:
```javascript
// Cookies are automatically sent with EventSource requests
const eventSource = new EventSource('http://localhost:3001/sse/events', {
  withCredentials: true
});

eventSource.addEventListener('job-update', (event) => {
  const data = JSON.parse(event.data);
  console.log('Job update:', data);
});
```

---

### Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid cron expression",
    "details": [
      {
        "field": "cronExpr",
        "message": "Must be a valid cron expression"
      }
    ]
  }
}
```

**Common Error Codes**:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

---

## 📖 Usage Guide

### 1. User Registration & Login

1. Navigate to `http://localhost:5173`
2. Click "Register" to create a new account
3. Fill in your email, password, and name
4. After registration, login with your credentials
5. You'll be redirected to the dashboard

### 2. Creating a One-Time Job

1. Go to "Jobs" page from the sidebar
2. Click "Create New Job"
3. Fill in the form:
   - **Name**: "Send Weekly Report"
   - **Type**: One-time
   - **Command**: SEND_EMAIL
   - **Scheduled At**: Select future date/time
   - **Payload**: 
     ```json
     {
       "to": "manager@company.com",
       "subject": "Weekly Report",
       "template": "weekly-report"
     }
     ```
4. Click "Create Job"
5. The job will appear in your jobs list

### 3. Creating a Recurring Job

1. Click "Create New Job"
2. Fill in the form:
   - **Name**: "Database Backup"
   - **Type**: Recurring
   - **Command**: DB_BACKUP
   - **Cron Expression**: `0 2 * * *` (every day at 2 AM)
   - **Payload**:
     ```json
     {
       "database": "production",
       "destination": "s3://backups/"
     }
     ```
3. Click "Create Job"
4. The job will run automatically based on the cron schedule

### 4. Cron Expression Examples

- `*/5 * * * *` - Every 5 minutes
- `0 * * * *` - Every hour
- `0 0 * * *` - Every day at midnight
- `0 9 * * 1-5` - Weekdays at 9 AM
- `0 0 1 * *` - First day of every month
- `0 0 * * 0` - Every Sunday at midnight

Use [crontab.guru](https://crontab.guru/) to help create cron expressions.

### 5. Managing Jobs

#### Pause a Job
1. Find the job in the jobs list
2. Click the "Pause" button
3. The job status will change to "paused"
4. Paused jobs won't execute

#### Resume a Job
1. Find the paused job
2. Click the "Resume" button
3. The job will become active again

#### Update a Job
1. Click "Edit" on the job
2. Modify the fields you want to change
3. Click "Update Job"
4. Note: For recurring jobs, the next run time will be recalculated

#### Delete a Job
1. Click "Delete" on the job
2. Confirm the deletion
3. The job and its associated queue entries will be removed

### 6. Viewing Logs

1. Navigate to "Logs" page
2. View recent job executions
3. Filter by:
   - Status (success, failed, running)
   - Job name
   - Date range
4. Click on a log entry to see detailed output

### 7. Real-time Notifications

- When a job starts, completes, or fails, you'll see a notification
- Notifications appear in the top-right corner
- Click the bell icon to view notification history
- SSE connection status is shown in the header

### 8. Monitoring with Bull Board

1. Navigate to `http://localhost:3001/admin/queues`
2. View:
   - Active jobs in the queue
   - Completed jobs
   - Failed jobs
   - Delayed jobs
3. Manually retry failed jobs
4. Remove jobs from the queue

---

## 📁 Project Structure

```
CapstoneChronos/
│
├── Backend/
│   └── ExpressServer/
│       ├── server.js              # Entry point, MongoDB connection
│       ├── app.js                 # Express app configuration
│       ├── package.json           # Backend dependencies
│       │
│       ├── config/
│       │   └── redis.js           # Redis client configuration
│       │
│       ├── models/
│       │   ├── user.model.js      # User schema
│       │   ├── job.model.js       # Job schema
│       │   └── log.model.js       # Log schema
│       │
│       ├── controllers/
│       │   ├── auth.controller.js # Authentication logic
│       │   ├── job.controller.js  # Job CRUD operations
│       │   ├── log.controller.js  # Log retrieval
│       │   └── sse.controller.js  # SSE event streaming
│       │
│       ├── middlewares/
│       │   ├── auth.middleware.js # JWT validation
│       │   └── job.middleware.js  # Job validation
│       │
│       ├── routes/
│       │   ├── index.js           # Route aggregator
│       │   ├── auth.routes.js     # Auth endpoints
│       │   ├── job.routes.js      # Job endpoints
│       │   ├── log.routes.js      # Log endpoints
│       │   └── sse.routes.js      # SSE endpoint
│       │
│       ├── services/
│       │   └── jobQueue.service.js # BullMQ queue management
│       │
│       ├── workers/
│       │   └── job.worker.js      # Job execution worker
│       │
│       ├── sse/
│       │   └── sseHub.js          # SSE connection manager
│       │
│       ├── validations/
│       │   ├── auth.validation.js # Auth input validation
│       │   └── job.validation.js  # Job input validation
│       │
│       └── scripts/
│           └── clearQueue.js      # Utility to clear job queue
│
├── Frontend/
│   └── chronosFrontend/
│       ├── index.html             # HTML entry point
│       ├── package.json           # Frontend dependencies
│       ├── vite.config.js         # Vite configuration
│       ├── tailwind.config.js     # Tailwind CSS config
│       │
│       └── src/
│           ├── main.jsx           # React entry point
│           ├── App.jsx            # Root component
│           ├── api.js             # Axios API client
│           ├── index.css          # Global styles
│           │
│           ├── components/
│           │   ├── base/          # Reusable UI components
│           │   │   ├── Badge.jsx
│           │   │   ├── Button.jsx
│           │   │   ├── Card.jsx
│           │   │   └── Input.jsx
│           │   │
│           │   └── feature/       # Feature-specific components
│           │       ├── Header.jsx
│           │       └── Sidebar.jsx
│           │
│           ├── context/
│           │   └── AuthContext.jsx # Authentication state
│           │
│           ├── pages/
│           │   ├── auth/
│           │   │   ├── Login.jsx
│           │   │   └── Register.jsx
│           │   │
│           │   ├── dashboard/
│           │   │   └── Dashboard.jsx
│           │   │
│           │   ├── jobs/
│           │   │   └── Job.jsx
│           │   │
│           │   ├── logs/
│           │   │   └── Log.jsx
│           │   │
│           │   ├── notifications/
│           │   │   └── Notification.jsx
│           │   │
│           │   ├── schedule/
│           │   │   └── Schedule.jsx
│           │   │
│           │   └── layout/
│           │       └── DashboardLayout.jsx
│           │
│           └── router/
│               └── config.jsx      # Route configuration
│
├── README.md                       # This file
└── LICENSE                         # License information
```

---

## 🧪 Testing

### Backend Testing

```bash
cd Backend/ExpressServer

# Clear the job queue
npm run clear:queue
```

### Manual Testing Checklist

- [ ] User registration works
- [ ] User login returns valid JWT
- [ ] Protected routes require authentication
- [ ] One-time jobs are created and executed
- [ ] Recurring jobs execute on schedule
- [ ] Jobs can be paused and resumed
- [ ] Jobs can be updated
- [ ] Jobs can be deleted
- [ ] Logs are created for each execution
- [ ] SSE sends real-time notifications
- [ ] Failed jobs retry with exponential backoff

---

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
```
Error: MongooseServerSelectionError: connect ECONNREFUSED
```
**Solution**: Ensure MongoDB is running
```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod
```

#### 2. Redis Connection Failed
```
Error: Redis connection to localhost:6379 failed
```
**Solution**: Ensure Redis is running
```bash
# Windows
redis-server

# Linux/Mac
sudo systemctl start redis
```

#### 3. Jobs Not Executing
- Check if the worker is running (should start automatically with backend)
- Verify Redis is running
- Check Bull Board at `http://localhost:3001/admin/queues`
- Look for errors in backend console

#### 4. SSE Not Working
- Ensure browser supports SSE (all modern browsers do)
- Check if authorization token is valid
- Look for CORS issues in browser console
- Verify SSE endpoint is accessible

#### 5. Invalid Cron Expression
```
Error: Invalid cron expression
```
**Solution**: Validate cron expression at [crontab.guru](https://crontab.guru/)

---

## 🔐 Security Best Practices

### For Production Deployment

1. **Environment Variables**
   - Use strong, unique JWT secrets (at least 32 characters)
   - Never commit `.env` files
   - Use environment variable management (e.g., AWS Secrets Manager)

2. **HTTPS & Cookies**
   - Enable HTTPS for all communications
   - Set `COOKIE_SECURE=true` in production
   - Set `COOKIE_SAMESITE=strict` for enhanced security
   - Use secure headers (helmet.js recommended)

3. **Database**
   - Enable MongoDB authentication
   - Use connection string with credentials
   - Set up IP whitelisting

4. **Redis**
   - Enable Redis authentication
   - Use TLS for Redis connections
   - Bind Redis to localhost or private network

5. **Rate Limiting**
   - Implement rate limiting on auth endpoints
   - Use libraries like `express-rate-limit`

6. **Input Validation**
   - Already implemented with express-validator
   - Review and strengthen validation rules

7. **CORS**
   - Whitelist specific frontend domain
   - Don't use `*` in production

---

## 🚀 Deployment

### Backend Deployment (Example: Heroku)

1. Create `Procfile`:
   ```
   web: node server.js
   ```

2. Set environment variables in Heroku dashboard

3. Deploy:
   ```bash
   git push heroku main
   ```

### Frontend Deployment (Example: Vercel)

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Deploy to Vercel:
   ```bash
   vercel deploy
   ```

3. Update `VITE_API_BASE_URL` to production backend URL

### Database Hosting
- **MongoDB**: MongoDB Atlas (free tier available)
- **Redis**: Redis Cloud, Upstash, or AWS ElastiCache

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Use ESLint for code linting
- Follow existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features

---

## 📄 License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact the development team
- Check existing documentation

---

## 🙏 Acknowledgments

- [BullMQ](https://docs.bullmq.io/) for excellent job queue documentation
- [cron-parser](https://www.npmjs.com/package/cron-parser) for cron expression parsing
- [Express.js](https://expressjs.com/) for the web framework
- [React](https://react.dev/) for the frontend library
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework

---

**Built with ❤️ for AirTribe Capstone Project**

*Last Updated: December 2025*