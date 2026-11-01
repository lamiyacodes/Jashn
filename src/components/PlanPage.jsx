import { EVENT_TYPES } from '../lib/planner'
import { capitalise, rupees, shortDate, titleCase } from '../lib/format'
import OverviewSection from './sections/OverviewSection'
import BudgetSection from './sections/BudgetSection'
import TimelineSection from './sections/TimelineSection'
import ChecklistSection from './sections/ChecklistSection'
import TrackerSection from './sections/TrackerSection'
import RefinePanel from './RefinePanel'

const SECTIONS = [
  ['overview', 'Overview'],
  ['budget', 'Budget'],
  ['timeline', 'Timeline'],
  ['checklist', 'Checklist'],
  ['tracker', 'Spending tracker'],
]

export default function PlanPage({
  plan,
  form,
  ideas,
  loading,
  section,
  onSectionChange,
  checked,
  onToggleVendor,
  spent,
  onSpentChange,
  refine,
}) {
  const fallbackName =
    form.type === 'other' ? form.customType.trim() : EVENT_TYPES[form.type]?.noun
  const title = capitalise(plan.eventName || fallbackName)
  const eventDate = plan.timeline[plan.timeline.length - 1].due

  return (
    <main className="container" aria-live="polite">
      <div className="plan-head">
        <h2>{title}</h2>
        <p className="muted">
          {plan.guests} guests
          {form.city ? ' in ' + titleCase(form.city) : ''}
          {', ' + shortDate(eventDate)}
        </p>
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

      <div className="workspace">
        <nav className="sidenav" aria-label="Plan sections">
          {SECTIONS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={'nav-btn' + (section === key ? ' active' : '')}
              aria-current={section === key ? 'page' : undefined}
              onClick={() => onSectionChange(key)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="content">
          {section === 'overview' && <OverviewSection ideas={ideas} loading={loading} />}
          {section === 'budget' && <BudgetSection plan={plan} />}
          {section === 'timeline' && <TimelineSection plan={plan} />}
          {section === 'checklist' && (
            <ChecklistSection plan={plan} checked={checked} onToggle={onToggleVendor} />
          )}
          {section === 'tracker' && (
            <TrackerSection plan={plan} spent={spent} onChange={onSpentChange} />
          )}
        </div>

        <aside className="aside">
          <RefinePanel {...refine} />
        </aside>
      </div>
    </main>
  )
}
