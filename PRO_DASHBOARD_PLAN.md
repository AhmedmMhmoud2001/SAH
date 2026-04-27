# SAH Academy PRO Dashboard - Implementation Plan

## Overview
- **Project**: SAH Academy Admin Dashboard
- **Version**: 1.0
- **Frontend**: React 19 + Vite
- **Backend**: Express + Prisma + MySQL

---

## Table of Contents
1. [Backend API Extensions](#backend-api-extensions)
2. [Frontend Structure](#frontend-structure)
3. [Components](#components)
4. [Pages](#pages)
5. [Testing Checklist](#testing-checklist)

---

## Backend API Extensions

### Required New Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/stats` | Dashboard statistics | Admin |
| GET | `/api/admin/users` | List all users | Admin |
| POST | `/api/admin/users` | Create user | Admin |
| PUT | `/api/admin/users/:id` | Update user | Admin |
| DELETE | `/api/admin/users/:id` | Delete user | Admin |
| POST | `/api/admin/courses` | Create course | Admin |
| PUT | `/api/admin/courses/:id` | Update course | Admin |
| DELETE | `/api/admin/courses/:id` | Delete course | Admin |
| POST | `/api/admin/lessons` | Create lesson | Admin |
| PUT | `/api/admin/lessons/:id` | Update lesson | Admin |
| DELETE | `/api/admin/lessons/:id` | Delete lesson | Admin |
| POST | `/api/admin/questions` | Create question | Admin |
| DELETE | `/api/admin/questions/:id` | Delete question | Admin |
| GET | `/api/admin/reports/users` | User report | Admin |
| GET | `/api/admin/reports/courses` | Course report | Admin |
| GET | `/api/admin/reports/subscriptions` | Subscription report | Admin |
| GET | `/api/admin/subscriptions` | All subscriptions | Admin |

---

## Frontend Structure

```
sah_dashboard/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── AdminLayout.jsx
│   │   ├── common/
│   │   │   ├── DataTable.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Button.jsx
│   │   │   └── Input.jsx
│   │   └── ui/
│   │       ├── LanguageToggle.jsx
│   │       └── ThemeToggle.jsx
│   ├── context/
│   │   ├── AuthContext.jsx (existing)
│   │   ├── ThemeContext.jsx
│   │   └── I18nContext.jsx
│   ├── pages/
│   │   └── admin/
│   │       ├── Dashboard.jsx
│   │       ├── Users.jsx
│   │       ├── Courses.jsx
│   │       ├── Videos.jsx
│   │       ├── Questions.jsx
│   │       ├── Reports.jsx
│   │       ├── Subscriptions.jsx
│   │       ├── About.jsx
│   │       └── Contact.jsx
│   ├── api/
│   │   └── admin.js
│   ├── i18n/
│   │   ├── ar.json
│   │   └── en.json
│   └── styles/
│       └── admin.css
```

---

## Pages Description

### 1. Dashboard (Statistics)
- Total users count
- Total courses count
- Total subscriptions count
- Completion rate percentage
- Recent users chart
- Revenue chart

### 2. Users Management
- Table with columns: Name, Email, Role, Status, Created
- Actions: Add, Edit, Delete
- Search and filter

### 3. Courses Management
- Table with columns: Title, Price, Duration, Level, Status
- Actions: Add, Edit, Delete, Toggle Status
- Course details modal

### 4. Videos/Lessons Management
- Table with columns: Title, Course, Duration, Status
- Actions: Add, Edit, Delete
- Link to course

### 5. Questions Management
- Table with columns: Question, Quiz, Course
- Actions: Add, Delete

### 6. Reports
- User registration trends
- Course enrollment stats
- Revenue reports
- Export options (Excel/PDF)

### 7. Subscriptions
- Table with columns: User, Course, Start Date, End Date, Status, Progress
- Filter by status
- Progress percentage

### 8. About Us
- Company description
- Mission & Vision
- Team section

### 9. Contact Us
- Contact form
- Contact info (phone, email, address)
- Social media links

---

## Theme System

### Light Theme (Default)
- Background: #ffffff
- Text: #1f2937
- Primary: #6366f1 (Indigo)
- Secondary: #8b5cf6
- Accent: #10b981

### Dark Theme
- Background: #1f2937
- Text: #f9fafb
- Primary: #818cf8
- Secondary: #a78bfa
- Accent: #34d399

---

## Language Support

### Arabic (ar) - RTL
### English (en) - LTR

---

## Testing Checklist

- [ ] Backend server running
- [ ] API endpoints returning correct data
- [ ] Frontend loading without errors
- [ ] Theme toggle working
- [ ] Language toggle working
- [ ] Navigation working
- [ ] All pages rendering
- [ ] CRUD operations working

---

## Implementation Order

1. ✅ Plan created
2. ⏳ Backend API extensions
3. ⏳ Theme & i18n contexts
4. ⏳ Layout components (Header, Sidebar)
5. ⏳ Admin pages (Dashboard through Contact)
6. ⏳ Testing

---

*Last Updated: April 23, 2026*
*Status: In Progress*