# Security Audit Report — Citizen Monitors Backend

**Scope:** Node.js/Express backend  
**Reference:** OWASP Top 10  
**Date:** 2025-02-25

---

## Executive summary

The audit identified **14 issues** across authentication, configuration, injection risk, logging, and production hardening. Critical items: **sensitive file in repo**, **permissive CORS**, **no rate limiting**, **JWT algorithm not fixed**, **error message leakage**, and **mass assignment in role form**. Each finding below includes risk, location, and fix.

---

## 1. Sensitive file committed / not in .gitignore (A02:2021 – Cryptographic Failures)

**Risk:** `config/firebaseServiceAccountKey.json` contains Firebase private keys. If committed or deployed, attackers can impersonate your app, read/write storage, and abuse Firebase. **Critical.**

**Location:** Repo root; `.gitignore` does not list this file or `*.json` keys.

**Fix:** Ignore the key file and load from environment in production.

**.gitignore (add):**
```gitignore
# Firebase / GCP keys - never commit
config/firebaseServiceAccountKey.json
*-service-account*.json
*.pem
```

**Improved config:** Prefer loading Firebase credentials from env in production (see Issue 8).

---

## 2. CORS allows all origins (A05:2021 – Security Misconfiguration)

**Risk:** `app.use(cors())` allows any origin. Any website can call your API with a user’s cookies/tokens (CSRF-style abuse) and exfiltrate data. **High.**

**File:** `server.js` line 22

**Current:**
```javascript
app.use(cors());
```

**Improved:**
```javascript
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",").map((o) => o.trim());
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
```

Use `ALLOWED_ORIGINS` in `.env` (e.g. from `.env.example`).

---

## 3. No security headers (A05:2021 – Security Misconfiguration)

**Risk:** Missing headers (e.g. X-Content-Type-Options, X-Frame-Options) increase risk of clickjacking, MIME sniffing, and XSS. **Medium.**

**File:** `server.js`

**Fix:** Use `helmet` and add it early.

```bash
npm install helmet
```

**Improved (after other middleware, before routes):**
```javascript
import helmet from "helmet";
// ...
app.use(helmet({ contentSecurityPolicy: false })); // disable CSP if you serve no HTML; enable if you do
```

---

## 4. No rate limiting (A04:2021 – Insecure Design / A07:2021 – Identification and Authentication Failures)

**Risk:** Auth and API endpoints can be brute-forced (passwords, tokens) and abused for DoS. **High.**

**File:** `server.js`

**Fix:** Add rate limiting (e.g. `express-rate-limit`).

```bash
npm install express-rate-limit
```

**Improved:**
```javascript
import rateLimit from "express-rate-limit";

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: "Too many requests" },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many auth attempts" },
});

app.use("/api/", generalLimiter);
app.use("/api/auth", authLimiter);
```

---

## 5. Global error handler leaks internal messages (A04:2021 – Insecure Design)

**Risk:** `res.status(500).json({ message: err.message })` sends stack traces or DB/implementation details to clients, aiding attackers. **Medium.**

**File:** `server.js` lines 40–42

**Current:**
```javascript
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});
```

**Improved:**
```javascript
app.use((err, req, res, next) => {
  const isProd = process.env.NODE_ENV === "production";
  console.error(err);
  res.status(err.status || 500).json({
    message: isProd ? "An error occurred" : err.message,
  });
});
```

---

## 6. JWT algorithm not restricted (A02:2021 – Cryptographic Failures)

**Risk:** If `algorithm` is not fixed, an attacker can try `alg: "none"` or a weaker algorithm and forge tokens. **High.**

**Files:**  
- `utils/generateToken.js` (sign)  
- `middleware/authMiddleware.js` (verify)  
- `services/authService.js` – `validateTokenService` (verify)

**Current (generateToken.js):**
```javascript
return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
```

**Improved:**
```javascript
return jwt.sign(payload, process.env.JWT_SECRET, {
  expiresIn: "1d",
  algorithm: "HS256",
});
```

