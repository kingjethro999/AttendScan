@AGENTS.md

# CLAUDE.md — AttendScan

## Project Overview

**AttendScan** is a web-based Progressive Web App (PWA) for QR-code-driven attendance management in academic settings. Lecturers generate time-limited QR codes displayed via projector; students scan them on their own devices to mark attendance. Built with Next.js, Prisma, and PostgreSQL hosted on Render.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Database | PostgreSQL (Render) |
| ORM | Prisma |
| Auth | NextAuth.js v5 (credentials + JWT) |
| Styling | Tailwind CSS |
| Icons | Lucide React (no emojis anywhere in the UI) |
| QR Generation | `qrcode.react` |
| QR Scanning | `html5-qrcode` |
| CSV/Excel Export | `papaparse` + `xlsx` |
| PWA | `next-pwa` |
| Deployment | Vercel (frontend) + Render (Postgres) |

---

## Repository Structure

```
attendscan/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                  # Sidebar layout shared by all dashboard pages
│   │   ├── lecturer/
│   │   │   ├── home/
│   │   │   │   └── page.tsx            # Lecturer home — metrics cards
│   │   │   ├── courses/
│   │   │   │   ├── page.tsx            # My Courses — list + create
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx        # Single course — attendance table + QR modal
│   │   │   └── history/
│   │   │       └── page.tsx            # History — courses dropdown → date-collapsed attendance
│   │   └── student/
│   │       ├── home/
│   │       │   └── page.tsx            # Student home — metrics cards
│   │       ├── scan/
│   │       │   └── page.tsx            # QR scanner page
│   │       └── history/
│   │           └── page.tsx            # Student attendance history
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── courses/
│   │   │   ├── route.ts                # GET all courses for lecturer, POST create course
│   │   │   └── [id]/
│   │   │       └── route.ts            # GET single course + its attendance
│   │   ├── qr/
│   │   │   └── generate/
│   │   │       └── route.ts            # POST — create a QR session token with expiry
│   │   ├── attendance/
│   │   │   └── submit/
│   │   │       └── route.ts            # POST — student submits attendance via scanned token
│   │   └── export/
│   │       └── [courseId]/
│   │           └── route.ts            # GET — export attendance as CSV or Excel
│   ├── landing/
│   │   └── page.tsx                    # Public landing page
│   └── layout.tsx                      # Root layout
├── components/
│   ├── ui/                             # Reusable primitives (Button, Card, Badge, Modal, etc.)
│   ├── sidebar/
│   │   ├── LecturerSidebar.tsx
│   │   └── StudentSidebar.tsx
│   ├── courses/
│   │   ├── CourseCard.tsx
│   │   ├── CreateCourseForm.tsx
│   │   └── AttendanceTable.tsx
│   ├── qr/
│   │   ├── QRGeneratorModal.tsx        # Lecturer QR generation + display modal
│   │   └── QRScanner.tsx              # Student scanner component
│   ├── history/
│   │   ├── CourseDropdown.tsx
│   │   └── DateCollapsible.tsx
│   └── metrics/
│       ├── LecturerMetrics.tsx
│       └── StudentMetrics.tsx
├── lib/
│   ├── prisma.ts                       # Prisma client singleton
│   ├── auth.ts                         # NextAuth config
│   ├── qr-token.ts                     # QR token generation + validation logic
│   └── export.ts                       # CSV + Excel export helpers
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
│   ├── manifest.json                   # PWA manifest
│   └── icons/                         # PWA icons (192, 512)
├── middleware.ts                       # Route protection by role
├── next.config.js
├── tailwind.config.ts
└── .env
```

---

## Database Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  LECTURER
  STUDENT
}

model User {
  id          String       @id @default(cuid())
  firstName   String
  lastName    String
  email       String       @unique
  password    String       // bcrypt hashed
  role        Role
  studentId   String?      @unique  // only for STUDENT role
  createdAt   DateTime     @default(now())

  // Relations
  courses     Course[]     // lecturer's courses
  attendance  Attendance[] // student's attendance records
}

model Course {
  id          String       @id @default(cuid())
  name        String
  code        String       // e.g. CSE 201
  lecturerId  String
  createdAt   DateTime     @default(now())

  lecturer    User         @relation(fields: [lecturerId], references: [id])
  attendance  Attendance[]
  qrSessions  QRSession[]
}

