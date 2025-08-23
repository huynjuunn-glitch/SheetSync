import { pgTable, text, date, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerName: text("customer_name").notNull(),
  design: text("design").notNull(),
  orderDate: date("order_date").notNull(),
  pickupDate: date("pickup_date").notNull(),
  flavor: text("flavor").notNull(),
  sheet: text("sheet").notNull(),
  size: text("size").notNull(),
  cream: text("cream").notNull(),
  requests: text("requests"),
  notes: text("notes"),
  orderChannel: text("order_channel").notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Google Sheets row schema for data import
export const googleSheetsRowSchema = z.object({
  이름: z.string(),
  디자인: z.string(),
  주문일자: z.string(),
  픽업일자: z.string(),
  맛선택: z.string(),
  시트: z.string(),
  사이즈: z.string(),
  크림: z.string(),
  요청사항: z.string(),
  특이사항: z.string(),
  주문경로: z.string(),
});

export type GoogleSheetsRow = z.infer<typeof googleSheetsRowSchema>;