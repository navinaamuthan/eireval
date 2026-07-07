# EirEval — Do LLMs know Irish financial regulation?

An open, compliance-grade evaluation of frontier LLMs on Irish and EU financial regulation:
Consumer Protection Code, MiFID II, AML/CFT, Banking & Payments (PSD2/DGS), the Central Bank
regime (F&P, SEAR), and AI & Data in finance (EU AI Act, GDPR, DORA).

**The headline metric is not accuracy — it's the confidently-wrong rate**: the share of questions a
model answers incorrectly while reporting ≥80 confidence. That is the failure mode a model-risk
committee actually fears.

Built by [Navina Ganapathy Amuthan](https://navinaamuthan.vercel.app) · dataset CC-BY-4.0 · not legal advice.

## Quick start

```bash
npm install
cp .env.example .env        # add ANTHROPIC_API_KEY / OPENAI_API_KEY / GOOGLE_API_KEY / GROQ_API_KEY (any subset)
npm run eval                # queries the models, writes results/results.json (~5 min)
npm run dev                 # view at localhost:3000
```

Model ids are configured at the top of `scripts/run_eval.mjs` — update them as new models ship.
Estimated API cost for a full run: cents, not euros (36 short questions × 4 models).

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. vercel.com → Add New Project → import the repo → Deploy (defaults are fine; no env vars needed —
   the site renders committed `results/results.json`; the eval itself runs locally).
3. To publish new results: `npm run eval`, commit `results/results.json`, push. Vercel redeploys.

## The verification workflow (IMPORTANT — do this before promoting the site)

Every question ships `"verified": false`. Before publicising results:

1. Open `data/questions.json`. For each item, read the cited instrument/provision (EUR-Lex for
   directives/regulations, irishstatutebook.ie for Acts, centralbank.ie for codes).
2. Confirm the correct answer against the source text **as currently in force** — several
   instruments here are amended regularly (CPC revision, AML acts).
3. Flip `"verified": true` (or fix/retire the item — never silently change an answer after results
   are published; retire and version instead).
4. The dataset page shows the verified count publicly. Credibility = that number.

## Growing to 150 items

Add items to `data/questions.json` following the existing schema (unique id, domain, 4 options,
source citation, `verified: false`). Good sources for new items: CBI Consumer Protection Code,
CCMA, MCC, F&P Q&As; ESMA/EBA Q&As; the AI Act's finance-relevant articles. Keep the domain
balance roughly even, and prefer questions whose answers are stable in law over news-cycle trivia.

## Design decisions (the short version)

- **MCQ + exact match, no LLM judge**: a model shouldn't grade a model in a compliance eval.
- **Explicit ABSTAIN option**: rewards honesty; makes overconfidence measurable.
- **Source citation on every item**: the dataset is an auditable artifact, not a quiz.
- **verified flags**: the eval's own compliance posture — trust is earned per-item.
