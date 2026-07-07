export const metadata = { title: "Methodology" };

export default function Methodology() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-10">
      <div>
        <p className="eyebrow mb-4">Methodology</p>
        <h1 className="font-display text-4xl">How the eval works, and why it is built this way.</h1>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">Format: multiple choice with abstention</h2>
        <p className="text-muted leading-relaxed">
          Every item is a four-option multiple-choice question with an explicit ABSTAIN option, graded by exact
          match. No LLM-as-judge for grading — a compliance eval should not have a model marking a model&apos;s
          homework. Models also report a 0–100 confidence with each answer.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">The metric that matters: confidently wrong</h2>
        <p className="text-muted leading-relaxed">
          A model that says &ldquo;I don&apos;t know&rdquo; is safe to deploy with guardrails. A model that asserts
          the wrong customer-due-diligence threshold with 95% confidence is a regulatory incident waiting for a
          timestamp. We report the share of items answered incorrectly with self-reported confidence ≥ 80 — the
          failure mode model-risk teams actually fear — alongside plain accuracy, abstention rate, and mean
          confidence when right versus wrong (a crude calibration signal).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">Ground truth and its limits</h2>
        <p className="text-muted leading-relaxed">
          Every question cites its source instrument and provision (directive, regulation, Irish statute, or
          Central Bank code). Items are marked <em>verified</em> only after a human has re-read the cited provision.
          Regulation changes: items carry the dataset version date, and anything superseded gets retired, not
          silently edited. Corrections are welcome and credited — file an issue with the provision text.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">What this is not</h2>
        <p className="text-muted leading-relaxed">
          Not legal advice, not a claim that any model is fit or unfit for deployment, and not a substitute for a
          firm&apos;s own model validation. It is a public, reproducible starting point for a conversation that is
          currently happening on vibes: whether language models know the rules of the market they are about to be
          deployed into.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">Reproduce it</h2>
        <p className="text-muted leading-relaxed font-mono text-sm bg-white/70 border border-sand rounded-2xl p-5">
          git clone → npm install → add API keys to .env → npm run eval → results/results.json → npm run build
        </p>
      </section>
    </main>
  );
}
