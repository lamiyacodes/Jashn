export default function ChecklistSection({ plan, checked, onToggle }) {
  const completed = plan.vendors.filter((vendor) => checked[vendor]).length
  const progress = Math.round((completed / plan.vendors.length) * 100)

  return (
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
          <input type="checkbox" checked={!!checked[vendor]} onChange={() => onToggle(vendor)} />
          <span className={checked[vendor] ? 'done' : ''}>{vendor}</span>
        </label>
      ))}
    </section>
  )
}