**Current (authMiddleware.js verify):**
```javascript
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

**Improved:**
```javascript
const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
```

Apply the same `algorithms: ["HS256"]` in `validateTokenService` where `jwt.verify` is used.

---

## 7. Missing JWT_SECRET check at startup

**Risk:** If `JWT_SECRET` is missing or weak, all JWTs are weak or verification fails at runtime. **Medium.**

**File:** `server.js` or `utils/generateToken.js`

**Improved (e.g. in server.js after dotenv):**
```javascript
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("FATAL: JWT_SECRET must be set and at least 32 characters");
  process.exit(1);
}
```

---

## 8. Firebase credentials from file only (A02:2021 – Cryptographic Failures)

**Risk:** Service account key in a JSON file is easy to leak (repo, images, logs). Prefer env in production. **Medium.**

**File:** `config/firebaseConfig.js` lines 9–11

**Current:**
```javascript
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../config/firebaseServiceAccountKey.json"))
);
```

**Improved:**
```javascript
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
} else {
  const keyPath = path.join(__dirname, "firebaseServiceAccountKey.json");
  if (!fs.existsSync(keyPath)) throw new Error("Firebase credentials not found");
  serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
}
```

Document in `.env.example`: `FIREBASE_SERVICE_ACCOUNT_JSON` = full JSON string (e.g. from CI/secrets).

---

## 9. Auth routes lack input validation (A03:2021 – Injection / A07:2021 – Auth Failures)

**Risk:** Unvalidated `req.body` (email, password, token, verificationCode) enables injection, bypasses, and bad data. **High.**

**Files:** `routes/auth.js`, `controllers/authController.js`, `services/authService.js`

**Fix:** Use `express-validator` on all auth endpoints (register, verify-email, resend-token, select-role, submit-details, signin, forgot-password, reset-password).

**Example for register (add to route or controller):**
```javascript
import { body, validationResult } from "express-validator";

const registerValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }).withMessage("Password at least 8 characters"),
  body("confirmPassword").custom((v, { req }) => v === req.body.password),
];
// In handler: if (!validationResult(req).isEmpty()) return res.status(400).json({ errors: validationResult(req).array() });
```

Apply similar validation for: email only, token, verificationCode, password + confirm, and role (enum).

---

## 10. Mass assignment in submit role form (A01:2021 – Broken Access Control)

**Risk:** `Object.assign(user, details)` with `details` from `req.body` lets clients set fields like `role`, `isVerified`, `hasSubmittedRoleForm`, or other schema fields. **High.**

**File:** `services/authService.js` lines 164–167

**Current:**
```javascript
Object.assign(user, details);
user.isVerified = true;
user.hasSubmittedRoleForm = true;
```

**Improved:** Allowlist only safe fields:
```javascript
const allowedFields = [
  "firstName", "lastName", "gender", "dateOfBirth", "state", "lga", "ward", "pollingUnit",
  "isRegisteredVoter", "isPoliticalPartyMember", "isElectionWitnessReady", "isOpenToSurvey", "profileImage"
];
const safeDetails = {};
for (const key of allowedFields) {
  if (details[key] !== undefined) safeDetails[key] = details[key];
}
Object.assign(user, safeDetails);
user.isVerified = true;
user.hasSubmittedRoleForm = true;
```

---

## 11. Mongoose ObjectId not validated (A03:2021 – Injection / DoS)

**Risk:** Passing invalid or malicious `req.params.id` to `findById(id)` can throw or behave unexpectedly. Validate before use. **Medium.**

**Files:** Controllers that use `req.params.id` or `req.params.electionId` (e.g. `adminElectionController.js`, `supportContoller.js`, `podcastController.js`).

**Fix:** Centralized validator (e.g. `utils/validators.js`):
```javascript
import mongoose from "mongoose";
export const isValidObjectId = (id) => id && mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id);
```

In each controller:
```javascript
if (!isValidObjectId(req.params.id)) {
  return res.status(400).json({ message: "Invalid ID" });
}
```

Use the same pattern for `electionId`, `adminId`, etc.

---

## 12. Debug logging of request body/files (A09:2021 – Security Logging and Monitoring Failures)

**Risk:** `logFields` in `electionRoutes.js` logs `req.body` and `req.files` (and filenames). If ever enabled, it can log passwords, tokens, and PII. **Medium.**

**File:** `routes/Election/electionRoutes.js` lines 40–50

**Current:** Middleware that logs body and files (if used in chain, high risk).

**Improved:** Remove `logFields` entirely, or guard:
```javascript
if (process.env.NODE_ENV !== "production" && process.env.DEBUG_ELECTION === "1") {
  router.use(logFields);
}
```
Prefer removal; use proper structured logging without sensitive fields.

---

## 13. Overly large file upload limit (A04:2021 – Insecure Design)

**Risk:** `fileSize: 100 * 1024 * 1024` (100 MB) in multer configs enables easy DoS via large uploads. **Medium.**

**Files:** `config/multer.js` line 22, `config/electionMulter.js` line 46, `config/incidentMulter.js` line 44

**Improved:** Use a smaller limit (e.g. 10 MB for profile/images, 25 MB for election media) and set per-route if needed:
```javascript
limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
```

---

## 14. Profile multer: extension-only validation (A03:2021 – Injection)

**Risk:** In `config/multer.js` only extension is checked; `file.mimetype` is not. Attacker can upload executable with `.jpg` name. **Medium.**

**File:** `config/multer.js` lines 7–14

**Current:** Only `path.extname(file.originalname)` checked.

**Improved:** Same pattern as `electionMulter.js` – allowlist both extension and mimetype:
```javascript
const allowedTypes = [".png", ".jpg", ".jpeg", ".pdf", ".webp", ".svg"];
const allowedMime = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "application/pdf"];
const ext = path.extname(file.originalname).toLowerCase();
if (allowedTypes.includes(ext) && allowedMime.includes(file.mimetype)) {
  cb(null, true);
} else {
  cb(new Error("Invalid file type"));
}
```

---

## 15. Auth middleware: admin permissions not loaded (A01:2021 – Broken Access Control)

**Risk:** `isAuthorized(action)` checks `req.user.permissions[action]`, but `authMiddleware` loads user with `.lean()` and does not populate `adminPermissions`. So `req.user.permissions` is undefined and every non–super-admin admin is denied. **High (logic bug).**

**File:** `middleware/authMiddleware.js` lines 19–20, 61–64

**Improved:** Load user with permissions and attach to `req.user`:
```javascript
const user = await CompletedUser.findOne({ email: decoded.email })
  .populate("adminPermissions")
  .lean();
