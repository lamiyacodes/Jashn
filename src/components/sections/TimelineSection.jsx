import { shortDate } from '../../lib/format'

export default function TimelineSection({ plan }) {
  return (
    <section className="card">
      <h2>Timeline</h2>
      {plan.compressed && (
        <p className="message warning">
          The event is closer than the ideal lead time, so the schedule has been compressed. Start
          with the first item immediately.
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
  )
}
