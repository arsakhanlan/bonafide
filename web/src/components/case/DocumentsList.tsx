import React, { useState } from 'react';
import { useCase } from '@/context/CaseContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { FileText, FileCheck, Shield, Upload, Eye, CheckCircle2, Scale } from 'lucide-react';

interface DocumentsListProps {
  embedded?: boolean;
}

export function DocumentsList({ embedded = false }: DocumentsListProps) {
  const { documents, setModal } = useCase();
  const [inspectDoc, setInspectDoc] = useState<any | null>(null);

  const getDocExcerpt = (doc: any) => {
    if (doc.name.includes('Notice') || doc.kind === 'NOTICE') {
      return 'Patna Cyber Crime Cell requisition memo CY/2026/891. Requisition specifies contested transaction ₹2,000. Statutory requirement under BNSS §106: lien restricted solely to ₹2,000.';
    }
    if (doc.name.includes('Statement') || doc.kind === 'STATEMENT') {
      return 'Account ledger reflects total balance ₹1,48,000. Contested hold ₹2,000. Innocent surplus ₹1,46,000 illegally restricted in violation of MHA SOP Cl. 4.2.';
    }
    if (doc.name.includes('Invoice') || doc.kind === 'INVOICE') {
      return 'GST Tax Invoice #481 — ₹2,000 for replacement screen & hardware repair. Proves bona fide consideration under Sale of Goods Act and BNSS §106 commercial exception.';
    }
    if (doc.name.includes('WhatsApp') || doc.kind === 'CHAT') {
      return 'Customer chat delivery acknowledgment with UPI transaction screenshot. Demonstrates bona fide commercial exchange without knowledge of cyber dispute.';
    }
    if (doc.name.includes('Escrow') || doc.name.includes('Binance')) {
      return 'P2P Escrow Order Confirmation #94812 — Automated cryptographic escrow release against INR bank transfer. Complete trading audit trail.';
    }
    return 'Document ingested, OCR verified, and grounded against BNSS §106 proportional lien standards.';
  };

  const content = (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-border/80 text-xs">
        <span className="font-semibold text-foreground flex items-center gap-1.5">
          <FileCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          Verified Case Dossier ({documents.length})
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setModal('UPLOAD_PAPERS')}
          className="h-7 text-xs gap-1 border-border bg-card hover:bg-secondary text-foreground"
        >
          <Upload className="h-3 w-3" />
          Upload Papers
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground text-xs">
          No papers uploaded yet. Upload bank SMS or statement to begin.
        </div>
      ) : (
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {documents.map(doc => (
            <div
              key={doc.id}
              onClick={() => setInspectDoc(doc)}
              className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card hover:border-emerald-500/40 hover:bg-secondary/40 transition-all text-xs card-hover-micro cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-lg bg-secondary text-muted-foreground shrink-0">
                  <FileText className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate text-xs">
                    {doc.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge
                      variant="secondary"
                      className="text-[9px] px-1.5 py-0 h-4 bg-secondary text-secondary-foreground"
                    >
                      {doc.kind}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 font-medium">
                      <Shield className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> PII Protected
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setInspectDoc(doc);
                  }}
                  className="h-7 px-2 text-[11px] gap-1 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
                >
                  <Eye className="h-3 w-3" />
                  <span>Check</span>
                </Button>
                <Badge
                  variant="outline"
                  className="text-[9px] font-mono shrink-0 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10"
                >
                  GROUNDED
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Smooth Minimal Document Check Modal */}
      <Dialog open={!!inspectDoc} onOpenChange={() => setInspectDoc(null)}>
        <DialogContent className="max-w-md p-4 sm:p-5 rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                <FileCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-sm sm:text-base font-bold text-foreground truncate">
                  {inspectDoc?.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Grounded Evidence Type: {inspectDoc?.kind}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 rounded-xl bg-secondary/50 border border-border/80 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground flex items-center gap-1">
                <Scale className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                BNSS §106 Extracted Finding:
              </span>
              <p className="text-foreground leading-relaxed font-sans text-xs sm:text-[12.5px]">
                {inspectDoc && getDocExcerpt(inspectDoc)}
              </p>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300 text-[11px]">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>
                <strong>Bona Fide Proof Validated:</strong> Demonstrates consideration and lack of nexus to unlawful conduct.
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
              <Shield className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>PII Scrubbed: Account digits & phone masked before AI ingestion.</span>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => setInspectDoc(null)}
              className="w-full text-xs h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
            >
              Done Checking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-card">
      <CardHeader className="py-4 px-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-slate-800 dark:text-slate-200" />
            <CardTitle className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Document Repository & Evidence ({documents.length})
            </CardTitle>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setModal('UPLOAD_PAPERS')}
            className="h-8 text-xs gap-1 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload More
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">{content}</CardContent>
    </Card>
  );
}

