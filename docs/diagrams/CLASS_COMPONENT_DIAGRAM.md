# Cyber Lab IN Class And Component Diagram

This project is JavaScript/React/Express, so this is a practical component and service diagram rather than a pure OOP class model.

Source file: `docs/diagrams/class-component-diagram.mmd`

```mermaid
classDiagram
  direction LR

  class AppRouter {
    routes
    publicRoutes
    protectedRoutes
    roleRoutes
  }
  class PublicPages {
    WelcomePage
    PublicCoursesPage
    PublicCoursePage
    BlogListPage
    BlogDetailPage
    AboutPage
  }
  class AuthPages {
    AuthPage
    LoginPage
    SignUpPage
    RoleLoginPage
    OAuthCallbackPage
  }
  class DashboardPages {
    DashboardPage
    AdminDashboardPage
    InstructorDashboardPage
    MarketingDashboardPage
    OpsDashboardPage
  }
  class LearningPages {
    CourseCatalogPage
    CourseDetailPage
    LessonReaderPage
    AITutorPage
    LiveClassPages
    QuizPages
  }
  class LeadCaptureForm {
    validatesInput
    submitsLead
    sourceTags
  }
  class FaqChatbot {
    guidedFaqOptions
    keywordResponses
    chatbotLeadFlow
  }
  class CookieConsent {
    necessaryAlwaysOn
    analyticsOptIn
    marketingOptIn
    visitorTracking
  }
  class ApiClient {
    fetchJson
    credentialsInclude
    csrfHeader
    errorHandling
  }
  class ProtectedRoute {
    requiresSession
    redirectToLogin
  }
  class RoleProtectedRoute {
    requiresRole
    roleLoginRedirect
  }
  class ExpressApp {
    cors
    jsonParser
    cookieParser
    cacheHeaders
    routeMounts
  }
  class AuthRoutes {
    register
    login
    googleOAuth
    me
    changePassword
    logout
  }
  class CourseRoutes {
    publicCourses
    courseDetails
    enroll
    materials
    progress
  }
  class EnrollmentRoutes {
    createEnrollment
    listByUser
    listByCourse
    accessCheck
  }
  class LeadRoutes {
    createLead
    listLeads
    updateStage
    addNote
  }
  class BlogRoutes {
    listPublished
    getBySlug
  }
  class VisitorRoutes {
    trackVisitor
    saveConsent
    summary
  }
  class DashboardRoutes {
    studentSummary
    adminSummary
    instructorSummary
    marketingSummary
    opsSummary
  }
  class AiRoutes {
    courseChat
    sessions
    messages
    usageLimit
  }
  class LiveClassRoutes {
    listByCourse
    accessCheck
    joinEvent
    leaveEvent
    attendance
  }
  class OtherModuleRoutes {
    videos
    documents
    labs
    quizzes
    assignments
    certificates
    payments
    audit
    leaderboards
  }
  class AccessMiddleware {
    requireAuth
    requireRole
    requireDashboardRole
    requireCourseAccess
    requireBatchMembership
    requireInstructorAssignment
  }
  class AuthorizationService {
    canAccessCourse
    canManageCourse
    canAccessBatch
    canJoinLiveClass
    assertDecision
  }
  class RepositoryLayer {
    users
    courses
    enrollments
    leads
    blogs
    visitors
    progress
    audit
    aiChat
    liveAttendance
  }
  class DatabaseLayer {
    sharedPgPool
    migrations
    seed
    parameterizedQueries
  }
  class JwtUtility {
    signToken
    verifyToken
    tokenVersion
  }
  class PasswordHashing {
    bcryptHash
    bcryptCompare
  }
  class GoogleOAuth {
    passportStrategy
    safeRedirectState
    profileMapping
  }

  <<React>> AppRouter
  <<React>> PublicPages
  <<React>> AuthPages
  <<React>> DashboardPages
  <<React>> LearningPages
  <<React>> LeadCaptureForm
  <<React>> FaqChatbot
  <<React>> CookieConsent
  <<React>> ProtectedRoute
  <<React>> RoleProtectedRoute
  <<JavaScriptModule>> ApiClient
  <<Express>> ExpressApp
  <<ExpressRouter>> AuthRoutes
  <<ExpressRouter>> CourseRoutes
  <<ExpressRouter>> EnrollmentRoutes
  <<ExpressRouter>> LeadRoutes
  <<ExpressRouter>> BlogRoutes
  <<ExpressRouter>> VisitorRoutes
  <<ExpressRouter>> DashboardRoutes
  <<ExpressRouter>> AiRoutes
  <<ExpressRouter>> LiveClassRoutes
  <<ExpressRouter>> OtherModuleRoutes
  <<Middleware>> AccessMiddleware
  <<Service>> AuthorizationService
  <<Repository>> RepositoryLayer
  <<Database>> DatabaseLayer
  <<Utility>> JwtUtility
  <<Utility>> PasswordHashing
  <<Integration>> GoogleOAuth

  AppRouter --> PublicPages : renders
  AppRouter --> AuthPages : renders
  AppRouter --> DashboardPages : renders
  AppRouter --> LearningPages : renders
  AppRouter --> ProtectedRoute : wraps private routes
  AppRouter --> RoleProtectedRoute : wraps staff dashboards
  PublicPages --> LeadCaptureForm : embeds
  PublicPages --> FaqChatbot : embeds
  AppRouter --> CookieConsent : global component
  PublicPages --> ApiClient : loads public data
  AuthPages --> ApiClient : authenticates
  DashboardPages --> ApiClient : loads private data
  LearningPages --> ApiClient : loads course data
  LeadCaptureForm --> ApiClient : posts leads
  FaqChatbot --> ApiClient : posts chatbot leads
  CookieConsent --> ApiClient : posts consent
  ProtectedRoute --> ApiClient : checks session
  RoleProtectedRoute --> ApiClient : checks roles
  ApiClient --> ExpressApp : HTTPS JSON with cookies
  ExpressApp --> AuthRoutes : mounts
  ExpressApp --> CourseRoutes : mounts
  ExpressApp --> EnrollmentRoutes : mounts
  ExpressApp --> LeadRoutes : mounts
  ExpressApp --> BlogRoutes : mounts
  ExpressApp --> VisitorRoutes : mounts
  ExpressApp --> DashboardRoutes : mounts
  ExpressApp --> AiRoutes : mounts
  ExpressApp --> LiveClassRoutes : mounts
  ExpressApp --> OtherModuleRoutes : mounts
  AuthRoutes --> JwtUtility : issues and validates JWT
  AuthRoutes --> PasswordHashing : hashes and verifies passwords
  AuthRoutes --> GoogleOAuth : OAuth strategy
  AuthRoutes --> RepositoryLayer : users and audit
  CourseRoutes --> AccessMiddleware : private course data
  EnrollmentRoutes --> AccessMiddleware : enrollment required
  DashboardRoutes --> AccessMiddleware : role required
  AiRoutes --> AccessMiddleware : course access required
  LiveClassRoutes --> AccessMiddleware : course and window checks
  OtherModuleRoutes --> AccessMiddleware : module guards
  AccessMiddleware --> JwtUtility : verifies token
  AccessMiddleware --> RepositoryLayer : loads user and roles
  AccessMiddleware --> AuthorizationService : fail closed decisions
  AuthorizationService --> RepositoryLayer : enrollment and course lookup
  LeadRoutes --> RepositoryLayer : lead writes and reads
  BlogRoutes --> RepositoryLayer : published blog reads
  VisitorRoutes --> RepositoryLayer : visitor and consent writes
  CourseRoutes --> RepositoryLayer : course and material reads
  DashboardRoutes --> RepositoryLayer : aggregate metrics
  RepositoryLayer --> DatabaseLayer : SQL
```

