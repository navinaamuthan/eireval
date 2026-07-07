#!/usr/bin/env node
/**
 * EirEval runner. Usage:
 *   ANTHROPIC_API_KEY=... OPENAI_API_KEY=... GOOGLE_API_KEY=... GROQ_API_KEY=... node scripts/run_eval.mjs
 * Reads data/questions.json, queries each configured model, grades, writes results/results.json.
 * Providers without a key are skipped. Requires Node 18+ (global fetch).
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const { questions, meta } = JSON.parse(readFileSync(path.join(root, "data/questions.json"), "utf8"));

// ── Edit model ids here as new models ship ──────────────────────────────
const MODELS = [
  { provider: "anthropic", id: "claude-sonnet-5", label: "Claude Sonnet 5" },
  { provider: "anthropic", id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" },
  { provider: "openai", id: "gpt-4o", label: "GPT-4o" },
  { provider: "google", id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  { provider: "groq", id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B (Groq)" },
];
const CONFIDENT_THRESHOLD = 80; // wrong + confidence >= this = "confidently wrong"

const SYSTEM = `You are being evaluated on Irish and EU financial regulation. Answer the multiple-choice question.
Respond with ONLY a JSON object, no other text: {"answer": "A"|"B"|"C"|"D"|"ABSTAIN", "confidence": <integer 0-100>}
Use "ABSTAIN" if you are not reasonably sure. confidence is your probability that your answer is correct.`;

function userPrompt(q) {
  const opts = Object.entries(q.options).map(([k, v]) => `${k}. ${v}`).join("\n");
  return `${q.question}\n\n${opts}`;
}

async function askAnthropic(model, q) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model, max_tokens: 100, system: SYSTEM, messages: [{ role: "user", content: userPrompt(q) }] }),
  });
  if (!r.ok) throw new Error(`anthropic ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return j.content?.[0]?.text ?? "";
}

async function askOpenAI(model, q) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ model, max_tokens: 100, messages: [{ role: "system", content: SYSTEM }, { role: "user", content: userPrompt(q) }] }),
  });
  if (!r.ok) throw new Error(`openai ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content ?? "";
}

async function askGoogle(model, q) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM }] }, contents: [{ parts: [{ text: userPrompt(q) }] }], generationConfig: { maxOutputTokens: 100 } }),
  });
  if (!r.ok) throw new Error(`google ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return j.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function askGroq(model, q) {
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.GROQ_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      max_tokens: 100,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: SYSTEM }, { role: "user", content: userPrompt(q) }],
    }),
  });
  if (!r.ok) throw new Error(`groq ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content ?? "";
}

const ASK = { anthropic: askAnthropic, openai: askOpenAI, google: askGoogle, groq: askGroq };
const KEY = { anthropic: "ANTHROPIC_API_KEY", openai: "OPENAI_API_KEY", google: "GOOGLE_API_KEY", groq: "GROQ_API_KEY" };

function parseResponse(text) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    const j = JSON.parse(m[0]);
    const answer = String(j.answer ?? "").toUpperCase().trim();
    const confidence = Math.max(0, Math.min(100, Number(j.confidence)));
    if (!["A", "B", "C", "D", "ABSTAIN"].includes(answer) || Number.isNaN(confidence)) return null;
    return { answer, confidence };
  } catch {
    return null;
  }
}

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function evalModel(model) {
  const rows = [];
  for (const q of questions) {
    let parsed = null, raw = "", error = null;
    for (let attempt = 0; attempt < 3 && !parsed; attempt++) {
      try {
        raw = await ASK[model.provider](model.id, q);
        parsed = parseResponse(raw);
        if (!parsed) await sleep(500);
      } catch (e) {
        error = String(e.message).slice(0, 200);
        await sleep(2000 * (attempt + 1));
      }
    }
    const answer = parsed?.answer ?? "PARSE_FAIL";
    const confidence = parsed?.confidence ?? null;
    const correct = answer === q.correct;
    rows.push({ id: q.id, domain: q.domain, answer, confidence, correct, expected: q.correct, error });
    process.stdout.write(`  ${q.id}: ${answer}${confidence != null ? ` (${confidence})` : ""} ${correct ? "✓" : answer === "ABSTAIN" ? "·" : "✗"}\n`);
    await sleep(300);
  }
  const total = rows.length;
  const answered = rows.filter((r) => ["A", "B", "C", "D"].includes(r.answer));
  const abstained = rows.filter((r) => r.answer === "ABSTAIN").length;
  const correct = rows.filter((r) => r.correct).length;
  const confidentlyWrong = answered.filter((r) => !r.correct && r.confidence >= CONFIDENT_THRESHOLD).length;
  const byDomain = {};
  for (const r of rows) {
    byDomain[r.domain] ??= { total: 0, correct: 0 };
    byDomain[r.domain].total++;
    if (r.correct) byDomain[r.domain].correct++;
  }
  const meanConf = (rs) => (rs.length ? Math.round(rs.reduce((s, r) => s + (r.confidence ?? 0), 0) / rs.length) : null);
  return {
    label: model.label,
    provider: model.provider,
    model: model.id,
    total,
    accuracy: +(correct / total * 100).toFixed(1),
    abstainRate: +(abstained / total * 100).toFixed(1),
    confidentlyWrongRate: +(confidentlyWrong / total * 100).toFixed(1),
    meanConfidenceWhenRight: meanConf(answered.filter((r) => r.correct)),
    meanConfidenceWhenWrong: meanConf(answered.filter((r) => !r.correct)),
    byDomain,
    rows,
  };
}

const runnable = MODELS.filter((m) => process.env[KEY[m.provider]]);
if (!runnable.length) {
  console.error("No API keys found. Set at least one of ANTHROPIC_API_KEY / OPENAI_API_KEY / GOOGLE_API_KEY / GROQ_API_KEY (see .env.example).");
  process.exit(1);
}
console.log(`EirEval: ${questions.length} questions × ${runnable.length} models (skipping ${MODELS.length - runnable.length} without keys)\n`);
const results = [];
for (const m of runnable) {
  console.log(`── ${m.label} (${m.id})`);
  results.push(await evalModel(m));
}
mkdirSync(path.join(root, "results"), { recursive: true });
writeFileSync(
  path.join(root, "results/results.json"),
  JSON.stringify({ meta: { ...meta, generated_at: new Date().toISOString(), sample: false, confident_threshold: CONFIDENT_THRESHOLD }, models: results }, null, 2)
);
console.log("\nWrote results/results.json — rebuild/redeploy the site to publish.");
