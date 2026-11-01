# Jashn

**Plan the celebration, not the stress.**

Jashn is a GenAI-powered celebration and event planner. It turns a few details about an event into a budget, a countdown timeline, a vendor checklist and personalised ideas, and lets the user reshape the budget by describing what they want changed.

Built for **Hack2Skill PromptWars, Challenge 05: Celebration and Event Planner** by Lamiya Zainab Abidi.

- Live app: https://jashn-red.vercel.app
- Repository: https://github.com/lamiyacodes/Jashn

## Chosen vertical and persona

**Vertical:** Celebration and Event Planner (weddings, birthdays and community events).

**Persona:** an organiser in India, such as a family member, a student club lead or a neighbourhood volunteer, who has a fixed budget in rupees, limited time and no professional planner. They need a realistic starting plan quickly, and they need to be able to change it as their priorities change.

## Approach and logic

The planner separates what must be reliable from what benefits from AI.

1. **Rules decide the structure.** Each event type has a template: a percentage budget split, a list of vendor categories and a countdown timeline measured in weeks before the event. The budget, timeline and checklist always come from these templates, so they are fast, free, predictable and testable.
2. **Context adjusts the plan.** The total budget and guest count produce rupee amounts and a cost per guest. If the event date is closer than the ideal lead time for that event type, the timeline is compressed proportionally, so the first task never falls in the past, and the user is told.
3. **AI adds personalisation and flexibility.** Gemini writes ideas and tips specific to the event type, budget, city and theme, and it rebalances the budget when the user describes a change in plain language.
4. **The app degrades gracefully.** If the AI is busy or unavailable, the app falls back to built-in suggestions and says so. The planner is never blocked by an API failure.

## How the solution works

1. The user picks one of nine event types (or chooses Other and types their own), then enters guests, budget, date, city and an optional theme.
2. The app validates the input and builds the plan locally, then shows the results page: a summary, a left menu (Overview, Budget, Timeline, Checklist, Spending tracker) and a Refine panel on the right.
3. In parallel, the browser calls `/api/plan`, a serverless function that asks Gemini for four ideas and three tips. While it runs the user can already read the rest of the plan.
4. In the Refine panel the user types a request such as "spend more on food and less on decor". The browser calls `/api/refine`, which sends the current split and the request to Gemini, validates the answer and returns a new split with a short explanation.
5. The user can tick vendors off, record actual spending per category and get warnings when a category or the total budget is exceeded.
6. The plan is saved in the browser, and the user can keep it or delete it.

## Assumptions

- All amounts are in Indian rupees, and the default templates reflect typical Indian celebrations.
- Budget percentages and lead times in the templates are reasonable starting points, not quotes. Real costs vary by city, season and vendor.
- Vendor entries are categories to book, not recommendations of specific businesses.
- The AI output is advice. The user is expected to review it before acting on it.
- Dates are treated as calendar dates in the user's own time zone.
- Event wording is kept neutral so it suits different traditions. For example, the wedding checklist asks for a ceremony officiant "as per your tradition".
- There are no user accounts. The plan lives in the browser's local storage, so it is private to the device.
- When refining, the prompt asks the model to keep the contingency category at 5 percent or more. This is a prompt instruction, not a hard rule enforced in code.

## Features

- Nine event types plus a custom type for any other event.
- Budget allocation in rupees with a donut chart and a per-guest figure.
- Countdown timeline that compresses itself for close dates.
- Vendor checklist with a progress bar.
- Personalised ideas and tips from Gemini.
- Refine your plan: the budget is rebalanced from a plain-language request.
- Spending tracker with overspend warnings.
- Keep or delete the saved plan.

## AI usage and safeguards

| Feature | Endpoint | What Gemini does |
| --- | --- | --- |
| Ideas and tips | `api/plan.js` | Writes four ideas and three tips tailored to the event, city, budget and theme |
| Plan refinement | `api/refine.js` | Reads the current budget split and a request, then returns a new split with an explanation |

- The API key is a server-side environment variable and is never sent to the browser or committed to the repository.
- User input is trimmed, length-limited and passed to the model as data, not as instructions.
- Model replies are requested as JSON, cleaned and validated. For refinement, categories are matched by name and the percentages are rescaled to total exactly 100.
- Temporary Gemini errors are retried with a short pause, then a second, lighter model is tried.
- Each request has a time limit, so a slow response cannot hang the page.
- If the AI cannot answer, the user sees built-in suggestions and a clear label.

## Testing

```bash
npm test
```

The test suite uses Vitest and covers the planning logic in `src/lib/planner.js`:

- every event type's budget split adds up to 100 percent and keeps a contingency line
- the timeline counts down in order and ends on the event day
- rupee amounts, cost per guest and days remaining are calculated correctly
- the timeline is compressed only when the event date is close
- invalid input (missing budget, guests or date, unknown type, past date, empty custom type) is rejected with a clear message
- the built-in fallback suggestions are complete for every event type

The tests also run automatically on every push through GitHub Actions.

## Accessibility

- Every input has a visible label.
- The checklist progress bar uses the `progressbar` role with value attributes.
- The chart has a text alternative, and its legend repeats every value as text.
- The plan menu marks the current section with `aria-current`.
- Results are announced through an `aria-live` region, and errors use `role="alert"`.
- Keyboard focus is clearly visible on every control.
- The layout is responsive and works from phone width upward.

## Tech stack

- React and Vite
- Vercel serverless functions
- Google Gemini API
- Vitest for tests
- Plain CSS, no UI library

## Run locally

```bash
git clone https://github.com/lamiyacodes/Jashn.git
cd Jashn
npm install
npm run dev
```

The planner, budget, timeline, checklist and tracker work locally. The two AI endpoints run as Vercel serverless functions, so locally the app shows its built-in suggestions.

## Deploy

1. Import the repository into Vercel.
2. Add an environment variable named `GEMINI_API_KEY` with a key from Google AI Studio.
3. Deploy. The `api` folder is picked up automatically.

## Project structure

```
api/plan.js                 Gemini call for ideas and tips
api/refine.js               Gemini call for budget refinement
api/_lib/gemini.js          Shared Gemini helper: retries, backup model, timeouts
api/_lib/shape.js           Validation and rescaling of AI replies
src/App.jsx                 State and page flow
src/components/             Header, footer, home page, plan page, refine panel, chart
src/components/sections/    Overview, budget, timeline, checklist and tracker sections
src/hooks/                  Debounced saving
src/lib/planner.js          Event templates, budget, timeline and fallback logic
src/lib/format.js           Rupee, date and text formatting
src/lib/api.js              JSON request helper
src/lib/ideasCache.js       Session cache that avoids repeated AI calls
src/lib/storage.js          Browser storage helpers
.github/workflows/ci.yml    Lint, tests and build on every push
vercel.json                 Function timeouts, security and cache headers
```


## Author

Lamiya Zainab Abidi, BCA student specialising in AI, ML and Data Science.
