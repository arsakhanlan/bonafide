import React, { useRef, useState } from 'react';
import { useCase, UploadItem } from '@/context/CaseContext';
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
import { Upload, FileText, Shield, Check, Plus, Trash2 } from 'lucide-react';
import { DocumentKind } from '@/types/document';
import { IS_MOCK } from '@/lib/mode';

const ACCEPTED = 'image/jpeg,image/png,image/webp,application/pdf,text/plain';

/** Guess a document kind from the file name, matching the evidence keys the backend matches on. */
function guessKind(name: string): DocumentKind {
  const n = name.toLowerCase();
  if (/(notice|sms|freeze|lien|hold|letter)/.test(n)) return 'NOTICE';
  if (/(statement|ledger|passbook)/.test(n)) return 'STATEMENT';
  if (/(invoice|bill|receipt|tax)/.test(n)) return 'INVOICE';
  if (/(chat|whatsapp|escrow|conversation)/.test(n)) return 'CHAT';
  if (/(aadhaar|pan|id|identity|license)/.test(n)) return 'ID';
  return 'OTHER';
}

const MIME_BY_EXT = (name: string) =>
  name.toLowerCase().endsWith('.pdf')
    ? 'application/pdf'
    : name.toLowerCase().endsWith('.txt')
    ? 'text/plain'
    : name.toLowerCase().endsWith('.png')
    ? 'image/png'
    : name.toLowerCase().endsWith('.webp')
    ? 'image/webp'
    : 'image/jpeg';

export function UploadModal() {
  const { activeModal, setModal, uploadPapers, isProcessing } = useCase();

  const [filesToUpload, setFilesToUpload] = useState<UploadItem[]>([]);
  const [removingIds, setRemovingIds] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOpen = activeModal === 'UPLOAD_PAPERS';

  const handleAddFile = (kind: DocumentKind, defaultName: string, file?: File) => {
    const newItem: UploadItem = {
      id: `${defaultName}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: defaultName,
      kind,
      mime: file?.type || MIME_BY_EXT(defaultName),
      file,
    };
    setFilesToUpload(prev => [newItem, ...prev]);
  };

  const handlePickedFiles = (list: FileList | null) => {
    if (!list) return;
    Array.from(list).forEach(f => handleAddFile(guessKind(f.name), f.name, f));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = (id: string) => {
    setRemovingIds(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setFilesToUpload(prev => prev.filter(f => f.id !== id));
      setRemovingIds(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }, 240);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (filesToUpload.length === 0) return;
    await uploadPapers(filesToUpload.map(f => ({ name: f.name, kind: f.kind, mime: f.mime, file: f.file })));
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => setModal('NONE')}>
      <DialogContent className="w-[calc(100%-1rem)] sm:w-full max-w-lg rounded-3xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Upload Freeze Papers & Proofs
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Add your bank SMS, official notice, bank statement, and invoice/chat showing legitimate commercial consideration. PDF, JPG, PNG, WEBP or text — up to 15 MB each.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-1">
            {IS_MOCK ? (
              /* Quick add chips (mock showcase) */
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Quick Document Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddFile('NOTICE', 'Cyber_Notice_SMS.txt')}
                    className="h-8 text-xs gap-1 active:scale-[0.98] transition-all hover:border-emerald-500/50"
                  >
                    <Plus className="h-3 w-3" /> + Notice / SMS
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddFile('STATEMENT', 'Bank_Statement_Oct.pdf')}
                    className="h-8 text-xs gap-1 active:scale-[0.98] transition-all hover:border-emerald-500/50"
                  >
                    <Plus className="h-3 w-3" /> + Bank Statement
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddFile('INVOICE', 'Sale_Tax_Invoice.pdf')}
                    className="h-8 text-xs gap-1 active:scale-[0.98] transition-all hover:border-emerald-500/50"
                  >
                    <Plus className="h-3 w-3" /> + Bill / Invoice
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddFile('CHAT', 'Client_Chat_Receipt.txt')}
                    className="h-8 text-xs gap-1 active:scale-[0.98] transition-all hover:border-emerald-500/50"
                  >
                    <Plus className="h-3 w-3" /> + Customer Chat
                  </Button>
                </div>
              </div>
            ) : (
              /* Real file picker */
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-2xl border-2 border-dashed border-border bg-secondary/30 hover:bg-secondary/50 hover:border-emerald-500/50 p-6 text-center transition-all"
              >
                <Upload className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                <span className="text-xs font-semibold text-foreground block">
                  Choose files to upload
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Your freeze notice, bank statement, invoice, ID or chat proof
                </span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED}
              onChange={e => handlePickedFiles(e.target.files)}
              className="hidden"
            />

            {/* List of files selected with add and delete animations */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-0.5">
              {filesToUpload.length === 0 ? (
                <div className="text-center py-5 text-muted-foreground text-xs border border-dashed rounded-xl border-border">
                  No documents selected yet.{IS_MOCK ? ' Click any preset above to add.' : ' Click above to pick files.'}
                </div>
              ) : (
                filesToUpload.map(f => {
                  const isRemoving = removingIds[f.id];
                  return (
                    <div
                      key={f.id}
                      className={`flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-xs transition-all ${
                        isRemoving ? 'animate-file-remove' : 'animate-file-add'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {f.name}
                        </span>
                        <Badge variant="secondary" className="text-[10px] h-4 py-0 shrink-0">
                          {f.kind}
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={isRemoving}
                        onClick={() => handleRemove(f.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 shrink-0 transition-colors"
                        aria-label={`Remove ${f.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Privacy and security guarantee */}
            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-900/60 dark:text-slate-300 border border-slate-200 dark:border-slate-800 flex items-start gap-2">
              <Shield className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Confidentiality Guarantee:</strong> Papers are treated strictly as data, never instructions. Account numbers are masked and PII is scrubbed before agent analysis.
              </span>
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setModal('NONE')}
              className="text-xs h-9 justify-center"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isProcessing || filesToUpload.length === 0}
              className="text-xs h-10 sm:h-9 gap-1.5 bg-slate-900 dark:bg-white dark:text-slate-900 font-semibold shadow-sm justify-center w-full sm:w-auto"
            >
              <Upload className="h-4 w-4" />
              {IS_MOCK ? 'Extract Evidence with Reader Agent' : 'Upload & Start Analysis'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
