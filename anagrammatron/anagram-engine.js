const fs = require("fs");

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
}

function countLetters(text) {
  const counts = {};
  for (const char of normalize(text)) {
    counts[char] = (counts[char] || 0) + 1;
  }
  return counts;
}

function canUseWord(word, available) {
  const wordCounts = countLetters(word);

  for (const char in wordCounts) {
    if (!available[char] || wordCounts[char] > available[char]) {
      return false;
    }
  }

  return true;
}

function subtractLetters(available, word) {
  const next = { ...available };
  const wordCounts = countLetters(word);

  for (const char in wordCounts) {
    next[char] -= wordCounts[char];
    if (next[char] === 0) delete next[char];
  }

  return next;
}

function isEmptyCounts(counts) {
  return Object.keys(counts).length === 0;
}

function generateAnagrams(input, words, maxWords = 3, limit = 50) {
  const results = [];
  const available = countLetters(input);

  const usableWords = words
    .map(w => w.trim().toLowerCase())
    .filter(w => w.length > 1)
    .filter(w => canUseWord(w, available))
    .sort((a, b) => b.length - a.length);

  function search(currentPhrase, remainingLetters, depth) {
    if (results.length >= limit) return;

    if (isEmptyCounts(remainingLetters)) {
      results.push(currentPhrase.join(" "));
      return;
    }

    if (depth >= maxWords) return;

    for (const word of usableWords) {
      if (canUseWord(word, remainingLetters)) {
        const nextRemaining = subtractLetters(remainingLetters, word);
        search([...currentPhrase, word], nextRemaining, depth + 1);
      }
    }
  }

  search([], available, 0);

  return [...new Set(results)];
}

// ---- uso da terminale ----

const input = process.argv.slice(2).join(" ");

if (!input) {
  console.log("Uso:");
  console.log("node anagram-engine.js \"Giovanni Bindi\"");
  process.exit(1);
}

const words = fs.readFileSync("words.txt", "utf8").split("\n");

const anagrams = generateAnagrams(input, words, 4, 100);

console.log(`Anagrammi trovati per: "${input}"\n`);

if (anagrams.length === 0) {
  console.log("Nessun anagramma trovato. Il dizionario è probabilmente troppo povero.");
} else {
  for (const item of anagrams) {
    console.log("- " + item);
  }
}