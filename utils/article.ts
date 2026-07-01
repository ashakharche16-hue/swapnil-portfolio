const VOWELS = new Set(["a", "e", "i", "o", "u"]);

/**
 * Returns the indefinite article ("a" / "an") for a word based on its first
 * letter. Simple vowel-letter heuristic — good enough for role titles; it does
 * not special-case sound-based exceptions like "an hour" or "a university".
 */
export function indefiniteArticle(word: string): string {
  const first = word.trim().charAt(0).toLowerCase();
  return VOWELS.has(first) ? "an" : "a";
}
