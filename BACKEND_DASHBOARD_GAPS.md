# SAH Academy - Backend & Admin Dashboard Gaps

## 1. Backend Gaps (Technical & Logical)

### A. Security & Performance
- **Rate Limiting**: Protect authentication and contact form endpoints from brute-force/spam attacks.
- **Advanced Logging**: Implement an Audit Trail system to log every sensitive admin action (e.g., changing permissions, deleting courses).
- **Video Security**: Secure video content by implementing signed URLs or integrating with private hosting (Vimeo/Wistia) to prevent unauthorized downloads.
- **Request Validation**: Strengthen Zod schemas for all complex inputs (Course creation, RBAC assignments).

### B. Functional Features
- **Email Service**: Integration with Nodemailer/SendGrid for:
  - Password Reset flow.
  - Order receipts.
  - Welcome emails.
- **Payment Integration**: Implement a real payment gateway (Stripe, Moyasar, or Tap) to replace the current manual/placeholder checkout.
- **PDF Generation**: Logic to generate dynamic certificates of completion using libraries like `pdfkit` or `puppeteer`.
- **Database Backups**: Automated scripts to backup the database and media assets.

## 2. Admin Dashboard Gaps (UI & Management)

### A. Visualization & Analytics
- **Dashboard Overview**: Add charts (Line/Bar charts) using `Recharts` or `Chart.js` to visualize:
  - Monthly Revenue.
  - New Students Enrollment.
  - Most Popular Courses.
- **Sales Reports**: Dedicated page to export financial data as CSV/Excel.

### B. Content Management Enhancements
- **Rich Text Editor**: Replace simple `textarea` fields with a professional editor (e.g., `React-Quill` or `TinyMCE`) for Lesson content and About sections.
- **Central Media Manager**: A UI to manage all uploaded images and assets in one place.
- **Bulk Operations**: Ability to perform actions on multiple users or orders at once.

### C. Advanced Student Tracking
- **Detailed Progress View**: A modal or page showing exactly which lessons a specific student has completed and their quiz scores.
- **Manual Enrollment**: Ability for admins to manually grant course access to specific students.

### D. Global Settings
- **Site Configuration**: A page to manage:
  - Site Title & Logo.
  - Social Media Links (global).
  - SEO Metadata (Keywords, Descriptions).
  - Maintenance Mode toggle.

## 3. Deployment & DevOps
- **CI/CD Pipeline**: Automated deployment to production (e.g., GitHub Actions to VPS).
- **Environment Management**: Proper staging vs production environments.
- **SSL/HTTPS Configuration**: Ensuring secure communication for the API.
