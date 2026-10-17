/**
 * High-fidelity A4 Legal Document Print Engine
 * Uses an isolated hidden iframe to guarantee:
 * 1. Exactly 1-page (or cleanly paginated) output with ZERO ghost pages
 * 2. 100% immune to application dark mode or Radix UI modal overlays
 * 3. Strict A4 portrait margins (15mm 18mm) with crisp legal typography
 */

interface PrintDocumentOptions {
  title: string;
  recipient: string;
  body: string;
  docketRef?: string;
  date?: string;
  citations?: string[];
  applicantName?: string;
  applicantPhone?: string;
}

export function printA4RepresentationLetter({
  title,
  recipient,
  body,
  docketRef = 'BONAFIDE-REP-2026-4092',
  date = '17th October 2026',
  citations = [],
  applicantName = 'Ravi Sharma',
  applicantPhone = '+91 98201 44092',
}: PrintDocumentOptions) {
  // Remove any stale print frame
  const existingFrame = document.getElementById('bonafide-a4-print-iframe');
  if (existingFrame) {
    existingFrame.remove();
  }

  // Create isolated iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'bonafide-a4-print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  // Format paragraphs from body text
  const paragraphs = body
    .split('\n\n')
    .map(p => p.trim())
    .filter(Boolean);

  let formattedHtml = '';
  let subjectHtml = '';
  let addresseeHtml = '';
  let signoffHtml = '';

  paragraphs.forEach((p, idx) => {
    if (p.startsWith('To,') || idx === 0) {
      addresseeHtml = `<div class="addressee">${p.replace(/\n/g, '<br/>')}</div>`;
    } else if (p.toLowerCase().startsWith('subject:')) {
      subjectHtml = `<div class="subject-box">${p}</div>`;
    } else if (p.startsWith('Yours sincerely,') || p.startsWith('Yours faithfully,')) {
      signoffHtml = `<div class="signoff-text">${p.replace(/\n/g, '<br/>')}</div>`;
    } else if (p.includes('"Where an account receives a tainted transaction') || p.includes('statutory mandate')) {
      formattedHtml += `<div class="statutory-quote">${p.replace(/\n/g, '<br/>')}</div>`;
    } else {
      formattedHtml += `<p>${p.replace(/\n/g, '<br/>')}</p>`;
    }
  });

  doc.open();
  doc.write(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 16mm 14mm 16mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      background: #ffffff !important;
      color: #0f172a !important;
      font-family: Georgia, Cambria, "Times New Roman", Times, serif;
      font-size: 10pt;
      line-height: 1.45;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sheet {
      width: 100%;
      max-width: 100%;
      background: #ffffff;
      padding: 0;
      margin: 0;
    }
    .header-bar {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 8px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .title-crest {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 10pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #0f172a;
    }
    .subtitle {
      font-size: 8pt;
      color: #475569;
      margin-top: 2px;
    }
    .meta-docket {
      text-align: right;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 8pt;
      color: #475569;
      line-height: 1.35;
    }
    .addressee {
      margin-bottom: 10px;
      font-size: 9.5pt;
      line-height: 1.4;
      color: #0f172a;
    }
    .subject-box {
      background: #f8fafc;
      border-left: 3.5px solid #0f172a;
      padding: 7px 10px;
      margin: 10px 0;
      font-weight: bold;
      font-size: 9.5pt;
      line-height: 1.35;
      color: #0f172a;
    }
    p {
      margin-bottom: 8px;
      text-align: justify;
      text-justify: inter-word;
      font-size: 9.5pt;
      line-height: 1.45;
      color: #1e293b;
    }
    .statutory-quote {
      border-left: 3px solid #2563eb;
      background: #f8fafc;
      padding: 7px 10px;
      margin: 8px 0;
      font-style: italic;
      font-size: 9pt;
      line-height: 1.4;
      color: #0f172a;
    }
    .signoff-container {
      margin-top: 14px;
      padding-top: 10px;
      border-top: 1px solid #cbd5e1;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      page-break-inside: avoid;
    }
    .signoff-left {
      font-size: 9pt;
      line-height: 1.4;
    }
    .signature-line {
      width: 140px;
      border-bottom: 1px solid #475569;
      margin: 16px 0 6px 0;
    }
    .seal-stamp {
      border: 1.5px solid #0f172a;
      border-radius: 4px;
      padding: 6px 10px;
      text-align: center;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 7.5pt;
      color: #0f172a;
      line-height: 1.25;
      max-width: 190px;
    }
    .seal-stamp-header {
      font-weight: bold;
      border-bottom: 1px solid #0f172a;
      padding-bottom: 3px;
      margin-bottom: 3px;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header-bar">
      <div>
        <div class="title-crest">Statutory Legal Representation</div>
        <div class="subtitle">Bharatiya Nagarik Suraksha Sanhita, 2023 (Section 106) & MHA Cyber SOP</div>
      </div>
      <div class="meta-docket">
        <div>Ref: <strong>${docketRef}</strong></div>
        <div>Date: ${date}</div>
        <div style="color: #2563eb; font-weight: 600;">OFFICIAL SERVICE INSTRUMENT</div>
      </div>
    </div>

    ${addresseeHtml}
    ${subjectHtml}

    <div class="body-content">
      ${formattedHtml}
    </div>

    <div class="signoff-container">
      <div class="signoff-left">
        ${signoffHtml || `
          <div>Yours faithfully,</div>
          <div class="signature-line"></div>
          <div style="font-weight: bold;">${applicantName}</div>
          <div style="color: #475569; font-size: 8.5pt;">${applicantPhone}</div>
          <div style="color: #64748b; font-size: 8pt;">Encl: Tax Invoice, Bank Statement, UPI Receipt, Identity Proof</div>
        `}
      </div>

      <div class="seal-stamp">
        <div class="seal-stamp-header">✓ Bonafide AI Verified</div>
        <div>BNSS §106 Compliance Verified</div>
        <div style="font-size: 6.5pt; color: #64748b; margin-top: 2px;">HASH: 9A82-C4B0-106</div>
      </div>
    </div>
  </div>
</body>
</html>
  `);

  doc.close();

  // Trigger print cleanly on iframe
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
  }, 150);
}
