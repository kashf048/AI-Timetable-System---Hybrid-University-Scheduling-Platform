# AI Timetable System - Hybrid University Scheduling Platform

A comprehensive, enterprise-grade timetable management system for universities that combines automated scheduling optimization with manual control and intelligent conflict resolution.

## Features

### Core Scheduling Capabilities
- **Automated Timetable Generation**: CSP (Constraint Satisfaction Problem) solver with backtracking algorithm
- **Optimization Engine**: Genetic Algorithm for schedule refinement and quality improvement
- **Intelligent Scoring**: Evaluate timetable quality based on constraint satisfaction and resource utilization
- **Conflict Detection**: Real-time validation with detailed conflict reports and suggested resolutions

### University Data Management
- **Instructors**: Manage faculty with availability and workload constraints
- **Courses**: Track courses with duration, frequency, and student count
- **Rooms**: Manage classrooms with capacity and facility information
- **Time Slots**: Define available scheduling windows

### Constraint System
- **Hard Constraints**: Must-satisfy rules (room capacity, instructor availability, no overlaps)
- **Soft Constraints**: Preferences to optimize (instructor preferences, room preferences, time distribution)
- **Flexible Configuration**: Create and manage custom constraints

### Multi-View Timetable Display
- **Instructor View**: See all classes assigned to each instructor
- **Room View**: View room utilization and scheduling
- **Course View**: Track course scheduling across the week
- **Filtering & Search**: Find specific schedules quickly

### Export & Sharing
- **PDF Export**: Generate professional timetable reports
- **Excel Export**: Download schedules for further analysis
- **JSON Export**: API-ready data format
- **CSV Export**: Compatible with external systems

### Email Notifications
- Schedule generation alerts
- Conflict detection notifications
- Manual change notifications
- Instructor assignment updates

### REST API
- Public endpoints for external system integration
- JSON-based data format
- Student portal integration ready
- Mobile app compatibility

### Version Control & History
- Track all timetable changes
- Compare versions
- Rollback to previous schedules
- Audit trail logging

## Technology Stack

### Frontend
- **React 19** with Vite
- **Tailwind CSS 4** for styling
- **shadcn/ui** components
- **tRPC** for type-safe API calls

### Backend
- **Express.js** server
- **tRPC** procedures
- **MySQL/TiDB** database
- **Drizzle ORM** for type-safe queries

### Scheduling Engines
- **CSP Solver**: Constraint satisfaction with backtracking
- **Genetic Algorithm**: Population-based optimization
- **Scoring System**: Multi-criteria evaluation

### Additional Libraries
- **pdf-lib**: PDF generation
- **exceljs**: Excel file creation
- **Zod**: Schema validation

## Installation & Setup

### Prerequisites
- Node.js 22.x or higher
- pnpm 10.x or higher
- MySQL 8.0+ or TiDB

### Quick Start

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Setup Database**
   ```bash
   # Generate and apply migrations
   pnpm db:push
   
   # Seed sample data
   pnpm seed
   ```

3. **Start Development Server**
   ```bash
   pnpm dev
   ```
   Server runs on http://localhost:3000

4. **Run Tests**
   ```bash
   pnpm test
   ```

## Usage Guide

### Creating a Timetable

1. **Add University Data**
   - Navigate to Dashboard
   - Add Instructors with availability constraints
   - Add Courses with session requirements
   - Add Rooms with capacity information
   - Define Time Slots for scheduling

2. **Configure Constraints**
   - Set Hard Constraints (must-satisfy rules)
   - Set Soft Constraints (preferences)
   - Adjust constraint weights for optimization

3. **Generate Timetable**
   - Click "Generate Timetable"
   - Select generation algorithm (CSP or Genetic Algorithm)
   - Monitor generation progress
   - Review generated schedule

4. **Optimize Schedule**
   - Use Genetic Algorithm to improve quality
   - Adjust soft constraint weights
   - Run optimization iterations
   - Compare scores

5. **Manual Adjustments**
   - View conflicts in detail
   - Make manual changes
   - System validates changes in real-time
   - Export final schedule

### Viewing Timetables

- **Dashboard**: Overview of all timetables
- **Timetable Views**: Multi-view display (instructor/room/course)
- **Conflict Reporter**: Detailed conflict analysis
- **Version History**: Track changes over time

### Exporting Data

```typescript
// Via UI: Use Export Actions component
// Via API: Call export endpoints
GET /api/rest/timetables/:id
POST /api/trpc/export.toPDF
POST /api/trpc/export.toExcel
POST /api/trpc/export.toJSON
POST /api/trpc/export.toCSV
```

## API Endpoints

### REST API

