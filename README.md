# Job Portal with Role-Based Access Control (RBAC)

A full-stack MERN application implementing fine-grained role-based access control for a job portal platform.

## 🎯 Features

### Authentication & Authorization
- JWT-based authentication with access & refresh tokens
- 4 role types: Admin, Employer, Candidate, Viewer
- Fine-grained permission system with route-level and resource-level checks
- Ownership-based authorization (users can only modify their own resources)

### User Management
- Complete CRUD operations for users (Admin only)
- Role assignment and modification
- Profile management with skills, experience, and education
- User activity tracking and audit logs

### Job Management
- Employers can create, update, and delete their job postings
- Advanced job search and filtering
- Job statistics and analytics
- Support for multiple job types (full-time, part-time, contract, internship)

### Application Management
- Candidates can apply for jobs with cover letters
- Application status tracking (pending, reviewing, shortlisted, rejected, accepted)
- Employers can review and update application statuses
- Prevent duplicate applications

### Security Features
- Password hashing with bcrypt
- Rate limiting on authentication and sensitive endpoints
- Input validation and sanitization
- MongoDB injection prevention
- HTTP Parameter Pollution (HPP) protection
- CORS configuration
- Helmet security headers

### Observability
- Structured logging with Winston
- Correlation IDs for request tracing
- Comprehensive audit logging
- Authorization denial metrics

## 📁 Project Structure

```
job-portal-rbac/
├── backend/
│   ├── config/          # Database, roles, permissions configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth, authorization, validation, rate limiting
│   ├── models/          # MongoDB schemas (User, Job, Application, AuditLog)
│   ├── routes/          # API routes
│   ├── utils/           # JWT, logger, validators
│   ├── seeds/           # Database seeding script
│   ├── server.js        # Express app setup
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # Auth context
│   │   ├── services/    # API services
│   │   ├── hooks/       # Custom React hooks
│   │   └── utils/       # Permission utilities
│   └── package.json
└── docker-compose.yml
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB 5.0+
- Docker & Docker Compose (optional)

### Option 1: Docker Setup (Recommended)

1. Clone the repository and navigate to the project directory

2. Start all services:
```bash
docker-compose up --build
```

3. Seed the database:
```bash
docker-compose exec backend npm run seed
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

### Option 2: Local Setup

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/job-portal
JWT_SECRET=your-secure-secret-key
JWT_REFRESH_SECRET=your-secure-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
LOG_LEVEL=info
```

5. Start MongoDB (if not running):
```bash
# Using MongoDB service
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

6. Seed the database:
```bash
npm run seed
```

7. Start the development server:
```bash
npm run dev
```

#### Frontend Setup

1. Open a new terminal and navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm start
```

## 👥 Default Users (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@jobportal.com | Admin@123 |
| Employer | hr@techcorp.com | Employer@123 |
| Employer | jobs@startupxyz.com | Employer@123 |
| Candidate | john.doe@email.com | Candidate@123 |
| Candidate | jane.smith@email.com | Candidate@123 |
| Viewer | guest@email.com | Viewer@123 |

## 🔐 Role Permissions Matrix

| Resource | Admin | Employer | Candidate | Viewer |
|----------|-------|----------|-----------|--------|
| View all users | ✅ | ❌ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ | ❌ |
| Change user roles | ✅ | ❌ | ❌ | ❌ |
| View all jobs | ✅ | ✅ | ✅ | ✅ |
| Create jobs | ✅ | ✅ | ❌ | ❌ |
| Update own jobs | ✅ | ✅ | ❌ | ❌ |
| Delete own jobs | ✅ | ✅ | ❌ | ❌ |
| Update any job | ✅ | ❌ | ❌ | ❌ |
| View applications | ✅ | ✅* | ✅* | ❌ |
| Create applications | ✅ | ❌ | ✅ | ❌ |
| Update application status | ✅ | ✅* | ❌ | ❌ |
| View audit logs | ✅ | ❌ | ❌ | ❌ |
| View statistics | ✅ | ✅* | ❌ | ❌ |

*Employers can only see applications for their own jobs
*Candidates can only see their own applications
*Employers can only see statistics for their own jobs

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get current user profile

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `PUT /api/users/:id/role` - Change user role (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)
- `GET /api/users/permissions` - Get current user permissions

### Jobs
- `GET /api/jobs` - Get all jobs (with filtering)
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create new job (Employer, Admin)
- `PUT /api/jobs/:id` - Update job (Owner, Admin)
- `DELETE /api/jobs/:id` - Delete job (Owner, Admin)
- `GET /api/jobs/stats` - Get job statistics (Employer, Admin)

### Applications
- `GET /api/applications` - Get applications (filtered by role)
- `POST /api/applications` - Submit job application (Candidate)
- `PUT /api/applications/:id/status` - Update application status (Employer, Admin)
- `DELETE /api/applications/:id` - Delete application (Owner, Admin)

### Admin
- `GET /api/admin/audit-logs` - Get audit logs (Admin)

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### API Testing with cURL

#### Register a new user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test@123",
    "role": "candidate"
  }'
```

#### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@jobportal.com",
    "password": "Admin@123"
  }'
```

#### Get jobs (with token):
```bash
curl -X GET http://localhost:5000/api/jobs \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🛡️ Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **JWT Secrets**: Use strong, random secrets in production
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limiting**: Adjust rate limits based on your needs
5. **Input Validation**: All inputs are validated and sanitized
6. **Password Policy**: Enforced strong password requirements
7. **Token Expiration**: Short-lived access tokens (15 minutes)
8. **Audit Logging**: All sensitive actions are logged

## 📊 Database Indexes

Optimized indexes for performance:
- User: `email`, `role`, `isActive`
- Job: `postedBy + status`, `status + createdAt`, text search
- Application: `job + applicant` (unique), `applicant + status`, `job + status`

## 🔄 Rate Limiting

- General API: 100 requests per 15 minutes
- Authentication: 5 attempts per 15 minutes
- Job Creation: 10 jobs per hour
- Applications: 20 applications per hour

## 📝 Logging

Logs are stored in `/backend/logs/`:
- `combined.log` - All logs
- `error.log` - Error logs only

Log rotation: 5MB max file size, 5 files retained

## 🚀 Production Deployment

1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure HTTPS
4. Set up MongoDB replica set
5. Enable MongoDB authentication
6. Configure firewall rules
7. Set up log aggregation (e.g., ELK stack)
8. Enable monitoring (e.g., PM2, New Relic)
9. Set up automated backups

## 📦 Additional Features to Implement

- Email notifications for application status changes
- File upload for resumes and company logos
- Advanced search with Elasticsearch
- Real-time notifications with WebSockets
- Social authentication (Google, LinkedIn)
- PDF resume generation
- Export functionality for job listings
- Analytics dashboard for employers
- Job recommendations for candidates
- Interview scheduling system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License

## 📧 Support

For issues and questions, please open an issue on the repository.

---

Built with ❤️ using MERN Stack
