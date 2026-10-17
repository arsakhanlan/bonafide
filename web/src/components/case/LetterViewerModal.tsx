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
import { Input } from '@/components/ui/input';
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
} from 'lucide-react';

export function LetterViewerModal() {
  const {
    activeModal,
    setModal,
    letters,
    selectedLetterId,
    approveLetter,
    isProcessing,
  } = useCase();

  const letter = letters.find(l => l.id === selectedLetterId) || letters[0];

  const [bodyText, setBodyText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [nameInput, setNameInput] = useState('Ravi Sharma');
  const [phoneInput, setPhoneInput] = useState('+91 98201 44092');
  const [accountInput, setAccountInput] = useState('501004829104092');
  const [showAutoFill, setShowAutoFill] = useState(true);

  useEffect(() => {
    if (letter) {
      setBodyText(letter.body);
    }
  }, [letter]);

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
    window.print();
  };

  const handleApprove = async () => {
    if (hasPlaceholders) {
      alert('Please fill or replace all {{...}} placeholders before approving.');
      return;
    }
    await approveLetter(letter.id, bodyText);
  };

  return (
    <Dialog open={activeModal === 'REVIEW_LETTER'} onOpenChange={() => setModal('NONE')}>
      <DialogContent className="max-w-3xl max-h-[92vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {letter.title}
              </DialogTitle>
            </div>
            <Badge
              variant={letter.status === 'APPROVED' ? 'success' : letter.status === 'SENT' ? 'info' : 'warning'}
              className="text-xs uppercase font-mono"
            >
              {letter.status}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            To: {letter.recipient || 'The Branch Manager / Nodal Officer'}
          </DialogDescription>
        </DialogHeader>

        {/* Citations & Anti-hallucination checks */}
        {letter.citations && letter.citations.length > 0 && (
          <div className="bg-slate-50/80 dark:bg-slate-900/50 px-6 py-2.5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 text-[11px]">
              <Scale className="h-3.5 w-3.5 text-indigo-500" />
              Statutory Grounding:
            </span>
            {letter.citations.map((cite, i) => (
              <Badge key={i} variant="outline" className="text-[10px] bg-white dark:bg-slate-800 font-normal">
                {cite}
              </Badge>
            ))}
          </div>
        )}

        {/* Quick Placeholder Auto-fill Bar if placeholders exist */}
        {hasPlaceholders && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/80 dark:border-amber-900/60 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                <strong>{placeholders.length} placeholder(s) detected</strong> (e.g. {placeholders.slice(0, 2).join(', ')}).
              </span>
            </div>

            <Button
              size="sm"
              variant="default"
              onClick={handleAutoFillPlaceholders}
              className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              1-Click Auto Fill
            </Button>
          </div>
        )}

        {/* Editable Letter Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Representation Letter Text (Editable):</span>
              <span className="font-mono text-[11px]">{bodyText.length} characters</span>
            </div>

            <Textarea
              value={bodyText}
              onChange={e => setBodyText(e.target.value)}
              className="font-mono text-xs leading-relaxed min-h-[340px] p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 focus:ring-1 focus:ring-slate-900 dark:focus:ring-white resize-y"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <DialogFooter className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="text-xs gap-1.5 h-9"
            >
              {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {isCopied ? 'Copied!' : 'Copy Text'}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              className="text-xs gap-1.5 h-9"
            >
              <Printer className="h-3.5 w-3.5" />
              Print Letter
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setModal('NONE')}
              className="text-xs h-9"
            >
              Cancel
            </Button>

            {letter.status === 'DRAFT' && (
              <Button
                size="sm"
                variant="hero"
                disabled={isProcessing || hasPlaceholders}
                onClick={handleApprove}
                className="text-xs h-9 font-semibold gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve Representation Letter
              </Button>
            )}

            {letter.status === 'APPROVED' && (
              <Button
                size="sm"
                variant="default"
                onClick={() => setModal('MARK_SENT', letter.id)}
                className="text-xs h-9 font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Send className="h-4 w-4" />
                Next: Mark as Sent (Start 7-Day Clock)
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

