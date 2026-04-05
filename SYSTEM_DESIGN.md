# AI Timetable System - Complete System Design Document

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Data Model](#data-model)
4. [Core Components](#core-components)
5. [Scheduling Algorithms](#scheduling-algorithms)
6. [API Design](#api-design)
7. [Security Architecture](#security-architecture)
8. [Performance & Scalability](#performance--scalability)
9. [Deployment Architecture](#deployment-architecture)
10. [Error Handling & Logging](#error-handling--logging)

---

## Executive Summary

The AI Timetable System is a comprehensive university scheduling platform that combines constraint satisfaction problem (CSP) solving, genetic algorithms, and intelligent conflict resolution to automate and optimize timetable generation while maintaining manual override capabilities.

**Key Characteristics:**
- **Hybrid Approach**: Automated optimization + manual control
- **Multi-Algorithm**: CSP solver + Genetic Algorithm
- **Real-time Validation**: Conflict detection and resolution
- **Enterprise-Ready**: Production-grade error handling, logging, and security
- **Scalable**: Designed for universities with 100-500 courses

---

## System Architecture

### 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                    │
│  ┌──────────────┬──────────────┬──────────────────────────┐ │
│  │  Dashboard   │  Forms       │  Timetable Grid Display  │ │
│  │  Management  │  Validation  │  Multi-view Support      │ │
│  └──────────────┴──────────────┴──────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │ tRPC + REST API
┌──────────────────────────▼──────────────────────────────────┐
│                    API Layer (Express)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  tRPC Procedures  │  REST Endpoints  │  Middleware    │ │
│  │  - CRUD Ops       │  - Data Export   │  - Auth        │ │
│  │  - Scheduling     │  - Integration   │  - Validation  │ │
│  │  - Export         │  - Webhooks      │  - Error Hdlg  │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              Business Logic Layer (Services)                │
│  ┌──────────────┬──────────────┬──────────────────────────┐ │
│  │ Scheduling   │ Conflict     │ Export & Notification   │ │
│  │ Engines      │ Detection    │ Services                │ │
│  │ - CSP        │ - Validation │ - PDF/Excel/JSON/CSV    │ │
│  │ - GA         │ - Reporting  │ - Email Notifications   │ │
│  │ - Scoring    │              │ - Version Control       │ │
│  └──────────────┴──────────────┴──────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              Data Access Layer (Drizzle ORM)                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Query Builders  │  Type-Safe Queries  │  Migrations  │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                 Database Layer (MySQL)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  14 Tables  │  Indexes  │  Relationships  │  Backups  │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### 2. Component Interaction Flow

```
User Request
    ↓
[Authentication & Authorization]
    ↓
[Input Validation & Sanitization]
    ↓
[tRPC/REST Handler]
    ↓
[Business Logic Service]
    ↓
[Database Query]
    ↓
[Response Formatting]
    ↓
[Error Handling & Logging]
    ↓
User Response
```

---

## Data Model

### 1. Core Entities

#### Users
- Manages authentication and authorization
- Tracks user roles (admin, user)
- Maintains audit trail

#### Instructors
- Faculty information
- Department assignment
- Maximum hours per week constraint
- Availability schedule

#### Courses
- Course code and name
- Instructor assignment
- Sessions per week
- Duration per session
- Student count

#### Rooms
- Room code and name
- Building and floor information
- Capacity
- Facilities (projector, whiteboard, computers)

#### TimeSlots
- Start and end times
- Day of week
- Availability status

### 2. Scheduling Entities

#### Timetables
- Generated schedules
- Status (draft, published, archived)
- Quality score
- Schedule data (JSON)

#### TimetableVersions
- Version history tracking
- Change descriptions
- Rollback support

#### Conflicts
- Conflict type (room, instructor, capacity)
- Severity level
- Affected entities
- Resolution suggestions

### 3. Constraint Entities

#### HardConstraints
- Must-satisfy rules
- Room capacity matching
- Instructor availability
- No time overlaps

#### SoftConstraints
- Optimization preferences
- Instructor preferences
- Room preferences
- Time distribution

### 4. System Entities

#### EmailNotifications
- Notification queue
- Status tracking
- Retry logic

#### AuditTrail
- Action logging
- User tracking
- Change history

### Entity Relationship Diagram

```
Users (1) ──────────────────────────────── (M) Instructors
                                                    │
                                                    │ teaches
                                                    │
                                                    ▼
                                              Courses (1)
                                                    │
                                                    │ scheduled in
                                                    │
                                                    ▼
                                          TimetableEntries
                                                    │
                                                    │ uses
                                                    │
                                    ┌───────────────┼───────────────┐
                                    ▼               ▼               ▼
                                  Rooms        TimeSlots      Timetables
                                    │               │               │
                                    │               │               │
                                    └───────────────┼───────────────┘
                                                    │
                                                    │ has
                                                    │
                                    ┌───────────────┼───────────────┐
                                    ▼               ▼               ▼
                            HardConstraints  SoftConstraints  Conflicts
```

---

## Core Components

### 1. Scheduling Engines

#### CSP Solver (Constraint Satisfaction Problem)
- **Algorithm**: Backtracking with constraint propagation
- **Timeout**: 30 seconds (configurable)
- **Features**:
  - Domain initialization based on room capacity
  - Constraint propagation for domain reduction
  - Consistency checking before assignment
  - Timeout protection against infinite loops
  - Depth limiting to prevent stack overflow

**Complexity**: O(n^m) where n = domain size, m = variables
**Best for**: Small to medium schedules (< 200 courses)

#### Genetic Algorithm Optimizer
- **Population Size**: 50 individuals
- **Generations**: 100 iterations
- **Mutation Rate**: 0.1 (10%)
- **Crossover Rate**: 0.8 (80%)
- **Features**:
  - Population-based optimization
  - Fitness-based selection
  - Genetic operations (crossover, mutation)
  - Elitism preservation
  - Convergence detection

**Complexity**: O(p * g * n) where p = population, g = generations, n = schedule size
**Best for**: Large schedules (> 200 courses)

#### Scoring System
- **Metrics**:
  - Hard constraint satisfaction (100% required)
  - Soft constraint fulfillment (weighted)
  - Resource utilization efficiency
  - Fairness in distribution
  - Preference matching

**Formula**: `Score = (HC_Weight * HC_Satisfaction) + (SC_Weight * SC_Satisfaction) + (RU_Weight * Resource_Util) + (Fair_Weight * Fairness)`

### 2. Conflict Detection System

**Conflict Types**:
- Room conflicts (double-booking)
- Instructor conflicts (same time teaching)
- Capacity conflicts (room too small)
- Availability conflicts (outside available times)
- Preference conflicts (soft constraints violated)

**Detection Method**: Real-time validation during assignment

**Resolution Strategies**:
1. Automatic reallocation
2. Suggested alternatives
3. Manual override with confirmation

### 3. Validation & Error Handling

**Input Validation**:
- Email format validation
- Time format validation (HH:MM)
- Time range validation
- Capacity validation
- Duration validation
- Constraint weight validation

**Error Handling**:
- Global error middleware
- Custom error classes
- Structured error responses
- Error logging and tracking
- User-friendly error messages

### 4. Export & Notification Services

**Export Formats**:
- PDF: Professional formatted reports
- Excel: Spreadsheet with formatting
- JSON: API-ready data
- CSV: Comma-separated values

**Notification System**:
- Email queue management
- Retry logic (3 attempts)
- Status tracking
- Template system

---

## Scheduling Algorithms

### CSP Solver Algorithm

```
function BacktrackSearch(assignment, unassigned_vars):
  if timeout_exceeded():
    return FAILURE
  
  if all_variables_assigned(assignment):
    return assignment
  
  var = select_unassigned_variable(unassigned_vars)
  
  for value in order_domain_values(var):
    if is_consistent(var, value, assignment):
      assignment[var] = value
      result = BacktrackSearch(assignment, unassigned_vars - {var})
      
      if result != FAILURE:
        return result
      
      delete assignment[var]
  
  return FAILURE
```

### Genetic Algorithm

```
function GeneticAlgorithm(population_size, generations):
  population = initialize_population(population_size)
  
  for generation in 1..generations:
    fitness_scores = evaluate_fitness(population)
    
    new_population = []
    
    // Elitism: keep best solutions
    for elite in top_k_individuals(population, k=2):
      new_population.append(elite)
    
    // Generate new individuals
    while len(new_population) < population_size:
      parent1 = select_parent(population, fitness_scores)
      parent2 = select_parent(population, fitness_scores)
      
      child = crossover(parent1, parent2)
      child = mutate(child, mutation_rate)
      
      new_population.append(child)
    
    population = new_population
    
    if converged(fitness_scores):
      break
  
  return best_individual(population)
```

### Scoring Function

```
function CalculateScore(schedule):
  hard_constraint_score = evaluate_hard_constraints(schedule)
  
  if hard_constraint_score < 100:
    return 0  // Invalid schedule
  
  soft_constraint_score = evaluate_soft_constraints(schedule)
  resource_utilization = calculate_resource_utilization(schedule)
  fairness_score = calculate_fairness(schedule)
  
  total_score = (
    0.4 * hard_constraint_score +
    0.3 * soft_constraint_score +
    0.2 * resource_utilization +
    0.1 * fairness_score
  )
  
  return total_score
```

---

## API Design

### tRPC Procedures

**Instructor Management**:
- `instructor.create` - Create new instructor
- `instructor.list` - List all instructors
- `instructor.get` - Get specific instructor
- `instructor.update` - Update instructor
- `instructor.delete` - Delete instructor

**Course Management**:
- `course.create` - Create new course
- `course.list` - List all courses
- `course.get` - Get specific course
- `course.update` - Update course
- `course.delete` - Delete course

**Room Management**:
- `room.create` - Create new room
- `room.list` - List all rooms
- `room.get` - Get specific room
- `room.update` - Update room
- `room.delete` - Delete room

**Time Slot Management**:
- `timeSlot.create` - Create new time slot
- `timeSlot.list` - List all time slots
- `timeSlot.get` - Get specific time slot
- `timeSlot.delete` - Delete time slot

**Scheduling Operations**:
- `scheduling.generate` - Generate timetable
- `scheduling.optimize` - Optimize existing timetable
- `scheduling.list` - List all timetables
- `scheduling.get` - Get specific timetable
- `scheduling.delete` - Delete timetable

**Export Operations**:
- `export.toPDF` - Export to PDF
- `export.toExcel` - Export to Excel
- `export.toJSON` - Export to JSON
- `export.toCSV` - Export to CSV

### REST Endpoints

```
GET    /api/rest/health
GET    /api/rest/timetables
GET    /api/rest/timetables/:id
GET    /api/rest/timetables/:id/versions
GET    /api/rest/courses
GET    /api/rest/instructors
GET    /api/rest/rooms
GET    /api/rest/timeslots
```

---

## Security Architecture

### Authentication & Authorization

**Authentication Method**: Manus OAuth
- Session-based authentication
- Secure cookie handling
- Session expiration
- CSRF protection

**Authorization Levels**:
- **Public**: Health checks, public data
- **User**: CRUD operations, scheduling
- **Admin**: System configuration, user management

### Input Security

**Validation Layers**:
1. Client-side validation (React)
2. Server-side validation (Zod schemas)
3. Database constraints
4. Sanitization of user inputs

**Security Measures**:
- XSS prevention (HTML escaping)
- SQL injection prevention (Parameterized queries)
- CSRF token validation
- Rate limiting on sensitive endpoints
- Request size limits

### Data Protection

**Encryption**:
- HTTPS for all communications
- Sensitive data encrypted at rest
- Secure password hashing

**Access Control**:
- Role-based access control (RBAC)
- Resource-level permissions
- Audit logging of sensitive operations

---

## Performance & Scalability

### Database Optimization

**Indexing Strategy**:
- Primary key indexes on all tables
- Foreign key indexes for joins
- Composite indexes on frequently queried fields
- Partial indexes on status fields

**Query Optimization**:
- Connection pooling
- Query result caching
- Pagination for large datasets
- Lazy loading of related data

### Caching Strategy

**Levels**:
1. **Application Cache**: In-memory caching of frequently accessed data
2. **Database Cache**: Query result caching
3. **HTTP Cache**: Browser caching of static assets

**Cache Invalidation**:
- Time-based expiration (TTL)
- Event-based invalidation
- Manual cache clearing

### Scalability Measures

**Horizontal Scaling**:
- Stateless API servers
- Load balancing
- Session persistence (Redis)
- Distributed caching

**Vertical Scaling**:
- Database optimization
- Connection pooling
- Query optimization
- Memory management

### Performance Targets

- **API Response Time**: < 200ms (p95)
- **Scheduling Generation**: < 30s (CSP), < 60s (GA)
- **Database Query**: < 100ms (p95)
- **Page Load**: < 2s (p95)

---

## Deployment Architecture

### Environment Configuration

**Development**:
- Local database
- Debug logging
- Hot module reloading
- Mock services

**Staging**:
- Production-like database
- Full logging
- Integration testing
- Performance testing

**Production**:
- Replicated database
- Minimal logging
- Monitoring and alerting
- Backup and recovery

### Docker Deployment

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install --production
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

### Environment Variables

```
DATABASE_URL=mysql://user:password@host:3306/db
NODE_ENV=production
JWT_SECRET=<secret>
VITE_APP_ID=<app-id>
OAUTH_SERVER_URL=<oauth-url>
VITE_OAUTH_PORTAL_URL=<portal-url>
BUILT_IN_FORGE_API_URL=<api-url>
BUILT_IN_FORGE_API_KEY=<api-key>
```

---

## Error Handling & Logging

### Error Hierarchy

```
AppError (Base)
├── ValidationError (400)
├── NotFoundError (404)
├── UnauthorizedError (401)
├── ForbiddenError (403)
├── ConflictError (409)
└── RateLimitError (429)
```

### Logging Levels

- **DEBUG**: Detailed information for debugging
- **INFO**: General informational messages
- **WARN**: Warning messages for potential issues
- **ERROR**: Error messages with stack traces

### Structured Logging

```json
{
  "timestamp": "2026-04-01T12:00:00Z",
  "level": "error",
  "message": "Scheduling failed",
  "context": {
    "timetableId": 1,
    "algorithm": "csp",
    "duration": "30000ms"
  },
  "error": {
    "message": "Timeout exceeded",
    "stack": "..."
  }
}
```

### Monitoring & Alerting

**Metrics**:
- Request count and latency
- Error rate
- Database query performance
- Scheduling success rate
- Resource utilization

**Alerts**:
- High error rate (> 5%)
- Slow response times (> 1s p95)
- Database connection issues
- Scheduling failures
- Resource exhaustion

---

## Conclusion

The AI Timetable System is designed as a production-ready, scalable platform combining advanced scheduling algorithms with enterprise-grade infrastructure. The architecture supports both automated optimization and manual control, with comprehensive error handling, logging, and security measures.

**Key Design Principles**:
1. **Separation of Concerns**: Clear layer separation
2. **Scalability**: Horizontal and vertical scaling support
3. **Security**: Multiple validation layers
4. **Reliability**: Error handling and recovery
5. **Maintainability**: Clean code and documentation
6. **Performance**: Optimization at all layers

---

**Document Version**: 1.0  
**Last Updated**: April 2026  
**Status**: Production Ready
