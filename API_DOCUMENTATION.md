# AI Timetable System - API Documentation

## Overview

The AI Timetable System provides both REST and tRPC APIs for integrating with external systems and building custom interfaces.

## Authentication

All endpoints require authentication via Manus OAuth. The system uses session cookies for authenticated requests.

### Login Flow

1. Redirect to `getLoginUrl()` from the frontend
2. User authenticates with Manus OAuth
3. Session cookie is set automatically
4. User is redirected back to the application

## REST API Endpoints

### Base URL
```
https://your-domain.manus.space/api/rest
```

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-01T00:00:00Z"
}
```

### Timetables

#### List All Timetables
```http
GET /timetables
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Spring 2024",
      "status": "published",
      "score": 85.5,
      "createdAt": "2026-04-01T00:00:00Z",
      "updatedAt": "2026-04-01T00:00:00Z"
    }
  ]
}
```

#### Get Specific Timetable
```http
GET /timetables/:id
```

**Response:**
```json
{
  "id": 1,
  "name": "Spring 2024",
  "status": "published",
  "schedule": {
    "0": {
      "09:00-10:30": [
        {
          "courseId": 1,
          "courseName": "CS101",
          "instructorId": 1,
          "instructorName": "Dr. Alice",
          "roomId": 1,
          "roomName": "A101",
          "startTime": "09:00",
          "endTime": "10:30"
        }
      ]
    }
  },
  "score": 85.5,
  "createdAt": "2026-04-01T00:00:00Z"
}
```

#### Get Timetable Versions
```http
GET /timetables/:id/versions
```

**Response:**
```json
{
  "versions": [
    {
      "id": 1,
      "timetableId": 1,
      "versionNumber": 1,
      "changes": "Initial generation",
      "createdAt": "2026-04-01T00:00:00Z"
    }
  ]
}
```

### Courses

#### List All Courses
```http
GET /courses
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "code": "CS101",
      "name": "Introduction to Computer Science",
      "instructorId": 1,
      "slotsPerWeek": 3,
      "durationMinutes": 90,
      "studentCount": 50
    }
  ]
}
```

### Instructors

#### List All Instructors
```http
GET /instructors
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Dr. Alice",
      "email": "alice@university.edu",
      "department": "Computer Science",
      "maxHoursPerWeek": 20
    }
  ]
}
```

### Rooms

#### List All Rooms
```http
GET /rooms
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "code": "A101",
      "name": "Lecture Hall A",
      "building": "Building A",
      "floor": 1,
      "capacity": 100,
      "hasProjector": true,
      "hasWhiteboard": true,
      "hasComputers": false
    }
  ]
}
```

### Time Slots

#### List All Time Slots
```http
GET /timeslots
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "startTime": "09:00",
      "endTime": "10:30",
      "dayOfWeek": 0,
      "isAvailable": true
    }
  ]
}
```

## tRPC Procedures

### Base URL
```
https://your-domain.manus.space/api/trpc
```

### Scheduling Procedures

#### Generate Timetable
```typescript
trpc.scheduling.timetable.generate.mutate({
  name: "Spring 2024",
  algorithm: "csp", // or "genetic"
  courseIds: [1, 2, 3],
  constraints: {
    hardConstraints: [1, 2, 3],
    softConstraints: [4, 5]
  }
})
```

**Response:**
```typescript
{
  success: true,
  timetableId: 1,
  score: 85.5,
  conflicts: []
}
```

#### Optimize Timetable
```typescript
trpc.scheduling.timetable.optimize.mutate({
  timetableId: 1,
  iterations: 100,
  populationSize: 50
})
```

**Response:**
```typescript
{
  success: true,
  newScore: 92.3,
  improvementPercentage: 8.4
}
```

#### Get Timetable
```typescript
trpc.scheduling.timetable.get.query({
  timetableId: 1
})
```

**Response:**
```typescript
{
  id: 1,
  name: "Spring 2024",
  status: "published",
  schedule: { /* ... */ },
  score: 85.5
}
```

### Data Management Procedures

#### Create Instructor
```typescript
trpc.scheduling.instructor.create.mutate({
  name: "Dr. Alice",
  email: "alice@university.edu",
  department: "Computer Science",
  maxHoursPerWeek: 20
})
```

#### Create Course
```typescript
trpc.scheduling.course.create.mutate({
  code: "CS101",
  name: "Introduction to Computer Science",
  instructorId: 1,
  slotsPerWeek: 3,
  durationMinutes: 90,
  studentCount: 50
})
```

#### Create Room
```typescript
trpc.scheduling.room.create.mutate({
  code: "A101",
  name: "Lecture Hall A",
  building: "Building A",
  floor: 1,
  capacity: 100,
  hasProjector: true,
  hasWhiteboard: true,
  hasComputers: false
})
```

#### Create Time Slot
```typescript
trpc.scheduling.timeSlot.create.mutate({
  startTime: "09:00",
  endTime: "10:30",
  dayOfWeek: 0,
  isAvailable: true
})
```

### Constraint Procedures

#### Create Hard Constraint
```typescript
trpc.constraints.hardConstraints.create.mutate({
  type: "room_capacity",
  description: "Room must have sufficient capacity",
  weight: 100
})
```

#### Create Soft Constraint
```typescript
trpc.constraints.softConstraints.create.mutate({
  type: "instructor_preference",
  description: "Prefer morning classes",
  weight: 50
})
```

### Export Procedures

#### Export to PDF
```typescript
trpc.export.toPDF.mutate({
  timetableId: 1,
  title: "Spring 2024 Timetable",
  includeScore: true
})
```

**Response:**
```typescript
{
  success: true,
  data: "base64-encoded-pdf",
  filename: "timetable-1.pdf"
}
```

#### Export to Excel
```typescript
trpc.export.toExcel.mutate({
  timetableId: 1,
  title: "Spring 2024 Timetable",
  includeScore: true
})
```

#### Export to JSON
```typescript
trpc.export.toJSON.mutate({
  timetableId: 1
})
```

#### Export to CSV
```typescript
trpc.export.toCSV.mutate({
  timetableId: 1
})
```

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "error": "Invalid input",
  "message": "Course ID is required"
}
```

#### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Please sign in to continue"
}
```

#### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Timetable with ID 999 not found"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting

- **REST API**: 100 requests per minute per user
- **tRPC**: 200 requests per minute per user

## Webhooks

Email notifications are sent automatically for:
- Schedule generation completion
- Conflict detection
- Manual schedule changes
- Optimization results

## Integration Examples

### Python Client
```python
import requests

BASE_URL = "https://your-domain.manus.space/api/rest"

# Get all timetables
response = requests.get(f"{BASE_URL}/timetables")
timetables = response.json()

# Get specific timetable
response = requests.get(f"{BASE_URL}/timetables/1")
timetable = response.json()
```

### JavaScript/Node.js Client
```javascript
const BASE_URL = "https://your-domain.manus.space/api/rest";

// Get all timetables
const response = await fetch(`${BASE_URL}/timetables`);
const timetables = await response.json();

// Get specific timetable
const response = await fetch(`${BASE_URL}/timetables/1`);
const timetable = await response.json();
```

### cURL
```bash
# Get all timetables
curl https://your-domain.manus.space/api/rest/timetables

# Get specific timetable
curl https://your-domain.manus.space/api/rest/timetables/1

# Export to PDF
curl -X POST https://your-domain.manus.space/api/trpc/export.toPDF \
  -H "Content-Type: application/json" \
  -d '{"timetableId": 1}'
```

## Versioning

The API follows semantic versioning. Current version: **1.0.0**

Breaking changes will be announced with a new major version.

## Support

For API support and questions:
- Email: support@university.edu
- Documentation: https://docs.timetable-system.edu
- Issues: https://github.com/university/timetable-system/issues

---

**Last Updated**: April 2026  
**API Version**: 1.0.0
