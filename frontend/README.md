# Deriv DBot Parity Sprint

Visual builder + runtime + OAuth + open-contract monitor + portfolio/history + optional Node worker.

## Quickstart
1. Create a Deriv **App ID** and an **API token** (Read + Trade). Add redirect `http://localhost:3000/oauth`.
2. Copy `.env.local.example` → `.env.local` and set your values.
3. Install & run:
```bash
npm i
npm run dev
```
4. **Login with Deriv**, then visit **/builder** to design a strategy and **Run** (use Virtual account).

## Features (Items 1–6)
1) **Blocks & Builder** (Blockly) with save/load/export/import stubs.  
2) **Compiler & Runtime**: IR, validation via `contracts_for`, reconnection/backoff.  
3) **Portfolio & History** pages (`portfolio`, `profit_table`).  
4) **Backend Worker** (`server/worker.js`) for server-side execution (demo).  
5) **UI/UX**: Nav, inspector area, clean dark theme.  
6) **Compliance & Ops**: `NEXT_PUBLIC_ENFORCE_OAUTH=1` to hide token paste.

## Environment
```
NEXT_PUBLIC_DERIV_APP_ID=1089
NEXT_PUBLIC_DERIV_API_URL=wss://ws.derivws.com/websockets/v3
NEXT_PUBLIC_DERIV_OAUTH_URL=https://oauth.deriv.com/oauth2/authorize
NEXT_PUBLIC_REDIRECT_PATH=/oauth
NEXT_PUBLIC_ENFORCE_OAUTH=0
```

## Notes
- Extend blocks for **Rise/Fall, Higher/Lower, Digits, Lookbacks, Accumulators, Multipliers**, barriers & validation rules.
- The worker is a minimal example; consider a proper queue & persistence for production.
- Always test with **Virtual** accounts. Trading involves risk.
