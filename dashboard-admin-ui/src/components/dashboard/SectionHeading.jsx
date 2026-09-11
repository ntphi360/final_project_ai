export default function SectionHeading({ icon: Icon, iconColor, title, subtitle, children }) {
  return (
    <div className="section-heading">
      <span className="section-icon" style={{ color: iconColor, backgroundColor: `${iconColor}14` }}>
        <Icon size={20} />
      </span>
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}
