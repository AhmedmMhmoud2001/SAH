# SAH Academy - Weekly Development Plan

## Overview
- **Backend**: Node.js + Express + Prisma + MySQL
- **Dashboard**: React 19 + Vite
- **Duration**: 8 Weeks

---

## Week 1: Project Setup + Database Schema ✅

### Goals
- [x] Create backend project structure
- [x] Setup Express server with CORS
- [x] Configure Prisma with MySQL schema
- [x] Create all database models
- [x] Create all API routes
- [x] Create seed script

### Files Created
```
sah_backend/
├── package.json
├── .env
├── prisma/
│   └── schema.prisma          # 9 models
└── src/
    ├── index.js              # Express app
    ├── seed.js               # Seed script
    ├── lib/
    │   └── db.js             # Prisma client
    ├── routes/
    │   ├── auth.js           # Register, Login, Me
    │   ├── courses.js        # Courses CRUD
    │   ├── progress.js       # Progress tracking
    │   ├── quiz.js           # Quiz submission
    │   └── enrollments.js   # Enrollment
    └── validators/
        └── auth.js          # Zod schemas
```

### Todo This Week (Must Complete)
- [ ] Configure MySQL database
- [ ] Run `npm install`
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma db push`
- [ ] Run `npm run db:seed`

### Next: Week 2 Commands
```bash
cd C:\SAH\sah_backend
npm install
# Setup MySQL, then:
npx prisma generate
npx prisma db push
npm run db:seed
```

---

## Week 2: Authentication API

### Goals
- [ ] Test register endpoint
- [ ] Test login endpoint
- [ ] Test JWT middleware
- [ ] Test /me endpoint
- [ ] Fix any bugs

### Tasks
1. **Test register**
   ```bash
   curl -X POST http://localhost:3001/api/auth/register ^
     -H "Content-Type: application/json" ^
     -d "{\"name\":\"Rana Essawi\",\"email\":\"rana@test.com\",\"password\":\"123456\"}"
   ```

2. **Test login**
   ```bash
   curl -X POST http://localhost:3001/api/auth/login ^
     -H "Content-Type: application/json" ^
     -d "{\"email\":\"rana@test.com\",\"password\":\"123456\"}"
   ```

3. **Test protected route**
   ```bash
   curl http://localhost:3001/api/auth/me -H "Authorization: Bearer <token>"
   ```

### Acceptance Criteria
- [ ] User can register with name, email, password
- [ ] User can login and receive JWT
- [ ] Protected routes require valid JWT
- [ ] Duplicate email returns 400 error

---

## Week 3: Courses API

### Goals
- [ ] GET /api/courses (list with pagination)
- [ ] GET /api/courses/:id (single course)
- [ ] GET /api/courses/:id/lessons (course lessons)
- [ ] Test bilingual responses
- [ ] Verify seed data

### API Endpoints
```
GET /api/courses?page=1&limit=8&lang=ar
GET /api/courses/:id?lang=en
GET /api/courses/:id/lessons
```

---

## Week 4: Progress & Quiz API

### Goals
- [ ] GET /api/progress/:courseId
- [ ] POST /api/progress/:courseId (mark complete)
- [ ] GET /api/quizzes/:id
- [ ] POST /api/quizzes/:id/submit
- [ ] POST /api/enrollments
- [ ] Track lesson completion

### Endpoints to Test
```
GET    /api/progress/:courseId
POST   /api/progress/:courseId
POST   /api/progress/:courseId/quiz
GET    /api/quizzes/:id
POST   /api/quizzes/:id/submit
POST   /api/enrollments
GET    /api/enrollments
```

---

## Week 5: Dashboard Frontend Setup

### Goals
- [ ] Create React 19 + Vite project
- [ ] Setup routing (React Router)
- [ ] Create dashboard layout
- [ ] Setup API service layer
- [ ] Create auth context

### Structure
```
sah_dashboard/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── api/
│   │   └── axios.js
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   └── MyCourses.jsx
│   └── components/
│       ├── Layout.jsx
│       └── Navbar.jsx
```

---

## Week 6: Dashboard - Auth Pages

### Goals
- [ ] Login page connects to API
- [ ] Register page connects to API
- [ ] JWT stored in localStorage
- [ ] Auth context provides user data
- [ ] Protected route wrapper
- [ ] Logout functionality

---

## Week 7: Dashboard - User Dashboard

### Goals
- [ ] Dashboard home (continue learning)
- [ ] My Courses page
- [ ] Course details page
- [ ] Course learn page (video)
- [ ] Quiz page

---

## Week 8: Integration & Testing

### Goals
- [ ] Full auth flow tested
- [ ] Course enrollment flow tested
- [ ] Progress tracking tested
- [ ] Quiz flow tested

---

## Dependencies to Install

### Backend (Already in package.json)
```bash
@prisma/client
bcryptjs
cors
dotenv
express
jsonwebtoken
zod
prisma
```

### Dashboard (Week 5)
```bash
# After creating sah_dashboard:
npm install react-router-dom axios
```

---

## Testing Commands

### Backend Tests
```bash
# Health check
curl http://localhost:3001/api/health

# Register
curl -X POST http://localhost:3001/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\"}"

# Login
curl -X POST http://localhost:3001/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"

# Get courses
curl http://localhost:3001/api/courses

# Enroll (requires token)
curl -X POST http://localhost:3001/api/enrollments ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer <token>" ^
  -d "{\"courseId\":\"<course-id>\"}"
```

---

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=3001
DATABASE_URL="mysql://user:pass@localhost:3306/sah_academy"
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### Dashboard (.env)
```
VITE_API_URL=http://localhost:3001/api
```

---

## Next Steps

### Immediate (Complete Week 1)
1. Setup MySQL database
2. Run `npm install`
3. Generate Prisma client
4. Run database migrations
5. Seed course data
6. Start server: `npm run dev`

### Then Move to Week 2
- Test all endpoints
- Fix issues
- Verify JWT works

---

*Last Updated: April 23, 2026*
*Status: Week 1 Complete*