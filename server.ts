import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  app.use(express.json());
  
  // Production Infrastructure Hooks
  const IS_PROD = process.env.NODE_ENV === 'production';
  const DB_URL = process.env.DATABASE_URL; // AWS RDS
  const REDIS_URL = process.env.REDIS_URL; // AWS ElastiCache
  
  if (IS_PROD && !DB_URL) {
    console.warn("[Production Warning]: DATABASE_URL is missing. Falling back to in-memory store.");
  }

  // Health Check for AWS Load Balancer
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      service: "AfroSpace-Engine", 
      version: "1.0.0",
      infrastructure: IS_PROD ? "AWS Cloud" : "Local Development"
    });
  });

  // In-memory "DB" for demo / Fallback
  const events: any[] = [];
  const actions: any[] = [];
  let currentMetrics = {
    mrr: 124500,
    conversion: 0.042,
    churn: 0.051,
    active_users: 12402,
    roas: 1.8
  };

  // API Routes
  app.get("/api/dashboard", (req, res) => {
    res.json({
      revenue: `$${currentMetrics.mrr.toLocaleString()}`,
      users: currentMetrics.active_users.toLocaleString(),
      aiStatus: "Autonomous Growth Active",
      growthRate: "+12.4%",
      activeAgents: 8,
      brand: "AfroSpace"
    });
  });

  app.post("/api/events", (req, res) => {
    const { name, userId, metadata } = req.body;
    events.push({ name, userId, metadata, timestamp: new Date() });
    
    // In production, this would save to RDS:
    // await db.insert('events').values({ name, userId, metadata });
    
    console.log(`[Event Tracked]: ${name} by ${userId}`);
    res.json({ status: "tracked" });
  });

  app.get("/api/growth/status", (req, res) => {
    res.json({
      ...currentMetrics,
      lastActions: actions.slice(-5).reverse()
    });
  });

  app.get("/api/ai/decisions", (req, res) => {
    res.json({
      CEO: {
        agent: "Strategic Orchestrator",
        instruction: "Global Strategy & Benchmarking ($200k MRR Target)",
        status: "DECISION_LOCKED",
        decisions: [
          "Authorized expansion into East African fintech corridor.",
          "Targeting 15% WoW growth through referral multipliers.",
          "Approved $50k reinvestment into user acquisition."
        ]
      },
      CFO: {
        agent: "Capital Allocator",
        instruction: "Revenue Optimization & MRR Analysis ($200k MRR Benchmarking)",
        status: "ANALYZING",
        decisions: [
          "Projecting MRR hit of $150k by end of quarter.",
          "Identifying 12% mismatch in LTV/CAC ratios.",
          "Recommending dynamic pricing for Tier-2 clusters."
        ]
      },
      CTO: {
        agent: "Systems Architect",
        instruction: "AWS Infrastructure Scaling (Supporting 15% WoW Growth)",
        status: "SECURE",
        decisions: [
          "Auto-scaling triggers adjusted for sudden traffic surges.",
          "Migration to Graviton3 instances for 20% compute savings.",
          "Network latency optimized in 4 regional edge nodes."
        ]
      },
      GROWTH: {
        agent: "Viral Engineer",
        instruction: "Funnel Optimization (5% Conversion Benchmark)",
        status: "EXECUTING",
        decisions: [
          "Deployment of multi-variant landing page B/A tests.",
          "Achieved 4.8% conversion in Beta Testing phase.",
          "Integrating viral loops in the onboarding sequence."
        ]
      }
    });
  });

  app.post("/api/ai/predict", (req, res) => {
    // Simulate prediction output structurally similar to prophet library
    const insight = {
        trend: "bullish",
        expected_growth: 1.25,
        risk_score: 0.15,
        recommendation: "Maintain asset allocation; high probability of sector breakout.",
        forecast: [
            { ds: "2023-01-01", yhat: 110, yhat_lower: 105, yhat_upper: 115 },
            { ds: "2023-02-01", yhat: 120, yhat_lower: 112, yhat_upper: 128 },
            { ds: "2023-03-01", yhat: 135, yhat_lower: 122, yhat_upper: 145 },
            { ds: "2023-04-01", yhat: 150, yhat_lower: 138, yhat_upper: 165 },
            { ds: "2023-05-01", yhat: 175, yhat_lower: 155, yhat_upper: 195 },
            { ds: "2023-06-01", yhat: 210, yhat_lower: 180, yhat_upper: 240 },
        ]
    };
    res.json(insight);
  });


  // Autonomous Growth Engine
  setInterval(() => {
    const newActions: any[] = [];
    
    // Logic Core
    if (currentMetrics.conversion < 0.05) {
      newActions.push({ type: "onboarding", action: "Optimize Flow", impact: "+0.8% Conv" });
    }
    if (currentMetrics.churn > 0.04) {
      newActions.push({ type: "email", action: "Retention Campaign", impact: "-0.5% Churn" });
    }
    if (currentMetrics.roas > 1.5) {
      newActions.push({ type: "ads", action: "Scale Budget", impact: "+$2.5k MRR" });
    }

    // Apply simulation changes
    currentMetrics.conversion += (Math.random() * 0.001);
    currentMetrics.mrr += Math.floor(Math.random() * 500);
    
    if (newActions.length > 0) {
      const selected = newActions[Math.floor(Math.random() * newActions.length)];
      actions.push({ ...selected, timestamp: new Date().toISOString() });
      io.emit("ai_update", selected);
    }
  }, 8000);

  // WebSocket logic
  io.on("connection", (socket) => {
    console.log("Client connected to AfroSpace Real-time Engine");
    
    // Simulate AI events
    const interval = setInterval(() => {
      const actions = ["Optimization Complete", "New Lead Detected", "Revenue Spike", "Cost Reduction Applied"];
      const impacts = ["+2.4%", "+$1,200", "+5.1%", "-$400"];
      const randomIndex = Math.floor(Math.random() * actions.length);
      
      socket.emit("ai_update", {
        action: actions[randomIndex],
        impact: impacts[randomIndex],
        timestamp: new Date().toISOString()
      });
    }, 5000);

    socket.on("disconnect", () => {
      clearInterval(interval);
      console.log("Client disconnected");
    });
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`AfroSpace Server running at http://localhost:${PORT}`);
  });
}

startServer();
