import { type Order, type InsertOrder } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getOrders(): Promise<Order[]>;
  getOrdersByDateRange(startDate: string, endDate: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private orders: Map<string, Order>;

  constructor() {
    this.orders = new Map();
  }

  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrdersByDateRange(startDate: string, endDate: string): Promise<Order[]> {
    const orders = Array.from(this.orders.values());
    return orders.filter(order => {
      const orderDate = order.orderDate;
      return orderDate >= startDate && orderDate <= endDate;
    });
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = { 
      ...insertOrder, 
      id,
      requests: insertOrder.requests || null,
      notes: insertOrder.notes || null
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  // Method to seed orders from Google Sheets data
  async seedOrders(orders: Order[]): Promise<void> {
    orders.forEach(order => {
      this.orders.set(order.id, order);
    });
  }
}

export const storage = new MemStorage();
