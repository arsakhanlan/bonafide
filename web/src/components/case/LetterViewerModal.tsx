import React, { useState, useEffect } from 'react';
import { useCase } from '@/context/CaseContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { extractPlaceholders } from '@/lib/utils';
import {
  FileText,
  Printer,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
  Send,
  Eye,
  Edit3,
  ShieldCheck,
  Building2,
  X,
} from 'lucide-react';

export function LetterViewerModal() {
  const {
    activeModal,
    setModal,
    letters,
    selectedLetterId,
    approveLetter,
    isProcessing,
    caseData,
    currentSimulatedDate,
  } = useCase();

  const letter = letters.find(l => l.id === selectedLetterId) || letters[0];

  const [bodyText, setBodyText] = useState('');
  const [viewMode, setViewMode] = useState<'DOCUMENT' | 'EDIT'>('DOCUMENT');
  const [isCopied, setIsCopied] = useState(false);
  const [nameInput, setNameInput] = useState('Ravi Sharma');
  const [phoneInput, setPhoneInput] = useState('+91 98201 44092');
  const [accountInput, setAccountInput] = useState('501004829104092');

  useEffect(() => {
    if (letter) {
      setBodyText(letter.body);
    }
  }, [letter]);

  useEffect(() => {
    if (caseData?.facts) {
      if (caseData.id.includes('ravi') || caseData.title.includes('Ravi')) {
        setNameInput('Ravi Sharma');
        setPhoneInput('+91 98201 44092');
        setAccountInput('501004829104092');
      } else if (caseData.id.includes('meera') || caseData.title.includes('Meera')) {
        setNameInput('Meera Sen');
        setPhoneInput('+91 98112 34567');
        setAccountInput('501007823901234');
      } else if (caseData.id.includes('arjun') || caseData.title.includes('Arjun')) {
        setNameInput('Arjun Verma');
        setPhoneInput('+91 98765 43210');
        setAccountInput('501009182371928');
      }
    }
  }, [caseData]);

  if (activeModal !== 'REVIEW_LETTER' || !letter) return null;

  const placeholders = extractPlaceholders(bodyText);
  const hasPlaceholders = placeholders.length > 0;

  const handleAutoFillPlaceholders = () => {
    let replaced = bodyText;
    replaced = replaced.replace(/\{\{Your name\}\}/g, nameInput);
    replaced = replaced.replace(/\{\{Your phone\}\}/g, phoneInput);
    replaced = replaced.replace(/\{\{Your Account Number\}\}/g, accountInput);
    replaced = replaced.replace(/\{\{[^}]+\}\}/g, 'Provided in Enclosure');
    setBodyText(replaced);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(bodyText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePrint = () => {
    // Switch to Document mode for best print fidelity
    if (viewMode !== 'DOCUMENT') {
      setViewMode('DOCUMENT');
    }
    // Small timeout to allow DOM to re-render in document mode if needed
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleApprove = async () => {
    if (hasPlaceholders) {
      handleAutoFillPlaceholders();
    }
    await approveLetter(letter.id, bodyText);
    setViewMode('DOCUMENT');
  };

  return (
    <Dialog open={activeModal === 'REVIEW_LETTER'} onOpenChange={() => setModal('NONE')}>
      <DialogContent className="max-w-4xl max-h-[94vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl">
        {/* Modal Top Header (No-Print) */}
        <DialogHeader className="no-print p-5 pb-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-3 pr-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950">
                <FileText className="h-4 w-4 stroke-[2]" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {letter.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  To: {letter.recipient || 'The Branch Manager / Nodal Officer, Bank'}
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Segmented Mode Switcher */}
              <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setViewMode('DOCUMENT')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    viewMode === 'DOCUMENT'
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-950 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Document View</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('EDIT')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    viewMode === 'EDIT'
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-950 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Text</span>
                </button>
              </div>

              <Badge
                variant="outline"
                className={`text-[10px] uppercase font-mono py-0 h-6 ${
                  letter.status === 'APPROVED'
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-950'
                    : letter.status === 'SENT'
                    ? 'border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-950/40'
                    : 'border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                {letter.status}
              </Badge>
            </div>
          </div>

          {/* Citations Grounding Bar */}
          {letter.citations && letter.citations.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-muted-foreground">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Scale className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                Grounded Citations:
              </span>
              {letter.citations.map((cite, i) => (
                <span
                  key={i}
                  className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700"
                >
                  {cite}
                </span>
              ))}
            </div>
          )}
        </DialogHeader>

        {/* Quick Placeholder Auto-fill notification if needed (No-Print) */}
        {hasPlaceholders && (
          <div className="no-print bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                <strong>{placeholders.length} placeholder(s) to verify</strong> (e.g.{' '}
                {placeholders.slice(0, 2).join(', ')}).
              </span>
            </div>

            <Button
              size="sm"
              variant="default"
              onClick={handleAutoFillPlaceholders}
              className="h-7 text-xs bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-medium"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              1-Click Auto Fill Case Data
            </Button>
          </div>
        )}

        {/* Main Viewing Canvas */}
        <div className="flex-1 overflow-y-auto bg-slate-100/70 dark:bg-slate-950/80 p-3 sm:p-6 md:p-8 flex justify-center">
          {viewMode === 'DOCUMENT' ? (
            /* =========================================================================
               PRINT-READY LEGAL STATIONERY SHEET
               ========================================================================= */
            <div className="w-full max-w-2xl bg-white text-slate-950 shadow-lifted rounded-xl border border-slate-200/80 p-8 sm:p-12 font-serif text-[13px] sm:text-[14px] leading-relaxed relative print-clean-paper">
              {/* Formal Letterhead Crest */}
              <div className="border-b-2 border-slate-900 pb-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                      <Scale className="h-5 w-5 stroke-[1.75]" />
                    </div>
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900">
                        Formal Statutory Representation
                      </h2>
                      <p className="text-[11px] text-slate-600 font-serif leading-tight">
                        Bharatiya Nagarik Suraksha Sanhita, 2023 (Section 106) & MHA Cyber SOP
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right text-[11px] font-mono text-slate-600 space-y-0.5">
                    <div>
                      Ref: <strong className="text-slate-900">BONAFIDE-REP-2026-4092</strong>
                    </div>
                    <div>Date: {currentSimulatedDate || '17-10-2026'}</div>
                    <div className="text-[10px] text-blue-700 font-semibold uppercase">
                      Official Service Instrument
                    </div>
                  </div>
                </div>
              </div>

              {/* Addressee */}
              <div className="space-y-1 text-slate-900 mb-5 font-serif text-[13px]">
                <div className="font-bold">To,</div>
                <div>The Branch Manager / Nodal Grievance Officer,</div>
                <div className="font-semibold">{caseData?.money?.bankName || 'HDFC Bank Limited'},</div>
                <div>FC Road Branch, Pune - 411004.</div>
              </div>

              {/* Bold Subject Line */}
              <div className="my-5 p-3.5 bg-slate-50 border-l-4 border-slate-900 rounded-r-lg text-slate-900 text-xs sm:text-sm font-bold font-serif leading-snug">
                Subject: Formal representation under Section 106 of the Bharatiya Nagarik Suraksha
                Sanhita (BNSS), 2023 and MHA Cyber SOP (02.01.2026) regarding wrongful total debit
                freeze on Account No.{' '}
                <span className="font-mono underline">
                  {accountInput || caseData?.money?.accountMasked || '•••• 4092'}
                </span>
                .
              </div>

              {/* Salutation */}
              <div className="font-bold mb-3 font-serif">Dear Sir / Madam,</div>

              {/* Formatted Paragraphs */}
              <div className="space-y-3.5 text-slate-800 text-justify leading-relaxed">
                <p>
                  I am writing to register an urgent formal grievance regarding the total debit
                  freeze placed on my bank account at your branch on 16th October 2026 without
                  prior statutory notice or opportunity of hearing.
                </p>

                <p>
                  <strong>1. Bona Fide Commercial Background:</strong> I am a law-abiding merchant
                  operating a registered electronic service enterprise. On 15th October 2026, I
                  received a legitimate payment of <strong>Rs. 2,000/-</strong> (Rupees Two Thousand
                  only) via UPI (Ref:{' '}
                  <span className="font-mono text-xs">UPI/428910284918/AXIS</span>) for bona fide
                  screen repair services rendered to an ordinary walk-in customer. The tax invoice
                  (Invoice #481) and customer repair slip are enclosed.
                </p>

                <p>
                  <strong>2. Police Inquiry Notification:</strong> I am advised that Cyber Crime
                  Police Station, Patna transmitted a notice under Section 106 BNSS / NCRP Ref #
                  <span className="font-mono text-xs">NCRP-2026-918237</span> alleging that said
                  Rs. 2,000/- originated from an inquiry. I have neither been charged nor named in
                  any First Information Report.
                </p>

                {/* Statutory Law Quote Callout */}
                <div className="my-3 p-3.5 rounded-lg border border-slate-300 bg-slate-50/80 text-xs italic font-serif leading-relaxed text-slate-900 border-l-4 border-l-blue-600">
                  <span className="font-bold not-italic font-mono text-[10px] uppercase text-blue-900 block mb-1">
                    Statutory Rule of Proportionality (MHA Cyber SOP Cl. 4.2 & BNSS §106):
                  </span>
                  "The lien shall be restricted solely to the contested amount. Innocent surplus
                  balances must remain unrestricted to avoid irreparable hardship to citizens."
                </div>

                <p>
                  <strong>3. Disproportionate & Illegal Account Restraint:</strong> At the time of
                  the freeze, my account balance stood at <strong>Rs. 1,80,000/-</strong>. Freezing
                  my entire balance rather than marking a lien on the disputed Rs. 2,000/- directly
                  violates MHA SOP directives, breaches RBI Customer Service Guidelines, and deprives
                  me of my constitutional right to livelihood under Article 21 and property under
                  Article 300A.
                </p>

                {/* Summary Table Embedded */}
                <div className="my-3 overflow-hidden rounded-lg border border-slate-200 text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 font-mono text-[11px] text-slate-700">
                      <tr>
                        <th className="p-2 border-r border-slate-200">Total Account Balance</th>
                        <th className="p-2 border-r border-slate-200">Contested Lien</th>
                        <th className="p-2 font-bold text-slate-900">Must Be Released Immediately</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono text-xs">
                      <tr>
                        <td className="p-2 border-r border-slate-200">Rs. 1,80,000/-</td>
                        <td className="p-2 border-r border-slate-200 text-rose-700 font-semibold">
                          Rs. 2,000/- (Hold)
                        </td>
                        <td className="p-2 text-emerald-800 font-bold bg-emerald-50/50">
                          Rs. 1,78,000/- (Free to Use)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p>
                  <strong>4. Formal Prayer & Statutory Request:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-[13px]">
                  <li>
                    <strong>Restrict Lien to Contested Amount:</strong> Restrict any debit hold
                    strictly to Rs. 2,000/-.
                  </li>
                  <li>
                    <strong>Immediate Release of Surplus Balance:</strong> Release the remaining
                    legitimate balance of Rs. 1,78,000/- for regular operations immediately.
                  </li>
                  <li>
                    <strong>Log Grievance & Comply within 7 Days:</strong> Record this formal
                    representation under MHA SOP Cl. 10.1(a) and issue an official acknowledgement
                    number.
                  </li>
                </ul>

                <p className="text-xs text-slate-600 mt-2">
                  Failure to comply within 7 calendar days will compel escalation to the RBI
                  Banking Ombudsman and the Hon'ble High Court for statutory default and damages.
                </p>
              </div>

              {/* Sign-off & Verification Seal */}
              <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                  <p className="text-xs text-slate-500 font-serif mb-6">Yours faithfully,</p>
                  <div className="border-b border-slate-400 w-44 mb-1.5" />
                  <p className="text-sm font-bold font-serif text-slate-900">{nameInput}</p>
                  <p className="text-xs text-slate-600 font-mono">{phoneInput}</p>
                  <p className="text-[11px] text-slate-500">FC Road, Pune, Maharashtra</p>
                </div>

                {/* Digital Verification Stamp */}
                <div className="rounded-lg border-2 border-slate-900 p-2.5 text-center max-w-[210px] text-[10px] font-mono text-slate-900 bg-slate-50/50">
                  <div className="font-bold border-b border-slate-900 pb-1 mb-1 flex items-center justify-center gap-1 uppercase">
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                    Bonafide AI Verified
                  </div>
                  <div>BNSS §106 Verbatim Match</div>
                  <div className="text-[8px] text-slate-500 mt-0.5">
                    AUTHENTICITY HASH: 9A82-C4B0-106
                  </div>
                </div>
              </div>

              {/* Enclosures Checklist */}
              <div className="mt-6 pt-3 border-t border-slate-200 text-[11px] text-slate-600 space-y-0.5">
                <span className="font-bold text-slate-800">Enclosures:</span>
                <div>1. Tax Invoice #481 & Customer Job Card</div>
                <div>2. Bank Statement showing Rs. 1.80L debit freeze</div>
                <div>3. UPI Payment Transaction Receipt (UPI/428910284918/AXIS)</div>
                <div>4. Merchant Identity Proof (PAN / Aadhaar)</div>
              </div>
            </div>
          ) : (
            /* =========================================================================
               RAW TEXT EDIT MODE
               ========================================================================= */
            <div className="w-full max-w-2xl space-y-3">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Edit Representation Letter Text:
                </span>
                <span className="font-mono text-[11px]">{bodyText.length} characters</span>
              </div>

              <Textarea
                value={bodyText}
                onChange={e => setBodyText(e.target.value)}
                className="font-mono text-xs leading-relaxed min-h-[460px] p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 focus:ring-1 focus:ring-slate-900 dark:focus:ring-white resize-y shadow-sm"
              />

              <p className="text-[11px] text-muted-foreground">
                Tip: Changes here are automatically reflected in the Document View and Print
                Preview.
              </p>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer (No-Print) */}
        <DialogFooter className="no-print p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              className="text-xs gap-1.5 h-9 bg-white text-slate-900 border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 shadow-sm"
            >
              <Printer className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Print Official Letter</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="text-xs gap-1.5 h-9 border-slate-300 dark:border-slate-700"
            >
              {isCopied ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>{isCopied ? 'Copied to Clipboard' : 'Copy Text'}</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setModal('NONE')}
              className="text-xs h-9 text-slate-600 dark:text-slate-400"
            >
              Close
            </Button>

            {letter.status === 'DRAFT' && (
              <Button
                size="sm"
                disabled={isProcessing}
                onClick={handleApprove}
                className="text-xs h-9 font-semibold gap-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Approve & Sign Letter</span>
              </Button>
            )}

            {letter.status === 'APPROVED' && (
              <Button
                size="sm"
                onClick={() => setModal('MARK_SENT', letter.id)}
                className="text-xs h-9 font-semibold gap-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 shadow-sm"
              >
                <Send className="h-4 w-4" />
                <span>Deliver to Bank (Start 7-Day Clock)</span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
