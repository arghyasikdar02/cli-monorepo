import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/layout/ProtectedRoute'
import RoleProtectedRoute from './components/layout/RoleProtectedRoute'
import CookieConsent from './components/ui/CookieConsent'
import { ROLE_GROUPS } from './lib/roles'

// Auth
import WelcomePage from './pages/auth/WelcomePage'
const SplashPage = lazy(() => import('./pages/auth/SplashPage'))
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const RoleLoginPage = lazy(() => import('./pages/auth/RoleLoginPage'))
const SignUpPage = lazy(() => import('./pages/auth/SignUpPage'))
const AuthPage = lazy(() => import('./pages/auth/AuthPage'))
const GettingStartedPage = lazy(() => import('./pages/auth/GettingStartedPage'))
const OAuthCallbackPage = lazy(() => import('./pages/auth/OAuthCallbackPage'))
const RequiredPasswordChangePage = lazy(() => import('./pages/auth/RequiredPasswordChangePage'))

// Core
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminCoursesPage = lazy(() => import('./pages/admin/AdminCoursesPage'))
const AdminContentPage = lazy(() => import('./pages/admin/AdminContentPage'))
const AdminPeoplePage = lazy(() => import('./pages/admin/AdminPeoplePage'))
const AdminInstructorsPage = lazy(() => import('./pages/admin/AdminInstructorsPage'))
const AdminLiveClassesPage = lazy(() => import('./pages/admin/AdminLiveClassesPage'))
const AdminGoogleIntegrationPage = lazy(() => import('./pages/admin/AdminGoogleIntegrationPage'))
const AdminCysenseiPage = lazy(() => import('./pages/admin/AdminCysenseiPage'))
const InstructorDashboardPage = lazy(() => import('./pages/instructor/InstructorDashboardPage'))
const MarketingDashboardPage = lazy(() => import('./pages/marketing/MarketingDashboardPage'))
const OpsDashboardPage = lazy(() => import('./pages/ops/OpsDashboardPage'))
const CourseCatalogPage = lazy(() => import('./pages/courses/CourseCatalogPage'))
const CourseDetailPage = lazy(() => import('./pages/courses/CourseDetailPage'))
const LessonReaderPage = lazy(() => import('./pages/courses/LessonReaderPage'))
const QuizPage = lazy(() => import('./pages/quiz/QuizPage'))
const QuizResultsPage = lazy(() => import('./pages/quiz/QuizResultsPage'))
const PublicCoursesPage = lazy(() => import('./pages/public/PublicCoursesPage'))
const PublicCoursePage = lazy(() => import('./pages/public/PublicCoursePage'))
const BlogListPage = lazy(() => import('./pages/public/BlogListPage'))
const BlogDetailPage = lazy(() => import('./pages/public/BlogDetailPage'))
const AboutPage = lazy(() => import('./pages/public/AboutPage'))
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage'))
const AccessibilityPage = lazy(() => import('./pages/public/PlatformInfoPages').then(module => ({ default: module.AccessibilityPage })))
const CertificateVerificationPage = lazy(() => import('./pages/public/PlatformInfoPages').then(module => ({ default: module.CertificateVerificationPage })))
const ContactPage = lazy(() => import('./pages/public/PlatformInfoPages').then(module => ({ default: module.ContactPage })))
const CookiePolicyPage = lazy(() => import('./pages/public/PlatformInfoPages').then(module => ({ default: module.CookiePolicyPage })))
const FaqPage = lazy(() => import('./pages/public/PlatformInfoPages').then(module => ({ default: module.FaqPage })))
const ForOrganisationsPage = lazy(() => import('./pages/public/PlatformInfoPages').then(module => ({ default: module.ForOrganisationsPage })))
const InstructorProfilePage = lazy(() => import('./pages/public/PlatformInfoPages').then(module => ({ default: module.InstructorProfilePage })))
const InstructorsPage = lazy(() => import('./pages/public/PlatformInfoPages').then(module => ({ default: module.InstructorsPage })))
const LabDetailPage = lazy(() => import('./pages/public/PlatformInfoPages').then(module => ({ default: module.LabDetailPage })))
const LabsPage = lazy(() => import('./pages/public/PlatformInfoPages').then(module => ({ default: module.LabsPage })))
const LearningPathDetailPage = lazy(() => import('./pages/public/PlatformInfoPages').then(module => ({ default: module.LearningPathDetailPage })))
const LearningPathsPage = lazy(() => import('./pages/public/PlatformInfoPages').then(module => ({ default: module.LearningPathsPage })))
const PlannedCoursePage = lazy(() => import('./pages/public/PlatformInfoPages').then(module => ({ default: module.PlannedCoursePage })))
const ResourcesPage = lazy(() => import('./pages/public/PlatformInfoPages').then(module => ({ default: module.ResourcesPage })))

// Learning
const AITutorPage = lazy(() => import('./pages/ai-tutor/AITutorPage'))
const LiveClassListPage = lazy(() => import('./pages/live-classes/LiveClassListPage'))
const LiveClassDetailPage = lazy(() => import('./pages/live-classes/LiveClassDetailPage'))
const LiveClassSessionPage = lazy(() => import('./pages/live-classes/LiveClassSessionPage'))

