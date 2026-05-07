const newline = String.fromCharCode(10);

export function normalize(text) {
  const decomposed = String(text)
    .toLowerCase()
    .normalize("NFD");

  let result = "";

  for (const char of decomposed) {
    if (char >= "a" && char <= "z") {
      result += char;
    }
  }

  return result;
}

export function splitLines(text) {
  return String(text)
    .replaceAll(String.fromCharCode(13), newline)
    .split(newline);
}

export function countLetters(text) {
  const counts = {};

  for (const char of normalize(text)) {
    counts[char] = (counts[char] || 0) + 1;
  }

  return counts;
}

export function canUseWord(word, available) {
  const wordCounts = countLetters(word);

  for (const char in wordCounts) {
    if (!available[char] || wordCounts[char] > available[char]) {
      return false;
    }
  }

  return true;
}

export function subtractLetters(available, word) {
  const next = { ...available };
  const wordCounts = countLetters(word);

  for (const char in wordCounts) {
    next[char] -= wordCounts[char];

    if (next[char] === 0) {
      delete next[char];
    }
  }

  return next;
}

export function isEmptyCounts(counts) {
  return Object.keys(counts).length === 0;
}

export function generateAnagrams(input, words, maxWords = 4, limit = 100) {
  const results = [];
  const available = countLetters(input);

  const usableWords = words
    .map((word) => normalize(word))
    .filter((word) => word.length > 1)
    .filter((word) => canUseWord(word, available))
    .sort((a, b) => b.length - a.length || a.localeCompare(b, "it"));

  function search(currentPhrase, remainingLetters, depth, startIndex) {
    if (results.length >= limit) {
      return;
    }

    if (isEmptyCounts(remainingLetters)) {
      results.push(currentPhrase.join(" "));
      return;
    }

    if (depth >= maxWords) {
      return;
    }

    for (let index = startIndex; index < usableWords.length; index += 1) {
      const word = usableWords[index];

      if (!canUseWord(word, remainingLetters)) {
        continue;
      }

      const nextRemaining = subtractLetters(remainingLetters, word);
      search([...currentPhrase, word], nextRemaining, depth + 1, index);
    }
  }

  search([], available, 0, 0);

  return [...new Set(results)];
}