model QRSession {
  id          String       @id @default(cuid())
  courseId    String
  token       String       @unique  // UUID used in QR payload
  expiresAt   DateTime
  createdAt   DateTime     @default(now())
  used        Boolean      @default(false)

  course      Course       @relation(fields: [courseId], references: [id])
  attendance  Attendance[]
}

model Attendance {
  id          String     @id @default(cuid())
  studentId   String
  courseId    String
  sessionId   String
  timestamp   DateTime   @default(now())

  student     User       @relation(fields: [studentId], references: [id])
  course      Course     @relation(fields: [courseId], references: [id])
  session     QRSession  @relation(fields: [sessionId], references: [id])

  @@unique([studentId, sessionId]) // prevent duplicate scans per session
}
```

---

## Environment Variables (`.env`)

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Authentication

- **Library**: NextAuth.js v5 with Credentials provider
- **Session strategy**: JWT
- **Password hashing**: `bcryptjs`
- **Registration flow**:
  - Shared `/register` page with a **Role selector** (Lecturer / Student)
  - Student registration requires: First Name, Last Name, Email, Password, Student ID
  - Lecturer registration requires: First Name, Last Name, Email, Password
- **Login flow**: Email + Password → JWT with `{ id, role, firstName }`
- **Route protection**: `middleware.ts` reads JWT role and redirects:
  - `/lecturer/*` → only `Role.LECTURER`
  - `/student/*` → only `Role.STUDENT`
  - Unauthenticated users → `/login`

---

## Pages & Features

### Landing Page (`/`)

Public marketing page. Contains:
- App name + tagline
- Feature highlights (QR attendance, PWA, real-time)
- CTA buttons: **Get Started** (→ `/register`) and **Sign In** (→ `/login`)
- No auth required

---

### Auth Pages

#### `/register`
Form fields:
- First Name, Last Name
- Email, Password
- Role toggle: **Lecturer** | **Student**
- If Student: additional **Student ID** field

Validation: all fields required, email unique, student ID unique for students.

#### `/login`
- Email + Password
- On success: redirect based on role → `/lecturer/home` or `/student/home`

---

### Sidebar Layout (`(dashboard)/layout.tsx`)

The sidebar is the primary navigation. It is **role-aware** — renders `LecturerSidebar` or `StudentSidebar` based on JWT role. Sidebar collapses to icon-only on mobile (PWA).

#### Lecturer Sidebar Links
| Icon | Label | Route |
|---|---|---|
| `LayoutDashboard` | Home | `/lecturer/home` |
| `BookOpen` | My Courses | `/lecturer/courses` |
| `ClockCounterClockwise` | History | `/lecturer/history` |
| `LogOut` | Log Out | triggers `signOut()` |

#### Student Sidebar Links
| Icon | Label | Route |
|---|---|---|
| `LayoutDashboard` | Home | `/student/home` |
| `QrCode` | Scan | `/student/scan` |
| `ClockCounterClockwise` | History | `/student/history` |
| `LogOut` | Log Out | triggers `signOut()` |

---

### Lecturer — Home (`/lecturer/home`)

Displays metric cards fetched on load:

| Icon | Metric | Description |
|---|---|---|
| `QrCode` | QR Codes Generated | Total QR sessions created by this lecturer |
| `Users` | Total Scans | Unique attendance records across all courses |
| `BookOpen` | Total Courses | Number of courses created |
| `TrendingUp` | Today's Scans | Attendance records from today |

Each card shows current value + a subtle label. Cards are responsive grid: 2-col on mobile, 4-col on desktop.

---

### Lecturer — My Courses (`/lecturer/courses`)

- Lists all courses belonging to the logged-in lecturer as **cards**
- Each card shows: Course Name, Course Code, total students who have attended, date created
- If no courses exist: empty state with `BookOpen` icon and **Create your first course** prompt
- **Create Course** button (top right) opens an inline form or modal:
  - Fields: Course Name (e.g. "Data Structures"), Course Code (e.g. "CSE 201")
  - On submit: `POST /api/courses`
- Clicking a course card navigates to `/lecturer/courses/[id]`

---

### Lecturer — Single Course (`/lecturer/courses/[id]`)

This is the most feature-rich page.

**Top section:**
- Course name + code as heading
- **Export** button with dropdown: `Export as CSV` | `Export as Excel`
- **Generate QR Code** button (primary action)

**Attendance Table:**
- Grouped by date (most recent first)
- Each date is a collapsible section header
- Inside each date: table with columns:
  - Name (First + Last)
  - Student ID
  - Course
  - Timestamp (HH:MM:SS)
- Empty state if no attendance yet

**Generate QR Code Modal:**

Triggered by clicking **Generate QR Code**. Modal contains:
- **Select Course**: pre-filled with current course (locked)
- **Time Frame selector**: dropdown options:
  - 2 minutes
  - 5 minutes
  - 6 minutes
  - 10 minutes
  - 15 minutes
  - 30 minutes
  - Custom (number input in minutes)
- **Generate** button
- On generation:
  - Calls `POST /api/qr/generate` with `{ courseId, durationMinutes }`
  - API creates a `QRSession` record with `expiresAt = now + duration`
  - Returns `{ token, expiresAt }`
  - QR code is rendered client-side using `qrcode.react` encoding the URL: `{APP_URL}/attend?token={token}`
  - Countdown timer displayed below the QR code (live, counts down to 0)
  - At 0: QR code grays out and a badge reads **Expired**
  - Warning banner: `"Do not close this modal or refresh the page — students are scanning"`
  - Close button is visible but triggers a confirmation dialog: **"Are you sure? Active students may not finish scanning."**

---

### Lecturer — History (`/lecturer/history`)

- **Course dropdown** at top: lists all lecturer's courses
- Selecting a course loads its full attendance grouped by date
- Each date is a `<details>` / accordion component (collapsed by default)
- Inside each date: same table structure as single course page (Name, Student ID, Course, Timestamp)
- Export button mirrors the single course export but scoped to selected course

---

### Student — Home (`/student/home`)

Metric cards:

| Icon | Metric |
|---|---|
| `CheckCircle` | Total Sessions Attended |
| `BookOpen` | Courses Attended |
| `Calendar` | This Month's Attendance |
| `Clock` | Last Scan Timestamp |

---

### Student — Scan (`/student/scan`)

- Camera viewfinder using `html5-qrcode`
- **Scan** button activates camera
- On successful decode of a QR code URL containing a token:
  - Extracts `token` from URL
  - Calls `POST /api/attendance/submit` with `{ token }`
  - API validates token:
    - Checks `QRSession` exists and `expiresAt > now`
    - Checks student hasn't already submitted for this session (`@@unique` constraint)
    - If valid: creates `Attendance` record, returns `{ success: true, courseName, timestamp }`
    - If expired: returns `{ success: false, reason: "QR code has expired" }`
    - If duplicate: returns `{ success: false, reason: "Attendance already recorded" }`
  - Success state: green banner with `CheckCircle` icon, course name, timestamp
  - Error state: red banner with `XCircle` icon, reason message
- PWA camera permission is requested on first visit; persisted

---

### Student — History (`/student/history`)

- Full list of attendance records for the logged-in student
- Grouped by course, then by date (collapsible)
- Each row: Course Code, Date, Time, Session duration window
- Empty state: `ClockCounterClockwise` icon + **"No attendance records yet. Start by scanning a QR code."**

---

## API Routes

### `POST /api/auth/register`
Creates a new user. Body: `{ firstName, lastName, email, password, role, studentId? }`. Hashes password with bcrypt. Returns 201 or error.

### `GET /api/courses`
Returns all courses for the authenticated lecturer.

### `POST /api/courses`
Creates a new course. Body: `{ name, code }`. Attaches to authenticated lecturer.

### `GET /api/courses/[id]`
Returns course details + all attendance records grouped by date. Validates lecturer owns the course.

### `POST /api/qr/generate`
Body: `{ courseId, durationMinutes }`.
- Creates a `QRSession` with `token = uuid()` and `expiresAt = now + durationMinutes`
- Returns `{ token, expiresAt, qrUrl }`
- Lecturer must own the course

### `POST /api/attendance/submit`
Body: `{ token }`.
- Finds `QRSession` by token
- Validates not expired
- Validates student not already recorded for session
- Creates `Attendance` record
- Returns `{ success, courseName, timestamp }` or `{ success: false, reason }`

### `GET /api/export/[courseId]?format=csv|excel`
- Fetches all attendance for the course
- Flattens into rows: `[Date, Name, Student ID, Course Code, Timestamp]`
- `csv`: streams CSV via `papaparse`
- `excel`: generates `.xlsx` via `xlsx` library
- Sets appropriate `Content-Disposition` headers

---

## QR Code Logic (Detail)

The QR code contains a URL: `https://attendscan.app/attend?token=<uuid>`

**Frontend (lecturer modal):**
- `qrcode.react` renders the QR code entirely client-side — no server image generation
- Token + expiry are stored in React state only (not persisted in localStorage)
- A `setInterval` counts down seconds; at 0 the QR renders with 30% opacity and an **Expired** overlay

**Backend (`/api/attendance/submit`):**
- Token lookup: `prisma.qRSession.findUnique({ where: { token } })`
- Expiry check: `session.expiresAt > new Date()`
- Duplicate check: Prisma upsert throws on `@@unique([studentId, sessionId])` violation — caught and returned as a friendly error
- On success: `prisma.attendance.create(...)` with `studentId` from JWT, `courseId` from session, `sessionId` from session

---

## Export Format

**CSV columns:**
```
Date, First Name, Last Name, Student ID, Course Name, Course Code, Timestamp
```

**Excel columns (same)** — styled with bold header row, auto column widths.

Filename format: `AttendScan_{CourseCode}_{YYYY-MM-DD}.csv` / `.xlsx`

---

## PWA Configuration

`next-pwa` wraps Next.js. `public/manifest.json`:

```json
{
  "name": "AttendScan",
  "short_name": "AttendScan",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0f172a",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Key PWA behaviors:
- Installable on Android and iOS home screen
- Camera access persisted after first grant
- Offline: cached shell + auth pages; attendance submission requires connectivity (by design — no offline queue)

---

## Responsiveness

| Breakpoint | Sidebar | Layout |
|---|---|---|
| `< 768px` | Hidden; hamburger menu triggers slide-over drawer | Single column |
| `768px – 1024px` | Icon-only collapsed sidebar | 2-col grids |
| `> 1024px` | Full sidebar with labels | 4-col metric grids |

Attendance tables scroll horizontally on mobile. QR modal is full-screen on mobile, centered card on desktop.

---

## Middleware (`middleware.ts`)

```ts
// Protect routes by role
// /lecturer/* → Role.LECTURER only
// /student/*  → Role.STUDENT only
// /api/courses, /api/qr, /api/export → LECTURER only
// /api/attendance/submit → STUDENT only
// /login, /register, / → public
```

Uses `getToken()` from `next-auth/jwt` to read role without a DB call on every request.

---

## Development Commands

```bash
# Install dependencies
npm install

# Set up database
npx prisma migrate dev --name init
npx prisma generate

# Run dev server
npm run dev

# Open Prisma Studio
npx prisma studio

# Build for production
npm run build
npm start
```

---

## Key Implementation Notes

1. **QR token is a UUID v4** — generated server-side via `crypto.randomUUID()` in the API route. Never reuse tokens.

2. **No QR image stored on server** — the QR is rendered purely client-side from the token string. The server only stores the token + expiry in `QRSession`.

3. **Duplicate attendance prevention** — enforced at the database level via `@@unique([studentId, sessionId])` in Prisma schema, not just application logic.

4. **Lecturer course ownership** — every API route that touches a course verifies `course.lecturerId === session.user.id`. Never trust the client to assert ownership.

5. **Student ID is immutable** — set at registration, never editable. Used as the human-readable identifier in all attendance exports.

6. **Export route is streaming** — for large courses, pipe the response rather than buffering the full dataset in memory.

7. **Time frame options** — the 6-minute default aligns with the described classroom use case. Always store `expiresAt` as an absolute UTC timestamp, never a duration, to avoid clock-skew issues between client and server.

8. **Camera on scan page** — `html5-qrcode` requires the page to be served over HTTPS in production (Vercel handles this). In local dev, `localhost` is treated as a secure context by browsers.

9. **Render Postgres** — set `connection_limit` in `DATABASE_URL` to `?connection_limit=5` to stay within Render's free tier connection pool.

10. **NextAuth secret** — generate with `openssl rand -base64 32` and set in both `.env` and Vercel environment variables.