# CREX Live Score - Cricket Exchange Clone (MERN Stack)

A full-stack cricket live score web application built with the **MERN** stack (MongoDB, Express, React, Node.js) and **Socket.io** real-time WebSockets, replicating the exact interface and features of the **CREX (Cricket Exchange)** platform.

---

## 🌟 Key Features

1. **Exact CREX UI & Experience**:
   - Modern dark navy CREX theme (`#0a0e1a` & `#121829`) with vibrant team accents.
   - Top Live Matches horizontal carousel / ticker with live scores and over rates.
   - Categorized navigation: **All Matches**, **🔴 Live Matches**, **Upcoming**, and **Completed**.
   - Live pulsating status indicators (`LIVE`, `Toss Done`, `Innings Break`, `Result`).

2. **Custom Wide & No Ball Scoring Rule**:
   - *Requirement implemented*: Wide (`Wd`) and No Ball (`Nb`) balls are logged in the over history and commentary, but **0 extra penalty runs** are awarded by default!
   - Only runs physically scored off the bat or ran by the batsmen are added to the team total score.
   - Configurable per match in the Admin match creation panel.

3. **1-Minute Live Transition After Toss**:
   - When the Toss is conducted by the Admin, a live 60-second radial countdown timer appears on the match screen: *"Match starting in 00:XX"*.
   - Once the timer expires, the match automatically activates to **LIVE** status!

4. **Live Ball-by-Ball Match Center**:
   - **Recent Overs Strip**: Horizontal scrollable delivery badges with authentic CREX colors:
     - `•` Dot ball (slate)
     - `1, 2, 3` Regular runs (slate)
     - `4` Boundaries (vibrant blue)
     - `6` Maximums (emerald green / gold)
     - `W` Wicket (bold red)
     - `Wd` Wide ball (amber)
     - `Nb` No ball (magenta/purple)
   - **Batters at Crease**: Active striker indicated with `*` and batsman stats (Runs, Balls faced, 4s, 6s, Strike Rate, and highlighted "not out" badge).
   - **Current Bowler**: Overs, Maidens, Runs conceded, Wickets, Economy rate, Wides, and No-Balls.
   - **Partnership tracker**: Real-time runs and balls between active batsmen.
   - **CRR & RRR**: Current Run Rate and Required Run Rate calculated dynamically.
   - **Delivery Animation Banner**: Flashy pop-in animations with confetti for `FOUR`, `SIX`, `WICKET`, `NO BALL`, and `WIDE`.

5. **Full Tabs**:
   - **Live**: Active batters, current bowler, partnership, and recent commentary highlights.
   - **Scorecard**: Full 1st and 2nd innings scorecards with dismissal types (`c Rohit b Bumrah`, `b Shami`, `lbw b Rashid`, `run out`), fall of wickets timeline, and did-not-bat lists.
   - **Overs**: Over-by-over breakdown showing all deliveries and bowler details.
   - **Commentary**: Reverse-chronological ball-by-ball commentary feed.
   - **Match Info**: Playing XI of both teams with Captain `(C)` and Wicketkeeper `(WK)` indicators, venue, and rules.

6. **Comprehensive Admin Panel**:
   - Password-protected with JWT authentication.
   - **Create Match**: Team names, colors, format (T20, ODI, 10-overs, custom), overs, venue, and manual player squad entry with presets (IND vs AUS, etc.).
   - **Conduct Toss**: Choose toss winner and decision (bat/bowl), triggering the 1-minute countdown.
   - **Live Scoring Console**:
     - Striker, Non-Striker, and Bowler selectors.
     - Swap Strike Ends button.
     - 0, 1, 2, 3, 4, 6 ball buttons.
     - Extras with custom 0-penalty rule: Wide (+ ran runs), No Ball (+ bat runs), Leg Bye, Bye.
     - Wicket dismissal dialog: Select dismissal type, fielder, and incoming batsman.
     - Start 2nd Innings and End Match controls.

7. **Completed Matches Archive**:
   - All past matches remain accessible in the **Completed** tab with full historical scorecards and stats.

---

## ⚙️ Environment Variables

Copy `backend/.env.example` to `backend/.env` for local use. On a host, set these in the dashboard instead (never commit `.env`).

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB Atlas URL (recommended in production; without it data goes to `backend/data/matches.json`, which most hosts wipe on redeploy) |
| `JWT_SECRET` | Long random string (required in production) |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Admin login. `ADMIN_PASSWORD_HASH` (bcrypt) can be used instead |
| `CLIENT_URL` | Only if the frontend is hosted separately (comma separated). Empty = allow all |
| `PORT` | Set automatically by most hosts |

Frontend (only for a **separate** frontend host, read at build time): `VITE_API_URL`, `VITE_SOCKET_URL` - see `frontend/.env.example`.

---

## ☁️ Deployment

### Option A - one service (easiest, recommended): Render / Railway / any Node host
The backend automatically serves the built frontend, so no CORS or URL settings are needed.

- Build command: `npm run build`
- Start command: `npm start`
- Env vars: `NODE_ENV=production`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `MONGO_URI`
- Health check path: `/api/health`
- (`render.yaml` is included for one-click Render setup)

### Option B - split hosting
- Backend (Render/Railway/Fly/VPS): root `backend`, build `npm install`, start `npm start`.
- Frontend (Netlify/Vercel): root `frontend`, build `npm run build`, output `dist`,
  env `VITE_API_URL=https://YOUR-BACKEND/api` and `VITE_SOCKET_URL=https://YOUR-BACKEND`.
  SPA redirects are included (`public/_redirects` for Netlify, `vercel.json` for Vercel).
- Set `CLIENT_URL` on the backend to the frontend URL.

Note: Vercel/Netlify serverless functions cannot run the backend (WebSockets need a long-running server).

---

## 🚀 How to Run the Application

### 1. Start the Backend
Open a terminal in `backend/`:
```bash
cd backend
npm install
npm run dev
# Server will run on http://localhost:5000 with WebSockets active
```

### 2. Start the Frontend
Open a second terminal in `frontend/`:
```bash
cd frontend
npm install
npm run dev
# Frontend will be live on http://localhost:5173
```

---

## 🔑 Admin Access
- Navigate to: **`http://localhost:5173/admin/login`**
- **Username**: `admin`
- **Password**: `admin123`
*(Both can be customized in `backend/.env`)*
