# ⚡ AfroSpace SaaS — Next-Click Live Checklist

### 1️⃣ Verify ECS Services
*   **AWS Console** → ECS → Clusters → `afrospace-cluster`
*   Check Tasks for:
    *   **Backend Service** (Internal: 3000, External ALB: 80) ✅
    *   **Dashboard Service** (Static assets or separate container) ✅
*   Ensure Task status = `RUNNING`
*   *If any task fails* → check **Logs** tab → CloudWatch logs.

### 2️⃣ Test Load Balancer
*   **AWS Console** → EC2 → Load Balancers → `afrospace-alb`
*   ALB Listeners:
    *   `/api/*` → Backend Target Group ✅
    *   `/` → Frontend/Dashboard Target Group ✅
*   **Health Checks**:
    *   Backend → `/api/health` → `HTTP 200`
    *   Dashboard → `/index.html` → Loads correctly

### 3️⃣ Verify Database Connection
*   Check RDS PostgreSQL endpoint in ECS task environment variables (`DATABASE_URL`).
*   Check Backend logs → ensure "Connected to DB" or "DB Ready".
*   Use pgAdmin / DBeaver to verify table migrations.

### 4️⃣ Firebase Auth Check
*   Login on the App/Dashboard.
*   Verify ID Token is sent in `Authorization: Bearer <token>` header.
*   Backend logs should show: `[Auth]: User verified <UID>`.

### 5️⃣ Stripe Subscription Test
*   Execute a test checkout flow (using Stripe Test Cards).
*   Ensure the success page redirects back to your dashboard.
*   Verify **Stripe Webhook** triggers backend update to `isSubscribed`.

### 6️⃣ Autonomous Growth Engine
*   Check logs for `run_growth_loop` execution.
*   Current Engine Logic:
    *   *If Conversion < 5%*: Trigger `Optimize Flow`.
    *   *If ROAS > 1.5x*: Trigger `Scale Ad Budget`.
    *   *If Churn > 4%*: Trigger `Retention Email`.

### 7️⃣ WebSocket Dashboard
*   Open Dashboard → watch Metrics update in real-time.
*   Check fields: `MRR`, `Conversion`, `Churn`, `Active Users`.
*   Verify **AI Actions** stream appears in the "Live Events" feed.

### 8️⃣ Domain & Security
*   **Route53**: Domain assigned to ALB.
*   **ACM**: SSL certificate attached to HTTPS (443) listener.
*   **Secure Cookies**: Ensure `HttpOnly` and `Secure` flags are set in production.

### 9️⃣ CloudWatch Monitoring
*   Setup Alarms for:
    *   5xx Error spikes.
    *   ECS Task CPU > 85%.
    *   RDS Connection counts.

### 🔟 Go Live ✅
*   Your AfroSpace engine is now autonomous.
*   *Observation*: The system will now observe user behavior and reinvest revenue into growth actions automatically.