// Gamification
const LeaderboardPage = lazy(() => import('./pages/gamification/LeaderboardPage'))

// Account
const ProfilePage = lazy(() => import('./pages/account/ProfilePage'))
const SettingsPage = lazy(() => import('./pages/account/SettingsPage'))
const NotificationsPage = lazy(() => import('./pages/account/NotificationsPage'))
const DownloadsPage = lazy(() => import('./pages/account/DownloadsPage'))

// Subscription

// Support
const HelpCenterPage = lazy(() => import('./pages/support/HelpCenterPage'))
const AccountSecurityHelpPage = lazy(() => import('./pages/support/AccountSecurityHelpPage'))
const ReportBugPage = lazy(() => import('./pages/support/ReportBugPage'))
const PrivacyPolicyPage = lazy(() => import('./pages/support/PrivacyPolicyPage'))
const TermsOfServicePage = lazy(() => import('./pages/support/TermsOfServicePage'))
const RefundPolicyPage = lazy(() => import('./pages/support/RefundPolicyPage'))

const P = ({ children, allowPasswordChange = false }) => <ProtectedRoute allowPasswordChange={allowPasswordChange}>{children}</ProtectedRoute>
const RoleP = ({ children, roles, loginPath }) => (
  <RoleProtectedRoute roles={roles} loginPath={loginPath}>{children}</RoleProtectedRoute>
)

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <CookieConsent />
      <Suspense fallback={<div className="route-loading" role="status"><span className="route-loading-indicator" aria-hidden="true" /><span>Loading Cyber Lab IN</span></div>}>
        <Routes>
        {/* Public */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/splash" element={<SplashPage />} />
        <Route path="/welcome" element={<Navigate to="/" replace />} />
        <Route path="/courses" element={<PublicCoursesPage />} />
        <Route path="/courses/cybersecurity/web-application-security" element={<PlannedCoursePage slug="web-application-security" />} />
        <Route path="/courses/cybersecurity/soc-analyst-foundations" element={<PlannedCoursePage slug="soc-analyst-foundations" />} />
        <Route path="/courses/cybersecurity/ethical-hacking-foundations" element={<PlannedCoursePage slug="ethical-hacking-foundations" />} />
        <Route path="/courses/:categorySlug" element={<PublicCoursesPage />} />
        <Route path="/courses/:categorySlug/:courseSlug" element={<PublicCoursePage />} />
        <Route path="/learning-paths" element={<LearningPathsPage />} />
        <Route path="/learning-paths/beginner-cybersecurity" element={<LearningPathDetailPage slug="beginner-cybersecurity" />} />
        <Route path="/learning-paths/ethical-hacking" element={<LearningPathDetailPage slug="ethical-hacking" />} />
        <Route path="/learning-paths/soc-analyst" element={<LearningPathDetailPage slug="soc-analyst" />} />
        <Route path="/learning-paths/network-cloud-security" element={<LearningPathDetailPage slug="network-cloud-security" />} />
        <Route path="/learning-paths/digital-forensics" element={<LearningPathDetailPage slug="digital-forensics" />} />
        <Route path="/labs" element={<LabsPage />} />
        <Route path="/labs/:labSlug" element={<LabDetailPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/instructors" element={<InstructorsPage />} />
        <Route path="/instructors/arghya-sikdar" element={<InstructorProfilePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/for-organisations" element={<ForOrganisationsPage />} />
        <Route path="/for-institutions" element={<Navigate to="/for-organisations#institutions" replace />} />
        <Route path="/for-businesses" element={<Navigate to="/for-organisations#businesses" replace />} />
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin/login"
          element={<RoleLoginPage title="Admin Login" purpose="Access user, course, enrollment, payment, live monitoring, analytics, and audit controls." allowedRoles={ROLE_GROUPS.admin} redirectTo="/admin/dashboard" />}
        />
        <Route
          path="/instructor/login"
          element={<RoleLoginPage title="Instructor Login" purpose="Access assigned courses, students, attendance, quiz results, lab attempts, and progress." allowedRoles={ROLE_GROUPS.instructor} redirectTo="/instructor/dashboard" />}
        />
        <Route
          path="/marketing/login"
          element={<RoleLoginPage title="Sales and Marketing Login" purpose="Access leads, course interest, source analytics, conversion status, follow-ups, and sales suggestions." allowedRoles={ROLE_GROUPS.marketing} redirectTo="/marketing/dashboard" />}
        />
        <Route
          path="/ops/login"
          element={<RoleLoginPage title="Lab and Admin Ops Login" purpose="Access lab operations, lab sessions, document logs, protected resources, and system health." allowedRoles={ROLE_GROUPS.ops} redirectTo="/ops/dashboard" />}
        />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/getting-started" element={<GettingStartedPage />} />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        <Route path="/change-password" element={<P allowPasswordChange><RequiredPasswordChangePage /></P>} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/refund" element={<RefundPolicyPage />} />
        <Route path="/refund-policy" element={<RefundPolicyPage />} />
        <Route path="/cookie-policy" element={<CookiePolicyPage />} />
        <Route path="/certificate-verification" element={<CertificateVerificationPage />} />
        <Route path="/accessibility" element={<AccessibilityPage />} />

        {/* Protected — Core */}
        <Route path="/dashboard" element={<RoleP roles={ROLE_GROUPS.student} loginPath="/login"><DashboardPage /></RoleP>} />
        <Route path="/dashboard/student" element={<RoleP roles={ROLE_GROUPS.student} loginPath="/login"><DashboardPage /></RoleP>} />
        <Route path="/dashboard/admin" element={<RoleP roles={ROLE_GROUPS.admin} loginPath="/admin/login"><AdminDashboardPage /></RoleP>} />
        <Route path="/dashboard/instructor" element={<RoleP roles={ROLE_GROUPS.instructor} loginPath="/instructor/login"><InstructorDashboardPage /></RoleP>} />
        <Route path="/dashboard/sales" element={<RoleP roles={ROLE_GROUPS.marketing} loginPath="/marketing/login"><MarketingDashboardPage /></RoleP>} />
        <Route path="/admin/dashboard" element={<RoleP roles={ROLE_GROUPS.admin} loginPath="/admin/login"><AdminDashboardPage /></RoleP>} />
        <Route path="/admin/courses" element={<RoleP roles={ROLE_GROUPS.admin} loginPath="/admin/login"><AdminCoursesPage /></RoleP>} />
        <Route path="/admin/content" element={<RoleP roles={ROLE_GROUPS.admin} loginPath="/admin/login"><AdminContentPage /></RoleP>} />
        <Route path="/admin/live-classes" element={<RoleP roles={ROLE_GROUPS.admin} loginPath="/admin/login"><AdminLiveClassesPage /></RoleP>} />
        <Route path="/admin/instructors" element={<RoleP roles={ROLE_GROUPS.admin} loginPath="/admin/login"><AdminInstructorsPage /></RoleP>} />
        <Route path="/admin/enrolments" element={<RoleP roles={ROLE_GROUPS.admin} loginPath="/admin/login"><AdminPeoplePage mode="enrolments" /></RoleP>} />
        <Route path="/admin/cysensei" element={<RoleP roles={ROLE_GROUPS.admin} loginPath="/admin/login"><AdminCysenseiPage /></RoleP>} />
        <Route path="/admin/google" element={<RoleP roles={ROLE_GROUPS.admin} loginPath="/admin/login"><AdminGoogleIntegrationPage /></RoleP>} />
        <Route path="/instructor/dashboard" element={<RoleP roles={ROLE_GROUPS.instructor} loginPath="/instructor/login"><InstructorDashboardPage /></RoleP>} />
        <Route path="/marketing/dashboard" element={<RoleP roles={ROLE_GROUPS.marketing} loginPath="/marketing/login"><MarketingDashboardPage /></RoleP>} />
        <Route path="/ops/dashboard" element={<RoleP roles={ROLE_GROUPS.ops} loginPath="/ops/login"><OpsDashboardPage /></RoleP>} />
        <Route path="/learn/courses" element={<P><CourseCatalogPage /></P>} />
        <Route path="/learn/courses/:id" element={<P><CourseDetailPage /></P>} />
        <Route path="/courses/:id" element={<P><CourseDetailPage /></P>} />
        <Route path="/lessons/:courseId/:lessonId" element={<P><LessonReaderPage /></P>} />
        <Route path="/quiz/:quizId" element={<P><QuizPage /></P>} />
        <Route path="/quiz/:quizId/results" element={<P><QuizResultsPage /></P>} />

        {/* Protected — Learning */}
        <Route path="/ai-tutor" element={<P><AITutorPage /></P>} />
        <Route path="/live-classes" element={<P><LiveClassListPage /></P>} />
        <Route path="/live-classes/:id" element={<P><LiveClassDetailPage /></P>} />
        <Route path="/live-classes/:id/session" element={<P><LiveClassSessionPage /></P>} />

        {/* Protected — Gamification */}
        <Route path="/leaderboard" element={<P><LeaderboardPage /></P>} />
        <Route path="/achievements" element={<P><Navigate to="/dashboard" replace /></P>} />

        {/* Protected — Account */}
        <Route path="/profile" element={<P><ProfilePage /></P>} />
        <Route path="/settings" element={<P><SettingsPage /></P>} />
        <Route path="/notifications" element={<P><NotificationsPage /></P>} />
        <Route path="/downloads" element={<P><DownloadsPage /></P>} />

        {/* Protected — Subscription */}
        <Route path="/subscription" element={<P><Navigate to="/learn/courses" replace /></P>} />
        <Route path="/billing/history" element={<P><Navigate to="/settings" replace /></P>} />

        {/* Protected — Support */}
        <Route path="/help" element={<P><HelpCenterPage /></P>} />
        <Route path="/help/account-security" element={<P><AccountSecurityHelpPage /></P>} />
        <Route path="/report-bug" element={<P><ReportBugPage /></P>} />

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
