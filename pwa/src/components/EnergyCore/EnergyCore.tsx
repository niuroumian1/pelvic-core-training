interface EnergyCoreProps {
  compact?: boolean
}

export function EnergyCore({ compact = false }: EnergyCoreProps) {
  return (
    <div
      className={`energy-core${compact ? ' energy-core--compact' : ''}`}
      aria-label="能量核心"
      role="img"
    >
      <span className="energy-core__orbit energy-core__orbit--outer" />
      <span className="energy-core__orbit energy-core__orbit--inner" />
      <span className="energy-core__ring" />
      <span className="energy-core__center" />
    </div>
  )
}

