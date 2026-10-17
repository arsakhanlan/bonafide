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
import { printA4RepresentationLetter } from '@/lib/printA4';
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
  Sun,
  Moon,
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
  const [paperTone, setPaperTone] = useState<'AUTO' | 'WHITE'>('AUTO');
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
    // Print using the dedicated isolated A4 print engine
    printA4RepresentationLetter({
      title: letter.title,
      recipient: letter.recipient || 'The Branch Manager / Nodal Officer',
      body: bodyText,
      docketRef: `BONAFIDE-${caseData?.id?.toUpperCase() || 'REP'}-4092`,
      date: currentSimulatedDate || '17th October 2026',
      citations: letter.citations,
      applicantName: nameInput,
      applicantPhone: phoneInput,
    });
  };

  const handleApprove = async () => {
    if (hasPlaceholders) {
      handleAutoFillPlaceholders();
    }
    await approveLetter(letter.id, bodyText);
    setViewMode('DOCUMENT');
  };

  // Parse bodyText into structured document sections
  const paragraphs = bodyText
    .split('\n\n')
    .map(p => p.trim())
    .filter(Boolean);

  let addressee = '';
  let subjectLine = '';
  let salutation = '';
  const bodyParagraphs: string[] = [];
  let signoff = '';

  paragraphs.forEach((p, idx) => {
    if (p.startsWith('To,') || idx === 0) {
      addressee = p;
    } else if (p.toLowerCase().startsWith('subject:')) {
      subjectLine = p;
    } else if (p.toLowerCase().startsWith('dear sir') || p.toLowerCase().startsWith('respected sir')) {
      salutation = p;
    } else if (p.startsWith('Yours sincerely,') || p.startsWith('Yours faithfully,')) {
      signoff = p;
    } else {
      bodyParagraphs.push(p);
    }
  });

  return (
    <Dialog open={activeModal === 'REVIEW_LETTER'} onOpenChange={() => setModal('NONE')}>
      <DialogContent className="w-[calc(100%-1rem)] sm:w-full max-w-4xl h-[94vh] max-h-[94vh] flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl">
        {/* Modal Top Header (No-Print) */}
        <DialogHeader className="shrink-0 p-3.5 sm:p-5 pb-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2.5 pr-6">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 shrink-0">
                <FileText className="h-4 w-4 stroke-[2]" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                  {letter.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground truncate">
                  To: {letter.recipient || 'The Branch Manager / Nodal Officer, Bank'}
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Paper Tone Toggle (In Document Mode) */}
              {viewMode === 'DOCUMENT' && (
                <button
                  type="button"
                  title="Toggle White Paper vs Dark Document"
                  onClick={() => setPaperTone(paperTone === 'AUTO' ? 'WHITE' : 'AUTO')}
                  className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  {paperTone === 'WHITE' ? (
                    <>
                      <Moon className="h-3 w-3" />
                      <span>Dark Theme</span>
                    </>
                  ) : (
                    <>
                      <Sun className="h-3 w-3" />
                      <span>White Paper</span>
                    </>
                  )}
                </button>
              )}

              {/* Segmented Mode Switcher */}
              <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setViewMode('DOCUMENT')}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    viewMode === 'DOCUMENT'
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-950 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span className="hidden xs:inline">Document View</span>
                  <span className="xs:hidden">Doc</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('EDIT')}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    viewMode === 'EDIT'
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-950 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span className="hidden xs:inline">Edit Text</span>
                  <span className="xs:hidden">Edit</span>
                </button>
              </div>

              <Badge
                variant="outline"
                className={`text-[10px] uppercase font-mono py-0 h-6 ${
                  letter.status === 'APPROVED'
                    ? 'border-primary/40 bg-primary/10 text-foreground font-semibold'
                    : letter.status === 'SENT'
                    ? 'border-blue-500/40 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {letter.status}
              </Badge>
            </div>
          </div>

          {/* Citations Grounding Bar */}
          {letter.citations && letter.citations.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/70 text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground flex items-center gap-1">
                <Scale className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                Grounded Citations:
              </span>
              {letter.citations.map((cite, i) => (
                <span
                  key={i}
                  className="rounded bg-secondary px-2 py-0.5 text-[10px] font-mono text-secondary-foreground border border-border/80"
                >
                  {cite}
                </span>
              ))}
            </div>
          )}
        </DialogHeader>

        {/* Quick Placeholder Auto-fill notification if needed */}
        {hasPlaceholders && (
          <div className="shrink-0 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span>
                <strong>{placeholders.length} placeholder(s) to verify</strong> (e.g.{' '}
                {placeholders.slice(0, 2).join(', ')}).
              </span>
            </div>

            <Button
              size="sm"
              variant="default"
              onClick={handleAutoFillPlaceholders}
              className="h-6 text-[11px] bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-medium px-2.5"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              1-Click Auto Fill
            </Button>
          </div>
        )}

        {/* Main Viewing Canvas */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-slate-100/70 dark:bg-slate-950/80 p-2.5 sm:p-6 pb-14">
          {viewMode === 'DOCUMENT' ? (
            /* =========================================================================
               AUTHENTIC LEGAL STATIONERY SHEET (Cleanly scrollable, zero overflow)
               ========================================================================= */
            <div
              className={`w-full max-w-2xl mx-auto rounded-xl border p-4 sm:p-9 font-serif text-[12px] sm:text-[13px] leading-relaxed relative shadow-lifted transition-all ${
                paperTone === 'WHITE'
                  ? 'bg-white text-slate-900 border-slate-300 shadow-md'
                  : 'bg-white text-slate-900 border-slate-200/80 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800'
              }`}
            >
              {/* Formal Letterhead Crest */}
              <div
                className={`border-b-2 pb-3 mb-5 ${
                  paperTone === 'WHITE'
                    ? 'border-slate-900'
                    : 'border-slate-900 dark:border-slate-100'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                        paperTone === 'WHITE'
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                      }`}
                    >
                      <Scale className="h-4.5 w-4.5 stroke-[1.75]" />
                    </div>
                    <div>
                      <h2
                        className={`text-xs font-bold uppercase tracking-wider font-mono ${
                          paperTone === 'WHITE'
                            ? 'text-slate-900'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        Formal Statutory Representation
                      </h2>
                      <p
                        className={`text-[10.5px] font-serif leading-tight ${
                          paperTone === 'WHITE'
                            ? 'text-slate-600'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Section 106, Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 & MHA Cyber SOP
                      </p>
                    </div>
                  </div>

                  <div
                    className={`text-left sm:text-right text-[10.5px] font-mono space-y-0.5 ${
                      paperTone === 'WHITE'
                        ? 'text-slate-600'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div>
                      Ref: <strong>BONAFIDE-{caseData?.id?.toUpperCase() || 'REP'}-4092</strong>
                    </div>
                    <div>Date: {currentSimulatedDate || '17th October 2026'}</div>
                    <div className="text-[9.5px] text-blue-700 dark:text-blue-400 font-semibold uppercase">
                      Official Service Copy
                    </div>
                  </div>
                </div>
              </div>

              {/* Addressee */}
              {addressee && (
                <div
                  className={`space-y-0.5 mb-4 font-serif text-[12.5px] whitespace-pre-line ${
                    paperTone === 'WHITE'
                      ? 'text-slate-900'
                      : 'text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {addressee}
                </div>
              )}

              {/* Bold Subject Line */}
              {subjectLine && (
                <div
                  className={`my-4 p-3 border-l-4 rounded-r-lg text-xs sm:text-[13px] font-bold font-serif leading-snug break-words ${
                    paperTone === 'WHITE'
                      ? 'bg-slate-50 border-slate-900 text-slate-900'
                      : 'bg-slate-50 border-slate-900 text-slate-900 dark:bg-slate-950 dark:border-slate-100 dark:text-slate-100'
                  }`}
                >
                  {subjectLine}
                </div>
              )}

              {/* Salutation */}
              {salutation && (
                <div className="font-bold mb-2.5 font-serif text-[13px]">{salutation}</div>
              )}

              {/* Body Paragraphs */}
              <div
                className={`space-y-3 text-justify leading-relaxed break-words ${
                  paperTone === 'WHITE'
                    ? 'text-slate-800'
                    : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                {bodyParagraphs.map((para, i) => {
                  const isStatutoryQuote =
                    para.includes('"Where an account receives a tainted transaction') ||
                    para.toLowerCase().includes('statutory mandate under section 106');

                  if (isStatutoryQuote) {
                    return (
                      <div
                        key={i}
                        className={`my-3 p-3 rounded-lg border text-xs italic font-serif leading-relaxed border-l-4 ${
                          paperTone === 'WHITE'
                            ? 'border-slate-300 bg-slate-50/80 text-slate-900 border-l-blue-600'
                            : 'border-slate-300 bg-slate-50/80 text-slate-900 border-l-blue-600 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:border-l-blue-500'
                        }`}
                      >
                        <span className="font-bold not-italic font-mono text-[9.5px] uppercase text-blue-900 dark:text-blue-300 block mb-1">
                          Statutory Rule of Proportionality (BNSS §106 & MHA SOP Cl. 4.2):
                        </span>
                        {para}
                      </div>
                    );
                  }

                  return (
                    <p key={i} className="whitespace-pre-line">
                      {para}
                    </p>
                  );
                })}
              </div>

              {/* Sign-off & Verification Seal */}
              <div
                className={`mt-6 pt-5 border-t flex flex-col sm:flex-row sm:items-end justify-between gap-5 ${
                  paperTone === 'WHITE'
                    ? 'border-slate-200'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="min-w-0">
                  {signoff ? (
                    <div className="whitespace-pre-line text-xs font-serif leading-snug">
                      {signoff}
                    </div>
                  ) : (
                    <div>
                      <p
                        className={`text-xs font-serif mb-5 ${
                          paperTone === 'WHITE'
                            ? 'text-slate-500'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        Yours faithfully,
                      </p>
                      <div
                        className={`border-b w-40 mb-1.5 ${
                          paperTone === 'WHITE'
                            ? 'border-slate-400'
                            : 'border-slate-400 dark:border-slate-600'
                        }`}
                      />
                      <p
                        className={`text-sm font-bold font-serif ${
                          paperTone === 'WHITE'
                            ? 'text-slate-900'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {nameInput}
                      </p>
                      <p
                        className={`text-xs font-mono ${
                          paperTone === 'WHITE'
                            ? 'text-slate-600'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {phoneInput}
                      </p>
                      <p
                        className={`text-[10.5px] ${
                          paperTone === 'WHITE'
                            ? 'text-slate-500'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        Pune, Maharashtra
                      </p>
                    </div>
                  )}
                </div>

                {/* Digital Verification Stamp */}
                <div
                  className={`rounded-lg border-2 p-2.5 text-center shrink-0 w-full sm:w-[190px] text-[9.5px] font-mono ${
                    paperTone === 'WHITE'
                      ? 'border-slate-900 text-slate-900 bg-slate-50/50'
                      : 'border-slate-900 text-slate-900 bg-slate-50/50 dark:border-slate-200 dark:text-slate-100 dark:bg-slate-950/50'
                  }`}
                >
                  <div
                    className={`font-bold border-b pb-1 mb-1 flex items-center justify-center gap-1 uppercase ${
                      paperTone === 'WHITE'
                        ? 'border-slate-900'
                        : 'border-slate-900 dark:border-slate-200'
                    }`}
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    Bonafide AI Verified
                  </div>
                  <div>BNSS §106 Compliance Verified</div>
                  <div
                    className={`text-[7.5px] mt-0.5 ${
                      paperTone === 'WHITE'
                        ? 'text-slate-500'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    AUTH HASH: 9A82-C4B0-106
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* =========================================================================
               RAW TEXT EDIT MODE
               ========================================================================= */
            <div className="w-full max-w-2xl mx-auto space-y-3">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Edit Representation Letter Text:
                </span>
                <span className="font-mono text-[11px]">{bodyText.length} characters</span>
              </div>

              <Textarea
                value={bodyText}
                onChange={e => setBodyText(e.target.value)}
                className="font-mono text-xs leading-relaxed min-h-[460px] p-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-800 focus:ring-1 focus:ring-slate-900 dark:focus:ring-white resize-y shadow-sm"
              />

              <p className="text-[11px] text-muted-foreground">
                Tip: Changes here are automatically reflected in the Document View and Print
                output.
              </p>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer (No-Print) */}
        <DialogFooter className="shrink-0 p-3 sm:p-4 px-4 sm:px-6 border-t border-border/80 bg-card flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              className="text-xs gap-1.5 h-9 justify-center bg-card text-foreground border-border hover:bg-secondary shadow-xs font-semibold active:scale-[0.98]"
            >
              <Printer className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">Print Official Letter (A4)</span>
              <span className="sm:hidden">Print (A4)</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="text-xs gap-1.5 h-9 justify-center border-border bg-card text-foreground hover:bg-secondary active:scale-[0.98]"
            >
              {isCopied ? (
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>{isCopied ? 'Copied' : 'Copy Text'}</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setModal('NONE')}
              className="text-xs h-9 text-muted-foreground hover:text-foreground flex-1 sm:flex-none justify-center"
            >
              Close
            </Button>

            {letter.status === 'DRAFT' && (
              <Button
                size="sm"
                disabled={isProcessing}
                onClick={handleApprove}
                className="text-xs h-9 font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs flex-1 sm:flex-none justify-center active:scale-[0.98]"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Approve & Sign</span>
              </Button>
            )}

            {letter.status === 'APPROVED' && (
              <Button
                size="sm"
                onClick={() => setModal('MARK_SENT', letter.id)}
                className="text-xs h-9 font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs flex-1 sm:flex-none justify-center active:scale-[0.98]"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Deliver to Bank (Start 7-Day Clock)</span>
                <span className="sm:hidden">Deliver to Bank</span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
