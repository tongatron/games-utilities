import {
  dedupeAndSortWords,
  extractWords,
  loadPresetDictionary,
  readFileAsText,
} from "./dictionary-utils.js";
import { splitLines } from "./engine-core.js";

const newline = String.fromCharCode(10);

const dictionaryStatus = document.getElementById("dictionaryStatus");
const workerStatus = document.getElementById("workerStatus");
const importLog = document.getElementById("importLog");
const dictionaryTextarea = document.getElementById("dictionary");
const dictionaryFilesInput = document.getElementById("dictionaryFiles");
const dictionaryFolderInput = document.getElementById("dictionaryFolder");
const presetDictionarySelect = document.getElementById("presetDictionary");
const loadPresetButton = document.getElementById("loadPresetButton");
const importButton = document.getElementById("importButton");
const generateButton = document.getElementById("generateButton");
const resultsBox = document.getElementById("results");
const resultCount = document.getElementById("resultCount");
const appMode = document.getElementById("appMode");

let worker = createWorker();

function createWorker() {
  return new Worker("./js/anagram-worker.js", { type: "module" });
}

function setStatus(message, isError = false) {
  dictionaryStatus.className = isError ? "status error" : "status";
  dictionaryStatus.innerHTML = message;
}

function setWorkerStatus(message, isError = false) {
  workerStatus.className = isError ? "status error" : "status secondary";
  workerStatus.textContent = message;
}

function log(message) {
  const current = importLog.textContent === "Nessun log." ? "" : importLog.textContent;
  importLog.textContent = `${current}${message}${newline}`;
}

function clearLog() {
  importLog.textContent = "";
}

function setResults(items) {
  resultCount.textContent = `${items.length} risultati`;

  if (items.length === 0) {
    resultsBox.className = "muted";
    resultsBox.innerHTML =
      "Nessun anagramma trovato.<br>Prova ad aumentare il numero massimo di parole oppure usa un dizionario piu ricco.";
    return;
  }

  resultsBox.className = "";
  resultsBox.innerHTML = items
    .map((item) => `<div class="result">➜ ${item}</div>`)
    .join("");
}

function setDictionary(words, sourceLabel) {
  const uniqueWords = dedupeAndSortWords(words);
  dictionaryTextarea.value = uniqueWords.join(newline);

  setStatus(
    `Sorgente: ${sourceLabel}<br>` +
      `Parole importate: ${words.length}<br>` +
      `Parole uniche disponibili: ${uniqueWords.length}`
  );

  return uniqueWords;
}

async function importSelectedDictionaries() {
  clearLog();
  log("Importazione avviata.");

  try {
    const fileFiles = Array.from(dictionaryFilesInput.files || []);
    const folderFiles = Array.from(dictionaryFolderInput.files || []);
    const selectedFiles = [...fileFiles, ...folderFiles].filter((file) =>
      file.name.toLowerCase().endsWith(".txt")
    );

    log(`File .txt validi trovati: ${selectedFiles.length}`);

    if (selectedFiles.length === 0) {
      setStatus("Nessun file .txt selezionato.", true);
      log("Controlla di aver scelto file con estensione .txt.");
      return;
    }

    importButton.disabled = true;
    setStatus(`Caricamento di ${selectedFiles.length} file...`);

    let allWords = [];
    let loadedFiles = 0;

    for (const file of selectedFiles) {
      const displayName = file.webkitRelativePath || file.name;
      log(`Leggo: ${displayName}`);

      try {
        const text = await readFileAsText(file);
        const words = extractWords(text);

        allWords.push(...words);
        loadedFiles += 1;

        log(`  OK: ${words.length} parole importate`);
      } catch (error) {
        log(`  ERRORE: ${error.message}`);
      }
    }

    setDictionary(allWords, `${loadedFiles} file locali`);
    log("Importazione completata.");
  } catch (error) {
    setStatus(`Errore generale: ${error.message}`, true);
    log(`ERRORE GENERALE: ${error.stack || error.message}`);
  } finally {
    importButton.disabled = false;
  }
}

async function loadPreset() {
  const url = presetDictionarySelect.value;

  clearLog();

  if (!url) {
    setStatus("Seleziona prima un dizionario incluso.", true);
    return;
  }

  loadPresetButton.disabled = true;
  setStatus("Caricamento dizionario incluso...");
  log(`Fetch: ${url}`);

  try {
    const words = await loadPresetDictionary(url);
    setDictionary(words, url.replace("./dizionari/", ""));
    log(`Dizionario incluso caricato: ${words.length} parole.`);
  } catch (error) {
    setStatus(error.message, true);
    log(`ERRORE: ${error.message}`);
  } finally {
    loadPresetButton.disabled = false;
  }
}

function run() {
  const input = document.getElementById("inputText").value;
  const dictionary = splitLines(dictionaryTextarea.value);
  const maxWords = Number(document.getElementById("maxWords").value);
  const limit = Number(document.getElementById("limit").value);

  if (!dictionaryTextarea.value.trim()) {
    resultCount.textContent = "0 risultati";
    resultsBox.className = "muted";
    resultsBox.innerHTML = "Prima carica almeno un dizionario.";
    return;
  }

  generateButton.disabled = true;
  setWorkerStatus("Ricerca in corso nel worker...");

  worker.onmessage = (event) => {
    generateButton.disabled = false;

    if (!event.data.ok) {
      setWorkerStatus(`Errore worker: ${event.data.error}`, true);
      return;
    }

    setWorkerStatus("Ricerca completata.");
    setResults(event.data.results);
  };

  worker.onerror = (event) => {
    generateButton.disabled = false;
    setWorkerStatus(`Errore worker: ${event.message}`, true);
  };

  worker.postMessage({
    input,
    words: dictionary,
    maxWords,
    limit,
  });
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    appMode.textContent = "Solo web";
    return;
  }

  try {
    await navigator.serviceWorker.register("./service-worker.js");
    appMode.textContent = "PWA pronta";
  } catch {
    appMode.textContent = "Web senza cache";
  }
}

importButton.addEventListener("click", importSelectedDictionaries);
loadPresetButton.addEventListener("click", loadPreset);
generateButton.addEventListener("click", run);

setStatus("Pagina pronta. Carica un dizionario incluso o importa i tuoi file.");
setWorkerStatus("Motore pronto. La ricerca usera un Web Worker dedicato.");
log("Script caricato correttamente.");

registerServiceWorker();
