# StudyTracker - Student Productivity Web Application

#### Video Demo: [URL TO BE ADDED]

#### Description:

StudyTracker is a comprehensive web-based student productivity application designed to help students manage their coursework, track assignments, monitor study time, and visualize their academic progress. Built as my CS50 final project, StudyTracker addresses the common challenge students face when juggling multiple courses, assignment deadlines, and study sessions across different subjects.

## What StudyTracker Does

StudyTracker combines five core features into a unified platform:

1. **Course Management**: Students can create and organize courses with custom colors, instructor names, and meeting schedules. Each course acts as a container for assignments and study sessions.

2. **Assignment Tracking**: Create detailed assignments with due dates, priorities (low/medium/high), and status tracking (not started/in progress/completed). Assignments are automatically sorted by deadline and color-coded by their associated course.

3. **Calendar View**: A visual monthly calendar displays all upcoming assignments with color-coded indicators matching their course colors. Students can click on any date to see all assignments due that day.

4. **Pomodoro Timer**: An integrated study timer using the Pomodoro technique (25-minute work sessions with 5-minute breaks by default). Students can link study sessions to specific courses or assignments, and completed sessions are automatically saved to build a study history.

5. **Analytics Dashboard**: Visual charts and statistics show study time distribution across courses, assignment completion rates, priority distributions, and 30-day completion trends. This helps students understand their productivity patterns and identify where they spend their time.

## Technology Stack

**Backend (Python/Flask)**:
- **Flask 3.0.0**: Lightweight web framework serving both API endpoints and static files
- **Flask-SQLAlchemy 3.1.1**: ORM for database operations with SQLite
- **Flask-Login 0.6.3**: Session-based authentication and user management
- **Flask-CORS 4.0.0**: Cross-origin resource sharing for development
- **Werkzeug 3.0.0**: Secure password hashing with PBKDF2-SHA256

**Frontend (React)**:
- **React 18.2.0**: Component-based UI library with hooks for state management
- **React Router DOM 6.20.0**: Client-side routing for single-page application behavior
- **Bootstrap 5.3.0**: Responsive UI component library
- **Axios 1.6.0**: HTTP client for API communication with interceptors
- **Chart.js 4.4.0 + react-chartjs-2**: Data visualization with bar, line, and pie charts
- **date-fns 2.30.0**: Modern date manipulation and formatting library

**Database**: SQLite with a normalized schema including Users, Courses, Assignments, and StudySession tables with proper foreign key relationships and CASCADE/SET NULL behaviors.

## Project Structure and File Purposes

**Backend Files**:
- `app.py` (57 lines): Flask application entry point that initializes the database, configures Flask-Login, registers API routes, and serves the React production build
- `backend/models.py` (152 lines): SQLAlchemy database models defining the schema with relationships, including User (with Flask-Login UserMixin), Course, Assignment, and StudySession models
- `backend/routes.py` (696 lines): Complete REST API with 17 endpoints covering authentication (register, login, logout), CRUD operations for courses/assignments/study sessions, and analytics aggregation
- `backend/utils.py` (32 lines): Validation helpers for email format, hex colors, usernames, passwords, and date calculations
- `requirements.txt`: Python dependencies specification for pip installation

**Frontend Structure**:
- `frontend/src/index.js`: React entry point rendering the App component
- `frontend/src/App.js` (86 lines): Router configuration with public routes (login/register) and protected routes (dashboard, courses, etc.)
- `frontend/src/contexts/AuthContext.js` (60 lines): Global authentication state using React Context API, checking auth status on mount and providing login/logout functions
- `frontend/src/services/api.js` (67 lines): Centralized Axios instance with configured base URL, credentials support, and error interceptors for clean API communication

**Page Components** (frontend/src/pages/):
- `LoginPage.js`: User authentication with validation
- `RegisterPage.js`: New user registration with client-side validation
- `Dashboard.js`: Overview showing upcoming assignments, completion stats, and recent activity
- `CoursesPage.js`: Course CRUD with modal forms and color selection
- `AssignmentsPage.js`: Assignment management with filtering by status, priority badges, and inline status updates
- `CalendarPage.js`: Custom-built monthly calendar with date navigation and assignment previews
- `TimerPage.js`: Pomodoro timer with configurable durations, circular progress indicator, session linking, and auto-save functionality
- `AnalyticsPage.js`: Chart.js visualizations for study time, completion trends, and priority distribution

**Shared Components** (frontend/src/components/):
- `Navbar.js`: Bootstrap navbar with route highlighting and user dropdown
- `PrivateRoute.js`: Route wrapper protecting pages from unauthenticated access
- `LoadingSpinner.js`: Reusable loading indicator for async operations
- `ErrorMessage.js`: Dismissible error alert component
- `ConfirmDialog.js`: Modal for confirming destructive actions like deletions

