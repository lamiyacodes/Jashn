import { lazy, Suspense } from 'react'
import { rupees } from '../../lib/format'

// The chart is only downloaded when the Budget section is opened.
const BudgetChart = lazy(() => import('../BudgetChart'))

export default function BudgetSection({ plan }) {
  return (
    <section className="card">
      <h2>Budget allocation</h2>
      <Suspense fallback={<p className="muted">Loading chart...</p>}>
        <BudgetChart items={plan.budget} total={rupees(plan.total)} />
      </Suspense>
      {plan.budget.map((item) => (
        <div key={item.name} className="line">
          <div className="line-top">
            <span>
              {item.name} ({item.pct}%)
            </span>
            <strong>{rupees(item.amount)}</strong>
          </div>
          <div className="bar">
            <span style={{ width: Math.min(100, item.pct * 3) + '%' }} />
          </div>
        </div>
      ))}
    </section>
  )
}
