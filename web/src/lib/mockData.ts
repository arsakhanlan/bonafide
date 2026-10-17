import { CaseData } from '@/types/case';
import { Letter } from '@/types/letter';
import { Deadline } from '@/types/deadline';
import { AgentStep } from '@/types/agentStep';

export interface PersonaCase {
  caseData: CaseData;
  letters: Letter[];
  deadlines: Deadline[];
  steps: AgentStep[];
}

export const MOCK_PERSONAS: Record<'RAVI' | 'MEERA' | 'ARJUN' | 'SUNIL', PersonaCase> = {
  RAVI: {
    caseData: {
      id: 'c_ravi89',
      uid: 'user_ravi_123',
      language: 'en',
      stage: 'LETTER_READY',
      busy: false,
      title: 'Ravi Sharma — Mobile Repair Shop, Pune',
      createdAt: '2026-10-16T10:00:00Z',
      updatedAt: '2026-10-16T10:05:00Z',
      facts: {
        occupation: 'Shopkeeper (Electronics / Mobile Repair)',
        disputedTransactionDate: '2026-10-15',
        disputedUpiRef: 'UPI/428910284918/AXIS',
        disputedAmount: 2000,
        bankName: 'HDFC Bank, FC Road Branch, Pune',
        policeUnit: 'Cyber Crime Police Station, Patna',
        ncrpAck: 'NCRP-2026-918237',
      },
      money: {
        frozen: 180000,
        disputed: 2000,
        release: 178000,
        currency: 'INR',
        bankName: 'HDFC Bank',
        accountMasked: '•••• •••• 4092',
      },
      nextStep: {
        action: 'REVIEW_LETTER',
        text: 'Review and approve your Section 106 representation letter to HDFC Bank.',
        letterId: 'L1_BANK_GRIEVANCE',
      },
      eligibility: {
        eligible: true,
        reasons: [
          'Bona fide merchant transaction with invoice proof',
          'Only ₹2,000 is under police investigation; ₹1,80,000 total balance wrongfully frozen',
          'Entitled to immediate release of surplus balance under BNSS §106',
        ],
      },
      evidence: [
        { kind: 'NOTICE', description: 'Bank SMS alert citing police lien', file: 'a1-sms.txt' },
        { kind: 'STATEMENT', description: 'Bank Statement showing ₹1,80,000 locked balance', file: 'a2-statement.pdf' },
        { kind: 'INVOICE', description: 'Tax Invoice #481 for Screen Replacement (₹2,000)', file: 'a3-bill.pdf' },
        { kind: 'CHAT', description: 'WhatsApp customer conversation & UPI confirmation', file: 'a4-chat.txt' },
      ],
      plan: [
        { step: 1, title: 'Extract Papers & Verify Legitimate Income', description: 'Reader agent masked PII, confirmed ₹2,000 UPI repair payment.', status: 'COMPLETED' },
        { step: 2, title: 'Statutory Grounding & Rule Check', description: 'Grounding in BNSS §106 and MHA SOP Clause 4.2 passed verbatim check.', status: 'COMPLETED' },
        { step: 3, title: 'L1 Bank Representation Approval', description: 'Draft ready for customer review and submission.', status: 'ACTIVE' },
        { step: 4, title: 'Bank 7-Day Grievance Clock', description: 'Bank must restrict freeze to ₹2,000 and release ₹1,78,000.', status: 'UPCOMING' },
      ],
      history: [
        { on: '2026-10-16', text: 'Case created and papers submitted by Ravi Sharma' },
        { on: '2026-10-16', text: 'AI Reader verified valid commercial transaction (₹2,000)' },
        { on: '2026-10-16', text: 'Grounding verified against MHA SOP & BNSS §106' },
        { on: '2026-10-16', text: 'Legal Representation Letter (L1) generated' },
      ],
      demo: {
        persona: 'RAVI',
        today: '2026-10-17',
      },
      personNote: 'I run a small phone repair shop on FC Road, Pune. A customer paid ₹2,000 for a screen replacement. Now my entire bank balance of ₹1,80,000 is frozen.',
    },
    letters: [
      {
        id: 'L1_BANK_GRIEVANCE',
        kind: 'L1_BANK_GRIEVANCE',
        title: 'Formal Representation under BNSS §106 — Partial Lien Release Request',
        recipient: 'The Branch Manager / Nodal Officer, HDFC Bank Ltd., FC Road, Pune',
        body: `To,
The Branch Manager / Nodal Officer,
HDFC Bank Limited,
FC Road Branch, Pune - 411004.

Subject: Urgent representation under Section 106 of the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 and MHA Cyber SOP regarding wrongful total debit freeze on Account No. {{Your Account Number}}.

Dear Sir/Madam,

I am writing with respect to the total debit freeze placed on my Savings/Current Account No. {{Your Account Number}} at your branch on 16th October 2026.

1. I am a bona fide shopkeeper operating an electronic repair business under the name 'Ravi Mobile Care'. On 15th October 2026, I received a payment of Rs. 2,000/- (Rupees Two Thousand only) via UPI (Ref: UPI/428910284918/AXIS) for genuine screen replacement services rendered. The relevant invoice (Invoice #481) and customer job card are enclosed.

2. I have been informed by SMS that a freeze request was communicated by Cyber Crime Police Station, Patna (Ref: NCRP-2026-918237) in connection with an alleged fraud complaint.

3. As per the Ministry of Home Affairs (MHA) Standard Operating Procedure dated 02-01-2026 on Bank Account Freezes, as well as the statutory mandate under Section 106 BNSS:
   "Where an account receives a tainted transaction in the ordinary course of business, the lien shall be restricted solely to the disputed amount, and the remaining innocent funds shall not be restrained."

4. At the time of the freeze, my account held a legitimate balance of Rs. 1,80,000/-. Freezing the entire account rather than marking a lien on the disputed sum of Rs. 2,000/- violates statutory guidelines and paralyzes my lawful livelihood.

5. ACCORDINGLY, I REQUEST YOU TO:
   a) Restrict any hold or lien strictly to the disputed sum of Rs. 2,000/-;
   b) Immediately release the remaining legitimate balance of Rs. 1,78,000/- for operation;
   c) Lodge this formal representation within your internal grievance portal and provide a grievance acknowledgement number within 7 working days.

Yours sincerely,
{{Your name}}
Phone: {{Your phone}}
Address: FC Road, Pune, Maharashtra
Encl: Invoice copy, UPI payment receipt, ID proof.`,
        status: 'DRAFT',
        citations: [
          'Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 — Section 106',
          'Ministry of Home Affairs (MHA) Cyber SOP Cl. 4.2 (Lien Restriction)',
          'RBI Master Direction on Customer Service in Banks (Grievance Redressal)',
        ],
        checks: {
          passed: true,
          reasons: [
            'Money calculations verified: ₹1,80,000 - ₹2,000 = ₹1,78,000 release',
            'All citations grounded word-for-word in statutory rulebook',
            'No prohibited legal guarantees or hallucinatory statutes',
          ],
        },
      },
    ],
    deadlines: [
      {
        id: 'BANK_FILE_GRIEVANCE',
        clock: 'BANK_FILE_GRIEVANCE',
        title: 'Bank Grievance Lodgement & Lien Restriction',
        description: 'Under MHA SOP, the bank has 7 calendar days from receipt of representation to record the grievance and release undisputed surplus funds.',
        status: 'PENDING',
        dueOn: '2026-10-24',
        daysRemaining: 7,
        statuteRef: 'MHA SOP Cl. 4.2 & BNSS §106',
      },
    ],
    steps: [
      { id: 's1', agent: 'SYSTEM', message: 'Case initialized for Ravi Sharma. Language: English', level: 'INFO', timestamp: '10:00:01' },
      { id: 's2', agent: 'READER', message: 'Extracted documents: Notice SMS, Bank statement, Repair bill (Rs 2,000), WhatsApp chat', level: 'INFO', timestamp: '10:00:15' },
      { id: 's3', agent: 'SORTER', message: 'Classification: Bona fide merchant innocent recipient. Fraud index: 0.00', level: 'INFO', timestamp: '10:00:28' },
      { id: 's4', agent: 'CHECKER', message: 'Maths check: Frozen ₹1,80,000 - Disputed ₹2,000 = ₹1,78,000 release. Verified.', level: 'INFO', timestamp: '10:00:42' },
      { id: 's5', agent: 'CHECKER', message: 'Grounded against Section 106 BNSS & MHA SOP 2026-01-02. Similarity score: 0.94', level: 'INFO', timestamp: '10:01:03' },
      { id: 's6', agent: 'CASE_BOSS', message: 'Representation ready. Customer action required: review & approve letter.', level: 'INFO', timestamp: '10:01:10' },
    ],
  },

  MEERA: {
    caseData: {
      id: 'c_meera42',
      uid: 'user_meera_456',
      language: 'en',
      stage: 'NEEDS_ANSWERS',
      busy: false,
      title: 'Meera Sen — Freelance Brand Designer',
      createdAt: '2026-10-16T11:00:00Z',
      updatedAt: '2026-10-16T11:12:00Z',
      money: {
        frozen: 45000,
        disputed: 12500,
        release: 32500,
        currency: 'INR',
        bankName: 'ICICI Bank',
        accountMasked: '•••• •••• 9811',
      },
      nextStep: {
        action: 'ANSWER_QUESTIONS',
        text: 'The AI agent needs 2 quick answers to prove the commercial purpose of the payment.',
      },
      questions: [
        {
          id: 'q1',
          text: 'What specific design deliverable was the ₹12,500 payment received for?',
          why: 'Police notice flagged a generic peer transfer; we need to establish commercial consideration under Contract Act.',
          placeholder: 'e.g. Logo concept and brand identity kit for client XYZ',
        },
        {
          id: 'q2',
          text: 'Do you have an email, contract, or client WhatsApp thread discussing this project?',
          why: 'Providing documentary correspondence confirms you had no knowledge of fraud origin.',
          placeholder: 'e.g. Yes, discussed via Gmail and delivered via Google Drive link',
        },
      ],
      answersAsked: true,
      eligibility: {
        eligible: true,
        reasons: ['Pending freelance clarification'],
      },
      evidence: [
        { kind: 'NOTICE', description: 'ICICI Bank notice email', file: 'a1-sms.txt' },
        { kind: 'STATEMENT', description: 'Bank Statement showing hold', file: 'a2-statement.pdf' },
      ],
      plan: [
        { step: 1, title: 'Submit Freelance Clarifications', description: 'Answer the 2 clarifying questions to establish legitimate consideration.', status: 'ACTIVE' },
        { step: 2, title: 'Generate Representation Letter', description: 'Produce L1 representation with client deliverable records.', status: 'UPCOMING' },
        { step: 3, title: 'Bank 7-Day Grievance Clock', description: 'Track bank compliance to unfreeze ₹32,500.', status: 'UPCOMING' },
      ],
      history: [
        { on: '2026-10-16', text: 'Case created by Meera Sen' },
        { on: '2026-10-16', text: 'AI Reader detected vague transaction description in statement' },
        { on: '2026-10-16', text: 'Clarification questions generated for customer' },
      ],
      demo: {
        persona: 'MEERA',
        today: '2026-10-17',
      },
      personNote: 'I do freelance logo design. A client paid me ₹12,500 in August. Now ICICI Bank put a hold on my account and won’t let me withdraw.',
    },
    letters: [],
    deadlines: [],
    steps: [
      { id: 's1', agent: 'SYSTEM', message: 'Case initialized for Meera Sen', level: 'INFO', timestamp: '11:00:01' },
      { id: 's2', agent: 'READER', message: 'Bank notice cites Cyber Cell, Ahmedabad regarding ₹12,500 credit', level: 'INFO', timestamp: '11:00:22' },
      { id: 's3', agent: 'SORTER', message: 'Documents lack invoice/agreement. Triggering clarifying questions.', level: 'WARN', timestamp: '11:00:45' },
    ],
  },

  ARJUN: {
    caseData: {
      id: 'c_arjun19',
      uid: 'user_arjun_789',
      language: 'en',
      stage: 'LETTER_READY',
      busy: false,
      title: 'Arjun Verma — P2P Crypto Merchant',
      createdAt: '2026-10-16T12:00:00Z',
      updatedAt: '2026-10-16T12:15:00Z',
      money: {
        frozen: 40000,
        disputed: 9800,
        release: 30200,
        currency: 'INR',
        bankName: 'State Bank of India',
        accountMasked: '•••• •••• 1045',
      },
      nextStep: {
        action: 'REVIEW_LETTER',
        text: 'Review Section 106 representation with P2P escrow transaction log.',
        letterId: 'L1_ARJUN_P2P',
      },
      eligibility: {
        eligible: true,
        reasons: [
          'Exchange escrow release logs verify genuine crypto sale',
          'Partial lien defense: ₹30,200 must be released immediately',
          'Includes mandatory caution disclaimer regarding crypto tax reporting',
        ],
      },
      evidence: [
        { kind: 'NOTICE', description: 'SBI Lien Notice SMS', file: 'a1-sms.txt' },
        { kind: 'STATEMENT', description: 'SBI Account Statement', file: 'a2-statement.pdf' },
        { kind: 'CHAT', description: 'Binance P2P Order Escrow Confirmation #8912', file: 'a3-chat.txt' },
      ],
      plan: [
        { step: 1, title: 'Verify P2P Escrow Records', description: 'Checked order timestamps against bank credit.', status: 'COMPLETED' },
        { step: 2, title: 'Statutory Drafting', description: 'Drafted Section 106 letter with escrow transaction trail.', status: 'COMPLETED' },
        { step: 3, title: 'Send to SBI Nodal Officer', description: 'Ready to submit.', status: 'ACTIVE' },
      ],
      history: [
        { on: '2026-10-16', text: 'Case registered by Arjun Verma' },
        { on: '2026-10-16', text: 'Escrow release verified: Order #8912 for 112 USDT' },
        { on: '2026-10-16', text: 'Statutory representation prepared' },
      ],
      demo: {
        persona: 'ARJUN',
        today: '2026-10-17',
      },
      personNote: 'I sell USDT on a peer-to-peer crypto exchange. A buyer transferred ₹40,000 for USDT. Now police disputed ₹9,800 and SBI froze all ₹40,000.',
    },
    letters: [
      {
        id: 'L1_ARJUN_P2P',
        kind: 'L1_BANK_GRIEVANCE',
        title: 'SBI Representation — P2P Crypto Escrow Consideration & Partial Lien Defense',
        recipient: 'The Branch Manager, State Bank of India, Commercial Branch',
        body: `To,
The Branch Manager,
State Bank of India, Commercial Branch.

Subject: Requisition to restrict debit freeze to disputed amount of Rs. 9,800/- and release Rs. 30,200/- under Section 106 BNSS (A/c {{Your Account Number}}).

Dear Sir,

I am writing regarding the total freeze placed on my Account No. {{Your Account Number}}.

1. The credit of Rs. 40,000/- received on 14th October 2026 represents consideration for lawful peer-to-peer digital asset transfer executed via centralized escrow (Order ID: #8912). The buyer transferred funds directly to my bank account, following which the escrow released 112 USDT to the buyer.

2. Out of this transaction, an amount of Rs. 9,800/- has been disputed pursuant to a complaint before Cyber Cell.

3. Under Section 106 BNSS, 2023 read with MHA SOP 2026-01-02, the bank is obliged to confine the lien strictly to the contested portion (Rs. 9,800/-) and allow normal withdrawal for the remaining Rs. 30,200/-.

Kindly update your portal records and provide grievance registration.

Yours faithfully,
{{Your name}}
Phone: {{Your phone}}`,
        status: 'DRAFT',
        citations: ['BNSS §106', 'MHA Cyber SOP 2026-01-02'],
        checks: { passed: true },
      },
    ],
    deadlines: [
      {
        id: 'BANK_FILE_GRIEVANCE',
        clock: 'BANK_FILE_GRIEVANCE',
        title: 'SBI Grievance Compliance Clock',
        description: '7-day statutory clock for SBI to process grievance and confine lien.',
        status: 'PENDING',
        dueOn: '2026-10-24',
        daysRemaining: 7,
      },
    ],
    steps: [
      { id: 's1', agent: 'READER', message: 'Parsed P2P order slip #8912: 112 USDT sold', level: 'INFO', timestamp: '12:00:05' },
      { id: 's2', agent: 'CHECKER', message: 'Model Armor scan: Clean transaction trail. Disputed: ₹9,800.', level: 'INFO', timestamp: '12:00:18' },
    ],
  },

  SUNIL: {
    caseData: {
      id: 'c_sunil01',
      uid: 'user_sunil_999',
      language: 'en',
      stage: 'REFERRED',
      busy: false,
      title: 'Sunil Kumar — Account Lending Referral',
      createdAt: '2026-10-16T13:00:00Z',
      updatedAt: '2026-10-16T13:02:00Z',
      money: {
        frozen: 12000,
        disputed: 12000,
        release: 0,
        currency: 'INR',
        bankName: 'Kotak Mahindra Bank',
        accountMasked: '•••• •••• 3319',
      },
      nextStep: {
        action: 'SEE_LEGAL_AID',
        text: 'Account-sharing detected. For your safety, the system cannot draft letters. Connect with free legal aid (NALSA).',
      },
      eligibility: {
        eligible: false,
        reasons: [
          'Safety policy: Allowing 3rd parties to operate your bank account/UPI for commission carries criminal liability under BNS §318 and IT Act §66D ("Mule Account").',
          'Self-help representation letters cannot be issued to protect you from unintended self-incrimination.',
          'Referred directly to government Legal Services Authority for free advocate defense.',
        ],
      },
      referral: {
        service: 'National Legal Services Authority (NALSA) & DLSA',
        reason: 'Third-party account lending / potential mule allegation',
        helpline: '15100 (Toll-Free Legal Aid Helpline)',
        website: 'https://nalsa.gov.in',
        office: 'District Legal Services Authority (DLSA), District Court Complex',
        freeLegalAidAct: 'Legal Services Authorities Act, 1987 — Section 12',
        guidanceNotes: [
          'Do not sign any statements or hand over further OTPs or phone access to anyone.',
          'Carry your bank passbook and identity card to your nearest District Legal Services Authority (DLSA) office.',
          'Under Section 12 of the Legal Services Authorities Act, 1987, you are entitled to a free court-appointed lawyer.',
          'Never agree to hold or transfer funds for third parties in exchange for monthly commission or fee.',
        ],
      },
      evidence: [
        { kind: 'NOTICE', description: 'Bank notice alleging mule account activity', file: 'a1-sms.txt' },
      ],
      plan: [
        { step: 1, title: 'Safety Scan & Referral', description: 'Identified third-party account usage. Immediately safeguarded.', status: 'COMPLETED' },
        { step: 2, title: 'Connect with Free Legal Aid Counsel', description: 'Visit DLSA or call 15100 for appointed advocate.', status: 'ACTIVE' },
      ],
      history: [
        { on: '2026-10-16', text: 'Case registered by Sunil Kumar' },
        { on: '2026-10-16', text: 'Safety Trigger: Account rented to third party' },
        { on: '2026-10-16', text: 'Case safely referred to Free Legal Aid (NALSA)' },
      ],
      demo: {
        persona: 'SUNIL',
        today: '2026-10-17',
      },
      personNote: 'A friend pays me ₹2,000 every month to let him use my bank account and my UPI. Now the bank says my account is frozen because of a fraud complaint.',
    },
    letters: [],
    deadlines: [],
    steps: [
      { id: 's1', agent: 'READER', message: 'Note indicates third-party account delegation ("friend pays me to use my account")', level: 'WARN', timestamp: '13:00:03' },
      { id: 's2', agent: 'CHECKER', message: 'CRITICAL SAFETY TRIGGER: Mule account indicators detected.', level: 'ERROR', timestamp: '13:00:10' },
      { id: 's3', agent: 'CASE_BOSS', message: 'Halting self-help letter generator. Redirecting user to Free Legal Aid (NALSA).', level: 'WARN', timestamp: '13:00:15' },
    ],
  },
};

