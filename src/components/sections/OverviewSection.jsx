export default function OverviewSection({ ideas, loading }) {
  return (
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
  )
}
