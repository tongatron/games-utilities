import { generateAnagrams } from "./engine-core.js";

self.addEventListener("message", (event) => {
  const { input, words, maxWords, limit } = event.data;

  try {
    const results = generateAnagrams(input, words, maxWords, limit);
    self.postMessage({ ok: true, results });
  } catch (error) {
    self.postMessage({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});
