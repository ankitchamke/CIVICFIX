# 🏛️ CivicFix — Public Grievance Reporting & Civic Issue Map
> **Nagpur, Maharashtra, India · Municipal Civic-Tech Platform**

CivicFix is a modern, community-driven civic grievance reporting and resolution tracking platform designed for transparent municipal collaboration. Citizens can report infrastructure issues (potholes, damaged streetlights, overflowing waste bins, stormwater drain clogs, water leakage), inspect spatial grievance concentrations on an interactive Nagpur issue map, upvote existing reports to prevent duplicate work orders, and track municipal work crew progress in real time.

---

## 🚀 Key Highlights & Features

### 1. 🗺️ Interactive Nagpur Civic Issue Map
- **Zero-Dependency Vector GIS Engine:** Custom responsive SVG schematic map covering key Nagpur corridors (*Sitabuldi, Dharampeth, Civil Lines, Sadar, Wardha Road, Medical Square, Futala Lake, and Ambazari Lake*).
- **Live Status & Category Filtering:** Interactive pins with real-time category colors and status rings (*Open*, *In Progress*, *Resolved*).
- **Side Inspector Drawer:** Click any marker to view photo proof, citizen endorsements, municipal work logs, and audit trails.

### 2. 📝 Issue Reporting Flow
- **Validated Grievance Form:** Fields for title, category, detailed description, Nagpur location, and photo evidence.
- **Nagpur Suggested Quick Chips:** 1-click selection of prominent Nagpur landmarks (*Sitabuldi Interchange, WHC Road Gokulpeth, Futala Promenade, Residency Road Sadar, Medical Square GMC, Chhatrapati Square Flyover*).
- **Client-Side Image Optimization:** Auto-compresses uploaded images via HTML5 Canvas to keep local storage lightweight (< 40KB) and prevent quota errors.

### 3. 🔍 Local Similarity & Duplicate Pre-Check
- **Transparent Heuristic Check:** Analyzes category and title/location keyword overlap before ticket creation.
- **Consolidated Upvoting:** Citizens can upvote an existing neighbor's report rather than filing duplicate tickets, boosting municipal priority on the work queue.

### 4. 📊 Single-Source-of-Truth Dashboard
- **Reactive Telemetry Cards:** Dynamic tallies for *Total Grievances*, *Open Issues*, *In Progress*, and *Resolved Cases* derived from the persistent dataset.
- **Audit Trails & Demo Controls:** Allows demonstrating work order status progression (*Open ➔ In Progress ➔ Resolved*) with instant persistence across page refreshes.
- **Session-Deduplicated Upvoting:** Prevents duplicate voting in the same browser session.

---

## 🛠️ Tech Stack

- **Frontend Core:** React 19 (Concurrent Mode, Functional Components)
- **Bundler & Dev Server:** Vite 8 (Lightning-fast HMR and production builds)
- **Styling & Design System:** Tailwind CSS 4 (Custom civic color palette: Deep Navy, Teal, Warm Slate)
- **Icons:** Lucide React
- **Typography:** Plus Jakarta Sans & Inter
- **Mapping:** Vector SVG Schematic Engine (Offline-capable, zero external API keys required)
- **Storage & State:** HTML5 LocalStorage persistence with automated seed & recovery fallbacks
- **Code Health:** Oxlint (0 errors, 0 warnings)

---

## 🏃 Getting Started Locally

### Prerequisites
- Node.js `v18+` or `v20+` (Tested on Node `v24.12.0`)
- npm `v9+` or `v11+`

### Installation
```bash
# Clone the repository
git clone https://github.com/ankitchamke/CIVICFIX.git
cd CIVICFIX

# Install dependencies
npm install

# Start local development server
npm run dev
```

The app will start at `http://localhost:5173/`.

### Available Scripts
- `npm run dev` — Launch Vite local development server with HMR.
- `npm run build` — Compile high-performance production assets to `/dist`.
- `npm run lint` — Run Oxlint code health check across all files.
- `npm run preview` — Locally preview the compiled production build.

---

## 🛡️ Demo Environment & Disclaimer

CivicFix is currently configured as an interactive civic-tech prototype scoped to **Nagpur, Maharashtra, India**. Complaint records, municipal tracking IDs (`CV-2026-XXXX`), and Nagpur Municipal Corporation (NMC) dispatch logs are simulated for demonstration and evaluation purposes.
