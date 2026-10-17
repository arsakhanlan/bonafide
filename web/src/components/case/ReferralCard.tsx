import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertOctagon, PhoneCall, Globe, MapPin, ShieldAlert, CheckCircle2 } from 'lucide-react';

export function ReferralCard() {
  const { caseData } = useCase();

  if (!caseData || (!caseData.referral && caseData.stage !== 'REFERRED')) return null;

  const referral = caseData.referral;

  return (
    <Card id="referral-section" className="border-2 border-purple-500/80 bg-purple-50/30 dark:border-purple-600/60 dark:bg-purple-950/20 shadow-md rounded-2xl overflow-hidden">
      <CardHeader className="bg-purple-100/70 dark:bg-purple-900/40 py-3.5 px-4 sm:px-6 border-b border-purple-200/80 dark:border-purple-800/80">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-purple-950 dark:text-purple-200">
            <AlertOctagon className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0" />
            <CardTitle className="text-sm sm:text-base font-bold">
              Account-Lending Safety Protocol: Legal Aid Referral
            </CardTitle>
          </div>
          <Badge variant="destructive" className="bg-purple-700 hover:bg-purple-800 text-xs font-semibold">
            Zero Letters Policy
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        <div className="rounded-xl bg-white dark:bg-slate-900 p-3.5 sm:p-4 border border-purple-200/80 dark:border-purple-900/60 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 text-sm">
            <ShieldAlert className="h-4 w-4 text-purple-600 shrink-0" />
            Why can't self-help letters be generated for this case?
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Allowing third parties to use your bank account or UPI in exchange for monthly commission or a fee exposes you to potential allegations of operating a <em>"mule account"</em> under the Bharatiya Nyaya Sanhita (BNS) and Information Technology Act.
          </p>
          <p className="text-slate-700 dark:text-slate-300 font-medium">
            Drafting informal letters to the bank could result in unintentional self-incrimination. Under the Legal Services Authorities Act, 1987, you are legally entitled to <strong>free legal counsel</strong> appointed by the government.
          </p>
        </div>

        {/* Legal Aid Contact Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 text-xs font-semibold uppercase tracking-wider">
              <PhoneCall className="h-4 w-4" />
              National Helpline
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {referral?.helpline || '15100'}
            </div>
            <p className="text-[11px] text-muted-foreground">
              24/7 Toll-Free National Legal Aid helpline
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <MapPin className="h-4 w-4" />
              Nearest DLSA Office
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
              {referral?.office || 'District Legal Services Authority'}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Located inside your local District Court Complex
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-xs font-semibold uppercase tracking-wider">
              <Globe className="h-4 w-4" />
              Online Portal
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
              nalsa.gov.in
            </div>
            <p className="text-[11px] text-muted-foreground">
              Direct application for free legal defender
            </p>
          </div>
        </div>

        {/* Guidance checklist */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Immediate Protective Measures for Sunil:
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            {(referral?.guidanceNotes || [
              'Do not sign any statements or hand over further OTPs or phone access to anyone.',
              'Carry your bank passbook and identity card to your nearest District Legal Services Authority (DLSA) office.',
              'Under Section 12 of the Legal Services Authorities Act, 1987, you are entitled to a free court-appointed lawyer.',
              'Never agree to hold or transfer funds for third parties in exchange for monthly commission.',
            ]).map((note, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-purple-600 mt-0.5 shrink-0" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

