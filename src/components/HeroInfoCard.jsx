function HeroInfoCard({ icon, title, value, detail, badgeText, badgeColor = 'green' }) {
  return (
    <div className="hero-info-card">
      <div className="hero-card-icon">{icon}</div>
      <div className="hero-card-content">
        <span className="hero-card-title">{title}</span>
        <div className="hero-card-value">{value}</div>
        <small className="hero-card-detail">{detail}</small>
      </div>
      {badgeText && (
        <span className={`hero-card-badge badge-${badgeColor}`}>
          {badgeText}
        </span>
      )}
    </div>
  )
}

export default HeroInfoCard
