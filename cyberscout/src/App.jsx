import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/layout/ProtectedRoute'
import RoleProtectedRoute from './components/layout/RoleProtectedRoute'
import CookieConsent from './components/ui/CookieConsent'

// Auth
import SplashPage from './pages/auth/SplashPage'
import WelcomePage from './pages/auth/WelcomePage'
import LoginPage from './pages/auth/LoginPage'
import RoleLoginPage from './pages/auth/RoleLoginPage'
import SignUpPage from './pages/auth/SignUpPage'
import AuthPage from './pages/auth/AuthPage'
import GettingStartedPage from './pages/auth/GettingStartedPage'
import OAuthCallbackPage from './pages/auth/OAuthCallbackPage'

// Core
import DashboardPage from './pages/dashboard/DashboardPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import InstructorDashboardPage from './pages/instructor/InstructorDashboardPage'
import MarketingDashboardPage from './pages/marketing/MarketingDashboardPage'
import OpsDashboardPage from './pages/ops/OpsDashboardPage'
import CourseCatalogPage from './pages/courses/CourseCatalogPage'
import CourseDetailPage from './pages/courses/CourseDetailPage'
import LessonReaderPage from './pages/courses/LessonReaderPage'
import QuizPage from './pages/quiz/QuizPage'
import QuizResultsPage from './pages/quiz/QuizResultsPage'
import PublicCoursesPage from './pages/public/PublicCoursesPage'
import PublicCoursePage from './pages/public/PublicCoursePage'
import BlogListPage from './pages/public/BlogListPage'
import BlogDetailPage from './pages/public/BlogDetailPage'
import AboutPage from './pages/public/AboutPage'
import {
  CertificateVerificationPage,
  ContactPage,
  CookiePolicyPage,
  ForOrganisationsPage,
  InstructorProfilePage,
  InstructorsPage,
  LabsPage,
  LearningPathDetailPage,
  LearningPathsPage,
  PlannedCoursePage,
  ResourcesPage,
} from './pages/public/PlatformInfoPages'

// Learning
import AITutorPage from './pages/ai-tutor/AITutorPage'
import LiveClassListPage from './pages/live-classes/LiveClassListPage'
import LiveClassDetailPage from './pages/live-classes/LiveClassDetailPage'
import LiveClassSessionPage from './pages/live-classes/LiveClassSessionPage'

// Gamification
import LeaderboardPage from './pages/gamification/LeaderboardPage'
import AchievementsPage from './pages/gamification/AchievementsPage'

// Account
import ProfilePage from './pages/account/ProfilePage'
import SettingsPage from './pages/account/SettingsPage'
import NotificationsPage from './pages/account/NotificationsPage'
import DownloadsPage from './pages/account/DownloadsPage'

// Subscription
import SubscriptionPage from './pages/subscription/SubscriptionPage'
import BillingHistoryPage from './pages/subscription/BillingHistoryPage'

// Support
import HelpCenterPage from './pages/support/HelpCenterPage'
import AccountSecurityHelpPage from './pages/support/AccountSecurityHelpPage'
import ReportBugPage from './pages/support/ReportBugPage'
import PrivacyPolicyPage from './pages/support/PrivacyPolicyPage'
import TermsOfServicePage from './pages/support/TermsOfServicePage'
import RefundPolicyPage from './pages/support/RefundPolicyPage'

const P = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>
const RoleP = ({ children, roles, loginPath }) => (
  <RoleProtectedRoute roles={roles} loginPath={loginPath}>{children}</RoleProtectedRoute>
)

const roleRoutes = {
  admin: ['admin', 'super_admin'],
  instructor: ['instructor'],
  marketing: ['marketing', 'sales'],
  ops: ['ops', 'lab_creator', 'support', 'finance'],
}

export default function App() {
  return (
    <BrowserRouter>
      <CookieConsent />
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
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/instructors" element={<InstructorsPage />} />
        <Route path="/instructors/arghya-sikdar" element={<InstructorProfilePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/for-organisations" element={<ForOrganisationsPage />} />
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin/login"
          element={<RoleLoginPage title="Admin Login" purpose="Access user, course, enrollment, payment, live monitoring, analytics, and audit controls." allowedRoles={roleRoutes.admin} redirectTo="/admin/dashboard" />}
        />
        <Route
          path="/instructor/login"
          element={<RoleLoginPage title="Instructor Login" purpose="Access assigned courses, students, attendance, quiz results, lab attempts, and progress." allowedRoles={roleRoutes.instructor} redirectTo="/instructor/dashboard" />}
        />
        <Route
          path="/marketing/login"
          element={<RoleLoginPage title="Sales and Marketing Login" purpose="Access leads, course interest, source analytics, conversion status, follow-ups, and sales suggestions." allowedRoles={roleRoutes.marketing} redirectTo="/marketing/dashboard" />}
        />
        <Route
          path="/ops/login"
          element={<RoleLoginPage title="Lab and Admin Ops Login" purpose="Access lab operations, lab sessions, document logs, protected resources, and system health." allowedRoles={roleRoutes.ops} redirectTo="/ops/dashboard" />}
        />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/getting-started" element={<GettingStartedPage />} />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/refund" element={<RefundPolicyPage />} />
        <Route path="/refund-policy" element={<RefundPolicyPage />} />
        <Route path="/cookie-policy" element={<CookiePolicyPage />} />
        <Route path="/certificate-verification" element={<CertificateVerificationPage />} />

        {/* Protected — Core */}
        <Route path="/dashboard" element={<P><DashboardPage /></P>} />
        <Route path="/dashboard/student" element={<P><DashboardPage /></P>} />
        <Route path="/dashboard/admin" element={<RoleP roles={roleRoutes.admin} loginPath="/admin/login"><AdminDashboardPage /></RoleP>} />
        <Route path="/dashboard/instructor" element={<RoleP roles={roleRoutes.instructor} loginPath="/instructor/login"><InstructorDashboardPage /></RoleP>} />
        <Route path="/dashboard/sales" element={<RoleP roles={roleRoutes.marketing} loginPath="/marketing/login"><MarketingDashboardPage /></RoleP>} />
        <Route path="/admin/dashboard" element={<RoleP roles={roleRoutes.admin} loginPath="/admin/login"><AdminDashboardPage /></RoleP>} />
        <Route path="/instructor/dashboard" element={<RoleP roles={roleRoutes.instructor} loginPath="/instructor/login"><InstructorDashboardPage /></RoleP>} />
        <Route path="/marketing/dashboard" element={<RoleP roles={roleRoutes.marketing} loginPath="/marketing/login"><MarketingDashboardPage /></RoleP>} />
        <Route path="/ops/dashboard" element={<RoleP roles={roleRoutes.ops} loginPath="/ops/login"><OpsDashboardPage /></RoleP>} />
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
        <Route path="/achievements" element={<P><AchievementsPage /></P>} />

        {/* Protected — Account */}
        <Route path="/profile" element={<P><ProfilePage /></P>} />
        <Route path="/settings" element={<P><SettingsPage /></P>} />
        <Route path="/notifications" element={<P><NotificationsPage /></P>} />
        <Route path="/downloads" element={<P><DownloadsPage /></P>} />

        {/* Protected — Subscription */}
        <Route path="/subscription" element={<P><SubscriptionPage /></P>} />
        <Route path="/billing/history" element={<P><BillingHistoryPage /></P>} />

        {/* Protected — Support */}
        <Route path="/help" element={<P><HelpCenterPage /></P>} />
        <Route path="/help/account-security" element={<P><AccountSecurityHelpPage /></P>} />
        <Route path="/report-bug" element={<P><ReportBugPage /></P>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