**Utility Functions**:
- `frontend/src/utils/dateHelpers.js`: Date formatting, time-until-due calculations, urgency levels, and calendar generation
- `frontend/src/utils/validation.js`: Client-side validation for emails, usernames, passwords, and form fields

## Design Decisions and Rationale

**Session-Based Authentication**: I chose Flask-Login with session-based authentication over JWT tokens because it integrates seamlessly with Flask, keeps the implementation straightforward for a CS50 project, and provides built-in CSRF protection. Sessions are stored server-side with HTTP-only cookies.

**SQLite Database**: While not suitable for high-concurrency production environments, SQLite is perfect for this project because it requires zero configuration, creates a single portable database file, and performs excellently for single-user or small-scale deployments. The entire database can be version-controlled easily.

**Monorepo Structure**: Rather than maintaining separate repositories for frontend and backend, I used a monorepo where Flask serves the React production build. This simplifies deployment and CS50 submission while maintaining clean separation during development (React dev server on port 3000, Flask API on port 5000).

**Custom Calendar Implementation**: Instead of using a third-party calendar library, I built the calendar from scratch using date-fns. This gave me complete control over the UI, reduced bundle size, and allowed tight integration with the assignment system.

**Bootstrap vs Custom CSS**: I chose Bootstrap to accelerate development and ensure responsive design across devices. This let me focus on functionality rather than styling, while still maintaining a professional appearance with minimal custom CSS.

**Pomodoro Technique**: The default 25/5 minute intervals are based on the widely-proven Pomodoro productivity technique. These durations are configurable because students have different concentration spans and preferences.

## Challenges Faced

**Date and Time Handling**: Managing dates across Python (datetime), JavaScript (Date), and SQLite (TEXT storage) required careful timezone handling. I standardized on UTC for storage and ISO-8601 format for transmission, converting to local time only in the UI.

**Real-time Timer State**: The Pomodoro timer needed to track elapsed time accurately while handling pauses, resumes, and browser refresh scenarios. I solved this by storing start times and calculating durations on-the-fly rather than relying solely on countdown intervals.

**React Router Authentication Flow**: Coordinating authentication state with React Router required careful use of the AuthContext to check authentication on mount, redirect unauthenticated users to login, and prevent authenticated users from accessing login/register pages.

**Chart.js Configuration**: Getting Chart.js to work with React and display properly required registering specific chart components globally and carefully structuring data objects. The documentation was scattered across Chart.js v4 and react-chartjs-2 v5.

**Assignment Status Management**: Automatically setting completed_at timestamps when marking assignments complete, while also allowing users to "reopen" assignments by clearing the timestamp, required careful state synchronization between frontend and backend.

## Future Enhancements

Several features would enhance StudyTracker:

- **Email Notifications**: Send reminder emails 24 hours before assignment due dates
- **Recurring Assignments**: Support weekly quizzes or regular homework with automatic generation
- **Collaborative Features**: Study groups where students can share assignments and study sessions
- **Mobile App**: Native iOS/Android apps with offline support and push notifications
- **LMS Integration**: Automatically import assignments from Canvas, Blackboard, or Moodle
- **Study Insights**: AI-powered recommendations for optimal study times based on historical productivity
- **File Attachments**: Upload and attach PDFs, documents, or links to assignments
- **Grade Tracking**: Record assignment grades and calculate course GPAs
- **Dark Mode**: System-respecting dark theme for late-night study sessions

## How to Run

**Setup**:
```bash
# Backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd frontend
npm install
cd ..
```

**Development** (two terminals):
```bash
# Terminal 1 - Backend API
python app.py

# Terminal 2 - React dev server
cd frontend && npm start
```

**Production**:
```bash
cd frontend
npm run build
cp -r build/* ../static/
cd ..
python app.py
```

Access the application at `http://localhost:5000` in production or `http://localhost:3000` in development.

## CS50 Connection

This project draws upon numerous CS50 concepts:

- **Week 9 (Flask)**: Web server implementation with routes, templates (served as static React build), and sessions
- **Week 10 (SQL)**: Database design with normalized tables, foreign keys, and complex queries with JOINs
- **Week 8 (JavaScript)**: React components, state management, event handling, and asynchronous operations
- **Week 2 (Arrays)**: Date calculations for calendar generation and data aggregation
- **Week 6 (Python)**: Backend logic, validation, error handling, and security with password hashing

StudyTracker represents a complete full-stack application that solves a real problem students face daily, demonstrating proficiency in web development, database design, user authentication, and creating intuitive user interfaces. The project significantly exceeds the complexity of CS50 problem sets by integrating multiple technologies into a cohesive, production-ready application.

---

**Author**: [Your Name]
**GitHub**: [Your GitHub Username]
**edX**: [Your edX Username]
**Location**: [Your City, Country]
**Date**: October 27, 2024

This project was built with assistance from Claude Code for CS50's Final Project.
