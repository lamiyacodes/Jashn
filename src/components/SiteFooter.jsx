const REPO_URL = 'https://github.com/lamiyacodes/Jashn'

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-start">
          <button
            type="button"
            className="link-btn"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Back to top
          </button>
        </div>
        <div className="footer-center">
          <p className="footer-main">Jashn ~ Built for Hack2Skill PromptWars 2026</p>
          <p className="footer-tagline">Plan the celebration, not the stress.</p>
          <p className="footer-credit">
            Designed and developed by <strong>Lamiya Zainab Abidi</strong>
          </p>
        </div>
        <div className="footer-end">
          <a className="gh-btn" href={REPO_URL} target="_blank" rel="noreferrer">
            View on GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}
