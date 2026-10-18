import { LetterKind } from '@/types/letter';

export type LetterAudience = 'bank' | 'police' | 'district' | 'lawyer';

/** Who a letter is addressed to, from its kind. Unknown kinds default to the bank. */
export function audienceOf(kind?: LetterKind | null): LetterAudience {
  switch (kind) {
    case 'L2_OFFICER':
      return 'police';
    case 'L3_REVIEW':
    case 'L3_DISTRICT':
      return 'district';
    case 'L5_LAWYER_NOTES':
      return 'lawyer';
    default:
      return 'bank';
  }
}

export const AUDIENCE_LABEL: Record<LetterAudience, string> = {
  bank: 'the bank',
  police: 'the police',
  district: 'the District Grievance Officer',
  lawyer: 'your lawyer',
};
