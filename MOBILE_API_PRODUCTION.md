# Citizen Monitors Mobile API (Production)

Base URL: `https://citizen-monitors.onrender.com/api/v1/mobile`

## Authentication

- Protected endpoints require:
  - `Authorization: Bearer <JWT>`
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
  "pushToken": "expo-push-token"
}
```

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
  "pushToken": "expo-push-token"
}
```

### `POST /auth/google/continue`
Body:
```json
{
  "idToken": "google-id-token",
  "platform": "ios",
  "deviceId": "ios-device-1",
  "appVersion": "1.0.0",
  "pushToken": "apns-token"
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
- `phoneNumber` (required)
- `bankName`, `bankAccountNumber`, `bankAccountName` (optional)
- `observerId[]` (files, max 2)

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
  "newsletter": true
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

Body:
```json
{
  "electionId": "target-result-or-incident-id",
  "dataType": "election",
  "action": "agree",
  "flagReason": "optional-required-for-flag"
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

---

## 9) Mobile Dashboard API (Protected)

Base: `/dashboard`

### `GET /dashboard`
Returns:
- `liveElections`
- `electionUpdates`
- `collationUpdates`
- `pulseAndDiscourse`
- `latestNewsAndInsights`

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