```
GET  /api/rest/health                 - Health check
GET  /api/rest/timetables             - List all timetables
GET  /api/rest/timetables/:id         - Get specific timetable
GET  /api/rest/timetables/:id/versions - Get version history
GET  /api/rest/courses                - List courses
GET  /api/rest/instructors            - List instructors
GET  /api/rest/rooms                  - List rooms
GET  /api/rest/timeslots              - List time slots
```

### tRPC Procedures

```typescript
// Scheduling
trpc.scheduling.timetable.generate
trpc.scheduling.timetable.optimize
trpc.scheduling.timetable.list
trpc.scheduling.timetable.get

// Data Management
trpc.scheduling.instructor.create
trpc.scheduling.course.create
trpc.scheduling.room.create
trpc.scheduling.timeSlot.create

// Constraints
trpc.constraints.hardConstraints.create
trpc.constraints.softConstraints.create

// Export
trpc.export.toPDF
trpc.export.toExcel
trpc.export.toJSON
trpc.export.toCSV
```

## Database Schema

### Core Tables
- `users` - User authentication
- `instructors` - Faculty information
- `courses` - Course definitions
- `rooms` - Classroom/lab information
- `timeSlots` - Available scheduling windows

### Scheduling Tables
- `timetables` - Generated schedules
- `timetableVersions` - Version history
- `conflicts` - Detected conflicts
- `hardConstraints` - Must-satisfy rules
- `softConstraints` - Optimization preferences

### System Tables
- `emailNotifications` - Notification queue
- `auditTrail` - Change logging

## Configuration

### Environment Variables

```env
DATABASE_URL=mysql://user:password@localhost:3306/timetable
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key
```

### Constraint Weights

Adjust in `server/scheduling/scoring.ts`:
- Hard constraint weight: 100 (non-negotiable)
- Soft constraint weight: 50 (default, adjustable)

### Optimization Parameters

Genetic Algorithm settings in `server/scheduling/geneticOptimizer.ts`:
- Population size: 50
- Generations: 100
- Mutation rate: 0.1
- Crossover rate: 0.8

## Performance Considerations

- **CSP Solver**: Best for small-medium schedules (< 200 courses)
- **Genetic Algorithm**: Better for large schedules (> 200 courses)
- **Scoring**: O(n) complexity for n schedule entries
- **Database**: Indexed queries for fast retrieval

## Troubleshooting

### Common Issues

**No timetable generated**
- Verify all required data is entered
- Check hard constraints aren't too restrictive
- Review conflict report for details

**Slow optimization**
- Reduce generation iterations
- Increase population size for better results
- Use CSP solver for smaller problems

**Export fails**
- Check file permissions
- Verify timetable has valid data
- Check disk space for large exports

### Debug Mode

```bash
# Enable debug logging
DEBUG=* pnpm dev

# Run with verbose output
pnpm test -- --reporter=verbose
```

## Development

### Project Structure

```
ai-timetable-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   └── lib/           # Utilities
│   └── public/            # Static assets
├── server/                # Express backend
│   ├── scheduling/        # Scheduling engines
│   ├── routers.ts         # tRPC routes
│   └── db.ts              # Database queries
├── drizzle/               # Database schema
└── shared/                # Shared types
```

### Adding Features

1. **Update Database Schema**
   ```bash
   # Edit drizzle/schema.ts
   pnpm drizzle-kit generate
   pnpm db:push
   ```

2. **Add tRPC Procedure**
   ```typescript
   // server/routers.ts
   myFeature: protectedProcedure
     .input(z.object({ ... }))
     .mutation(async ({ input, ctx }) => { ... })
   ```

3. **Create Frontend Component**
   ```typescript
   // client/src/components/MyFeature.tsx
   import { trpc } from "@/lib/trpc";
   ```

4. **Write Tests**
   ```bash
   pnpm test
   ```

## Testing

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test server/scheduling.test.ts

# Watch mode
pnpm test -- --watch
```

## Deployment

### Build for Production

```bash
pnpm build
pnpm start
```

### Docker Deployment

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build
CMD ["pnpm", "start"]
```

### Environment Setup

- Set `NODE_ENV=production`
- Configure database connection
- Set JWT secret
- Enable HTTPS

## Support & Documentation

- **API Documentation**: `/api/rest/health` endpoint
- **Database Schema**: See `drizzle/schema.ts`
- **Component Library**: shadcn/ui documentation
- **tRPC Guide**: https://trpc.io/docs

## License

MIT

## Contributors

Built with ❤️ for university scheduling automation.

---

**Version**: 1.0.0  
**Last Updated**: April 2026  
**Status**: Production Ready
