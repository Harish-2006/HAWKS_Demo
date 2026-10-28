# HAWKS — Predictive Security Intelligence Demo

A standalone React + Vite presentation prototype for **HAWKS (Hierarchical Attack-path Weighted Knowledge System)**.

> **Important:** This is a UI prototype. All dashboard metrics, timelines, node risk scores, attack paths, and explanatory examples are simulated demonstration data. They are not outputs from the currently training model.

## Requirements
- Node.js 18 or newer
- npm

## Run locally
1. Extract the ZIP.
2. Open a terminal in the `HAWKS-Demo` folder.
3. Run:

   ```bash
   npm install
   npm run dev
   ```

4. Open the local URL printed by Vite (usually `http://localhost:5173`).

## Production build check
```bash
npm run build
npm run preview
```

## Demo tour for presentation
1. **Overview** — explain the purpose and the prototype status banner.
2. **Attack Graph** — select nodes and inspect the illustrative connections.
3. **Temporal Analysis** — switch the snapshot selector and describe the simulated progression.
4. **Node Predictions** — change the prediction horizon and inspect risk ranking.
5. **Attack Paths** — select a route and review the possible progression.
6. **MITRE ATT&CK** — explain how a future model output could be mapped to techniques and mitigations.

## Suggested honest explanation
“The frontend is a working research prototype using illustrative data. The predictive model is still in training, so these scores and paths demonstrate the intended user workflow and are not claimed as trained-model results. The next integration stage will connect the model's outputs to these views.”

## Project structure
- `src/main.jsx` — interactive React application and simulated data
- `src/styles.css` — responsive dark navy/blue styling
- `index.html` — app entry document
- `vite.config.js` — Vite configuration
