import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { googleSheetsRowSchema, type Order } from "@shared/schema";
import { google } from "googleapis";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get orders by date range
  app.get("/api/orders", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (startDate && endDate) {
        const orders = await storage.getOrdersByDateRange(
          startDate as string,
          endDate as string
        );
        res.json(orders);
      } else {
        const orders = await storage.getOrders();
        res.json(orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Get single order
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  // Sync data from Google Sheets
  app.post("/api/sync-sheets", async (req, res) => {
    try {
      const sheetsData = await fetchGoogleSheetsData();
      const orders = convertSheetsDataToOrders(sheetsData);
      await storage.seedOrders(orders);
      res.json({ message: "Data synced successfully", count: orders.length });
    } catch (error) {
      console.error("Error syncing Google Sheets:", error);
      res.status(500).json({ error: "Failed to sync Google Sheets data" });
    }
  });

  // Get statistics for date range
  app.get("/api/statistics", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      let orders: Order[];
      if (startDate && endDate) {
        orders = await storage.getOrdersByDateRange(
          startDate as string,
          endDate as string
        );
      } else {
        orders = await storage.getOrders();
      }

      const statistics = calculateStatistics(orders);
      res.json(statistics);
    } catch (error) {
      console.error("Error calculating statistics:", error);
      res.status(500).json({ error: "Failed to calculate statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function fetchGoogleSheetsData() {
  // Initialize Google Sheets API
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const range = process.env.GOOGLE_SHEETS_RANGE || 'Sheet1!A:K';

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = response.data.values || [];
  if (rows.length === 0) {
    return [];
  }

  // Skip header row
  const dataRows = rows.slice(1);
  
  return dataRows.map(row => {
    const [이름, 디자인, 주문일자, 픽업일자, 맛선택, 시트, 사이즈, 크림, 요청사항, 특이사항, 주문경로] = row;
    
    return googleSheetsRowSchema.parse({
      이름: 이름 || '',
      디자인: 디자인 || '',
      주문일자: 주문일자 || '',
      픽업일자: 픽업일자 || '',
      맛선택: 맛선택 || '',
      시트: 시트 || '',
      사이즈: 사이즈 || '',
      크림: 크림 || '',
      요청사항: 요청사항 || '',
      특이사항: 특이사항 || '',
      주문경로: 주문경로 || '',
    });
  });
}

function convertSheetsDataToOrders(sheetsData: any[]): Order[] {
  return sheetsData.map(row => ({
    id: randomUUID(),
    customerName: row.이름,
    design: row.디자인,
    orderDate: formatDate(row.주문일자),
    pickupDate: formatDate(row.픽업일자),
    flavor: row.맛선택,
    sheet: row.시트,
    size: row.사이즈,
    cream: row.크림,
    requests: row.요청사항 || null,
    notes: row.특이사항 || null,
    orderChannel: row.주문경로,
  }));
}

function formatDate(dateString: string): string {
  // Convert various date formats to YYYY-MM-DD
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    // Try parsing Korean date format like "2024.12.15"
    const koreanDateMatch = dateString.match(/(\d{4})\.(\d{1,2})\.(\d{1,2})/);
    if (koreanDateMatch) {
      const [, year, month, day] = koreanDateMatch;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dateString;
  }
  return date.toISOString().split('T')[0];
}

function calculateStatistics(orders: Order[]) {
  const designCounts = orders.reduce((acc, order) => {
    acc[order.design] = (acc[order.design] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const flavorCounts = orders.reduce((acc, order) => {
    acc[order.flavor] = (acc[order.flavor] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sheetCounts = orders.reduce((acc, order) => {
    acc[order.sheet] = (acc[order.sheet] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sizeCounts = orders.reduce((acc, order) => {
    acc[order.size] = (acc[order.size] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const creamCounts = orders.reduce((acc, order) => {
    acc[order.cream] = (acc[order.cream] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalOrders = orders.length;
  const popularDesign = Object.entries(designCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || '';
  const popularSize = Object.entries(sizeCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || '';

  return {
    designCounts,
    flavorCounts,
    sheetCounts,
    sizeCounts,
    creamCounts,
    totalOrders,
    popularDesign,
    popularSize,
  };
}
