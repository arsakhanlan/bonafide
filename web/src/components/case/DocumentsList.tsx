import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, FileCheck, Shield, Upload, Eye } from 'lucide-react';

export function DocumentsList() {
  const { documents, setModal } = useCase();

  return (
    <Card className="border-slate-200/90 shadow-sm dark:border-slate-800/90">
      <CardHeader className="bg-slate-50/70 py-4 px-6 border-b border-slate-100 dark:bg-slate-900/40 dark:border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-sm font-semibold tracking-wide">
              Document Repository & Evidence ({documents.length})
            </CardTitle>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setModal('UPLOAD_PAPERS')}
            className="h-8 text-xs gap-1 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload More
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {documents.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-xs">
            No papers uploaded yet. Upload bank SMS or statement to begin.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documents.map(doc => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700 transition-all text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {doc.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                        {doc.kind}
                      </Badge>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 font-medium">
                        <Shield className="h-3 w-3" /> PII Masked
                      </span>
                    </div>
                  </div>
                </div>

                <Badge variant="outline" className="text-[10px] shrink-0 font-normal">
                  Verified
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

