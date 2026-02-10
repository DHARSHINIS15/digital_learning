# Digital Learning Experience Optimizer

Full-stack web application for enhancing and optimizing digital learning experiences with secure login, role-based access, course management, progress tracking, analytics dashboards, reporting, and notifications.

## Tech Stack

- **Frontend:** React (Vite), React Router DOM, Axios, Recharts, Material UI, Formik + Yup
- **Backend:** Node.js, Express.js, JWT, bcrypt, CORS, REST API
- **Database:** MySQL (mysql2)

## Prerequisites

- Node.js (v18+)
- MySQL Server
- npm or yarn

## Setup

### 1. Database

1. Create MySQL database and run the schema script:

```bash
mysql -u root -p < database.sql
```

Or open MySQL client and run the contents of `database.sql`.

2. Seed the default admin user (optional but recommended):

```bash
cd backend
npm run seed
```

Default admin: **admin@dleo.com** / **Admin@123**

### 2. Backend

1. Navigate to backend folder and install dependencies:

```bash
cd backend
npm install
```

2. Create a `.env` file (copy from `.env.example`):

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=digital_learning_optimizer
```

3. Start the server:

```bash
npm run dev
```

Backend runs at **http://localhost:5000**.

### 3. Frontend

1. Navigate to frontend folder and install dependencies:

```bash
cd frontend
npm install
```

2. (Optional) Create `.env` for API URL:

```env
VITE_API_URL=http://localhost:5000/api
```

If you use Vite's dev proxy (default), you can set `VITE_API_URL=/api` so requests go through the proxy to the backend.

3. Start the development server:

```bash
npm run dev
```

Frontend runs at **http://localhost:5173** (or the port Vite shows).

## Running Both Servers

1. **Terminal 1 – Backend:**

```bash
cd backend
npm run dev
```

2. **Terminal 2 – Frontend:**

```bash
cd frontend
npm run dev
```

3. Open **http://localhost:5173** in the browser and log in with the admin user (or any user created by admin).

## User Roles

| Role        | Access                                                                 |
|------------|-------------------------------------------------------------------------|
| **Admin**  | Dashboard, Manage Users, Manage Courses, full system oversight         |
| **Instructor** | Dashboard, My Courses, Add/Edit lessons, Reports, create notifications |
| **Student**    | Dashboard, Courses (enroll/view), Progress, Notifications               |

## API Overview

- **Auth:** `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- **Admin:** `POST /api/admin/create-user`, `GET/PUT/DELETE /api/admin/users`
- **Courses:** CRUD at `/api/courses`, lessons at `/api/courses/:id/lessons` and `/api/lessons/:id`
- **Enroll:** `POST /api/enroll/:courseId`, `GET /api/enroll/my`
- **Progress:** `POST /api/progress/update`, `GET /api/progress/my`, `GET /api/progress/student/:id`
- **Analytics:** `GET /api/analytics/admin`, `/api/analytics/instructor/:id`, `/api/analytics/student/:id`
- **Reports:** `GET /api/reports/student/:id`, `/api/reports/course/:id`, `/api/reports/download/:id`
- **Notifications:** `GET /api/notifications`, `POST /api/notifications`, `PUT /api/notifications/:id/read`

## Project Structure

```
/frontend
  src/
    components/    # Sidebar, Navbar, Layout, ProtectedRoute
    context/       # AuthContext
    pages/         # Login, admin/, instructor/, student/
    routes/        # Route definitions
    services/      # api.js
    utils/
/backend
  config/          # db.js
  controllers/
  middleware/      # auth, roleCheck
  routes/
  scripts/        # seedAdmin.js
  utils/
  server.js
database.sql       # MySQL schema
```

## Security

- JWT authentication for protected routes
- Role-based middleware (admin, instructor, student)
- Passwords hashed with bcrypt
- Store `JWT_SECRET` and DB credentials in `.env` only

## Notifications

- New lesson added → enrolled students get a "new_content" notification
- Notifications stored in DB; users can mark as read/unread
- Optional: low-engagement and deadline alerts can be implemented via a cron or scheduled job using `utils/notifyHelper.js`

## Reporting

- Instructor/Admin can view course-wise and student-wise reports
- Export report data as JSON (frontend can convert to CSV/PDF if needed)
