import SideNav from './SideNav'
import SideNavCollapsed from './SideNavCollapsed'
import TopAppBar from './TopAppBar'

export default function AppShell({ children, focusMode = false }) {
  return (
    <div className="min-h-screen bg-background">
      {focusMode ? <SideNavCollapsed /> : <SideNav />}
      <div className={focusMode ? 'ml-16' : 'ml-60'}>
        <TopAppBar />
        {children}
      </div>
    </div>
  )
}
