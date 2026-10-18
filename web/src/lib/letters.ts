import type { Letter } from '@/types/letter';

/**
 * The newest SENT letter. Firestore snapshots have no guaranteed order and several
 * letters can be sent on the same demo date, so compare sentOn first and createdAt next.
 */
export function latestSent(letters: Letter[]): Letter | undefined {
  return letters
    .filter((letter) => letter.status === 'SENT')
    .reduce<Letter | undefined>((latest, letter) => {
      if (!latest) return letter;
      const bySentOn = (letter.sentOn || '').localeCompare(latest.sentOn || '');
      if (bySentOn !== 0) return bySentOn > 0 ? letter : latest;
      return (letter.createdAt || '').localeCompare(latest.createdAt || '') > 0 ? letter : latest;
    }, undefined);
}

/** The newest letter in a group (draft or sent), using the mapped createdAt when present. */
export function latestLetter(letters: Letter[]): Letter | undefined {
  const dated = letters.filter((letter) => letter.createdAt);
  if (dated.length === 0) return letters[letters.length - 1];
  return dated.reduce((latest, letter) =>
    (letter.createdAt || '').localeCompare(latest.createdAt || '') > 0 ? letter : latest
  );
}
