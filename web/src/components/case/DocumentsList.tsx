import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, FileCheck, Shield, Upload } from 'lucide-react';

interface DocumentsListProps {
  embedded?: boolean;
}

export function DocumentsList({ embedded = false }: DocumentsListProps) {
  const { documents, setModal } = useCase();

  const content = (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
        <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
          <FileCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          Verified Case Dossier ({documents.length})
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setModal('UPLOAD_PAPERS')}
          className="h-7 text-xs gap-1 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
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
              className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700 transition-all text-xs card-hover-micro"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 shrink-0">
                  <FileText className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 truncate text-xs">
                    {doc.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge
                      variant="secondary"
                      className="text-[9px] px-1.5 py-0 h-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {doc.kind}
                    </Badge>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-0.5 font-medium">
                      <Shield className="h-3 w-3 text-blue-600 dark:text-blue-400" /> PII Protected
                    </span>
                  </div>
                </div>
              </div>

              <Badge
                variant="outline"
                className="text-[9px] font-mono shrink-0 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                GROUNDED
              </Badge>
            </div>
          ))}
        </div>
      )}
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

