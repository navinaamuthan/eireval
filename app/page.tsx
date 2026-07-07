import results from "@/results/results.json";
import questions from "@/data/questions.json";

type ModelResult = (typeof results.models)[number];

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  return (
    <div className="card p-5">
      <p className={`font-display text-3xl ${tone === "bad" ? "text-bad" : tone === "good" ? "text-good" : ""}`}>{value}</p>
      <p className="font-mono text-[11px] uppercase tracking-wider text-muted mt-1">{label}</p>
    </div>
  );
}

function Bar({ pct }: { pct: number }) {
  return (
    <div className="h-2 rounded-full bg-sand overflow-hidden">
      <div className="h-full rounded-full bg-clay" style={{ width: `${Math.max(2, pct)}%` }} />
    </div>
  );
}

export default function Home() {
  const isSample = (results.meta as { sample?: boolean }).sample;
  const models = [...results.models].sort((a, b) => b.accuracy - a.accuracy);
  const domains = Array.from(new Set(questions.questions.map((q) => q.domain)));

  return (
    <main className="max-w-5xl mx-auto px-6">
      <section className="py-16 md:py-24">
        <p className="eyebrow mb-4">An open evaluation · {questions.questions.length} questions · 6 regulatory domains</p>
        <h1 className="font-display text-4xl md:text-6xl leading-tight max-w-3xl">
          Do LLMs actually know <span className="text-clay italic">Irish financial regulation</span>?
        </h1>
        <p className="mt-6 text-lg text-muted max-w-2xl leading-relaxed">
          Banks want to put language models in front of regulated processes. Before that happens, someone should
          check what the models believe about the Consumer Protection Code, MiFID II, AML law, PSD2, the Central
          Bank regime and the EU AI Act. Accuracy is interesting. <strong className="text-ink">Confidently wrong</strong>{" "}
          is the number a model-risk committee actually cares about.
        </p>
      </section>

      {isSample && (
        <div className="mb-10 rounded-2xl border-2 border-dashed border-bad/50 bg-bad/5 p-5 text-sm">
          <strong>Sample layout — no real results yet.</strong> These numbers are placeholders. Run{" "}
          <code className="font-mono bg-sand px-1.5 py-0.5 rounded">npm run eval</code> with API keys to publish
          measured results.
        </div>
      )}

      <section className="space-y-10">
        {models.map((m: ModelResult) => (
          <div key={m.model} className="card p-6 md:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
              <h2 className="font-display text-2xl">{m.label}</h2>
              <span className="font-mono text-xs text-muted">{m.model}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Stat label="Accuracy" value={`${m.accuracy}%`} />
              <Stat label="Confidently wrong" value={`${m.confidentlyWrongRate}%`} tone="bad" />
              <Stat label="Abstained" value={`${m.abstainRate}%`} />
              <Stat
                label="Confidence right vs wrong"
                value={
                  m.meanConfidenceWhenRight != null && m.meanConfidenceWhenWrong != null
                    ? `${m.meanConfidenceWhenRight} / ${m.meanConfidenceWhenWrong}`
                    : "—"
                }
              />
            </div>
            <div className="space-y-3">
              {domains.map((d) => {
                const dd = (m.byDomain as Record<string, { total: number; correct: number }>)[d];
                const pct = dd ? Math.round((dd.correct / dd.total) * 100) : 0;
                return (
                  <div key={d} className="grid md:grid-cols-[260px_1fr_60px] items-center gap-3">
                    <span className="text-sm">{d}</span>
                    <Bar pct={pct} />
                    <span className="font-mono text-xs text-muted text-right">
                      {dd ? `${dd.correct}/${dd.total}` : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <section className="py-16 text-sm text-muted max-w-2xl">
        <p>
          Generated {new Date((results.meta as { generated_at: string }).generated_at).toDateString()} · threshold for
          &ldquo;confidently wrong&rdquo;: answered incorrectly with self-reported confidence ≥{" "}
          {(results.meta as { confident_threshold: number }).confident_threshold}. Full item-level data and grading
          method on the <a href="/methodology" className="text-clay hover:underline">methodology page</a>.
        </p>
      </section>
    </main>
  );
}
