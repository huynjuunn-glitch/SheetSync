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

  // 구글 시트 설정 저장
  app.post("/api/save-settings", async (req, res) => {
    try {
      const { apiKey, sheetId, sheetName } = req.body;
      
      // 임시로 환경변수에 저장 (실제로는 데이터베이스나 파일에 저장해야 함)
      process.env.GOOGLE_API_KEY = apiKey;
      process.env.GOOGLE_SHEET_ID = sheetId;
      process.env.GOOGLE_SHEET_NAME = sheetName;
      
      res.json({ message: "설정이 저장되었습니다" });
    } catch (error) {
      console.error("Error saving settings:", error);
      res.status(500).json({ error: "설정 저장에 실패했습니다" });
    }
  });

  // Sync data from Google Sheets
  app.post("/api/sync-sheets", async (req, res) => {
    try {
      const sheetsData = await fetchGoogleSheetsData();
      const orders = convertSheetsDataToOrders(sheetsData);
      await storage.seedOrders(orders);
      res.json({ message: "데이터 동기화가 완료되었습니다", count: orders.length });
    } catch (error) {
      console.error("Error syncing Google Sheets:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "구글 시트 데이터 동기화에 실패했습니다" 
      });
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
  // 클라이언트에서 전달받은 설정 사용
  const apiKey = process.env.GOOGLE_API_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const sheetName = process.env.GOOGLE_SHEET_NAME || 'Sheet1';

  if (!apiKey || !sheetId) {
    throw new Error('Google Sheets 설정이 필요합니다. API 키와 시트 ID를 확인해주세요.');
  }

  const range = `${sheetName}!A:K`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google Sheets API 오류:', errorText);
    throw new Error(`Google Sheets API 오류: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  const rows = data.values || [];
  
  if (rows.length === 0) {
    return [];
  }

  // Skip header row
  const dataRows = rows.slice(1);
  
  return dataRows.map((row: any) => {
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
