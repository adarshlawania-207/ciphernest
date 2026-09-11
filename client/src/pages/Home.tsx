import { useMemo, useState } from "react";

const cases = {
  clean: {
    type: "PACKET 01 · CONSISTENT",
    title: "Clean identity packet",
    description: "Aadhaar, PAN and licence agree across the available fields.",
    risk: 7,
    verdict: "VERIFIED",
    titleResult: "Identity record verified",
    copy: "No contradictions were found across the available evidence.",
    tone: "verified",
    ref: "CN-260911-0042",
    checks: [
      ["pass", "Secure QR signature validated", "Signed payload matches approved verification material.", "AADHAAR-QR-002"],
      ["pass", "Name and date of birth agree", "All three documents resolve to the same normalized identity.", "DOC-CONS-001"],
      ["pass", "PAN surname rule passed", "Fifth character aligns with the surname initial.", "PAN-SEM-001"],
    ],
    docs: [
      ["AADHAAR", "•••• 4821", "Ananya Rao", "12 MAY 2001"],
      ["PAN", "A•••• 8K2P", "Ananya Rao", "INDIVIDUAL"],
      ["DRIVING LICENCE", "KA05 20190073421", "Ananya Rao", "VALID STRUCTURE"],
    ],
  },
  mismatch: {
    type: "PACKET 02 · SYNTHETIC MISMATCH",
    title: "Cross-document mismatch",
    description: "Aadhaar and licence are internally consistent, but PAN differs.",
    risk: 68,
    verdict: "REVIEW",
    titleResult: "Officer review required",
    copy: "One high-signal contradiction needs a human decision before clearance.",
    tone: "review",
    ref: "CN-260911-0041",
    checks: [
      ["warning", "Name mismatch across documents", "Aadhaar reads ‘Rahul Mehta’; PAN OCR reads ‘Amit Sharma’.", "DOC-CONS-001"],
      ["pass", "Printed fields match signed QR", "The Aadhaar representation is internally consistent.", "AADHAAR-DATA-001"],
      ["pass", "No obvious splice indicator", "Image integrity heuristics found no high-confidence alteration signal.", "MEDIA-001"],
    ],
    docs: [
      ["AADHAAR", "•••• 9327", "Rahul Mehta", "06 NOV 1998"],
      ["PAN", "B•••• 2M9Q", "Amit Sharma", "INDIVIDUAL"],
      ["DRIVING LICENCE", "DL04 20210018492", "Rahul Mehta", "VALID STRUCTURE"],
    ],
  },
  tampered: {
    type: "PACKET 03 · ALTERED QR FIXTURE",
    title: "Cryptographic failure",
    description: "The QR payload is readable, but its signature cannot be validated.",
    risk: 96,
    verdict: "FAIL",
    titleResult: "Evidence could not be verified",
    copy: "The synthetic fixture contains a high-severity cryptographic contradiction.",
    tone: "danger",
    ref: "CN-260911-0039",
    checks: [
      ["fail", "Secure QR signature failed", "Payload cannot be validated against the approved certificate chain.", "AADHAAR-QR-002"],
      ["pass", "QR payload was readable", "Failure is cryptographic, not caused by image quality.", "AADHAAR-QR-001"],
      ["warning", "Issuer adapter unavailable", "Driving licence verification was not attempted in this offline fixture.", "DL-VERIFY-001"],
    ],
    docs: [
      ["AADHAAR", "•••• 1184", "Demo fixture", "QR SIGNATURE FAILED"],
      ["PAN", "C•••• 1X3V", "Demo fixture", "FORMAT VALID"],
      ["DRIVING LICENCE", "MH12 20200001944", "Demo fixture", "OFFLINE REVIEW"],
    ],
  },
} as const;

type CaseKey = keyof typeof cases;

type Check = (typeof cases)[CaseKey]["checks"][number];

function Icon({ children }: { children: string }) {
  return <span aria-hidden="true">{children}</span>;
}

