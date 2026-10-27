// Local Heuristic Duplicate Similarity Check
// Compares category, title keywords, and location strings without external APIs or AI services.

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'from', 'near', 'corner', 'street', 'st', 'ave', 'avenue', 'rd', 'road', 'blvd',
  'lane', 'way', 'is', 'it', 'there', 'has', 'have', 'been', 'some', 'very'
]);

function tokenize(text = '') {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

/**
 * Finds potential duplicate complaints from the existing dataset.
 * Returns array of matches with score, matching reasons, and complaint objects.
 */
export function findPossibleDuplicates(candidate, existingComplaints = []) {
  if (!candidate || !existingComplaints.length) return [];

  const candidateCat = candidate.category || '';
  const candidateTitleTokens = tokenize(candidate.title || '');
  const candidateLocTokens = tokenize(candidate.location || '');

  const matches = [];

  for (const item of existingComplaints) {
    let score = 0;
    const matchReasons = [];

    // 1. Same category match (+35%)
    if (candidateCat && item.category === candidateCat) {
      score += 35;
      matchReasons.push('Matching issue category');
    }

    // 2. Title keyword matches
    const itemTitleTokens = tokenize(item.title || '');
    const titleMatches = candidateTitleTokens.filter((token) => itemTitleTokens.includes(token));
    if (titleMatches.length > 0) {
      const titleBonus = Math.min(titleMatches.length * 20, 45);
      score += titleBonus;
      matchReasons.push(`Title keywords: "${titleMatches.slice(0, 3).join(', ')}"`);
    }

    // 3. Location keyword matches
    const itemLocTokens = tokenize(item.location || '');
    const locMatches = candidateLocTokens.filter((token) => itemLocTokens.includes(token));
    if (locMatches.length > 0) {
      const locBonus = Math.min(locMatches.length * 15, 30);
      score += locBonus;
      matchReasons.push(`Location terms: "${locMatches.slice(0, 2).join(', ')}"`);
    }

    // Cap score at 96%
    const finalScore = Math.min(score, 96);

    // Heuristic threshold:
    // Either score >= 50, OR matching category + at least 1 keyword match in title or location
    if (finalScore >= 45 || (candidateCat === item.category && (titleMatches.length > 0 || locMatches.length > 0))) {
      matches.push({
        complaint: item,
        score: Math.max(finalScore, 50),
        matchReasons,
      });
    }
  }

  // Sort descending by score
  return matches.sort((a, b) => b.score - a.score);
}
