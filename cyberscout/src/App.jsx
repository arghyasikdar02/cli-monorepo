import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/layout/ProtectedRoute'

// Auth
import SplashPage from './pages/auth/SplashPage'
import WelcomePage from './pages/auth/WelcomePage'
import LoginPage from './pages/auth/LoginPage'
import SignUpPage from './pages/auth/SignUpPage'
import GettingStartedPage from './pages/auth/GettingStartedPage'
import OAuthCallbackPage from './pages/auth/OAuthCallbackPage'

// Core
import DashboardPage from './pages/dashboard/DashboardPage'
import CourseCatalogPage from './pages/courses/CourseCatalogPage'
import CourseDetailPage from './pages/courses/CourseDetailPage'
import LessonReaderPage from './pages/courses/LessonReaderPage'
import QuizPage from './pages/quiz/QuizPage'
import QuizResultsPage from './pages/quiz/QuizResultsPage'

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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="/splash" element={<SplashPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/getting-started" element={<GettingStartedPage />} />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/refund" element={<RefundPolicyPage />} />

        {/* Protected — Core */}
        <Route path="/dashboard" element={<P><DashboardPage /></P>} />
        <Route path="/courses" element={<P><CourseCatalogPage /></P>} />
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
        <Route path="*" element={<Navigate to="/splash" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
