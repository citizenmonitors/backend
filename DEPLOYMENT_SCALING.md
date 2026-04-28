# Deployment and Scaling Runbook

This document covers production operations for:
- containers
- cache
- load balancing and traffic routing
- autoscaling
- reliability and safe rollouts

## 1) Current App Readiness (already implemented)

- Containerized TypeScript build and runtime (`Dockerfile`, `docker-compose.yml`, `docker-compose.prod.yml`)
- Redis-aware app cache (`utils/cache.ts`) with in-memory fallback
- Liveness and readiness endpoints:
  - `GET /health/live`
  - `GET /health/ready` (checks Mongo and Redis when configured)
- Rate limiting in Express for general API and auth endpoints

## 2) Baseline Production Environment Variables

Set these in your platform:

- `NODE_ENV=production`
- `PORT=5050` (or platform-managed)
- `JWT_SECRET=<strong-random-32+ chars>`
- `MONGODB_URI_PROD=<mongo uri>` (preferred)
- `REDIS_URL=<managed redis uri>` (recommended)
- `ALLOWED_ORIGINS=<comma separated origins>`

Optional:
- `SPEAKER_SLOT_NOTIFY_EMAILS=<comma separated emails>`

## 3) Load Balancer and Traffic Routing

Use an external load balancer in front of app instances.

### Required LB settings

- Health check path: `/health/live`
- Readiness gating path: `/health/ready`
- Timeout:
  - connect timeout: 5s
  - response/read timeout: 30s
- Retry policy:
  - retry on 502/503/504
  - 2-3 retries max
- Sticky sessions: disabled (app is stateless/JWT-based)

### TLS and edge security

- Terminate TLS at edge/LB
- Redirect HTTP to HTTPS
- Enable WAF/rate limiting at edge where available

## 4) Autoscaling Policy (recommended starter policy)

Start with min 2 instances to avoid single-point outages.

- Min replicas: 2
- Max replicas: 10 (adjust with traffic)
- Scale out when any is true for 5 minutes:
  - CPU > 65%
  - Memory > 75%
  - p95 latency > 600ms
  - requests/instance > 100 rps
- Scale in when all are true for 15 minutes:
  - CPU < 35%
  - Memory < 60%
  - p95 latency < 300ms

Use gradual cooldown:
- scale-out cooldown: 120s
- scale-in cooldown: 300s

## 5) Cache Strategy (Redis)

Current cache is enabled for location and bank read endpoints.

Recommended evolution:
- Keep TTL at 1 hour for static datasets (already done)
- Add cache metrics:
  - hit rate
  - evictions
  - Redis latency
- Add invalidation hooks only for data that can change frequently

Operational guidance:
- If Redis is down, app falls back to in-memory cache
- In-memory cache is per instance (not shared), so use Redis in multi-instance deployments

## 6) Database Load Controls

To reduce MongoDB pressure:
- keep hot read endpoints cached
- add DB indexes for high-cardinality filters/sorts
- monitor slow query logs and fix top offenders first
- use connection pooling defaults from driver unless profiling suggests changes

## 7) Static and Upload Storage for Scale

For multi-instance scale, avoid local disk as source of truth.

Use shared/object storage for:
- `observerId`
- `profileImage`
- `electionsData`

If staying on containers:
- mount persistent volumes for short-term
- move to object storage (S3/GCS) for long-term scaling and multi-region

## 8) Serverless Position

Current app is long-running Express (not serverless).

If serverless is required later:
- split file-heavy or long-running jobs into workers/functions
- keep core API on containers until cold-start and file IO concerns are resolved

## 9) Rollout Plan (safe sequence)

1. Deploy cache + health endpoints (done in code)
2. Deploy Redis managed instance and set `REDIS_URL`
3. Put LB health checks on `/health/live`
4. Enable readiness-aware deployment on `/health/ready`
5. Turn on autoscaling with conservative thresholds
6. Observe for 48h:
   - error rate
   - p95 latency
   - DB CPU
   - Redis hit rate
7. Tune autoscaling and cache TTLs

## 10) SLO and Alert Starter Pack

Set alerts on:
- 5xx rate > 2% for 5m
- p95 latency > 800ms for 10m
- `/health/ready` failing on >20% of instances
- Mongo connection failures
- Redis unavailable > 5m

Suggested starter SLO:
- API availability: 99.9%
- p95 latency: < 500ms for core read endpoints

## 11) Render-Specific Setup

This section maps the runbook directly to Render.

### A) Web service configuration

Use your `render.yaml` values:
- Build Command: `npm ci && npm run build`
- Start Command: `npm run start:prod`
- Environment: `Node`

Set environment variables in Render dashboard:
- `NODE_ENV=production`
- `JWT_SECRET=<strong-random-32+ chars>`
- `MONGODB_URI_PROD=<atlas uri>` (recommended) or `MONGODB_URI=<uri>`
- `REDIS_URL=<render redis internal/external url>`
- `ALLOWED_ORIGINS=<comma separated frontend origins>`

### B) Health checks on Render

Set health check path to:
- `/health/live`

Use `/health/ready` for diagnostics and incident checks. Keep liveness as the platform health check endpoint to avoid false restarts when optional dependencies are transient.

### C) Redis on Render

Create a Render Redis service and wire `REDIS_URL` to the web service.

Expected behavior with current code:
- If Redis is reachable, cache is shared across instances.
- If Redis is down, app continues with per-instance in-memory fallback cache.

### D) MongoDB on Render deployments

Preferred:
- Use MongoDB Atlas (or other managed Mongo) and set `MONGODB_URI_PROD`.

Avoid relying on local filesystem for persistent media when scaling horizontally; use object storage for uploads/media.

### E) Autoscaling on Render

Render autoscaling availability depends on plan/region/features.

If autoscaling is enabled for your service:
- Start with min instances: 2
- Set max instances based on budget and expected peak
- Scale target guidance:
  - CPU target around 60-70%
  - memory guardrails based on observed usage
  - confirm p95 latency remains under SLO during ramp

If autoscaling is not available on current plan:
- manually scale instance count and instance size
- use alerts (5xx, latency, CPU) to trigger manual scaling

### F) Load balancing and global traffic on Render

- Render provides service-level balancing for multiple instances of a service.
- Global multi-region load balancing is not automatically solved by app code.

For global traffic routing:
- put Cloudflare or another global edge in front of Render
- route by geo/latency where needed
- keep origin health checks pointed at `/health/live`

### G) Zero-downtime rollout checklist (Render)

1. Deploy with `npm run build` + `npm run start:prod` (already configured)
2. Confirm `/health/live` returns 200
3. Confirm `/health/ready` shows `mongo: up` and `redis: up` (if configured)
4. Validate key cached endpoints:
   - `/api/banks`
   - location read endpoints
5. Monitor logs and metrics for 30-60 minutes
6. If stable, increase instance count / enable autoscaling