## Frontend Handoff Notes

- `cyberscout/src/App.jsx` is the active route registry.
- `/` renders `WelcomePage`, which is the production landing page, not an intermediary home screen.
- Public pages use `LeadCaptureForm`, `FaqChatbot`, and `CookieConsent`.
- `ProtectedRoute` gates normal authenticated pages. `RoleProtectedRoute` gates staff dashboards.
- `cyberscout/src/lib/api.js` is the central API client and sends credentials so HTTP-only auth cookies can work across frontend/backend origins.

## Backend Handoff Notes

- `cyberscout-server/src/index.js` creates the Express app, applies CORS, JSON parsing, cookie parsing, cache headers, Passport initialization, and route mounts.
- `cyberscout-server/src/middleware/access.js` centralizes `requireAuth`, `requireRole`, dashboard role groups, course access, batch access, and instructor assignment guards.
- `cyberscout-server/src/services/authorization.js` implements fail-closed decisions for course access, course management, batch access, and live class join checks.
- `cyberscout-server/src/db/repositories.js` owns SQL reads/writes and row mapping.
- Password auth uses bcrypt. JWT sessions use `token_version` so password changes invalidate older sessions.
- Google OAuth is integrated through Passport when Google credentials are configured.

## Current Versus Planned

- Current: Vite React, Express, Supabase PostgreSQL through `pg`, JWT/cookie auth, role dashboards, and database-backed LMS, CRM, analytics, assessment, payment, and audit flows.
- Planned: Supabase Storage for protected assets and expanded production RAG source/chunk persistence. Direct browser table access remains revoked; the Express API is the authorization boundary.
