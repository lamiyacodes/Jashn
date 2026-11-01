const EXAMPLES = [
  'Keep the total spend low',
  'Spend more on food',
  'Reduce decor costs',
  'Prioritise photography',
]

export default function RefinePanel({ text, onTextChange, onSubmit, busy, note, error }) {
  return (
    <section className="card">
      <h2>Refine your plan</h2>
      <p className="muted">
        Tell Jashn what to change and the budget split will be adjusted to match.
      </p>
      <div className="chips">
        {EXAMPLES.map((example) => (
          <button key={example} type="button" className="chip" onClick={() => onTextChange(example)}>
            {example}
          </button>
        ))}
      </div>
      <form onSubmit={onSubmit}>
        <label htmlFor="refine">Your request</label>
        <input
          id="refine"
          type="text"
          maxLength={200}
          placeholder="Spend more on food and less on decor"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
        />
        <button type="submit" disabled={busy}>
          {busy ? 'Updating budget...' : 'Update budget'}
        </button>
      </form>
      {error && (
        <p className="message error" role="alert">
          {error}
        </p>
      )}
      {note && <p className="message note">{note}</p>}
    </section>
  )
}
