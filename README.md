# AI-Powered Canvas (AILMS): The AI-native LMS I built end-to-end

Hi, I’m Simon. I designed and built an AI-powered Learning Management System (LMS) that modernizes attendance, course workflows, and student–faculty interactions. It blends great UX with secure, real-time data and an AI assistant layer that’s ready for production.

## Why I built this
- I wanted to reimagine everyday classroom operations (attendance, course tracking, student visibility) with automation and AI.
- I focused on a clean, role-based experience: professors get the tools they need; students get clarity and progress.
- I made it production-minded: secure auth, enforceable data rules, and an API layer for AI services.

## Highlights (quick scan)
- Role-based dashboards for Students and Professors
- One-click Google Sign-In with domain restrictions (school emails only)
- AI-assisted attendance flow (camera/upload → review → confirm)
- Real-time data model and Firestore security rules
- Polished, responsive UI with dark/light mode

## What the app does (plain English)
- Professors can take attendance using a guided flow, review suggestions, and confirm results. They can also view history and manage courses.
- Students can enroll in classes, see attendance progress, and manage their profile.
- Everyone signs in with Google; only approved school domains can create profiles. Users only see their own data.

## Tech at a glance (for engineers)
- Frontend: React + Vite + Tailwind CSS v4 + Firebase (Auth + Firestore)
- Backend: FastAPI + Firebase Admin + AI services scaffold (Whisper/OpenAI)
- Data safety: Firestore rules enforce domain checks and per-user access

## Repo map
- Frontend: `ailms/frontend/`
- Backend: `ailms/CascadeProjects/windsurf-project/`
- Firestore rules: `ailms/frontend/firestore.rules`

## Status and what’s next
- Today: fully working role-based frontend with an AI attendance demo flow and secure auth. Backend scaffolding is ready for transcription and recognition.
- Next: plug in a production face recognition pipeline, persist attendance to Firestore, add analytics and exports, and expand test coverage.

## My role
- Built the frontend UI/UX, authentication, and role-based flows
- Designed the data model and wrote Firestore rules
- Set up the FastAPI backend with Firebase Admin and AI service scaffolds
- Planned the AI attendance path from demo to production

---

## Technical Overview (Appendix)
This section explains my AI-powered Learning Management System (LMS): what it does, how it’s built, and how everything connects. It’s grounded in the current project code:

- Frontend (React + Vite + Tailwind CSS + Firebase): `ailms/frontend/`
- Backend (FastAPI + Firebase Admin + Whisper + OpenAI): `ailms/CascadeProjects/windsurf-project/`
- Security rules (Firestore): `ailms/frontend/firestore.rules`

The goal is to give readers a quick understanding of the system, while also providing enough technical detail for developers.

---

## What Problem Are We Solving?
Managing attendance, course information, and student–professor interactions can be tedious and error-prone. Our system reduces that burden by combining a clean, role-based UI with AI features like speech transcription and an extensible pipeline for AI attendance.

---

## What the System Does (At a Glance)
- **Sign in with Google** and create a user profile in Firestore.
- **Role-based dashboards** for students and professors.
- **Attendance tracking** and history views.
- **A guided AI attendance demo flow** (camera/upload → process → review → complete).
- **Optional AI services** on the backend for transcription and intelligent responses.

---

## Frontend: React + Firebase + Tailwind
- Location: `ailms/frontend/`
- Key pieces:
  - **Firebase client setup**: `src/firebase_config.js` initializes Firebase Auth and Firestore using `VITE_*` environment variables.
  - **Theme context (dark/light mode)**: `src/context/Theme.jsx` and Tailwind classes are used throughout the app for consistent theming.
  - **Student pages**: `src/pages/student/`
    - `StudentDashboard.jsx`, `StudentProfile.jsx`, `ClassEnrollment.jsx`, `AttendanceTracker.jsx`
    - Example: `AttendanceTracker.jsx` shows course summaries and a recent records table with overflow-safe layout.
  - **Professor pages**: `src/pages/professor/`
    - `ProfessorDashboard.jsx`, `ProfessorProfile.jsx`, `FacialRecognitionAttendance.jsx`, `AttendanceHistory.jsx`
    - `ProfessorDashboard.jsx` provides tabs for Profile, AI Attendance, Manual Attendance, History, and Courses.

### Why this matters
- The UI is clean, responsive, and consistent across themes.
- The code is ready to swap mock data for real Firestore collections when desired.

---

## Authentication and Authorization
- **Client-side Auth**: Google Sign-In using Firebase (`src/firebase_config.js`).
- **Firestore security rules**: `frontend/firestore.rules` enforces:
  - Only allowed domains (`@student.sfbu.edu`, `@sfbu.edu`) can create user profiles.
  - Users can read their own profile (`/users/{uid}`) and their own subcollections.
  - Owner tabs and user messages are scoped to the authenticated user’s UID.

This ensures users only see and write data they own.

---

## Backend: FastAPI + Firebase Admin + AI Services
- Location: `ailms/CascadeProjects/windsurf-project/`
- Key files:
  - `app/core/firebase_config.py`: Creates a singleton Firebase Admin client using `GOOGLE_APPLICATION_CREDENTIALS`.
  - `app/core/config.py`: Loads environment variables and settings.
  - `app/repository/Rag_data_handler.py`: Saves and reads user AI messages in Firestore under `/users/{uid}/tab_id/{tab}/messages/*`.
  - `app/services/transcribe_audio_service.py`: Records audio, prepares tensors for Whisper, and is designed to store results server-side.
  - `main.py`: App startup loads OpenAI and Whisper, initializes Firestore, and configures email settings.

