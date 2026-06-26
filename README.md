# 🌐 Hyperlocal Hub (Civic Solver)

Hyperlocal Hub is a premium, state-of-the-art **Civic Governance and Issue-Tracking Platform** built to empower communities. It enables citizens to report local civic issues (such as potholes, broken pipes, streetlights, or garbage heaps) and work hand-in-hand with municipal officers to resolve them. 

The application is structured as a SEO-optimized **Multi-Page Application (MPA)** with a fallback local cache database sandbox, allowing immediate usage even when a custom Firebase backend is not configured.

---

## ✨ Features

### 👤 Citizen Hub
- **Interactive Issue Reporting**: Report community issues with detailed descriptions, location categories, and optional video file complaints (validated for duration).
- **Vouch & Consensus System**: Vouch for active reports to help verify community priority. Non-admin users can verify resolutions only after achieving community consensus (minimum 3 vouches).
- **Gamification & Leaderboard**: Earn points, level up, and unlock special badges (e.g., *Pothole Patrol*, *Super Verifier*) to recognize active community participation.
- **Multilingual Support**: Real-time modal toggle between **English** and **Hindi** with AI-driven translations.

### 💼 Municipal Officer (Admin) Portal
- **City-Scoped Dashboards**: Automatically extracts and restricts admin scopes using code verification parsing (e.g. entering code `MC-DELHI-2026` locks views to Delhi globally).
- **Official Progress Oversight**: Update issues through lifecycle stages (`Reported` ➔ `Under Review` ➔ `In Progress` ➔ `Resolved`).
- **Official Action Plans & Public Comments**: Municipal officers can append structured action plans and post updates to issue threads.

### 🗺️ Smart Map & Location Services
- **OpenStreetMap & Leaflet**: High-performance interactive map interface mapping localized civic issues.
- **GPS Centering**: Floating `🎯 Locate Me` action to instantly zoom to and track current coordinates.
- **Nominatim API Autocomplete**: Real-time address autocomplete inputs to pinpoint report coordinates dynamically.

### 🔍 SEO & Multi-Page Architecture (MPA)
- **Static MPA Build**: Pre-configured separate indexable build entry-points (`index.html`, `about.html`, `contact.html`, `privacy.html`, `terms.html`).
- **JSON-LD Schema Markup**: Embedded `FAQPage` structured JSON-LD scripts at the bottom of the dashboard layout to enhance Google search rank.
- **Accordion SEO FAQs**: Native `<details>`/`<summary>` dropdown accordion structures optimized for indexability.

---

## 🛠️ Technology Stack
- **Core Framework**: React 19, TypeScript
- **Styling System**: Tailwind CSS v4
- **Build Tool**: Vite v8 (Multi-Page Configuration)
- **Database & Authentication**: Firebase v12 (Firestore & Firebase Auth)
- **Fallback State**: LocalStorage browser sandbox

---

## 🚀 Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/Shree999751/certifi-apk.git
cd certifi-apk
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add your keys (optional, as the app falls back to Local Cache Mode automatically if variables are omitted):
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### 5. Build for Production
Compiles separate HTML page assets under `dist/` with optimized chunk loading:
```bash
npm run build
```

---

## 📴 Automatic Local Fallback Mode
If your Firebase Auth configuration is disabled (e.g. Email/Password provider isn't enabled in the Firebase console), the app detects the `auth/configuration-not-found` exception and **automatically falls back to local cache mode**. It saves `force_local_mode` in `localStorage` and redirects to the browser sandbox to guarantee an uninterrupted demo/run experience.

---

## 📄 License
This project is licensed under the MIT License.
