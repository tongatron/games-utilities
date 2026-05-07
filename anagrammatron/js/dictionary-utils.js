import { normalize, splitLines } from "./engine-core.js";

export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Errore FileReader"));

    reader.readAsText(file, "utf-8");
  });
}

export function extractWords(text) {
  return splitLines(text)
    .map((word) => normalize(word))
    .filter((word) => word.length > 1);
}

export function dedupeAndSortWords(words) {
  return [...new Set(words)].sort((a, b) => a.localeCompare(b, "it"));
}

export async function loadPresetDictionary(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Errore caricamento dizionario: ${response.status}`);
  }

  return extractWords(await response.text());
}
