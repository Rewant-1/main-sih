# API Integration Guide

This guide provides instructions for frontend developers on how to integrate with the backend API.

## Base URL

The base URL for all API endpoints is: `http://localhost:5001/api/v1`

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Some internal endpoints require the `x-internal-api-key` header.

## Response Format

All responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Available API Endpoints

### Auth (`/auth`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/auth/register/alumni` | No | Register a new alumni |
| POST | `/auth/login` | No | Login user |
| POST | `/auth/verify/:alumniId` | Internal API Key | Verify an alumni |
| GET | `/auth/test` | No | Test auth routes |

#### Register Alumni
```bash
curl -X POST http://localhost:5001/api/v1/auth/register/alumni \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "yoursecurepassword",
    "graduationYear": 2020,
    "degreeUrl": "http://example.com/degree.pdf"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john.doe@example.com", "password": "yoursecurepassword"}'
```

#### Verify Alumni (Internal)
```bash
curl -X POST http://localhost:5001/api/v1/auth/verify/:alumniId \
  -H "x-internal-api-key: YOUR_INTERNAL_API_KEY"
```

---

### Alumni (`/alumni`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/alumni` | No | Get all alumni |
| GET | `/alumni/:id` | No | Get alumni by ID |
| PUT | `/alumni/:id` | Yes | Update alumni |

---

### Students (`/students`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/students` | No | Get all students |
| GET | `/students/:id` | No | Get student by ID |
| PUT | `/students/:id` | Yes | Update student |
| POST | `/students/bulk-create` | No | Bulk create students |

---

### Users (`/users`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/users` | Yes | Get all users |
| GET | `/users/:id` | Yes | Get user by ID |
| PUT | `/users/:id` | Yes | Update user |
| DELETE | `/users/:id` | Yes (Admin) | Delete user |

---

### Jobs (`/jobs`)

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/jobs` | No | - | Get all jobs |
| GET | `/jobs/:id` | No | - | Get job by ID |
| POST | `/jobs` | Yes | Alumni | Create a job |
| PUT | `/jobs/:id` | Yes | - | Update job |
| DELETE | `/jobs/:id` | Yes | - | Delete job |
| POST | `/jobs/:id/apply` | Yes | Student | Apply to job |
| PATCH | `/jobs/:id/application-status` | Yes | - | Update application status |
| GET | `/jobs/my/posted` | Yes | Alumni | Get my posted jobs |

---

### Events (`/events`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/events` | No | Get all events |
| GET | `/events/:id` | No | Get event by ID |
| POST | `/events` | Yes | Create event |
| PUT | `/events/:id` | Yes | Update event |
| DELETE | `/events/:id` | Yes | Delete event |
| POST | `/events/:id/register` | Yes | Register for event |

---

### Posts (`/posts`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/posts` | No | Get all posts |
| GET | `/posts/:id` | No | Get post by ID |
| POST | `/posts` | Yes | Create post |
| PUT | `/posts/:id` | Yes | Update post |
| DELETE | `/posts/:id` | Yes | Delete post |
| POST | `/posts/:id/like` | Yes | Like/unlike post |
| POST | `/posts/:id/comment` | Yes | Comment on post |

---

### Connections (`/connections`)

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/connections` | Yes | - | Get all connections |
| POST | `/connections/send-request` | Yes | Student | Send connection request |
| POST | `/connections/accept-request` | Yes | Alumni | Accept request |
| POST | `/connections/reject-request` | Yes | Alumni | Reject request |

---

### Chats (`/chats`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/chats` | Yes | Get all chats |
| GET | `/chats/:id` | Yes | Get chat by ID |
| POST | `/chats` | Yes | Create chat |
| PUT | `/chats/:id` | Yes | Update chat |
| DELETE | `/chats/:id` | Yes | Delete chat |

---

### Messages (`/messages`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/messages` | Yes | Get messages (by chatId query) |
| GET | `/messages/:id` | Yes | Get message by ID |
| POST | `/messages` | Yes | Create message |
| PUT | `/messages/:id` | Yes | Update message |
| DELETE | `/messages/:id` | Yes | Delete message |

---

### Campaigns (`/campaigns`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/campaigns` | No | Get all campaigns |
| GET | `/campaigns/analytics` | No | Get campaign analytics |
| GET | `/campaigns/:id` | No | Get campaign by ID |
| POST | `/campaigns` | Yes | Create campaign |
| PUT | `/campaigns/:id` | Yes | Update campaign |
| DELETE | `/campaigns/:id` | Yes | Delete campaign |
| POST | `/campaigns/:id/donate` | Yes | Donate to campaign |
| POST | `/campaigns/:id/verify` | Yes | Verify campaign |

---

### Surveys (`/surveys`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/surveys` | No | Get all surveys |
| GET | `/surveys/analytics` | No | Get overall analytics |
| GET | `/surveys/:id` | No | Get survey by ID |
| GET | `/surveys/:id/analytics` | No | Get survey analytics |
| POST | `/surveys` | Yes | Create survey |
| PUT | `/surveys/:id` | Yes | Update survey |
| DELETE | `/surveys/:id` | Yes | Delete survey |
| POST | `/surveys/:id/respond` | No | Submit survey response |

---

### Success Stories (`/success-stories`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/success-stories` | No | Get all stories |
| GET | `/success-stories/categories` | No | Get category stats |
| GET | `/success-stories/:id` | No | Get story by ID |
| POST | `/success-stories` | Yes | Create story |
| PUT | `/success-stories/:id` | Yes | Update story |
| DELETE | `/success-stories/:id` | Yes | Delete story |
| POST | `/success-stories/:id/like` | Yes | Like/unlike story |
| POST | `/success-stories/:id/verify` | Yes | Verify story |

---

### Newsletters (`/newsletters`)

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/newsletters` | Yes | Admin | Get all newsletters |
| GET | `/newsletters/stats` | Yes | Admin | Get newsletter stats |
| GET | `/newsletters/:id` | Yes | Admin | Get newsletter by ID |
| POST | `/newsletters` | Yes | Admin | Create newsletter |
| PUT | `/newsletters/:id` | Yes | Admin | Update newsletter |
| DELETE | `/newsletters/:id` | Yes | Admin | Delete newsletter |
| POST | `/newsletters/:id/schedule` | Yes | Admin | Schedule newsletter |
| POST | `/newsletters/:id/send` | Yes | Admin | Send newsletter |

---

## Frontend Integration

### Directory Structure

```
src/
└── lib/
    ├── api-client.ts    # Axios instance with interceptors
    ├── api.ts           # API function exports
    └── types.ts         # TypeScript interfaces
```

### Example API Client Setup

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Example API Functions

```typescript
// Login
export const login = async (credentials: { email: string; password: string }) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

// Get jobs
export const getJobs = async () => {
  const response = await api.get('/jobs');
  return response.data;
};

// Apply to job (requires auth)
export const applyToJob = async (jobId: string) => {
  const response = await api.post(`/jobs/${jobId}/apply`);
  return response.data;
};
```