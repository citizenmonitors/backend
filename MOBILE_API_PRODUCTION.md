# Citizen Monitors Mobile API (Production)

Base URL: `https://citizen-monitors.onrender.com/api/v1/mobile`

## Authentication

- Protected endpoints require:
  - `Authorization: Bearer <JWT>`
  - `X-Inhouse-Access-Token: <INHOUSE_API_ACCESS_TOKEN>` (required when in-house gate is enabled on server)
- Content type:
  - `application/json` for most endpoints
  - `multipart/form-data` for file upload endpoints

---

## 1) Mobile Auth API

Base: `/auth`

### `POST /auth/register`
Register user and send verification code.

Body:
```json
{
  "email": "user@example.com",
  "password": "Password@123",
  "confirmPassword": "Password@123",
  "platform": "android",
  "deviceId": "device-123",
  "appVersion": "1.0.0",
  "pushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

**Expo push token (device):** obtain in the app with `expo-notifications`, then send the string on **register**, **signin**, and **google/continue** (re-send when the token changes). Stored as `mobileMeta.pushToken`. Format must start with `ExponentPushToken[` or `ExpoPushToken[`.

### `POST /auth/verify-email`
Body:
```json
{
  "email": "user@example.com",
  "verificationCode": "123456"
}
```

### `POST /auth/resend-token`
Body:
```json
{
  "email": "user@example.com"
}
```

### `POST /auth/signin`
Body:
```json
{
  "email": "user@example.com",
  "password": "Password@123",
  "platform": "android",
  "deviceId": "device-123",
  "appVersion": "1.0.0",
  "pushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

### `POST /auth/google/continue`
Use for first-time Google sign-up **and** returning users who signed up with Google. ID tokens are verified with `google-auth-library` (signature + audience).

Returning Google users who have not set a password yet must use this endpoint again (not email/password sign-in). After they call `POST /auth/set-password`, they may sign in with email and password.

Body:
```json
{
  "idToken": "google-id-token",
  "platform": "ios",
  "deviceId": "ios-device-1",
  "appVersion": "1.0.0",
  "pushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

### `POST /auth/set-password` (Protected)
Body:
```json
{
  "password": "NewPassword@123",
  "confirmPassword": "NewPassword@123"
}
```

### `POST /auth/validate` (Protected)
Validate token/session.

### `POST /auth/forgot-password`
Body:
```json
{
  "email": "user@example.com"
}
```

### `POST /auth/resend-forgot-password-otp`
Body:
```json
{
  "email": "user@example.com"
}
```

### `POST /auth/reset-password`
Body:
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "password": "NewPassword@123"
}
```

### `POST /auth/select-role`
Roles: `observer`, `volunteer`, `public-viewer`

Body:
```json
{
  "email": "user@example.com",
  "role": "public-viewer"
}
```

### `POST /auth/submit-details` (`multipart/form-data`)
Fields:
- `email` (required)
- `profileImage` (optional file)
- profile fields (optional): `firstName`, `lastName`, `gender`, `dateOfBirth`, `state`, `lga`, `ward`, `pollingUnit`, `nationality`, `whyYouJoinUs`, etc.

### `POST /auth/observer-role` (`multipart/form-data`)
Fields:
- `email` (required)
- `observerId[]` (PVC files, optional, max 2)

---

## Realtime Notifications (WebSocket)

Use Socket.IO to receive notifications instantly while the app is open.

- Socket base URL: `https://citizen-monitors.onrender.com`
- Transport: Socket.IO client
- Auth token options (one is enough):
  - `auth.token = "<JWT>"`
  - `Authorization: Bearer <JWT>` header
  - `?token=<JWT>` query

### Connection Event

Server emits on successful connection:

```json
{
  "event": "realtime:connected",
  "data": {
    "userId": "664f2d...",
    "connectedAt": "2026-05-05T13:33:01.896Z"
  }
}
```

### New Notification Event

Server emits when a new notification targets the connected user:

```json
{
  "event": "notification:new",
  "data": {
    "id": "6650a1...",
    "type": "result-aggregated",
    "preferenceKey": "resultAggregated",
    "body": "New collation update in your polling area.",
    "info": "Polling Unit 004",
    "createdAt": "2026-05-05T13:40:00.000Z"
  }
}
```

Notes:
- Persisted notifications are still available from `GET /notifications`.
- When the app is backgrounded or closed, the server sends push to `mobileMeta.pushToken` (if registered at login):
  - **Expo** tokens (`ExponentPushToken[...]`) → Expo Push API
  - **FCM** native tokens → Firebase Cloud Messaging (same Firebase project as storage)
- Set `EXPO_ACCESS_TOKEN` on the server for authenticated Expo delivery (see `.env.example`).
- Invalid/expired tokens are cleared from the user record automatically.
- Enabled in production by default; set `PUSH_NOTIFICATIONS_ENABLED=true` in dev to test.
- Push payload `data` includes `notificationId`, `type`, `preferenceKey`, and `info` for deep linking.
- Admin **newsletter** and **podcast** sends also create mobile inbox items (`type: newsletter`) for users with `notifications.mobile.newsletter` enabled.

### Backend: `EXPO_ACCESS_TOKEN` (server only)

1. Log in at [expo.dev](https://expo.dev) → **Account settings** → **Access tokens** → **Create**.
2. Copy the token into Render env: `EXPO_ACCESS_TOKEN=...` (never put this in the mobile app).
3. Redeploy the API. Optional in dev; recommended in production.

### Mobile app: register device token (example)

```ts
import * as Notifications from "expo-notifications";

const { status } = await Notifications.requestPermissionsAsync();
if (status !== "granted") return;

const expoPushToken = (await Notifications.getExpoPushTokenAsync()).data;
// e.g. ExponentPushToken[abc...]

await api.post("/auth/signin", {
  email,
  password,
  platform: Platform.OS === "ios" ? "ios" : "android",
  pushToken: expoPushToken,
});
```

Re-call signin (or register) when Expo issues a new token so the backend stays in sync.

---

## 2) Mobile Location API

Base: `/locations`

### `GET /locations/states`
### `GET /locations/states/:state/local_governments`
### `GET /locations/states/:state/local_governments/:lga/wards`
### `GET /locations/states/:state/local_governments/:lga/wards/:ward/polling_units`

---

## 3) Mobile Bank API

Base: `/banks`

### `GET /banks`
Returns supported banks list.

---

## 4) Mobile Profile API (Protected)

Base: `/profile`

### `GET /profile/me`
Get logged-in user profile.

### `PUT /profile/me` (`multipart/form-data`)
Update profile and optional image.

Common fields:
- `firstName`, `lastName`, `phoneNumber`, `gender`, `dateOfBirth`
- `state`, `lga`, `ward`, `pollingUnit`
- `isRegisteredVoter`, `isPoliticalPartyMember`, `isElectionWitnessReady`, `isOpenToSurvey`
- `nationality`, `whyYouJoinUs`
- `profileImage` (optional file)

### `PUT /profile/me/password`
Body:
```json
{
  "currentPassword": "OldPassword@123",
  "newPassword": "NewPassword@123",
  "confirmPassword": "NewPassword@123"
}
```

### `PUT /profile/upgrade/volunteer-to-observer`
Promote volunteer to observer flow.

### `PUT /profile/observer-data` (`multipart/form-data`)
Add or update observer info for users who skipped or need updates.

Fields:
- `phoneNumber`, `bankName`, `bankAccountNumber`, `bankAccountName`
- `replaceObserverIds` (boolean-like)
- `observerId[]` files

### `PUT /profile/upgrade/public-viewer-to-volunteer`
Promote `public-viewer` to `volunteer`.

### `POST /profile/me/anonymous-username/generate`
Generate anonymous username.

### `PUT /profile/me/anonymous-identity`
Body:
```json
{
  "enabled": true
}
```

### `GET /profile/election-vault`
Return user's submitted results/incidents.

### `POST /profile/polling-unit/lookup`
Body:
```json
{
  "state": "Lagos",
  "lga": "Alimosho",
  "ward": "Ward 4",
  "pollingUnit": "Optional exact unit name"
}
```

### `GET /profile/notifications`
Get mobile notification preference settings.

### `PUT /profile/notifications`
Body (all optional booleans):
```json
{
  "pollingUnitActivity": true,
  "electionDayAlert": true,
  "discussionReplies": false,
  "resultAggregated": true,
  "reportConfirmed": true,
  "reportFlagged": true,
  "securityAlerts": true,
  "newsletter": true,
  "newsAndInsights": true,
  "pressCoverage": true
}
```

### `POST /profile/feedback`
Body:
```json
{
  "title": "App feedback",
  "message": "Great app, but please improve loading speed."
}
```

---

## 5) Mobile Elections API (Protected)

Base: `/elections`

### `GET /elections/active?status=all|live|upcoming|concluded`
Returns relevant active elections.

### `GET /elections/live-carousel`
Returns live elections for carousel display.

### `GET /elections/:activeElectionId/my-submission`
Returns current user's submission (result or incident) for this active election.

### Result CRUD
- `POST /elections/:activeElectionId/results` (`multipart/form-data`)
- `PUT /elections/:activeElectionId/results` (`multipart/form-data`)
- `DELETE /elections/:activeElectionId/results`

Upload fields:
- `resultPicture` (file, optional)
- `resultVideo` (file, optional)
- body fields used by result schema, including `uploadLocation` (JSON/stringified JSON depending client)

### Incident CRUD
- `POST /elections/:activeElectionId/report` (`multipart/form-data`)
- `PUT /elections/:activeElectionId/report` (`multipart/form-data`)
- `DELETE /elections/:activeElectionId/report`

Upload fields:
- `incidentPictures[]` (files)
- `incidentVideos[]` (files)
- `selectIncident` (required)
- `incidentNote` (required)
- `uploadLocation`

---

## 6) Collation + Election Live API (Protected)

Base: `/elections/:activeElectionId`

### `GET /elections/:activeElectionId/collation`
Get collation bundle for active election.

### `POST /elections/:activeElectionId/collation/user-action`
Actions: `agree`, `flag`, `unagree`

Send as `multipart/form-data` when attaching optional flag evidence; `application/json` is still OK when you are not uploading files.

Body fields:
- `electionId` (required): target `ElectionData` or `IncidentReport` document id
- `dataType` (required): `election` | `incident`
- `action` (required): `agree` | `flag` | `unagree`
- `flagReason` (**required** when `action` is `flag`): short explanation
- `flagImage` (optional file): extra evidence
- `flagVideo` (optional file): extra evidence

When `action` is `flag`, you must always send **`flagReason`**. Image and video are optional extras.

Example (JSON-only, no media):
```json
{
  "electionId": "target-result-or-incident-id",
  "dataType": "election",
  "action": "flag",
  "flagReason": "Numbers do not match the polling unit summary."
}
```

### Report-thread comments
- `GET /elections/:activeElectionId/report-thread/:targetType/:targetId/comments`
- `POST /elections/:activeElectionId/report-thread/:targetType/:targetId/comments`
- `POST /elections/:activeElectionId/report-thread/comments/:commentId/like`

`targetType` values:
- `election-result`
- `incident-report`

Comment body:
```json
{
  "body": "Observed same update.",
  "useAnonymousDisplay": false
}
```

### Election discussion posts
- `GET /elections/:activeElectionId/discussion/posts?page=1&limit=20`
- `POST /elections/:activeElectionId/discussion/posts` (`multipart/form-data`)
- `POST /elections/:activeElectionId/discussion/posts/:postId/like`
- `GET /elections/:activeElectionId/discussion/posts/:postId/comments`
- `POST /elections/:activeElectionId/discussion/posts/:postId/comments`
- `POST /elections/:activeElectionId/discussion/posts/:postId/comments/:commentId/like`

Create discussion post fields:
- `body` (required)
- `visibilityScope`: `ward` | `lga`
- `allowSocialShare`: boolean-like
- `useAnonymousDisplay`: boolean-like
- `images[]` (optional files)
- `videos[]` (optional files)

---

## 7) Pulse API (Standalone, Protected)

Base: `/pulse`

### `GET /pulse/posts?page=1&limit=20`
Location-scoped pulse feed.

### `POST /pulse/posts` (`multipart/form-data`)
Create standalone pulse post (not tied to active election).

Fields:
- `body` (required)
- `visibilityScope`: `ward` | `lga` (default `lga`)
- `useAnonymousDisplay`: boolean-like
- `image` (optional file)

### `POST /pulse/posts/:postId/like`
Toggle like/unlike.

### `GET /pulse/posts/:postId/comments`
Get comments.

### `POST /pulse/posts/:postId/comments`
Body:
```json
{
  "body": "This is helpful.",
  "useAnonymousDisplay": false
}
```

### `POST /pulse/posts/:postId/comments/:commentId/like`
Toggle like/unlike for comment.

### Citizen Academy (educational articles)

Base (mobile): `/academy` → full paths `GET /api/v1/mobile/academy` and `GET /api/v1/mobile/academy/:slug`. **No Bearer token required.** If the server has `INHOUSE_API_ACCESS_TOKEN` set, clients must still send matching `X-Inhouse-Access-Token` on `/api/*` routes (same as other public API paths).

- **`GET /academy`** — `{ title, subtitle, articles[] }` where each article has `slug`, `title`, `category`, `readMinutes`, `summary`.
- **`GET /academy/:slug`** — full article: `slug`, `title`, `category`, `readMinutes`, `summary`, `sections[]` (`heading`, `paragraphs[]`). `400` if slug format is invalid; `404` if unknown slug.

Known slugs: `pvc-registration-guide`, `know-voters-right`, `incident-reporting`, `electoral-act-2022`, `voters-handbook-2027`.

### News & Insight (articles)

Base (mobile): `/news-insights`. **Optional Bearer** on `GET /` and `GET /:slug`: when a valid token is sent, responses include `isLikedByCurrentUser` for the current user. Other engagement routes **require** Bearer. In-house header rule matches Academy when configured.

- **`GET /news-insights`** — `{ title, subtitle, total, page, limit, items[] }`. Each item: `id`, `slug`, `title`, `thumbnailURLUrl`, `summary`, `publishedAt`, `likesCount`, `commentsCount`, `isLikedByCurrentUser` (false if anonymous).
- **`GET /news-insights/:slug`** — article detail plus `likesCount`, `commentsCount`, `isLikedByCurrentUser`.

**Engagement (Bearer required):** use article **`id`** from list/detail (MongoDB ObjectId).

- **`POST /news-insights/articles/:articleId/like`** — toggle like on the article. Response: `{ id, likesCount, isLikedByCurrentUser }`.
- **`GET /news-insights/articles/:articleId/comments`** — `{ comments[] }` (newest first). Each comment: `id`, `body`, `createdAt`, `updatedAt`, `author`, `likesCount`, `isLikedByCurrentUser`.
- **`POST /news-insights/articles/:articleId/comments`** — body: `{ "body": "...", "useAnonymousDisplay": false }` (anonymous requires an anonymous username on profile, same as Pulse).
- **`POST /news-insights/articles/:articleId/comments/:commentId/like`** — toggle like on a comment. Response: `{ comment }` shape (serialized comment object).

**Admin (Bearer + admin role):**

- `POST /api/admin/news-insights` — create article. **multipart/form-data:** text fields `title`, `content` (HTML), optional `excerpt`, `slug`, `publishedAt`, `isPublished`, `notifySubscribers`; **File** fields `thumbnailURL` (required image), `heroImageURL` (optional image). Files upload to Firebase; responses include `thumbnailURLUrl` / `heroImageURLUrl` as stored URLs. **Alias:** `POST /api/v1/mobile/news-insights` (same). On publish + `notifySubscribers`, users with `newsAndInsights: true` get a push (`type: news-insight`).
- `GET /api/admin/news-insights?page=1&limit=30` — list all articles (including unpublished).
- `GET /api/admin/news-insights/:id` — single article by MongoDB id.

**User toggle:** `PUT /profile/notifications` with `newsAndInsights` (boolean) controls whether the user receives these pushes (default `true` for new accounts).

### Press Coverage (articles)

Base (mobile): `/press-coverage`. Same patterns as News & Insight: optional Bearer on list/detail for `isLikedByCurrentUser`; engagement routes require Bearer.

- **`GET /press-coverage`** — `{ title, subtitle, total, page, limit, items[] }`. Items include `dateline` (optional), plus `likesCount`, `commentsCount`, `isLikedByCurrentUser`.
- **`GET /press-coverage/:slug`** — detail includes `dateline`, HTML `content`, hero image, counts, `isLikedByCurrentUser`.

**Engagement:** `POST/GET /press-coverage/articles/:articleId/like|comments` and comment like — same shapes as News & Insight.

**Admin:**

- `POST /api/admin/press-coverage` — create. **multipart/form-data:** text fields `title`, `content`, optional `excerpt`, `dateline`, `slug`, `publishedAt`, `isPublished`, `notifySubscribers`; **File** fields `thumbnailURL` (required image), `heroImageURL` (optional image). **Alias:** `POST /api/v1/mobile/press-coverage`. Pushes use `type: press-coverage` / preference `pressCoverage`.
- `GET /api/admin/press-coverage?page=1&limit=30`
- `GET /api/admin/press-coverage/:id`

**User toggle:** `PUT /profile/notifications` with `pressCoverage` (boolean) for these notifications (default `true`).

---

## 8) Mobile Notifications API (Protected)

Base: `/notifications`

### `GET /notifications?page=1&limit=20`
List notifications + unread count.

### `GET /notifications/:notificationId`
Get notification detail and mark as read.

### `POST /notifications/:notificationId/read`
Mark one notification as read.

### `POST /notifications/read-all`
Mark all visible notifications as read.

### `DELETE /notifications/:notificationId`
Remove a notification from the current user's inbox (soft delete). Also marks it read.

### `POST /notifications/test` (dev / staging only)
Sends a test notification to the **logged-in user** (inbox + Socket.IO + push if enabled).

Disabled in production unless `ALLOW_NOTIFICATION_TEST=true` on the server.

Body (optional):
```json
{
  "body": "Test title",
  "info": "Test subtitle"
}
```

Example:
```bash
curl -X POST "http://localhost:4000/api/v1/mobile/notifications/test" \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "X-Inhouse-Access-Token: YOUR_INHOUSE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"body":"Hello","info":"Push + inbox test"}'
```

**Observer approval (`pending-approval` type):**
- User submits observer PVC → admins receive inbox + push (`respectPreferences: false`).
- Admin approves → user receives approval inbox + push; volunteers in same PU may get role-update notice.
- Admin unapproves pending observer → user receives rejection inbox + push.

---

## 9) Mobile Dashboard API (Protected)

Base: `/dashboard`

### `GET /dashboard`
Returns:
- `liveElections`
- `electionUpdates`
- `collationUpdates`
- `pulseAndDiscourse`
- `latestNewsAndInsights` — published news cards: `id`, `slug`, `title`, `thumbnailURLUrl`, `summary`, `publishedAt`, `likesCount`, `commentsCount`, `isLikedByCurrentUser` (from **News & Insight**; see `GET /news-insights`).
- `pressCoverage` — same card shape for **Press Coverage**, plus optional `dateline` (see `GET /press-coverage`).

---

## Error Conventions (Common)

- `400` validation errors / bad IDs / malformed payload
- `401` missing or invalid token
- `403` location or role restriction
- `404` resource not found
- `500` server errors

Typical error payload:
```json
{
  "message": "Error description"
}
```

---

## Postman Setup Quick Guide

1. Create environment variable:
   - `baseUrl = https://citizen-monitors.onrender.com/api/v1/mobile`
   - `token = <jwt>`
2. For protected routes add header:
   - `Authorization: Bearer {{token}}`
3. Use `form-data` for upload endpoints and keep booleans as `true`/`false`.

