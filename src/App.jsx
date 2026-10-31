import { useEffect, useRef, useState } from 'react'
import './App.css'
import { EVENT_TYPES, buildPlan, fallbackSuggestions } from './lib/planner'

const STORAGE_KEY = 'jashn-state-v2'

const REFINE_EXAMPLES = [
  'Keep the total spend low',
  'Spend more on food',
  'Reduce decor costs',
  'Prioritise photography',
]

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

function viewFromHash(hasPlan) {
  return window.location.hash === '#plan' && hasPlan ? 'plan' : 'home'
}

function capitalise(text) {
  const value = String(text || '')
  return value.charAt(0).toUpperCase() + value.slice(1)
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
  const [refineText, setRefineText] = useState('')
  const [refining, setRefining] = useState(false)
  const [refineNote, setRefineNote] = useState('')
  const [refineError, setRefineError] = useState('')

  const hasPlanRef = useRef(!!saved.plan)
  const [view, setView] = useState(() => viewFromHash(!!saved.plan))

  useEffect(() => {
    const onHashChange = () => setView(viewFromHash(hasPlanRef.current))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, plan, ideas, checked, spent }))
    } catch {
      // Storage may be unavailable; the app still works without it.
    }
  }, [form, plan, ideas, checked, spent])

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  function goHome() {
    window.location.hash = 'home'
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const result = buildPlan(form)
    if (result.error) {
      setError(result.error)
      return
    }

    const eventName =
      form.type === 'other' ? form.customType.trim() : EVENT_TYPES[form.type].noun

    hasPlanRef.current = true
    setPlan({ ...result, eventName })
    setChecked({})
    setSpent({})
    setIdeas(null)
    setRefineText('')
    setRefineNote('')
    setRefineError('')
    setLoading(true)
    setView('plan')
    window.location.hash = 'plan'

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

  async function handleRefine(e) {
    e.preventDefault()
    const instruction = refineText.trim()
    if (!instruction) {
      setRefineError('Describe what you would like to change.')
      return
    }

    const eventName =
      plan.eventName ||
      (form.type === 'other' ? form.customType.trim() : EVENT_TYPES[form.type].noun)

    setRefineError('')
    setRefineNote('')
    setRefining(true)

    try {
      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName,
          guests: plan.guests,
          budget: plan.total,
          city: form.city,
          vibe: form.vibe,
          instruction,
          categories: plan.budget.map(({ name, pct }) => ({ name, pct })),
        }),
      })
      if (!response.ok) {
        let reason = 'status ' + response.status
        try {
          const err = await response.json()
          if (err.error) reason = err.error
        } catch {
          // Response was not JSON, keep the status message.
        }
        throw new Error(reason)
      }
      const data = await response.json()
      if (!Array.isArray(data.budget)) throw new Error('AI response had no budget')

      setPlan((current) => ({
        ...current,
        budget: current.budget.map((item) => {
          const match = data.budget.find((b) => b.name === item.name)
          const pct = match && Number.isFinite(Number(match.pct)) ? Number(match.pct) : item.pct
          return { ...item, pct, amount: Math.round((current.total * pct) / 100) }
        }),
      }))
      setRefineNote(data.note || 'The budget split has been updated.')
      setRefineText('')
    } catch (err) {
      setRefineError('Could not refine the plan right now (' + err.message + '). Your plan is unchanged.')
    } finally {
      setRefining(false)
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

  const planTitle = plan
    ? capitalise(
        plan.eventName ||
          (form.type === 'other' ? form.customType.trim() : EVENT_TYPES[form.type]?.noun)
      )
    : ''
  const eventDateIso = plan ? plan.timeline[plan.timeline.length - 1].due : null

  return (
    <div className="app">
      <header className="header">
        <h1>Jashn</h1>
        <p>Plan the celebration, not the stress.</p>
      </header>

      {view === 'home' && (
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
            <p className="muted">
              You have a saved plan.{' '}
              <a href="#plan">View your last plan</a>
            </p>
          )}
        </main>
      )}

      {view === 'plan' && plan && (
        <main aria-live="polite">
          <div className="plan-head">
            <h2>{planTitle}</h2>
            <p className="muted">
              {plan.guests} guests
              {form.city ? ' in ' + form.city : ''}
              {eventDateIso ? ', ' + shortDate(eventDateIso) : ''}
            </p>
            <button type="button" className="back" onClick={goHome}>
              Edit details or plan another event
            </button>
          </div>

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
            <h2>Refine your plan</h2>
            <p className="muted">
              Tell Jashn what to change and the budget split will be adjusted to match.
            </p>
            <div className="chips">
              {REFINE_EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  className="chip"
                  onClick={() => setRefineText(example)}
                >
                  {example}
                </button>
              ))}
            </div>
            <form onSubmit={handleRefine}>
              <label htmlFor="refine">Your request</label>
              <input
                id="refine"
                type="text"
                maxLength={200}
                placeholder="Spend more on food and less on decor"
                value={refineText}
                onChange={(e) => setRefineText(e.target.value)}
              />
              <button type="submit" disabled={refining}>
                {refining ? 'Updating budget...' : 'Update budget'}
              </button>
            </form>
            {refineError && (
              <p className="message error" role="alert">
                {refineError}
              </p>
            )}
            {refineNote && <p className="message note">{refineNote}</p>}
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
        </main>
      )}

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