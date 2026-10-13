import { useState } from 'react'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import FeatureStrip from '../components/FeatureStrip'
import FeaturesSection from '../components/FeaturesSection'
import HowItWorks from '../components/HowItWorks'
import SignatureFeatures from '../components/SignatureFeatures'
import ImpactSection from '../components/ImpactSection'
import Footer from '../components/Footer'
import '../App.css'

function LandingPage() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev)
  }

  return (
    <div className={`app ${isDarkMode ? 'dark-theme' : ''}`}>
      <Navbar isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} />
      <main>
        <HeroSection />
        <FeatureStrip />
        <FeaturesSection />
        <HowItWorks />
        <SignatureFeatures />
        <ImpactSection />
      </main>
      <Footer />
    </div>
  )
}

export default LandingPage
