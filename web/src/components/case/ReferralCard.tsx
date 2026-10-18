import React from 'react';
import { useCase } from '@/context/CaseContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertOctagon, PhoneCall, Globe, ShieldAlert } from 'lucide-react';

export function ReferralCard() {
  const { caseData } = useCase();

  if (!caseData || (!caseData.referral && caseData.stage !== 'REFERRED' && caseData.stage !== 'NEEDS_LAWYER')) return null;

  const referral = caseData.referral;
  const isCyber = referral?.to === 'CYBER_HELPLINE';
  const isLawyer = caseData.stage === 'NEEDS_LAWYER';

  const title = isCyber
    ? 'Report the Fraud — We Cannot Send Letters for This Case'
    : isLawyer
    ? 'This Case Needs a Lawyer — Free Legal Aid May Be Available'
    : 'Safety Protection: Free Legal Aid Referral';

  const body = isCyber
    ? 'Bonafide only writes self-help letters for people whose own money was frozen after they received a payment in good faith. Because this case looks like you may have lost money to a fraud, the right step is to report it so the police can act.'
    : isLawyer
    ? 'The papers suggest a formal court step that self-help letters cannot cover. Under the Legal Services Authorities Act, 1987, you are entitled to free legal counsel appointed by the government.'
    : 'For your safety, the system cannot draft letters for this case. Free government legal aid can advise you properly.';

  const helpline = referral?.helpline || (isCyber ? '1930' : '15100');
  const helplineLabel = isCyber ? 'Cyber Fraud Helpline' : 'National Helpline';
  const website = referral?.website || (isCyber ? 'https://cybercrime.gov.in' : 'https://nalsa.gov.in');
  const websiteLabel = isCyber ? 'cybercrime.gov.in' : 'nalsa.gov.in';
  const office = isCyber ? 'Report online or call 1930' : referral?.office || 'District Legal Services Authority';

  return (
    <Card id="referral-section" className="border-2 border-amber-600/60 bg-amber-50/25 dark:border-amber-500/40 dark:bg-amber-950/15 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="bg-amber-100/60 dark:bg-amber-950/30 py-3.5 px-4 sm:px-6 border-b border-amber-200/80 dark:border-amber-900/50">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-amber-950 dark:text-amber-200">
            <AlertOctagon className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <CardTitle className="text-sm sm:text-base font-bold">
              {title}
            </CardTitle>
          </div>
          <Badge variant="destructive" className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold">
            Zero Letters Policy
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        <div className="rounded-xl bg-card p-3.5 sm:p-4 border border-amber-200/80 dark:border-amber-900/50 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-foreground text-sm">
            <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            {referral?.title || (isCyber ? 'Why no letters here?' : "Why can't self-help letters be generated for this case?")}
          </div>
          {referral?.reason && <p className="text-muted-foreground leading-relaxed">{referral.reason}</p>}
          <p className="text-foreground/90 font-medium font-legal text-xs sm:text-[13px]">
            {body}
          </p>
        </div>

        {/* Contact Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          <div className="p-4 rounded-xl bg-card border border-border space-y-1">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider font-mono">
              <PhoneCall className="h-4 w-4" />
              {helplineLabel}
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {helpline}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {isCyber ? 'Report the fraud immediately' : '24/7 Toll-Free Legal Aid helpline'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border space-y-1">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider font-mono">
              <ShieldAlert className="h-4 w-4" />
              Next Step
            </div>
            <div className="text-sm font-bold text-foreground line-clamp-2">
              {office}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {isCyber ? 'Keep your complaint number safe' : 'Located inside your local District Court Complex'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border space-y-1">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider font-mono">
              <Globe className="h-4 w-4" />
              Online Portal
            </div>
            <div className="text-sm font-bold font-mono text-foreground">
              {websiteLabel}
            </div>
            <a
              href={website}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              Open the official site
            </a>
          </div>
        </div>

        {/* Guidance checklist */}
        <div className="rounded-xl bg-secondary/40 p-4 border border-border/80 space-y-2">
          <div className="text-xs font-bold text-foreground">
            Protective Steps Right Now:
          </div>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            {(referral?.guidanceNotes?.length
              ? referral.guidanceNotes
              : isCyber
              ? [
                  'Do not send more money to anyone promising to recover your funds.',
                  'Call 1930 or file online at cybercrime.gov.in with your transaction details.',
                  'Keep your complaint acknowledgment number safe.',
                ]
              : [
                  'Do not sign any statements or hand over further OTPs or phone access to anyone.',
                  'Carry your bank passbook and identity card to your nearest District Legal Services Authority (DLSA) office.',
                  'Under Section 12 of the Legal Services Authorities Act, 1987, you are entitled to a free court-appointed lawyer.',
                ]
            ).map((note, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-600 dark:bg-amber-400 mt-1.5 shrink-0" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
