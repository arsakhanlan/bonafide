import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Code,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Layers,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Terminal,
} from 'lucide-react';

interface SwaggerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SwaggerModal({ isOpen, onClose }: SwaggerModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [expandedEndpoints, setExpandedEndpoints] = useState<Record<number, boolean>>({ 0: true });

  const endpoints = [
    {
      method: 'POST',
      path: '/api/cases',
      tag: 'Cases',
      summary: 'Create a new citizen case file',
      description: 'Initializes a blank case file with stage NEW for an authenticated citizen.',
      auth: 'Bearer JWT',
      body: `{
  "language": "en"
}`,
      responses: [
        { code: '201 Created', desc: '{ "caseId": "c_4g9k2m1" }' },
        { code: '401 Unauthorized', desc: 'Missing or invalid Firebase ID token' },
      ],
      curl: `curl -X POST http://localhost:8080/api/cases \\
  -H "Authorization: Bearer $FIREBASE_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"language":"en"}'`,
    },
    {
      method: 'DELETE',
      path: '/api/cases/{caseId}',
      tag: 'Cases',
      summary: 'Delete case file & subcollections',
      description: 'Recursively deletes the case document and all subcollections (letters, deadlines, documents, steps, events).',
      auth: 'Bearer JWT',
      responses: [
        { code: '204 No Content', desc: 'Case permanently deleted' },
        { code: '404 Not Found', desc: 'Case not found or owned by different user' },
      ],
      curl: `curl -X DELETE http://localhost:8080/api/cases/c_ravi89 \\
  -H "Authorization: Bearer $FIREBASE_TOKEN"`,
    },
    {
      method: 'POST',
      path: '/api/demo/cases',
      tag: 'Demo',
      summary: 'Create benchmark demo persona case',
      description: 'Initializes one of the 4 judge evaluation personas (RAVI, MEERA, ARJUN, SUNIL) with preloaded synthetic evidence.',
      auth: 'Bearer JWT',
      body: `{
  "persona": "RAVI"
}`,
      responses: [
        { code: '201 Created', desc: '{ "caseId": "c_ravi89" }' },
      ],
      curl: `curl -X POST http://localhost:8080/api/demo/cases \\
  -H "Authorization: Bearer $FIREBASE_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"persona":"RAVI"}'`,
    },
    {
      method: 'POST',
      path: '/api/demo/cases/{caseId}/skip',
      tag: 'Demo',
      summary: 'Fast-forward simulated date (Judge Time Machine)',
      description: 'Judges skip ahead tool: advances pretend date forward and wakes any statutory deadlines crossed.',
      auth: 'Bearer JWT',
      body: `{
  "days": 8
}`,
      responses: [
        { code: '202 Accepted', desc: '{ "today": "2026-10-25", "woken": 1 }' },
      ],
      curl: `curl -X POST http://localhost:8080/api/demo/cases/c_ravi89/skip \\
  -H "Authorization: Bearer $FIREBASE_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"days":8}'`,
    },
    {
      method: 'POST',
      path: '/api/cases/{caseId}/letters/{letterId}/approve',
      tag: 'Letters',
      summary: 'Approve representation letter',
      description: 'Citizen approves representation letter. Verifies that all {{...}} placeholders are completed.',
      auth: 'Bearer JWT',
      body: `{
  "body": "To The Branch Manager... (no {{placeholders}})"
}`,
      responses: [
        { code: '200 OK', desc: '{ "status": "APPROVED" }' },
        { code: '400 Bad Request', desc: 'Placeholders left unresolved in letter text' },
      ],
      curl: `curl -X POST http://localhost:8080/api/cases/c_ravi89/letters/L1_BANK_GRIEVANCE/approve \\
  -H "Authorization: Bearer $FIREBASE_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"body":"..."}'`,
    },
    {
      method: 'POST',
      path: '/api/cases/{caseId}/letters/{letterId}/sent',
      tag: 'Letters',
      summary: 'Mark letter sent & start 7-day statutory clock',
      description: 'Records letter delivery (BRANCH, EMAIL, WHATSAPP, POST) and initiates the 7-day bank compliance timer.',
      auth: 'Bearer JWT',
      body: `{
  "sentOn": "2026-10-19",
  "how": "BRANCH"
}`,
      responses: [
        { code: '200 OK', desc: '{ "status": "SENT" }' },
      ],
      curl: `curl -X POST http://localhost:8080/api/cases/c_ravi89/letters/L1_BANK_GRIEVANCE/sent \\
  -H "Authorization: Bearer $FIREBASE_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"sentOn":"2026-10-19","how":"BRANCH"}'`,
    },
    {
      method: 'POST',
      path: '/api/cases/{caseId}/events',
      tag: 'Events',
      summary: 'Dispatch citizen event (UPLOAD, ANSWERS, REPLY)',
      description: 'Dispatches citizen inputs or bank responses to Case Boss for asynchronous agent mesh processing.',
      auth: 'Bearer JWT',
      body: `{
  "type": "REPLY",
  "text": "Bank filed my grievance on 2026-10-21"
}`,
      responses: [
        { code: '202 Accepted', desc: '{ "eventId": "ev_8921" }' },
        { code: '423 Locked', desc: 'Case is currently busy running another agent task' },
      ],
      curl: `curl -X POST http://localhost:8080/api/cases/c_ravi89/events \\
  -H "Authorization: Bearer $FIREBASE_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"REPLY","text":"Bank filed grievance"}'`,
    },
  ];

  const filtered = selectedTag === 'ALL' ? endpoints : endpoints.filter(e => e.tag === selectedTag);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getMethodBadge = (m: string) => {
    switch (m) {
      case 'GET':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300';
      case 'POST':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';
      case 'DELETE':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-1rem)] sm:w-full max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3 pr-6">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 shrink-0">
                <Code className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                  Bonafide OpenAPI & Swagger Explorer
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground truncate">
                  OpenAPI 3.0.3 specification for Spring Boot API & Cloud Run service
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/openapi.json"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span>openapi.json</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              <a
                href="http://localhost:8080/swagger-ui.html"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 transition-opacity"
              >
                <span>Backend UI</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 pt-2.5 sm:pt-3 overflow-x-auto scrollbar-none pb-0.5">
            {(['ALL', 'Cases', 'Demo', 'Letters', 'Events'] as const).map(t => (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors shrink-0 ${
                  selectedTag === t
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </DialogHeader>

        {/* Content list */}
        <div className="flex-1 p-3.5 sm:p-6 overflow-y-auto space-y-3 sm:space-y-4">
          {filtered.map((ep, idx) => {
            const isExpanded = expandedEndpoints[idx] ?? false;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-3.5 sm:p-4 space-y-3 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all text-xs"
              >
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer select-none"
                  onClick={() => setExpandedEndpoints(prev => ({ ...prev, [idx]: !isExpanded }))}
                >
                  <div className="flex items-center gap-2 font-mono min-w-0">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border shrink-0 ${getMethodBadge(ep.method)}`}>
                      {ep.method}
                    </span>
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {ep.path}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                      <Shield className="h-3 w-3 mr-1 text-emerald-500" />
                      {ep.auth}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(ep.curl, idx);
                      }}
                      className="h-7 text-xs gap-1 px-2"
                    >
                      {copiedIndex === idx ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span>{copiedIndex === idx ? 'Copied' : 'Copy cURL'}</span>
                    </Button>
                    <span className="p-1 text-muted-foreground hover:text-foreground">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 font-sans">
                  {ep.summary} — <span className="text-muted-foreground">{ep.description}</span>
                </p>

                {isExpanded && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3 accordion-animate-open">
                    {ep.body && (
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-mono text-muted-foreground font-semibold">
                          Request Body (JSON):
                        </span>
                        <pre className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-950 font-mono text-[11px] text-slate-900 dark:text-slate-200 overflow-x-auto">
                          {ep.body}
                        </pre>
                      </div>
                    )}

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-mono text-muted-foreground font-semibold">
                        Responses:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {ep.responses.map((r, rIdx) => (
                          <div
                            key={rIdx}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-[11px] font-mono"
                          >
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{r.code}</span>
                            <span className="text-muted-foreground">— {r.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

