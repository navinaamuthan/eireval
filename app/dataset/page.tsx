import questions from "@/data/questions.json";

export const metadata = { title: "Dataset" };

export default function Dataset() {
  const items = questions.questions;
  const verified = items.filter((q) => q.verified).length;
  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <p className="eyebrow mb-4">The dataset · v0.1 · CC-BY-4.0</p>
      <h1 className="font-display text-4xl mb-4">{items.length} questions, every one with a source.</h1>
      <p className="text-muted max-w-2xl mb-4">
        Multiple choice with an explicit abstain option. Each item cites the instrument and provision it is drawn
        from, so anyone can check the ground truth — and should. Items are marked{" "}
        <span className="font-mono text-xs">verified</span> only after a human has read the cited provision.
      </p>
      <p className="font-mono text-xs text-muted mb-10">
        Human-verified: {verified}/{items.length} · target size: 150 · contributions welcome via GitHub
      </p>

      <div className="space-y-4">
        {items.map((q) => (
          <details key={q.id} className="card p-5 group">
            <summary className="cursor-pointer list-none flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-xs text-clay">{q.id}</span>
              <span className="flex-1 min-w-[200px]">{q.question}</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                {q.domain} · {q.difficulty} · {q.verified ? "verified" : "unverified"}
              </span>
            </summary>
            <div className="mt-4 pl-1 text-sm space-y-1">
              {Object.entries(q.options).map(([k, v]) => (
                <p key={k} className={k === q.correct ? "text-good font-medium" : "text-muted"}>
                  {k}. {v} {k === q.correct && "✓"}
                </p>
              ))}
              <p className="pt-2 font-mono text-xs text-muted">
                Source: {q.source.instrument} — {q.source.provision}
              </p>
            </div>
          </details>
        ))}
      </div>
    </main>
  );
}
