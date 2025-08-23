import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // 샘플 데이터 추가
  await addSampleData();
  
  const server = await registerRoutes(app);
  
  async function addSampleData() {
    // 기존 데이터가 있는지 확인
    const existingOrders = await storage.getOrders();
    if (existingOrders.length > 0) {
      return; // 이미 데이터가 있으면 추가하지 않음
    }

    const sampleOrders = [
      {
        customerName: "김민수",
        design: "코코넛러브",
        orderDate: "2024-08-20",
        pickupDate: "2024-08-23",
        flavor: "초콜릿",
        sheet: "바닐라시트",
        size: "대형",
        cream: "생크림",
        requests: "생일 축하 메시지 필요",
        notes: "오후 3시 픽업 예정",
        orderChannel: "네이버예약"
      },
      {
        customerName: "이지은",
        design: "리본케이크",
        orderDate: "2024-08-21",
        pickupDate: "2024-08-24",
        flavor: "딸기",
        sheet: "초콜릿시트",
        size: "소형",
        cream: "버터크림",
        requests: null,
        notes: null,
        orderChannel: "카카오톡"
      },
      {
        customerName: "박영수",
        design: "코코넛러브",
        orderDate: "2024-08-22",
        pickupDate: "2024-08-25",
        flavor: "바닐라",
        sheet: "바닐라시트",
        size: "중형",
        cream: "휘핑크림",
        requests: "포장 꼼꼼히 부탁",
        notes: "아침 일찍 픽업",
        orderChannel: "매장방문"
      }
    ];

    for (const orderData of sampleOrders) {
      await storage.createOrder(orderData);
    }
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