export default function Home() {
  const [selected, setSelected] = useState<CaseKey>("mismatch");
  const [files, setFiles] = useState<string[]>([]);
  const [analysed, setAnalysed] = useState(false);
  const [running, setRunning] = useState(false);
  const current = cases[selected];
  const verifiedCount = 12;

  const fileLabel = useMemo(() => files.length ? files.join(" · ") : "", [files]);

  const runVerification = () => {
    setRunning(true);
    window.setTimeout(() => {
      setAnalysed(true);
      setRunning(false);
      window.setTimeout(() => document.getElementById("resultSection")?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
    }, 750);
  };

  const reset = () => {
    setAnalysed(false);
    setFiles([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const downloadReport = () => {
    const report = `CIPHERNEST SCREENING REPORT\n${current.ref}\n${current.verdict}\nRisk: ${current.risk}/100\n\n${current.checks.map((check) => `${check[3]} · ${check[1]}\n${check[2]}`).join("\n\n")}`;
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${current.ref}-report.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="cipher-page">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">C</div><div><strong>CipherNest</strong><span>IDENTITY ENGINE</span></div></div>
        <nav>
          <a className="nav-link active" href="#workspace"><Icon>◈</Icon><span>Verification desk</span></a>
          <a className="nav-link" href="#how-it-works"><Icon>◎</Icon><span>Logic layers</span></a>
          <a className="nav-link" href="#audit"><Icon>▤</Icon><span>Audit trail</span></a>
        </nav>
        <div className="sidebar-bottom"><span className="live-dot" /> DEMO ENVIRONMENT<br /><small>SIH 2026 · MHA</small></div>
      </aside>

      <main>
        <div className="mobile-brand"><div className="brand-mark">C</div><div><strong>CipherNest</strong><span>IDENTITY ENGINE</span></div></div>
        <header className="top-header"><div><p className="eyebrow">AI-BASED FAKE IDENTITY &amp; DOCUMENT SCREENING</p><h1>Cross-document <em>truth.</em></h1></div><div className="officer"><div className="avatar">AO</div><div><strong>Authorised Officer</strong><small>Screening Console</small></div></div></header>

        <section className="hero" id="workspace"><div><span className="badge">CRYPTOGRAPHY + LOGIC</span><h2>Verify what a forged image cannot fake.</h2><p>Validate government-signed QR evidence, reconcile identity records, and show officers exactly why a case passes or fails.</p></div><div className="hero-stat"><strong>{verifiedCount}</strong><span>validation rules<br />ready to run</span></div></section>

        <section className="workspace"><div className="section-head"><div><p className="eyebrow">01 / INTAKE</p><h3>Choose a guided evidence packet</h3></div><span className="subtle">Built for a dependable on-stage demo</span></div>
          <div className="case-grid">{(Object.keys(cases) as CaseKey[]).map((key) => <button key={key} className={`case-card ${selected === key ? "selected" : ""}`} onClick={() => { setSelected(key); setAnalysed(false); }}><div className="case-icon"><Icon>{key === "clean" ? "✓" : key === "mismatch" ? "≠" : "!"}</Icon></div><div><span className="case-type">{cases[key].type}</span><h4>{cases[key].title}</h4><p>{cases[key].description}</p></div><span className="select-dot" /></button>)}</div>
          <div className="intake-row"><label className="upload-zone"><span className="upload-icon">↑</span><div><strong>Attach evidence files</strong><p>PDF, PNG or JPG · file names are recorded in the audit trail</p>{fileLabel && <div className="file-names">{fileLabel}</div>}</div><input type="file" multiple accept="image/*,.pdf" onChange={(event) => setFiles(Array.from(event.target.files ?? []).map((file) => file.name))} /></label><button className="primary" disabled={running} onClick={runVerification}>{running ? "Analysing…" : "Run verification"}<span>→</span></button></div>
        </section>

        {analysed && <section id="resultSection" className="results" aria-live="polite"><div className="section-head"><div><p className="eyebrow">02 / DECISION ENGINE</p><h3>Officer-ready evidence report</h3></div><button className="text-button" onClick={reset}>Reset case</button></div>
          <div className={`verdict-panel ${current.tone}`}><div className="risk-orb"><strong>{current.risk}</strong><span>/100 RISK</span></div><div className="verdict-text"><span className="verdict-pill">{current.verdict}</span><h2>{current.titleResult}</h2><p>{current.copy}</p></div><div className="scan-meta"><span>CASE REFERENCE</span><strong>{current.ref}</strong><span>ANALYSED</span><strong>11 SEP 2026 · 14:32</strong></div></div>
          <div className="result-layout"><div className="checks-card"><div className="card-title"><h3>Validation chain</h3><span>{current.checks.length} RULES EVALUATED</span></div><div className="checks-list">{current.checks.map((check: Check) => <div className="check-row" key={check[3]}><div className={`check-status ${check[0]}`}>{check[0] === "pass" ? "✓" : check[0] === "warning" ? "!" : "×"}</div><div className="check-main"><strong>{check[1]}</strong><p>{check[2]}</p><span className="evidence">{check[3]} · source evidence preserved</span></div><span className="layer-tag">{check[0] === "pass" ? "PASS" : check[0] === "warning" ? "REVIEW" : "FAIL"}</span></div>)}</div></div>
            <div className="evidence-card"><div className="card-title"><h3>Document evidence</h3><span>OCR EXTRACT</span></div><div className="docs-list">{current.docs.map((doc) => <div className="doc-item" key={doc[0]}><header><strong>{doc[0]}</strong><span>{doc[1]}</span></header><div className="doc-field"><span>Detected identity</span><span>{doc[2]}</span></div><div className="doc-field"><span>Secondary signal</span><span>{doc[3]}</span></div></div>)}</div></div></div>
          <div className="audit-bar" id="audit"><Icon>◉</Icon><p><strong>Explainable decision record generated.</strong> Every rule, source field and outcome is preserved for officer review.</p><button onClick={downloadReport}>Download report</button></div>
        </section>}

        <section className="logic-section" id="how-it-works"><p className="eyebrow">THE CIPHERNEST METHOD</p><h2>Three layers. One defensible decision.</h2><div className="layer-grid"><article><span>01</span><h3>Cryptographic shield</h3><p>Secure QR signature and signed payload checks reveal altered Aadhaar details.</p></article><article><span>02</span><h3>Cross-document rules</h3><p>Names, dates, PAN semantics and licence plausibility must agree.</p></article><article><span>03</span><h3>Explainable result</h3><p>Officers receive evidence, not a mysterious confidence score.</p></article></div></section>
      </main>
    </div>
  );
}
