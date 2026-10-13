import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import FarmerDashboard from './pages/FarmerDashboard'
import CropRecommendationPage from './pages/CropRecommendationPage'
import CropRecommendationResultsPage from './pages/CropRecommendationResultsPage'
import AlternativeCropIntelligencePage from './pages/AlternativeCropIntelligencePage'
import OversupplyRiskPage from './pages/OversupplyRiskPage'
import CropSupplyDemandPage from './pages/CropSupplyDemandPage'
import DecisionLabPage from './pages/DecisionLabPage'
import WeatherClimatePage from './pages/WeatherClimatePage'
import MarketIntelligencePage from './pages/MarketIntelligencePage'
import GovernmentSchemesPage from './pages/GovernmentSchemesPage'
import DiseaseGuidancePage from './pages/DiseaseGuidancePage'
import AiAssistantPage from './pages/AiAssistantPage'
import ExpertDashboard from './pages/ExpertDashboard'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/farmer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/crop-recommendation"
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <CropRecommendationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/crop-recommendation/results/:requestId"
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <CropRecommendationResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/crop-recommendation/alternatives"
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <AlternativeCropIntelligencePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/crop-recommendation/alternatives/:requestId"
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <AlternativeCropIntelligencePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/alternative-crops"
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <AlternativeCropIntelligencePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/oversupply-risk"
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <OversupplyRiskPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/supply-demand"
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <CropSupplyDemandPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/decision-lab"
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <DecisionLabPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/decision-lab/:requestId"
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <DecisionLabPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/weather"
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <WeatherClimatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/market-intelligence"
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <MarketIntelligencePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/government-schemes"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                <GovernmentSchemesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/disease-guidance"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                <DiseaseGuidancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/ai-assistant"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                <AiAssistantPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expert/dashboard"
            element={
              <ProtectedRoute allowedRoles={['EXPERT']}>
                <ExpertDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App