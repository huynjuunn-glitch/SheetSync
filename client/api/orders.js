import { storage } from '../lib/storage.js';

export default async function handler(req, res) {
  const { method, query } = req;

  if (method === 'GET') {
    try {
      const { startDate, endDate, id } = query;
      
      // Handle single order by ID
      if (id) {
        const order = await storage.getOrder(id);
        if (!order) {
          return res.status(404).json({ error: "Order not found" });
        }
        return res.json(order);
      }
      
      console.log('API 요청 파라미터:', { startDate, endDate });
      
      let orders;
      if (startDate && endDate) {
        orders = await storage.getOrdersByDateRange(startDate, endDate);
        console.log('날짜 범위 필터 결과:', orders.length);
      } else {
        orders = await storage.getOrders();
        console.log('전체 주문 개수:', orders.length);
      }
      
      if (orders.length > 0) {
        console.log('첫 번째 주문 샘플:', orders[0]);
      }
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}