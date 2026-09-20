# GymBrain — Full UI & Feature Overhaul

A complete upgrade of GymBrain covering structure, UI polish, new pages, and backend features.
All changes preserve existing functionality while adding significant new capabilities.

---

## Proposed Changes

### 1. 📦 New Dependencies

#### [MODIFY] web/package.json
- Add `recharts` for the Stats dashboard bar/line charts (lightweight, React-native)

---

### 2. 🎨 Design System & Global Styles

#### [MODIFY] [index.css](file:///c:/kotlin%20prac/Personal%20Project/web/src/index.css)
- Add CSS page transition animations (`@keyframes slideIn`, `fadeIn`)
- Add shimmer skeleton keyframe
- Add bottom nav safe area padding utility
- Add `.skeleton` shimmer class

---

### 3. 🏗️ Layout & Navigation

#### [NEW] [Layout.jsx](file:///c:/kotlin%20prac/Personal%20Project/web/src/components/Layout.jsx)
- Persistent bottom navbar with 3 tabs: **Home**, **Stats**, **History**
- Active tab highlight with animated indicator
- Pages scroll independently inside layout
- Hidden on wizard flow pages (single, combo, time, equipment, workout, log)

#### [MODIFY] [App.jsx](file:///c:/kotlin%20prac/Personal%20Project/web/src/App.jsx)
- Wrap root routes in `<Layout>`
- Add `/stats` route → `StatsScreen`
- Add `/active` route → `ActiveWorkout`
- Keep wizard pages outside layout (they handle their own nav)

---

### 4. 🏠 Home Page — Restyle

#### [MODIFY] [Home.jsx](file:///c:/kotlin%20prac/Personal%20Project/web/src/pages/Home.jsx)
- Add animated hero section with gradient glow behind logo
- Show a "Quick Stats" strip: this week's workout count + streak
- Enable the **Splits** card (route to `/splits`) instead of disabled
- Remove the bottom history link (now in nav)

#### [NEW] [SplitsSelect.jsx](file:///c:/kotlin%20prac/Personal%20Project/web/src/pages/SplitsSelect.jsx)
- Push / Pull / Legs / Full Body options
- Same flow as MuscleSelect → time → equipment → generate

---

### 5. 📊 Stats Dashboard

#### [NEW] [StatsScreen.jsx](file:///c:/kotlin%20prac/Personal%20Project/web/src/pages/StatsScreen.jsx)
- **Weekly Volume Bar Chart** — sets per muscle this week (from `GET /stats/weekly`)
- **Workout Streak** — from `GET /stats/streak`
- **Top Muscle** this month
- **Total Workouts** this month
- Skeleton loaders while fetching

---

### 6. ⏱️ Active Workout Mode

#### [NEW] [ActiveWorkout.jsx](file:///c:/kotlin%20prac/Personal%20Project/web/src/pages/ActiveWorkout.jsx)
- Shows exercises one-by-one with set completion checkboxes
- **Rest Timer**: countdown (60s default, adjustable) between sets, with audio "ding" on finish
- Progress bar across top showing overall % complete
- "Done" → routes to `/log`

---

### 7. 📋 History Screen — Upgraded

#### [MODIFY] [HistoryScreen.jsx](file:///c:/kotlin%20prac/Personal%20Project/web/src/pages/HistoryScreen.jsx)
- Expand/collapse individual workout cards to show all exercises
- **Delete** button per entry (calls `DELETE /log/:id`)
- **Filter by muscle** dropdown
- Load more button (pagination)
- Skeleton loaders instead of pulsing emoji

---

### 8. 💪 Workout Plan — Upgraded

#### [MODIFY] [WorkoutPlan.jsx](file:///c:/kotlin%20prac/Personal%20Project/web/src/pages/WorkoutPlan.jsx)
- **"Start Workout"** button → routes to `/active` (Active Workout Mode)
- Keep existing "Log this Workout" quick-log path
- Wizard step progress bar at top (Step 4/4)

---

### 9. 🛠️ Backend — New Routes

#### [NEW] [stats.js](file:///c:/kotlin%20prac/Personal%20Project/server/routes/stats.js)
- `GET /stats/weekly?user_id=default` → weekly_volume aggregated by muscle
- `GET /stats/streak?user_id=default` → count consecutive days with workout logs
- `GET /stats/summary?user_id=default` → total workouts this month, top muscle

#### [MODIFY] [log.js](file:///c:/kotlin%20prac/Personal%20Project/server/routes/log.js)
- Add `DELETE /log/:id` route — deletes a workout log entry by ID

#### [MODIFY] [app.js](file:///c:/kotlin%20prac/Personal%20Project/server/app.js)
- Register the new `/stats` route

---

### 10. 🔌 API Service

#### [MODIFY] [api.js](file:///c:/kotlin%20prac/Personal%20Project/web/src/services/api.js)
- Add `fetchStats()`, `fetchStreak()`, `fetchSummary()`
- Add `deleteLog(id)`

---

### 11. 🗄️ Store

#### [MODIFY] [workoutStore.js](file:///c:/kotlin%20prac/Personal%20Project/web/src/store/workoutStore.js)
- Add `activeSetIndex`, `completedSets` state for Active Workout mode
- Add `restTimerRunning`, `restSeconds` state
- Add setters for above

---

## Verification Plan

### Manual Verification
1. Run both servers (`npm run dev` in `/server` and `/web`)
2. Walk through full wizard: Home → muscle/combo/split → time → equipment → generate → active workout → log
3. Visit Stats page — charts populate from DB data
4. Visit History — expand cards, delete an entry, filter by muscle
5. Confirm rest timer counts down and resets between sets

---

## Scope Summary

| Area | Files Changed/Added |
|---|---|
| Backend | +1 route file (`stats.js`), modify `log.js`, `app.js` |
| Frontend pages | +3 new (`StatsScreen`, `ActiveWorkout`, `SplitsSelect`), modify 5 existing |
| Frontend components | +1 new (`Layout` with bottom nav) |
| API + Store | modify `api.js`, `workoutStore.js` |
| Styles | modify `index.css` |
