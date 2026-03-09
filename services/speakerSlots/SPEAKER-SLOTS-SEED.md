# Speaker slots – backend seed data (one-time)

Use this to create the **72-Hour X Space** event and its schedule once in the backend. All data is created from the backend; the frontend only views schedule, creates invites, exports CSV, and moves bookings.

---

## 1. Event

Create one event:

| Field | Value |
|-------|--------|
| `name` | 72-Hour X Space |
| `slug` | 72hr-x-space |

---

## 2. Days (3)

Create three days for the event. Each day needs an id (or let backend generate), and must be linked to the event.

| id    | name   | theme           | date       |
|-------|--------|------------------|------------|
| day1  | Day 1  | People Focus     | 2025-04-10 |
| day2  | Day 2  | People Power     | 2025-04-11 |
| day3  | Day 3  | People Protest   | 2025-04-12 |

---

## 3. Slots (7)

Create slots for the event. Each slot references a day by `dayId`. Times are in WAT (Africa/Lagos).

| dayId | startTime | endTime | theme           | capacity | sessionType |
|-------|-----------|---------|-----------------|----------|-------------|
| day1  | 09:00     | 10:00   | People Focus    | 1        | keynote     |
| day1  | 11:00     | 12:00   | People Focus    | 3        | panel       |
| day1  | 14:00     | 15:00   | People Focus    | 1        | keynote     |
| day2  | 09:00     | 10:00   | People Power    | 1        | keynote     |
| day2  | 12:00     | 13:00   | People Power    | 2        | panel       |
| day3  | 10:00     | 11:00   | People Protest  | 1        | keynote     |
| day3  | 15:00     | 16:00   | People Protest  | 3        | panel       |

- **timezone:** `Africa/Lagos` for all.
- **sessionType:** `keynote` (1 speaker) or `panel` (multiple speakers).

---

## JSON payload (reference)

See `speaker-slots-seed-data.json` in this folder for the same data as a single JSON object. Backend can:

1. Create event from `event`.
2. Create days from `days` (assign to event; use `id` or generate).
3. Create slots from `slots` (use day ids that match `dayId` in slots).

---

## Frontend expectations

- **GET /api/admin/speaker-slots/events** – returns array of events (e.g. `[{ id, name, slug }]`).
- **GET /api/admin/speaker-slots/events/:eventId/schedule** – returns `{ days, schedule }` (or `slots`) where each slot has `dayId`, `start`/`startTime`, `end`/`endTime`, `theme`, `capacity`, `sessionType`, `bookedCount`, `bookings[]`.
- Days in schedule: `{ id, name, theme, date }`.
