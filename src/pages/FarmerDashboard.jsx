import { useState } from 'react'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import WelcomeCard from '../components/dashboard/WelcomeCard'
import OverviewCards from '../components/dashboard/OverviewCards'
import QuickActionCard from '../components/dashboard/QuickActionCard'
import SignatureFeatureCard from '../components/dashboard/SignatureFeatureCard'
import DecisionOverview from '../components/dashboard/DecisionOverview'
import ActivityCard from '../components/dashboard/ActivityCard'
import RiskNotice from '../components/dashboard/RiskNotice'
import './FarmerDashboard.css'

function FarmerDashboard() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="farmer-dashboard-layout">
      {/* Sidebar Navigation */}
      <DashboardSidebar 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
      />

      {/* Main Content Area */}
      <div className="dashboard-main">
        {/* Sticky Header */}
        <DashboardHeader 
          setMobileOpen={setMobileOpen} 
        />

        {/* Dashboard Body */}
        <main className="dashboard-content-body">
          {/* Welcome Banner */}
          <WelcomeCard />

          {/* Overview Cards */}
          <OverviewCards />

          {/* Quick Actions Grid */}
          <QuickActionCard />

          {/* Signature Features Showcase */}
          <SignatureFeatureCard />

          {/* Decision Journey Timeline */}
          <DecisionOverview />

          {/* Recent Activity Log */}
          <ActivityCard />

          {/* Risk Awareness Notice */}
          <RiskNotice />
        </main>
      </div>
    </div>
  )
}

export default FarmerDashboard
