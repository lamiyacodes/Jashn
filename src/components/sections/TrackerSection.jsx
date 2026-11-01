import { rupees } from '../../lib/format'

const amountOf = (spent, name) => Number(spent[name]) || 0

export default function TrackerSection({ plan, spent, onChange }) {
  const totalSpent = plan.budget.reduce((sum, item) => sum + amountOf(spent, item.name), 0)
  const overspent = plan.budget.filter((item) => amountOf(spent, item.name) > item.amount)

  return (
    <section className="card">
      <h2>Spending tracker</h2>
      <p className="muted">
        Enter the amount spent in each category. You will be warned if a category exceeds its plan.
      </p>
      {plan.budget.map((item) => {
        const amount = amountOf(spent, item.name)
        const isOver = amount > item.amount
        return (
          <div key={item.name} className="line">
            <div className="line-top">
              <label htmlFor={'spent-' + item.name}>
                {item.name} (planned {rupees(item.amount)})
              </label>
              <input
                id={'spent-' + item.name}
                className="spend"
                type="number"
                min="0"
                placeholder="0"
                value={spent[item.name] ?? ''}
                onChange={(e) => onChange(item.name, e.target.value)}
              />
            </div>
            <div className={'bar' + (isOver ? ' over' : '')}>
              <span style={{ width: Math.min(100, (amount / item.amount) * 100) + '%' }} />
            </div>
          </div>
        )
      })}

      <p>
        <strong>
          Spent so far: {rupees(totalSpent)} of {rupees(plan.total)}
        </strong>
      </p>

      {totalSpent > plan.total && (
        <p className="message error" role="alert">
          You have exceeded the total budget by {rupees(totalSpent - plan.total)}.
        </p>
      )}
      {overspent.map((item) => (
        <p key={item.name} className="message warning">
          {item.name} is over its planned amount by {rupees(amountOf(spent, item.name) - item.amount)}.
          Consider reducing other categories or using the contingency.
        </p>
      ))}
    </section>
  )
}
