const COLORS = [
  '#f6a7c5',
  '#ffd98a',
  '#9fdfd3',
  '#c8b6f2',
  '#ffc4a3',
  '#a8cbf7',
  '#c4e3a0',
  '#f9b4b8',
  '#e3d4ff',
  '#d9d2c3',
]

const INK = '#1b1033'

export default function BudgetChart({ items, total }) {
  const size = 200
  const stroke = 32
  const center = size / 2
  const radius = (size - stroke - 10) / 2
  const circumference = 2 * Math.PI * radius
  const sum = items.reduce((s, i) => s + i.pct, 0) || 1
  const gap = items.length > 1 ? 3 : 0

  const lengths = items.map((item) => (item.pct / sum) * circumference)

  const segments = items.map((item, index) => {
    const before = lengths.slice(0, index).reduce((a, b) => a + b, 0)
    return {
      item,
      draw: Math.max(0, lengths[index] - gap),
      offset: before + gap / 2,
      color: COLORS[index % COLORS.length],
    }
  })

  return (
    <div className="chart">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="chart-svg"
        role="img"
        aria-label="Donut chart of the budget split"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={INK}
          strokeWidth={stroke + 6}
        />
        <g transform={`rotate(-90 ${center} ${center})`}>
          {segments.map(({ item, draw, offset, color }) => (
            <circle
              key={item.name}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={stroke}
              strokeDasharray={`${draw} ${circumference - draw}`}
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
