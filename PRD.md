# SAH Academy - Product Requirements Document (PRD)

## 1. Project Overview
SAH Academy is a comprehensive Learning Management System (LMS) specifically designed for the Middle Eastern market (supporting Arabic and English). It allows students to browse, purchase, and learn accounting and financial courses while providing admins with a robust dashboard to manage the platform.

## 2. Target Audience
- **Students**: Professionals or students looking to learn accounting/ERP systems (like Odoo).
- **Administrators**: Academy owners and staff managing content, users, and finances.

## 3. Core Modules & User Flows

### A. Public Website (Frontend)
1. **Landing Page**: 
   - Hero section with academy intro.
   - Featured courses list.
   - "About Us" and "Contact Us" previews.
2. **Authentication**:
   - Sign Up (Name, Email, Password).
   - Login.
   - *Missing: Forgot Password / Reset Password.*
3. **Course Exploration**:
   - Course Listing (Search and Filter).
   - Course Details (Syllabus, Audience, Price, Intro Video).
4. **Learning Experience**:
   - Course Learn Page (Video player, lesson list).
   - Quizzes (Intermediate and Final).
   - *Missing: Certificate generation upon completion.*
5. **Student Dashboard**:
   - "My Courses" list.
   - Continue Learning (Jump back to the last lesson).
   - *Missing: Profile management (Edit name, avatar, change password).*

### B. Admin Dashboard (Backend Management)
1. **RBAC (Role-Based Access Control)**:
   - Dynamic role creation.
   - Granular permission assignment (e.g., `courses:read`, `finance:write`).
2. **Content Management**:
   - Courses: Create/Edit courses, lessons, and quizzes.
   - About Page: Dynamic content management (localized titles, rich text content, hero image, video link).
3. **User Management**:
   - View/Edit/Delete users.
   - Assign roles to employees.
4. **Financial Management**:
   - Orders: View and track course purchases.
   - Coupons: Create and manage discount codes.
   - Subscriptions: Manage user access levels.
5. **Support Management**:
   - Contact Messages: View and respond to user inquiries.
   - Contact Info: Update public contact details (Phone, Email, Social links).

## 4. Technical Stack
- **Frontend**: React (Vite), Vanilla CSS, Lucide Icons.
- **Admin Dashboard**: React (Vite), CSS.
- **Backend**: Node.js (Express), ESM.
- **Database**: Prisma ORM with MySQL/PostgreSQL.
- **Authentication**: JWT (JSON Web Tokens) with Secure HTTP-Only Cookies.

## 5. Identified Gaps & Missing Features
1. **Checkout Flow**: The current "Buy Now" button bypasses payment. A checkout page with order confirmation and payment simulator (or integration) is required.
2. **Profile Section**: Students need a dedicated space to manage their account details.
3. **Password Recovery**: Implementation of a "Forgot Password" email flow.
4. **Search/Filtering**: The courses page needs a functional search bar and category filters.
5. **Admin Reporting**: A dashboard overview with charts for revenue and student enrollment trends.
6. **Certificate Module**: Automatic generation of PDF certificates upon course completion.

## 6. Success Metrics
- Seamless transition between Arabic and English (LTR/RTL support).
- Stable and secure RBAC system.
- fully dynamic "About" and "Contact" sections managed from the dashboard.
- High performance and premium look and feel.