# Anagrammatron

Generatore di anagrammi con due facce:

- `index.html`: PWA statica pronta per GitHub Pages
- `anagram-engine.js`: versione Node da terminale

## Struttura

- `js/engine-core.js`: logica condivisa del motore
- `js/anagram-worker.js`: ricerca nel browser senza bloccare la UI
- `js/app.js`: interfaccia e caricamento dizionari
- `service-worker.js`: cache offline della shell applicativa
- `manifest.webmanifest`: metadati installazione PWA

## Avvio locale

```bash
python3 -m http.server 8080
```

Poi apri:

```text
http://localhost:8080/anagrammatron/
```

## Terminale

```bash
cd anagrammatron
node anagram-engine.js "Giovanni Bindi"
```

## Prossimi passi sensati

- ranking risultati per frequenza d'uso
- blacklist opzionale
- preset di dizionari piu grandi
- esportazione/share risultati
- hook futuro verso un layer AI che classifica gli anagrammi
