const COLORS = [
  '#0f1b3d',
  '#c8a24a',
  '#3e63a8',
  '#8a6d1f',
  '#5d6573',
  '#b8923f',
  '#1b2b52',
  '#dcbb68',
  '#7a8fb8',
  '#a8884a',
]

export default function BudgetChart({ items, total }) {
  const size = 200
  const stroke = 34
  const center = size / 2
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const sum = items.reduce((s, i) => s + i.pct, 0) || 1

  let used = 0
  const segments = items.map((item, index) => {
    const length = (item.pct / sum) * circumference
    const segment = { item, length, offset: used, color: COLORS[index % COLORS.length] }
    used += length
    return segment
  })

  return (
    <div className="chart">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="chart-svg"
        role="img"
        aria-label="Donut chart of the budget split"
      >
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#efe9da" strokeWidth={stroke} />
        <g transform={`rotate(-90 ${center} ${center})`}>
          {segments.map(({ item, length, offset, color }) => (
            <circle
              key={item.name}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={stroke}
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={-offset}
            >
              <title>{item.name + ': ' + item.pct + '%'}</title>
            </circle>
          ))}
        </g>
        <text x={center} y={center - 6} textAnchor="middle" className="chart-label">
          TOTAL
        </text>
        <text x={center} y={center + 16} textAnchor="middle" className="chart-total">
          {total}
        </text>
      </svg>

      <ul className="legend">
        {segments.map(({ item, color }) => (
          <li key={item.name}>
            <span className="swatch" style={{ background: color }} />
            <span className="legend-name">{item.name}</span>
            <strong>{item.pct}%</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}