if (!user) { ... }
req.user = user;
req.user.permissions = user.adminPermissions || {};
```

Then `isAuthorized` can keep checking `req.user.permissions[action]`.

---

## 16. HTTP status typo (production correctness)

**Risk:** `res.status(505)` is invalid (505 = Version Not Supported). Should be 500. **Low.**

**File:** `controllers/adminController/adminElectionController.js` line 10

**Current:** `res.status(505),json(...)` (also comma instead of dot).

**Improved:** `res.status(500).json({ error: error.message });`

---

## 17. MongoDB connection options (A05:2021 – Security Misconfiguration / Scalability)

**Risk:** No connection timeout or options; if `MONGODB_URI` is missing, Mongoose may hang or fail late. **Low.**

**File:** `config/db.js`

**Improved:**
```javascript
if (!process.env.MONGODB_URI) {
  console.error("FATAL: MONGODB_URI is required");
  process.exit(1);
}
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
})
```

---

## Summary table

| # | Severity | Category        | Item                          |
|---|----------|-----------------|-------------------------------|
| 1 | Critical | Config/Secrets  | Firebase key in repo/.gitignore |
| 2 | High     | Config          | CORS allow-all                |
| 3 | Medium   | Config          | No security headers (helmet)  |
| 4 | High     | Auth/DoS        | No rate limiting              |
| 5 | Medium   | Info disclosure | Error handler leaks messages  |
| 6 | High     | Crypto          | JWT algorithm not fixed       |
| 7 | Medium   | Config          | JWT_SECRET not validated      |
| 8 | Medium   | Secrets         | Firebase creds from file only |
| 9 | High     | Auth/Injection  | No auth input validation      |
|10 | High     | Access control  | Mass assignment in role form  |
|11 | Medium   | Injection       | ObjectId not validated        |
|12 | Medium   | Logging         | Sensitive data in logs        |
|13 | Medium   | DoS             | 100 MB file limit             |
|14 | Medium   | Upload          | Multer mimetype not checked   |
|15 | High     | Auth            | Permissions not populated      |
|16 | Low      | Correctness     | 505 typo                      |
|17 | Low      | Config          | DB connection options         |

---

## Recommended order of fixes

1. ~~Add Firebase key (and similar) to `.gitignore`; ensure key not in history (e.g. `git filter-branch` or BFG if it was committed).~~ **Done**
2. ~~Restrict CORS and add rate limiting and helmet in `server.js`.~~ **Done**
3. ~~Fix global error handler and JWT (algorithm + optional startup check).~~ **Done**
4. ~~Add auth input validation and role-form allowlist in `authService.js`.~~ **Done** (validators in `validators/authValidators.js`, allowlist in authService)
5. ~~Populate `adminPermissions` in auth middleware and fix status typo in admin controller.~~ **Done**
6. ~~Validate ObjectIds in admin/support/podcast controllers; reduce file limits and add mimetype check in multer.~~ **Done** (ObjectId in all id-param controllers; multer mimetype + 10MB profile; election/incident 25MB)
7. ~~Optionally move Firebase to env and add DB connection checks.~~ **Done** (Firebase env support; DB URI check)

**Follow-up (implemented):** Auth routes now use express-validator; all controllers that take `id`/`electionId`/`adminId`/`notificationId`/`podcastId` validate with `isValidObjectId`; file limits set to 10 MB (profile) and 25 MB (election/incident).

**Further (implemented):** Support request validation added for `POST /support`: `validators/supportValidators.js` (firstName, lastName, email, phoneNumber, category, message with length limits). Stricter rate limit on support submit: 10 requests per 15 min per IP.

---

## Dependency audit

Run regularly:

```bash
npm audit
npm audit fix    # apply non-breaking fixes
```

Address any **critical** or **high** findings before production. If `npm audit fix --force` is needed, run tests afterward (it may introduce breaking changes).

---

After changes, run tests and a quick smoke test of auth and admin flows.