### Why this matters
- The backend can safely perform privileged operations using Firebase Admin (no secrets in the client).
- It creates a solid foundation for production-grade AI features (transcription, recognition, summarization).

---

## AI Attendance: Current Demo and Next Steps
- Frontend demo (`ProfessorDashboard.jsx` → `FacialRecognitionAttendance.jsx`) walks through a friendly, staged flow:
  1. Choose camera or upload.
  2. Uploading/processing.
  3. Review recognized vs unknown faces.
  4. Confirm and complete.
- Today, this is a guided UI flow with mock results.
- **Recommended production path**:
  - Frontend sends images to a FastAPI endpoint.
  - Backend performs detection/recognition (GPU or cloud vision service).
  - Backend writes attendance results to Firestore.
  - UI refreshes from Firestore and shows final verified statuses.

---

## Data Model and Rules (Simple and Safe)
- Profiles: `/users/{uid}`
- User-owned messages: `/users/{uid}/tab_id/{tab}/messages/{messageId}`
- Owner tabs: `/owner/{userId}/tabs/{tabId}`
- Rules enforce domain checks and identity ownership (see `frontend/firestore.rules`).

---

## Deployment Notes
- **Frontend**: Vite app; configure `VITE_*` Firebase env vars.
- **Backend**: FastAPI app; configure `.env` with `OPENAI_API_KEY` and `GOOGLE_APPLICATION_CREDENTIALS`.
- **Security**:
  - Don’t expose Admin credentials to the frontend.
  - Lock down CORS and require authentication/claims for backend endpoints.

---

## Limitations and Future Work
- AI attendance is a demo; needs a real recognition pipeline for production.
- Add Firestore-backed course rosters and attendance records.
- Provide exports/reports and admin analytics.
- Add automated tests and CI/CD.

---

## Expanded Figure Captions
Use the following with your screenshots. Update numbering to match your actual figures.

- **Figure 1. Student Dashboard (Overview)**
  Shows student-specific cards and navigation. Uses the shared theme context (`src/context/Theme.jsx`) for dark/light mode. Sign-in state comes from Firebase (`src/firebase_config.js`).

- **Figure 2. Class Enrollment (Enrolled vs Available)**
  Displays enrolled and available course lists with consistent cards and hover states. Enroll/Drop actions are wired in the UI and ready to connect to Firestore. Source: `student/ClassEnrollment.jsx`.

- **Figure 3. Attendance Tracker (Student View)**
  Top cards summarize course attendance percentages with progress bars; the table lists recent records. The layout prevents overflow and keeps content scrollable when needed. Source: `student/AttendanceTracker.jsx`.

- **Figure 4. Professor Dashboard (Tabs and Context)**
  Tabbed interface (Profile, AI Attendance, Manual, History, Courses) in `professor/ProfessorDashboard.jsx`. Active tab styling adapts to dark/light mode.

- **Figure 5. AI-Powered Attendance (Guided Stages)**
  `FacialRecognitionAttendance.jsx` walks through capture/upload → processing → review → completion. In production, this would call a FastAPI endpoint for detection/recognition and then update Firestore.

- **Figure 6. Attendance History (Filters and Table)**
  `AttendanceHistory.jsx` provides filters (course/method) and a table with view/edit modals. Designed to bind to Firestore records with status badges and computed rates.

- **Figure 7. Authentication Flow (Google SSO)**
  `src/firebase_config.js` initializes Firebase with environment variables and sets up Google sign-in. On first login, the app creates a profile in `/users/{uid}` and reads the role to switch dashboards.

- **Figure 8. Firestore Rules (Security by Identity and Domain)**
  `frontend/firestore.rules` enforces allowed email domains for profile creation, restricts reads to the owning user, and scopes subcollection access by UID.

- **Figure 9. Backend Architecture (FastAPI + Firebase + AI)**
  `main.py` initializes OpenAI and Whisper; `app/core/firebase_config.py` sets up a Firebase Admin singleton. AI services and Firestore writes happen server-side.

- **Figure 10. End-to-End Flow (Proposed Production)**
  User action → Firebase Auth → Frontend → FastAPI → AI services (Whisper/Vision/OpenAI) → Firestore → Frontend update. This design supports identity checks, course roster validation, and auditable attendance.

---

## Quick References
- Frontend Firebase init: `frontend/src/firebase_config.js`
- Firestore rules: `frontend/firestore.rules`
- Theme provider: `frontend/src/context/Theme.jsx`
- Student pages: `frontend/src/pages/student/`
- Professor pages: `frontend/src/pages/professor/`
- Backend settings: `ailms/CascadeProjects/windsurf-project/app/core/config.py`
- Firebase Admin init: `ailms/CascadeProjects/windsurf-project/app/core/firebase_config.py`
- Server Firestore writes: `ailms/CascadeProjects/windsurf-project/app/repository/Rag_data_handler.py`
- Audio/Whisper scaffold: `ailms/CascadeProjects/windsurf-project/app/services/transcribe_audio_service.py`
- App startup: `ailms/CascadeProjects/windsurf-project/main.py`

---

## How to Use This Content
- If you keep the original `.docx`, copy-paste these sections in place.
- If you prefer, I can convert this Markdown to `.docx` and save it as `AI_Powered_Canvas_Project_Report_Improved.docx`.
