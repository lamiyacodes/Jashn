import { useEffect, useState } from 'react'
import './App.css'
import { EVENT_TYPES, buildPlan, fallbackSuggestions } from './lib/planner'

const STORAGE_KEY = 'jashn-state-v2'

const rupees = (n) => '₹' + Math.round(n).toLocaleString('en-IN')
const shortDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

const DEFAULT_FORM = {
  type: 'wedding',
  customType: '',
  guests: 150,
  budget: 1000000,
  date: '',
  city: '',
  vibe: '',
}

export default function App() {
  const [saved] = useState(loadSaved)
  const [form, setForm] = useState({ ...DEFAULT_FORM, ...(saved.form || {}) })
  const [plan, setPlan] = useState(saved.plan || null)
  const [ideas, setIdeas] = useState(saved.ideas || null)
  const [checked, setChecked] = useState(saved.checked || {})
  const [spent, setSpent] = useState(saved.spent || {})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, plan, ideas, checked, spent }))
    } catch {
      // Storage may be unavailable; the app still works without it.
    }
  }, [form, plan, ideas, checked, spent])

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const result = buildPlan(form)
    if (result.error) {
      setError(result.error)
      return
    }

    setPlan(result)
    setChecked({})
    setSpent({})
    setIdeas(null)
    setLoading(true)

    try {
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!response.ok) {
        let reason = 'AI service returned status ' + response.status
        try {
          const err = await response.json()
          if (err.error) reason = err.error + ' (status ' + response.status + ')'
        } catch {
          // Response was not JSON, keep the status message.
        }
        throw new Error(reason)
      }
      const data = await response.json()
      if (!Array.isArray(data.ideas) || data.ideas.length === 0) {
        throw new Error('AI response had no ideas')
      }
      setIdeas({ ...data, source: 'gemini' })
    } catch (err) {
      setIdeas({ ...fallbackSuggestions(form), source: 'builtin', reason: err.message })
    } finally {
      setLoading(false)
    }
  }

  const completed = plan ? plan.vendors.filter((v) => checked[v]).length : 0
  const progress = plan ? Math.round((completed / plan.vendors.length) * 100) : 0
  const totalSpent = plan
    ? plan.budget.reduce((sum, item) => sum + (Number(spent[item.name]) || 0), 0)
    : 0
  const overspent = plan
    ? plan.budget.filter((item) => (Number(spent[item.name]) || 0) > item.amount)
    : []

  return (
    <div className="app">
      <header className="header">
        <h1>Jashn</h1>
        <p>Plan the celebration, not the stress.</p>
      </header>

      <main>
        <form className="card" onSubmit={handleSubmit}>
          <h2>Event details</h2>

          <label htmlFor="type">Event type</label>
          <select id="type" value={form.type} onChange={update('type')}>
            {Object.entries(EVENT_TYPES).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>

          {form.type === 'other' && (
            <>
              <label htmlFor="customType">Describe your event</label>
              <input
                id="customType"
                type="text"
                maxLength={60}
                placeholder="Housewarming, farewell party, reunion"
                value={form.customType}
                onChange={update('customType')}
              />
            </>
          )}

          <div className="row">
            <div>
              <label htmlFor="guests">Number of guests</label>
              <input id="guests" type="number" min="1" value={form.guests} onChange={update('guests')} />
            </div>
            <div>
              <label htmlFor="budget">Total budget (₹)</label>
              <input id="budget" type="number" min="1" value={form.budget} onChange={update('budget')} />
            </div>
          </div>

          <div className="row">
            <div>
              <label htmlFor="date">Event date</label>
              <input id="date" type="date" value={form.date} onChange={update('date')} />
            </div>
            <div>
              <label htmlFor="city">City</label>
              <input id="city" type="text" placeholder="Lucknow" value={form.city} onChange={update('city')} />
            </div>
          </div>

          <label htmlFor="vibe">Theme or style (optional)</label>
          <input
            id="vibe"
            type="text"
            placeholder="Traditional, minimal, pastel"
            value={form.vibe}
            onChange={update('vibe')}
          />

          {error && (
            <p className="message error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Preparing plan...' : 'Generate plan'}
          </button>
        </form>

        {plan && (
          <div aria-live="polite">
            <section className="stats" aria-label="Summary">
              <div className="stat">
                <strong>{plan.daysLeft}</strong>
                <span>days remaining</span>
              </div>
              <div className="stat">
                <strong>{rupees(plan.perGuest)}</strong>
                <span>per guest</span>
              </div>
              <div className="stat">
                <strong>{rupees(plan.total)}</strong>
                <span>total budget</span>
              </div>
            </section>

            <section className="card">
              <h2>Ideas and recommendations</h2>
              {loading && <p className="muted">Generating personalised ideas...</p>}
              {ideas && (
                <>
                  <p className="tag">
                    {ideas.source === 'gemini' ? 'Personalised by Gemini' : 'Built-in suggestions'}
                  </p>
                  {ideas.reason && <p className="muted">AI note: {ideas.reason}</p>}
                  {ideas.summary && <p>{ideas.summary}</p>}
                  <ul className="ideas">
                    {ideas.ideas.map((idea) => (
                      <li key={idea.title}>
                        <strong>{idea.title}</strong>
                        <span>{idea.detail}</span>
                      </li>
                    ))}
                  </ul>
                  {ideas.tips && ideas.tips.length > 0 && (
                    <>
                      <h3>Planning tips</h3>
                      <ul>
                        {ideas.tips.map((tip) => (
                          <li key={tip}>{tip}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </>
              )}
            </section>

            <section className="card">
              <h2>Budget allocation</h2>
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

            <section className="card">
              <h2>Timeline</h2>
              {plan.compressed && (
                <p className="message warning">
                  The event is closer than the ideal lead time, so the schedule has been compressed.
                  Start with the first item immediately.
                </p>
              )}
              <ol className="timeline">
                {plan.timeline.map((step) => (
                  <li key={step.title}>
                    <span className="date">{shortDate(step.due)}</span>
                    <span>{step.title}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="card">
              <h2>Vendor checklist</h2>
              <div
                className="bar large"
                role="progressbar"
                aria-label="Vendor checklist progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <span style={{ width: progress + '%' }} />
              </div>
              <p className="muted">
                {completed} of {plan.vendors.length} completed
              </p>
              {plan.vendors.map((vendor) => (
                <label key={vendor} className="check">
                  <input
                    type="checkbox"
                    checked={!!checked[vendor]}
                    onChange={() => setChecked({ ...checked, [vendor]: !checked[vendor] })}
                  />
                  <span className={checked[vendor] ? 'done' : ''}>{vendor}</span>
                </label>
              ))}
            </section>

            <section className="card">
              <h2>Spending tracker</h2>
              <p className="muted">
                Enter the amount spent in each category. You will be warned if a category exceeds its plan.
              </p>
              {plan.budget.map((item) => {
                const amount = Number(spent[item.name]) || 0
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
                        onChange={(e) => setSpent({ ...spent, [item.name]: e.target.value })}
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
                  {item.name} is over its planned amount by{' '}
                  {rupees((Number(spent[item.name]) || 0) - item.amount)}. Consider reducing other
                  categories or using the contingency.
                </p>
              ))}
            </section>
          </div>
        )}
      </main>

      <footer>
        <p className="footer-main">Jashn ~ Built for Hack2Skill PromptWars 2026</p>
        <p className="footer-tagline">Plan the celebration, not the stress.</p>
        <p className="footer-credit">
          Designed and developed by <strong>Lamiya Zainab Abidi</strong>
        </p>
      </footer>
    </div>
  )
}