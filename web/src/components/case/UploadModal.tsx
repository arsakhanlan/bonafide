import React, { useState } from 'react';
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
import { Upload, FileText, Shield, Check, Plus, Trash2 } from 'lucide-react';
import { DocumentKind } from '@/types/document';

export function UploadModal() {
  const { activeModal, setModal, uploadPapers, isProcessing } = useCase();

  const [filesToUpload, setFilesToUpload] = useState<Array<{ name: string; kind: DocumentKind }>>([
    { name: 'Bank_Lien_Notice.pdf', kind: 'NOTICE' },
    { name: 'Account_Statement_Recent.pdf', kind: 'STATEMENT' },
  ]);

  if (activeModal !== 'UPLOAD_PAPERS') return null;

  const handleAddFile = (kind: DocumentKind, defaultName: string) => {
    setFilesToUpload([...filesToUpload, { name: defaultName, kind }]);
  };

  const handleRemove = (index: number) => {
    setFilesToUpload(filesToUpload.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (filesToUpload.length === 0) return;
    await uploadPapers(filesToUpload);
  };

  return (
    <Dialog open={activeModal === 'UPLOAD_PAPERS'} onOpenChange={() => setModal('NONE')}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-indigo-600" />
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Upload Freeze Papers & Proofs
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Add your bank SMS, official notice, bank statement, and invoice/chat showing legitimate commercial consideration.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {/* Quick add chips */}
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
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="h-3 w-3" /> + Notice / SMS
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddFile('STATEMENT', 'Bank_Statement_Oct.pdf')}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="h-3 w-3" /> + Bank Statement
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddFile('INVOICE', 'Sale_Tax_Invoice.pdf')}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="h-3 w-3" /> + Bill / Invoice
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddFile('CHAT', 'Client_Chat_Receipt.txt')}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="h-3 w-3" /> + Customer Chat
                </Button>
              </div>
            </div>

            {/* List of files selected */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filesToUpload.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {f.name}
                    </span>
                    <Badge variant="secondary" className="text-[10px] h-4 py-0">
                      {f.kind}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(i)}
                    className="h-7 w-7 text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Privacy and security guarantee */}
            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-900/60 dark:text-slate-300 border border-slate-200 dark:border-slate-800 flex items-start gap-2">
              <Shield className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Confidentiality Guarantee:</strong> Papers are treated strictly as data, never instructions. Account numbers are masked and PII is scrubbed before agent analysis.
              </span>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setModal('NONE')}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isProcessing || filesToUpload.length === 0}
              className="text-xs gap-1.5 bg-slate-900 dark:bg-white dark:text-slate-900"
            >
              <Upload className="h-4 w-4" />
              Extract Evidence with Reader Agent
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

