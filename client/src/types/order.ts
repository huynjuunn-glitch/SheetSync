export interface Order {
  id: string;
  customerName: string;
  design: string;
  orderDate: string;
  pickupDate: string;
  flavor: string;
  sheet: string;
  size: string;
  cream: string;
  requests?: string;
  notes?: string;
  orderChannel: string;
}

export interface Statistics {
  designCounts: Record<string, number>;
  flavorCounts: Record<string, number>;
  sheetCounts: Record<string, number>;
  sizeCounts: Record<string, number>;
  creamCounts: Record<string, number>;
  totalOrders: number;
  popularDesign: string;
  popularSize: string;
}
