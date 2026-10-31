# Jashn

**Plan the celebration, not the stress.**

Jashn is a GenAI-powered celebration and event planner. It turns a few details about an event into a budget, a timeline, a vendor checklist and personalised ideas, and lets the user reshape the budget by simply describing what they want changed.

Built for **Hack2Skill PromptWars, Challenge 05: Celebration and Event Planner** by Lamiya Zainab Abidi.

- Live app: https://jashn-red.vercel.app
- Repository: https://github.com/lamiyacodes/Jashn

## What it does

- **Nine event types:** wedding, engagement, anniversary, birthday, baby shower, community event, college event, corporate event, and Other, where the user types any event they like (for example a mehendi night or a housewarming).
- **Budget allocation:** splits the total budget into categories, shown in rupees with a per-guest figure.
- **Timeline:** a countdown plan worked out from the event date. If the date is closer than the ideal lead time, the schedule is compressed and the user is told.
- **Vendor checklist:** a tickable list with a live progress bar.
- **Personalised ideas:** Gemini writes ideas and planning tips specific to the event type, budget, city and theme.
- **Refine your plan:** the user types a request such as "spend more on food and less on decor", and Gemini proposes a new budget split that updates the plan.
- **Spending tracker:** the user enters what they have actually spent, and the app warns when a category or the whole budget is exceeded.
- **Saved in the browser:** the plan survives a page refresh.

## How AI is used

| Feature | Where | What Gemini does |
| --- | --- | --- |
| Ideas and tips | `api/plan.js` | Writes four ideas and three tips tailored to the event, city, budget and theme |
| Plan refinement | `api/refine.js` | Reads the current budget split and a plain-language request, then returns a new split with a short explanation |

The AI is wrapped in safeguards so the app stays dependable:

- The API key lives only on the server, as an environment variable. It is never sent to the browser.
- User input is trimmed, length-limited and passed to the model as data, not instructions.
- Replies are requested as JSON, cleaned, and validated. For refinement, categories are matched by name and the percentages are rescaled to total exactly 100.
- Temporary Gemini errors are retried once, then a second, lighter model is tried.
- If the AI is unavailable, the app falls back to built-in suggestions and clearly labels them, so the planner never breaks.

## Tech stack

- React and Vite
- Vercel serverless functions
- Google Gemini API
- Plain CSS, no UI library

## Accessibility

- Every input has a visible label.
- The checklist progress bar uses the `progressbar` role with value attributes.
- Results are announced through an `aria-live` region and errors use `role="alert"`.
- Keyboard focus states are visible, and the layout is responsive down to phone width.

## Run locally

```bash
git clone https://github.com/lamiyacodes/Jashn.git
cd Jashn
npm install --legacy-peer-deps
npm run dev
```

The planner, budget, timeline, checklist and tracker work locally. The two AI endpoints run as Vercel serverless functions, so locally the app shows its built-in suggestions.

## Deploy

1. Import the repository into Vercel.
2. Add an environment variable named `GEMINI_API_KEY` with a key from Google AI Studio.
3. Deploy. The `/api` folder is picked up automatically.

## Project structure

```
api/plan.js          Gemini call for ideas and tips
api/refine.js        Gemini call for budget refinement
src/App.jsx          Interface
src/App.css          Styles
src/lib/planner.js   Event templates, budget, timeline and fallback logic
vercel.json          Function timeout
```

## Author

Lamiya Zainab Abidi, BCA student specialising in AI, ML and Data Science.
