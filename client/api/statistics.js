import { storage } from '../lib/storage.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { startDate, endDate } = req.query;
    
    let orders;
    if (startDate && endDate) {
      orders = await storage.getOrdersByDateRange(startDate, endDate);
    } else {
      orders = await storage.getOrders();
    }
    
    const statistics = calculateStatistics(orders);
    res.json(statistics);
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
}

function calculateStatistics(orders) {
  const designCounts = orders.reduce((acc, order) => {
    acc[order.design] = (acc[order.design] || 0) + 1;
    return acc;
  }, {});

  const flavorCounts = orders.reduce((acc, order) => {
    acc[order.flavor] = (acc[order.flavor] || 0) + 1;
    return acc;
  }, {});

  const sizeCounts = orders.reduce((acc, order) => {
    acc[order.size] = (acc[order.size] || 0) + 1;
    return acc;
  }, {});

  const sheetCounts = orders.reduce((acc, order) => {
    acc[order.sheet] = (acc[order.sheet] || 0) + 1;
    return acc;
  }, {});

  const creamCounts = orders.reduce((acc, order) => {
    acc[order.cream] = (acc[order.cream] || 0) + 1;
    return acc;
  }, {});

  // Find most popular items
  const getMostPopular = (counts) => {
    const entries = Object.entries(counts);
    if (entries.length === 0) return null;
    return entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
  };

  return {
    designCounts,
    flavorCounts,
    sizeCounts,
    sheetCounts,
    creamCounts,
    totalOrders: orders.length,
    popularDesign: getMostPopular(designCounts),
    popularSize: getMostPopular(sizeCounts),
  };
}