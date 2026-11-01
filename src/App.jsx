import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { EVENT_TYPES, buildPlan, fallbackSuggestions } from './lib/planner'
import { postJson } from './lib/api'
import { cacheIdeas, readCachedIdeas } from './lib/ideasCache'
import { clearState, loadState } from './lib/storage'
import useDebouncedSave from './hooks/useDebouncedSave'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'
import HomePage from './components/HomePage'

// The results page is only downloaded once a plan exists.
const PlanPage = lazy(() => import('./components/PlanPage'))

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

export default function App() {
  const [saved] = useState(loadState)
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
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [section, setSection] = useState('overview')

  const hasPlanRef = useRef(!!saved.plan)
  const [view, setView] = useState(() => viewFromHash(!!saved.plan))

  const persisted = useMemo(
    () => ({ form, plan, ideas, checked, spent }),
    [form, plan, ideas, checked, spent]
  )
  useDebouncedSave(persisted)

  useEffect(() => {
    const onHashChange = () => setView(viewFromHash(hasPlanRef.current))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view])

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  function goHome() {
    window.location.hash = 'home'
  }

  function clearSavedPlan() {
    hasPlanRef.current = false
    setPlan(null)
    setIdeas(null)
    setChecked({})
    setSpent({})
    setRefineText('')
    setRefineNote('')
    setRefineError('')
    setForm(DEFAULT_FORM)
    setConfirmDelete(false)
    clearState()
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
    const cached = readCachedIdeas(form)

    hasPlanRef.current = true
    setPlan({ ...result, eventName })
    setChecked({})
    setSpent({})
    setIdeas(cached ? { ...cached, source: 'gemini' } : null)
    setRefineText('')
    setRefineNote('')
    setRefineError('')
    setConfirmDelete(false)
    setSection('overview')
    setLoading(!cached)
    setView('plan')
    window.location.hash = 'plan'

    // The same request was answered earlier in this session, so skip the AI call.
    if (cached) return

    try {
      const data = await postJson('/api/plan', form)
      if (!Array.isArray(data.ideas) || data.ideas.length === 0) {
        throw new Error('AI response had no ideas')
      }
      cacheIdeas(form, data)
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
      const data = await postJson('/api/refine', {
        eventName,
        guests: plan.guests,
        budget: plan.total,
        city: form.city,
        vibe: form.vibe,
        instruction,
        categories: plan.budget.map(({ name, pct }) => ({ name, pct })),
      })
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

  const toggleVendor = (vendor) =>
    setChecked((current) => ({ ...current, [vendor]: !current[vendor] }))

  const changeSpent = (name, value) => setSpent((current) => ({ ...current, [name]: value }))

  return (
    <div className="site">
      <SiteHeader view={view} onEdit={goHome} />

      {view === 'home' && (
        <HomePage
          form={form}
          update={update}
          error={error}
          loading={loading}
          onSubmit={handleSubmit}
          hasSavedPlan={!!plan}
          confirmDelete={confirmDelete}
          onAskDelete={() => setConfirmDelete(true)}
          onCancelDelete={() => setConfirmDelete(false)}
          onConfirmDelete={clearSavedPlan}
        />
      )}

      {view === 'plan' && plan && (
        <Suspense
          fallback={
            <main className="container">
              <p className="muted">Loading your plan...</p>
            </main>
          }
        >
          <PlanPage
            plan={plan}
            form={form}
            ideas={ideas}
            loading={loading}
            section={section}
            onSectionChange={setSection}
            checked={checked}
            onToggleVendor={toggleVendor}
            spent={spent}
            onSpentChange={changeSpent}
            refine={{
              text: refineText,
              onTextChange: setRefineText,
              onSubmit: handleRefine,
              busy: refining,
              note: refineNote,
              error: refineError,
            }}
          />
        </Suspense>
      )}

      <SiteFooter />
    </div>
  )
}
