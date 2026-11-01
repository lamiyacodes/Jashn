import { EVENT_TYPES } from '../lib/planner'

const FEATURES = [
  'Budget split with a clear chart',
  'Countdown timeline built from your date',
  'Vendor checklist with progress',
  'Ideas written for your city and theme',
  'Refine the plan just by asking',
]

const STEPS = [
  ['1', 'Describe your event', 'Choose the event type, guests, budget, date and city.'],
  ['2', 'Get a complete plan', 'Budget, timeline, vendor checklist and personalised ideas in seconds.'],
  ['3', 'Refine it by asking', 'Say what to change and the budget is rebalanced for you.'],
]

export default function HomePage({
  form,
  update,
  error,
  loading,
  onSubmit,
  hasSavedPlan,
  confirmDelete,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
}) {
  return (
    <main className="container">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Weddings, birthdays, fests and more</p>
          <h1>
            Plan the celebration, <em>not the stress.</em>
          </h1>
          <p className="lead">
            Tell Jashn about your event and get a budget, a countdown timeline, a vendor checklist
            and ideas written for your city. Then reshape the plan just by asking.
          </p>
          <ul className="feature-list">
            {FEATURES.map((feature) => (
              <li key={feature}>
                <span className="dot" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="hero-form">
          <form className="card" onSubmit={onSubmit}>
            <h2>Start your plan</h2>

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
                <label htmlFor="budget">Total budget (&#8377;)</label>
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

          {hasSavedPlan && (
            <div className="saved">
              <p className="muted">You have a saved plan.</p>
              {!confirmDelete ? (
                <div className="saved-actions">
                  <a href="#plan">View your last plan</a>
                  <button type="button" className="link-btn danger" onClick={onAskDelete}>
                    Delete saved plan
                  </button>
                </div>
              ) : (
                <div className="saved-actions" role="alert">
                  <span>Delete this plan?</span>
                  <button type="button" className="link-btn danger" onClick={onConfirmDelete}>
                    Yes, delete
                  </button>
                  <button type="button" className="link-btn" onClick={onCancelDelete}>
                    Keep it
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="steps" aria-label="How it works">
        {STEPS.map(([num, title, text]) => (
          <div key={num} className="step">
            <span className="num">{num}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
