import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const siteUrl = "https://eireval.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "EirEval | Do LLMs know Irish financial regulation?",
    template: "%s | EirEval",
  },
  description:
    "An open, compliance-grade evaluation of frontier LLMs on Irish and EU financial regulation: Consumer Protection Code, MiFID II, AML, PSD2, Central Bank regime, EU AI Act. Accuracy is interesting. Confidently-wrong is the number that matters.",
  keywords: [
    "LLM evaluation",
    "financial regulation benchmark",
    "Irish financial regulation",
    "Central Bank of Ireland",
    "MiFID II",
    "EU AI Act finance",
    "model risk management",
    "AI compliance Ireland",
  ],
  alternates: { canonical: siteUrl },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "EirEval | Do LLMs know Irish financial regulation?",
    description: "Frontier models, examined on the rules that govern Irish finance. The metric that matters: how often they are confidently wrong.",
    siteName: "EirEval",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-sand">
          <nav className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="font-display text-xl">
              Eir<span className="text-clay">Eval</span>
            </Link>
            <div className="flex gap-6 font-mono text-xs uppercase tracking-wider text-muted">
              <Link href="/" className="hover:text-clay">Results</Link>
              <Link href="/dataset" className="hover:text-clay">Dataset</Link>
              <Link href="/methodology" className="hover:text-clay">Methodology</Link>
            </div>
          </nav>
        </header>
        {children}
        <footer className="border-t border-sand mt-20">
          <div className="max-w-5xl mx-auto px-6 py-8 text-sm text-muted flex flex-wrap gap-4 justify-between">
            <span>
              Built by{" "}
              <a href="https://navinaamuthan.vercel.app" className="text-clay hover:underline">
                Navina Ganapathy Amuthan
              </a>{" "}
              in Dublin.
            </span>
            <span>Dataset CC-BY-4.0. Not legal advice; models are graded, people should still read the regulations.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
