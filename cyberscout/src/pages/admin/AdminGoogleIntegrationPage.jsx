import StaffDashboardShell from '../../components/layout/StaffDashboardShell'
import GoogleIntegrationPanel from './GoogleIntegrationPanel'
import { adminNavigation } from './adminNavigation'

export default function AdminGoogleIntegrationPage() {
  return (
    <StaffDashboardShell title="Google Integration" subtitle="Authorize the Google account used to create meeting spaces for live classes." loginPath="/admin/login" navigation={adminNavigation}>
      <GoogleIntegrationPanel />
    </StaffDashboardShell>
  )
}
