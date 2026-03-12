# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Firebase setup

- Create a Firebase project at https://console.firebase.google.com and enable **Authentication → Email/Password**, **Realtime Database** and **Cloud Messaging**.
- Copy and fill `.env.example` into `.env.local` at the project root (do NOT commit `.env.local`). Add FCM keys such as `VITE_VAPID_KEY` and your messaging sender id.
- Install the SDK in the frontend: `cd frontend/my-react-app && npm install` (dependencies include `firebase`, `chart.js`, `react-chartjs-2`, `jspdf`).
- The service worker `public/firebase-messaging-sw.js` is provided – replace the placeholder config with your project values.
- Run dev server: `npm run dev`.

## New features added by the Copilot assistant

This workspace now includes:

- **Smart dashboards** – user and admin charts using Chart.js (`HealthTrendsChart`, `HealthScore`, etc).
- **AI-based risk alerts** – logs are evaluated for fever, hypertension, and high sugar; warnings are shown and stored.
- **Emergency alert button** – users can send emergency notifications to admins; admins see counts.
- **Vaccination drive scheduler** – admins post drives, users receive reminders and notifications.
- **Push notifications** via Firebase Cloud Messaging; tokens are requested in `main.jsx` and handled in `NotificationBell`.
- **Health report generator** – users can download PDF reports (`report.js`).
- **Symptom checker** – a simple interactive tool suggests possible conditions.
- **Enhanced admin analytics** – real-time user counts, active users, risk heatmap, symptom frequency, emergencies.
- **Automatic notifications** when announcements or vaccine drives are posted.

Follow the UI links in the sidebar once you are logged in to explore these features.
